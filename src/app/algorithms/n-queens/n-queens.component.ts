import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlgorithmService } from '../../services/algorithm.service';

interface Step {
  step: number;
  line: number;
  action: string; // 'start' | 'try' | 'check' | 'place' | 'remove' | 'success'
  variables: { row?: number; col?: number; check_row?: number };
  data: { board: number[] };
  message: string;
}

@Component({
  selector: 'app-n-queens',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './n-queens.component.html',
  styleUrls: ['./n-queens.component.css'],
})
export class NQueensComponent implements OnInit, OnDestroy, AfterViewChecked {

  /* ─── Tabs ─────────────────────────────────────── */
  activeTab: 'overview' | 'visualization' | 'complexity' = 'visualization';

  /* ─── Problem config ────────────────────────────── */
  n = 4;

  /* ─── Steps & playback ──────────────────────────── */
  steps: Step[] = [];
  currentStepIndex = 0;
  isPlaying = false;
  speed = 1200;
  private intervalId: any = null;

  /* ─── Board state ───────────────────────────────── */
  board: number[] = [];
  attackCells = new Set<string>();
  currentTry: { row: number; col: number } | null = null;

  /* ─── Split-view resizer ────────────────────────── */
  codePanelWidth = 42;
  private isResizing = false;
  private readonly MIN_WIDTH = 25;
  private readonly MAX_WIDTH = 72;

  /* ─── Auto-scroll code panel ────────────────────── */
  @ViewChild('codeScroller') codeScroller!: ElementRef;
  @ViewChild('line1') line1!: ElementRef;
  @ViewChild('line2') line2!: ElementRef;
  @ViewChild('line3') line3!: ElementRef;
  @ViewChild('line4') line4!: ElementRef;
  @ViewChild('line5') line5!: ElementRef;
  @ViewChild('line6') line6!: ElementRef;

  private lastActiveLine = 0;

  constructor(private algoService: AlgorithmService) {}

  ngOnInit(): void {
    this.board = Array(this.n).fill(-1);
    this.startMiniAnimation();
  }

  /* ══════════════════════════════════════════════════
     GETTERS
  ══════════════════════════════════════════════════ */

  get currentStep(): Step | null {
    return this.steps.length ? this.steps[this.currentStepIndex] : null;
  }

  get progressPercentage(): number {
    return this.steps.length
      ? ((this.currentStepIndex + 1) / this.steps.length) * 100
      : 0;
  }

  get boardRows(): number[] {
    return Array.from({ length: this.n }, (_, i) => i);
  }

  get boardCols(): number[] {
    return Array.from({ length: this.n }, (_, i) => i);
  }

  /** Queens currently placed (board[r] !== -1) */
  get queensPlaced(): number[] {
    return this.board.filter(col => col !== -1);
  }

  /** Remaining empty slots */
  get queensRemaining(): number[] {
    const placed = this.queensPlaced.length;
    return Array.from({ length: Math.max(0, this.n - placed) });
  }

  /* ══════════════════════════════════════════════════
     SOLVE (calls backend, unchanged)
  ══════════════════════════════════════════════════ */

  solve(): void {
    this.board = Array(this.n).fill(-1);
    this.steps = [];
    this.currentStepIndex = 0;
    this.isPlaying = false;
    this.clearPlayInterval();
    this.attackCells.clear();
    this.currentTry = null;

    this.algoService.solveNQueens(this.n).subscribe({
      next: res => {
        this.steps = res.steps;
        this.currentStepIndex = 0;
        this.applyStep(this.steps[0]);
        setTimeout(() => this.handlePlayPause(), 500);
      },
      error: err => {
        console.error('Backend error:', err);
        alert('Backend not reachable. Is Flask running on the expected port?');
      }
    });
  }

  resetToEdit(): void {
    this.steps = [];
    this.currentStepIndex = 0;
    this.board = Array(this.n).fill(-1);
    this.attackCells.clear();
    this.currentTry = null;
    this.isPlaying = false;
    this.clearPlayInterval();
  }

  /* ══════════════════════════════════════════════════
     STEP APPLICATION
  ══════════════════════════════════════════════════ */

  // True when the ghost-queen backtrack animation should play
  isBacktracking = false;
  // True when the try-cell is actually under attack (conflict flash)
  isTryConflict = false;

  private applyStep(step: Step): void {
    if (!step) return;

    this.board = [...step.data.board];

    // Reset all overlays
    this.attackCells.clear();
    this.currentTry = null;
    this.isBacktracking = false;
    this.isTryConflict = false;

    const { row, col } = step.variables;

    if (step.action === 'try' || step.action === 'check') {
      if (row !== undefined && col !== undefined) {
        this.currentTry = { row, col };

        // Only compute conflict lines when queens are on the board
        const queensOnBoard = this.board.filter(c => c !== -1).length;
        if (queensOnBoard > 0) {
          this.computeConflictLine(row, col);
          // isTryConflict is set inside computeConflictLine
        }
      }
    } else if (step.action === 'remove') {
      if (row !== undefined && col !== undefined) {
        this.isBacktracking = true;
        this.currentTry = { row, col };
      }
    }
  }

  /**
   * For a given try-cell (tryRow, tryCol), find the FIRST placed queen
   * that conflicts with it, then highlight the ENTIRE column or FULL
   * diagonal that queen sits on — so the user sees the whole threat line.
   */
  computeConflictLine(tryRow: number, tryCol: number): void {
    const n = this.n;
    this.attackCells.clear();
    this.isTryConflict = false;

    for (let r = 0; r < n; r++) {
      const c = this.board[r];
      if (c === -1) continue;

      // ── Same column — highlight the full column ────
      if (c === tryCol) {
        for (let row = 0; row < n; row++) {
          if (row !== r) this.attackCells.add(`${row}-${c}`);
        }
        this.attackCells.add(`${r}-${c}`); // blocking queen's cell
        this.isTryConflict = true;
        return;
      }

      // ── Same diagonal — highlight the full diagonal ─
      const rowDiff = Math.abs(r - tryRow);
      const colDiff = Math.abs(c - tryCol);
      if (rowDiff === colDiff && rowDiff > 0) {
        // Walk the full diagonal in both directions from the blocking queen
        const dc = c > r ? 1 : -1; // direction of this diagonal (↘ or ↙)
        // Actually determine direction properly: it's ↘ if (r-c) is constant, ↙ if (r+c) is constant
        const isDiag1 = (r - c) === (tryRow - tryCol); // top-left to bottom-right
        if (isDiag1) {
          // All cells where row - col === r - c
          const k = r - c;
          for (let row = 0; row < n; row++) {
            const col = row - k;
            if (col >= 0 && col < n && !(row === r && col === c)) {
              this.attackCells.add(`${row}-${col}`);
            }
          }
        } else {
          // All cells where row + col === r + c
          const k = r + c;
          for (let row = 0; row < n; row++) {
            const col = k - row;
            if (col >= 0 && col < n && !(row === r && col === c)) {
              this.attackCells.add(`${row}-${col}`);
            }
          }
        }
        this.attackCells.add(`${r}-${c}`); // blocking queen's cell
        this.isTryConflict = true;
        return;
      }
    }
  }

  /** Legacy alias kept for overview mini-board */
  computeAttacks(row: number, col: number): void {
    this.computeConflictLine(row, col);
  }

  get miniBoard(): number[] {
    return Array.from({ length: this.MINI_N }, (_, i) => i);
  }

  /* ══════════════════════════════════════════════════
     PLAYBACK CONTROLS
  ══════════════════════════════════════════════════ */

  handlePlayPause(): void {
    if (!this.steps.length) return;

    if (this.currentStepIndex >= this.steps.length - 1 && !this.isPlaying) {
      this.currentStepIndex = 0;
      this.applyStep(this.steps[0]);
    }

    this.isPlaying = !this.isPlaying;
    this.isPlaying ? this.startPlaying() : this.clearPlayInterval();
  }

  startPlaying(): void {
    this.clearPlayInterval();
    this.intervalId = setInterval(() => {
      if (this.currentStepIndex < this.steps.length - 1) {
        this.goToNextStep();
      } else {
        this.isPlaying = false;
        this.clearPlayInterval();
      }
    }, this.speed);
  }

  private goToNextStep(): void {
    const nextIndex = this.currentStepIndex + 1;
    if (nextIndex >= this.steps.length) return;
    this.currentStepIndex = nextIndex;
    this.applyStep(this.steps[nextIndex]);
  }

  clearPlayInterval(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  handleReset(): void {
    this.isPlaying = false;
    this.clearPlayInterval();
    this.currentStepIndex = 0;
    if (this.steps.length) this.applyStep(this.steps[0]);
  }

  handlePrevious(): void {
    this.isPlaying = false;
    this.clearPlayInterval();
    if (this.currentStepIndex > 0) {
      this.currentStepIndex--;
      this.applyStep(this.steps[this.currentStepIndex]);
    }
  }

  handleNext(): void {
    this.isPlaying = false;
    this.clearPlayInterval();
    this.goToNextStep();
  }

  onSpeedChange(): void {
    if (this.isPlaying) this.startPlaying();
  }

  /* ══════════════════════════════════════════════════
     BOARD CELL CLASSIFIERS
  ══════════════════════════════════════════════════ */

  /** Cell is in the attack zone of an already-placed queen */
  isAttackCell(r: number, c: number): boolean {
    return this.attackCells.has(`${r}-${c}`);
  }

  /** The cell currently being tried (ghost queen lives here) */
  isTryCell(r: number, c: number): boolean {
    if (this.isBacktracking) return false; // backtrack uses its own class
    return (
      this.currentTry !== null &&
      this.currentTry.row === r &&
      this.currentTry.col === c
    );
  }

  /** Try-cell AND it's under attack — triggers conflict warning flash */
  isTryConflictCell(r: number, c: number): boolean {
    return this.isTryConflict && this.isTryCell(r, c);
  }

  /** The queen about to be removed via backtracking */
  isBacktrackCell(r: number, c: number): boolean {
    return (
      this.isBacktracking &&
      this.currentTry !== null &&
      this.currentTry.row === r &&
      this.currentTry.col === c
    );
  }

  isSafeHighlight(_r: number, _c: number): boolean { return false; }

  /* ══════════════════════════════════════════════════
     CODE LINE HIGHLIGHTING
  ══════════════════════════════════════════════════ */

  isLineActive(lineNumber: number): boolean {
    return this.currentStep?.line === lineNumber;
  }

  getLineExplanation(lineNumber: number): string {
    const step = this.currentStep;
    if (!step) return '';
    const { row, col, check_row } = step.variables;

    switch (lineNumber) {
      case 1:
        if (step.action === 'start') {
          return `Starting the N-Queens solver for a ${this.n}×${this.n} board. We'll place queens row by row.`;
        }
        return `All ${this.n} queens placed successfully! We've found a valid solution.`;

      case 2:
        return `Trying column ${col} in row ${row}. We iterate every column (0 to ${this.n - 1}) to find a safe spot.`;

      case 3:
        return `Checking if (row ${row}, col ${col}) is safe — no queen in the same column, or either diagonal.`;

      case 4:
        return `Checking conflict with the queen already placed in row ${check_row} (column ${this.board[check_row ?? 0]}). Same column or diagonal? If yes, this cell is unsafe.`;

      case 5:
        return `Safe! Placing a queen at row ${row}, col ${col}. Recording board[${row}] = ${col} and moving to the next row.`;

      case 6:
        return `Dead end in row ${row} — no column worked. Removing the queen from row ${row} (board[${row}] = -1) and backtracking to the previous row to try a different column.`;

      default:
        return step.message;
    }
  }

  /* ══════════════════════════════════════════════════
     UI HELPERS
  ══════════════════════════════════════════════════ */

  getActionColor(action: string): string {
    switch (action) {
      case 'start':   return '#3b82f6';
      case 'try':     return '#f59e0b';
      case 'check':   return '#f59e0b';
      case 'place':   return '#10b981';
      case 'remove':  return '#ef4444';
      case 'success': return '#10b981';
      default:        return '#6b7280';
    }
  }

  getActionIcon(action: string): string {
    switch (action) {
      case 'start':   return '🚀';
      case 'try':     return '🎯';
      case 'check':   return '🔍';
      case 'place':   return '♛';
      case 'remove':  return '↩️';
      case 'success': return '✅';
      default:        return '•';
    }
  }

  getActionLabel(action: string): string {
    switch (action) {
      case 'start':   return 'STARTING';
      case 'try':     return 'TRYING';
      case 'check':   return 'CHECKING';
      case 'place':   return 'PLACED';
      case 'remove':  return 'BACKTRACK';
      case 'success': return 'SOLVED!';
      default:        return action.toUpperCase();
    }
  }

  getSpeedLabel(): string {
    return `${(2200 - this.speed) / 1000}x`;
  }

  /* ══════════════════════════════════════════════════
     OVERVIEW ANIMATED BOARD
     Queen sits at (2,2) on a 5×5.
     Phases cycle: row → column → diag↘ → diag↙
  ══════════════════════════════════════════════════ */

  readonly MINI_N = 5;
  readonly MINI_QR = 2;
  readonly MINI_QC = 2;

  // 0=row, 1=col, 2=diag↘, 3=diag↙
  miniPhase = 0;
  private miniIntervalId: any = null;

  readonly miniPhaseLabels = [
    'Row — the queen controls her entire row',
    'Column — the queen controls her entire column',
    'Diagonal ↘ — she attacks this diagonal too',
    'Diagonal ↙ — and this one',
  ];

  get miniPhaseLabel(): string {
    return this.miniPhaseLabels[this.miniPhase];
  }

  startMiniAnimation(): void {
    if (this.miniIntervalId) return;
    this.miniIntervalId = setInterval(() => {
      this.miniPhase = (this.miniPhase + 1) % 4;
    }, 1400);
  }

  stopMiniAnimation(): void {
    if (this.miniIntervalId) {
      clearInterval(this.miniIntervalId);
      this.miniIntervalId = null;
    }
  }

  isMiniQueenCell(r: number, c: number): boolean {
    return r === this.MINI_QR && c === this.MINI_QC;
  }

  isMiniHighlight(r: number, c: number): boolean {
    if (this.isMiniQueenCell(r, c)) return false;
    const qr = this.MINI_QR, qc = this.MINI_QC;
    switch (this.miniPhase) {
      case 0: return r === qr;                                          // same row
      case 1: return c === qc;                                          // same column
      case 2: return (r - c) === (qr - qc);                            // diag ↘
      case 3: return (r + c) === (qr + qc);                            // diag ↙
    }
    return false;
  }

  /* ══════════════════════════════════════════════════
     CODE PANEL AUTO-SCROLL
  ══════════════════════════════════════════════════ */

  ngAfterViewChecked(): void {
    if (this.currentStep && this.currentStep.line !== this.lastActiveLine) {
      this.scrollToActiveLine(this.currentStep.line);
      this.lastActiveLine = this.currentStep.line;
    }
  }

  private scrollToActiveLine(lineNumber: number): void {
    const map: Record<number, ElementRef | undefined> = {
      1: this.line1,
      2: this.line2,
      3: this.line3,
      4: this.line4,
      5: this.line5,
      6: this.line6,
    };

    const lineRef = map[lineNumber];
    if (lineRef && this.codeScroller) {
      const el = lineRef.nativeElement as HTMLElement;
      const container = this.codeScroller.nativeElement as HTMLElement;
      container.scrollTo({
        top: el.offsetTop - container.clientHeight / 2 + el.clientHeight / 2,
        behavior: 'smooth',
      });
    }
  }

  /* ══════════════════════════════════════════════════
     RESIZER
  ══════════════════════════════════════════════════ */

  onResizerMouseDown(event: MouseEvent): void {
    event.preventDefault();
    this.isResizing = true;
    window.addEventListener('mousemove', this.onMouseMove);
    window.addEventListener('mouseup', this.onMouseUp);
  }

  private onMouseMove = (event: MouseEvent): void => {
    if (!this.isResizing) return;
    this.codePanelWidth = this.clampWidth((event.clientX / window.innerWidth) * 100);
  };

  private onMouseUp = (): void => {
    this.isResizing = false;
    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('mouseup', this.onMouseUp);
  };

  onResizerTouchStart(event: TouchEvent): void {
    this.isResizing = true;
    window.addEventListener('touchmove', this.onTouchMove, { passive: false });
    window.addEventListener('touchend', this.onTouchEnd);
  }

  private onTouchMove = (event: TouchEvent): void => {
    if (!this.isResizing) return;
    const touch = event.touches[0];
    this.codePanelWidth = this.clampWidth((touch.clientX / window.innerWidth) * 100);
  };

  private onTouchEnd = (): void => {
    this.isResizing = false;
    window.removeEventListener('touchmove', this.onTouchMove);
    window.removeEventListener('touchend', this.onTouchEnd);
  };

  private clampWidth(value: number): number {
    return Math.min(this.MAX_WIDTH, Math.max(this.MIN_WIDTH, value));
  }

  /* ══════════════════════════════════════════════════
     CLEANUP
  ══════════════════════════════════════════════════ */

  ngOnDestroy(): void {
    this.clearPlayInterval();
    this.stopMiniAnimation();
    this.onMouseUp();
    this.onTouchEnd();
  }
}
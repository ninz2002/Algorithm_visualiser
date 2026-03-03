import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-n-queens-construct',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="nqueens-construct">

      <!-- HEADER -->
      <div class="nq-header">
        <h3>Construct Challenge</h3>
        <p class="nq-subtitle">
          Place <strong>{{ boardSize }} queens</strong> on the board — one per row —
          so that no two queens attack each other.
        </p>
      </div>

      <!-- BOARD -->
      <div class="nq-board-wrap">
        <div
          class="nq-board"
          [style.grid-template-columns]="'repeat(' + boardSize + ', 1fr)'">

          <div
            *ngFor="let cell of boardCells; let i = index"
            class="nq-cell"
            [class.cell-light]="isLightCell(cell.row, cell.col)"
            [class.cell-dark]="!isLightCell(cell.row, cell.col)"
            [class.cell-queen]="board[cell.row] === cell.col"
            [class.cell-active-row]="cell.row === currentRow && status === 'playing'"
            [class.cell-conflict]="conflictCells.has(cell.row + '-' + cell.col)"
            [class.cell-shaking]="shakingCell === cell.row + '-' + cell.col"
            (click)="onCellClick(cell.row, cell.col)">

            <span
              class="queen-icon"
              *ngIf="board[cell.row] === cell.col">
              ♛
            </span>

          </div>

        </div>

        <!-- ROW LABELS -->
        <div class="nq-row-labels">
          <span
            *ngFor="let r of rowIndices"
            class="row-label"
            [class.row-label-active]="r === currentRow && status === 'playing'">
            Row {{ r + 1 }}
          </span>
        </div>
      </div>

      <!-- STATUS MESSAGE -->
      <div class="nq-status" *ngIf="status === 'success'">
        <span class="status-success">✓ Valid solution found!</span>
      </div>

      <!-- BACKTRACK HINT -->
      <div class="nq-hint" *ngIf="showBacktrackHint && status === 'playing'">
        <span>🤔</span>
        <span>This row has no valid moves. Try backtracking!</span>
      </div>

      <!-- FEEDBACK -->
      <div
        class="nq-feedback"
        *ngIf="feedbackMsg"
        [class.feedback-wrong]="feedbackType === 'wrong'"
        [class.feedback-info]="feedbackType === 'info'">
        {{ feedbackMsg }}
      </div>

      <!-- PROGRESS TRAIL -->
      <div class="nq-trail" *ngIf="placedCount > 0">
        <span class="trail-label">Placed:</span>
        <span
          *ngFor="let r of placedRows"
          class="trail-queen">
          ♛ R{{ r + 1 }}C{{ board[r] + 1 }}
        </span>
      </div>

      <!-- CONTROLS -->
      <div class="nq-controls">
        <button
          class="action-btn secondary"
          (click)="backtrack()"
          [disabled]="currentRow === 0 || status !== 'playing'">
          ← Backtrack
        </button>

        <button
          class="action-btn primary"
          (click)="reset()">
          ↺ Restart
        </button>
      </div>

    </div>
  `,
  styles: [`
    /* ============================
       LAYOUT
       ============================ */
    .nqueens-construct {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .nq-header h3 {
      font-size: 1.1rem;
      font-weight: 700;
      color: var(--text-primary, #e2e8f0);
      margin: 0 0 0.25rem;
    }
    .nq-subtitle {
      font-size: 0.82rem;
      color: var(--text-secondary, #94a3b8);
      margin: 0;
      line-height: 1.4;
    }
    .nq-subtitle strong { color: #a78bfa; }

    /* ============================
       BOARD
       ============================ */
    .nq-board-wrap {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
    }

    .nq-board {
      display: grid;
      border: 2px solid #334155;
      border-radius: 6px;
      overflow: hidden;
      width: min(320px, 100%);
      aspect-ratio: 1;
      flex-shrink: 0;
    }

    .nq-cell {
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: background 0.15s, filter 0.15s;
      position: relative;
    }

    .cell-light {
      background: #1e293b;
    }
    .cell-dark {
      background: #0f172a;
    }

    /* Active row gets a subtle highlight so user knows where to click */
    .cell-active-row {
      background: #1e3a5f !important;
    }
    .cell-active-row:hover {
      background: #1d4ed8 !important;
      filter: brightness(1.15);
    }

    /* Queen placed */
    .cell-queen {
      background: #312e81 !important;
    }

    /* Conflict path */
    .cell-conflict {
      background: #450a0a !important;
      animation: pulse-red 0.6s ease;
    }

    /* Shake on invalid click */
    .cell-shaking {
      animation: shake 0.4s ease !important;
    }

    @keyframes pulse-red {
      0%, 100% { opacity: 1; }
      50%       { opacity: 0.6; }
    }

    @keyframes shake {
      0%   { transform: translateX(0); }
      20%  { transform: translateX(-4px); }
      40%  { transform: translateX(4px); }
      60%  { transform: translateX(-3px); }
      80%  { transform: translateX(3px); }
      100% { transform: translateX(0); }
    }

    .queen-icon {
      font-size: clamp(1rem, 4vw, 1.6rem);
      color: #a78bfa;
      filter: drop-shadow(0 0 4px #7c3aed);
      pointer-events: none;
      user-select: none;
    }

    /* ============================
       ROW LABELS
       ============================ */
    .nq-row-labels {
      display: flex;
      flex-direction: column;
      justify-content: space-around;
      height: min(320px, 100%);
    }
    .row-label {
      font-size: 0.7rem;
      color: #475569;
      white-space: nowrap;
      transition: color 0.2s;
    }
    .row-label-active {
      color: #818cf8;
      font-weight: 600;
    }

    /* ============================
       STATUS / HINTS / FEEDBACK
       ============================ */
    .nq-status {
      font-size: 0.9rem;
      font-weight: 600;
    }
    .status-success {
      color: #34d399;
    }

    .nq-hint {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.82rem;
      color: #fbbf24;
      background: #1c1400;
      border: 1px solid #92400e;
      border-radius: 8px;
      padding: 0.5rem 0.75rem;
      animation: fade-in 0.3s ease;
    }

    .nq-feedback {
      padding: 0.45rem 0.75rem;
      border-radius: 8px;
      font-size: 0.82rem;
      font-weight: 500;
      animation: fade-in 0.2s ease;
    }
    .feedback-wrong {
      background: #450a0a;
      border: 1px solid #dc2626;
      color: #fca5a5;
    }
    .feedback-info {
      background: #1e1b4b;
      border: 1px solid #4f46e5;
      color: #a5b4fc;
    }

    @keyframes fade-in {
      from { opacity: 0; transform: translateY(4px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    /* ============================
       TRAIL
       ============================ */
    .nq-trail {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.78rem;
    }
    .trail-label {
      color: #64748b;
    }
    .trail-queen {
      color: #a78bfa;
      font-weight: 600;
      background: #1e1b4b;
      padding: 0.1rem 0.4rem;
      border-radius: 4px;
      border: 1px solid #4f46e5;
    }

    /* ============================
       CONTROLS
       ============================ */
    .nq-controls {
      display: flex;
      gap: 0.75rem;
    }
  `]
})
export class NQueensConstructComponent implements OnInit, OnDestroy {

  @Output() constructComplete = new EventEmitter<void>();

  // ============================================
  // CONFIG
  // ============================================

  boardSize = 4;

  // ============================================
  // STATE
  // ============================================

  /** board[row] = col where queen is placed, -1 = empty */
  board: number[] = [];
  currentRow = 0;
  conflictCells = new Set<string>();
  shakingCell: string | null = null;
  status: 'playing' | 'success' = 'playing';
  showBacktrackHint = false;
  failedAttemptsInRow = 0;

  feedbackMsg = '';
  feedbackType: 'wrong' | 'info' = 'info';

  private feedbackTimer: ReturnType<typeof setTimeout> | null = null;
  private shakeTimer: ReturnType<typeof setTimeout> | null = null;

  // ============================================
  // DERIVED
  // ============================================

  /** Flat cell list for *ngFor in the template */
  get boardCells(): { row: number; col: number }[] {
    const cells: { row: number; col: number }[] = [];
    for (let r = 0; r < this.boardSize; r++) {
      for (let c = 0; c < this.boardSize; c++) {
        cells.push({ row: r, col: c });
      }
    }
    return cells;
  }

  get rowIndices(): number[] {
    return Array.from({ length: this.boardSize }, (_, i) => i);
  }

  get placedCount(): number {
    return this.board.filter((c) => c !== -1).length;
  }

  get placedRows(): number[] {
    return this.rowIndices.filter((r) => this.board[r] !== -1);
  }

  isLightCell(row: number, col: number): boolean {
    return (row + col) % 2 === 0;
  }

  // ============================================
  // LIFECYCLE
  // ============================================

  ngOnInit(): void {
    this.reset();
  }

  ngOnDestroy(): void {
    if (this.feedbackTimer) clearTimeout(this.feedbackTimer);
    if (this.shakeTimer) clearTimeout(this.shakeTimer);
  }

  // ============================================
  // RESET
  // ============================================

  reset(): void {
    this.board = Array(this.boardSize).fill(-1);
    this.currentRow = 0;
    this.conflictCells.clear();
    this.shakingCell = null;
    this.status = 'playing';
    this.showBacktrackHint = false;
    this.failedAttemptsInRow = 0;
    this.feedbackMsg = '';
  }

  // ============================================
  // CELL CLICK
  // ============================================

  onCellClick(row: number, col: number): void {
    if (this.status !== 'playing') return;
    // Only the active row is clickable
    if (row !== this.currentRow) return;

    if (!this.isSafe(row, col)) {
      this.highlightConflict(row, col);
      this.triggerShake(row, col);
      this.failedAttemptsInRow++;

      const conflictReason = this.getConflictReason(row, col);
      this.showFeedback(`❌ Conflict! ${conflictReason}`, 'wrong');

      // Show backtrack hint once the user has tried every column and none work
      if (this.failedAttemptsInRow >= this.boardSize && !this.hasValidMove(row)) {
        this.showBacktrackHint = true;
      }
      return;
    }

    // Valid placement
    this.conflictCells.clear();
    this.showBacktrackHint = false;
    this.failedAttemptsInRow = 0;
    this.feedbackMsg = '';

    this.board[row] = col;
    this.currentRow++;

    if (this.currentRow === this.boardSize) {
      this.status = 'success';
      setTimeout(() => {
        this.constructComplete.emit();
      }, 1000);
    }
  }

  // ============================================
  // BACKTRACK
  // ============================================

  backtrack(): void {
    if (this.currentRow === 0 || this.status !== 'playing') return;
    this.currentRow--;
    this.board[this.currentRow] = -1;
    this.conflictCells.clear();
    this.shakingCell = null;
    this.showBacktrackHint = false;
    this.failedAttemptsInRow = 0;
    this.feedbackMsg = '';
  }

  // ============================================
  // SAFETY CHECKS
  // ============================================

  isSafe(row: number, col: number): boolean {
    for (let r = 0; r < row; r++) {
      const c = this.board[r];
      if (c === col) return false;
      if (Math.abs(c - col) === Math.abs(r - row)) return false;
    }
    return true;
  }

  hasValidMove(row: number): boolean {
    for (let col = 0; col < this.boardSize; col++) {
      if (this.isSafe(row, col)) return true;
    }
    return false;
  }

  private getConflictReason(row: number, col: number): string {
    for (let r = 0; r < row; r++) {
      const c = this.board[r];
      if (c === col) return `Same column as queen in Row ${r + 1}.`;
      if (Math.abs(c - col) === Math.abs(r - row)) {
        return `Diagonal attack from queen in Row ${r + 1}.`;
      }
    }
    return 'Another queen can attack this square.';
  }

  // ============================================
  // CONFLICT HIGHLIGHTING
  // ============================================

  highlightConflict(targetRow: number, targetCol: number): void {
    this.conflictCells.clear();
    for (let r = 0; r < targetRow; r++) {
      const c = this.board[r];
      if (c === -1) continue;
      const sameCol = c === targetCol;
      const sameDiag = Math.abs(c - targetCol) === Math.abs(r - targetRow);
      if (sameCol || sameDiag) {
        this.drawPath(r, c, targetRow, targetCol);
        this.conflictCells.add(`${r}-${c}`);
      }
    }
  }

  private drawPath(r1: number, c1: number, r2: number, c2: number): void {
    const dr = Math.sign(r2 - r1);
    const dc = Math.sign(c2 - c1);
    let r = r1;
    let c = c1;
    while (r !== r2 || c !== c2) {
      this.conflictCells.add(`${r}-${c}`);
      r += dr;
      c += dc;
    }
    this.conflictCells.add(`${r2}-${c2}`);
  }

  // ============================================
  // SHAKE ANIMATION
  // ============================================

  private triggerShake(row: number, col: number): void {
    const key = `${row}-${col}`;
    this.shakingCell = key;
    if (this.shakeTimer) clearTimeout(this.shakeTimer);
    this.shakeTimer = setTimeout(() => {
      if (this.shakingCell === key) this.shakingCell = null;
    }, 450);
  }

  // ============================================
  // FEEDBACK
  // ============================================

  private showFeedback(msg: string, type: 'wrong' | 'info', duration = 2200): void {
    if (this.feedbackTimer) clearTimeout(this.feedbackTimer);
    this.feedbackMsg = msg;
    this.feedbackType = type;
    this.feedbackTimer = setTimeout(() => {
      this.feedbackMsg = '';
    }, duration);
  }
}
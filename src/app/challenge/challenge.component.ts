import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import {
  ChallengeSet,
  ChallengeMode,
  ModeStatus,
  ChallengeModeData,
  ChallengeQuestion
} from './challenge-definitions/challenge.types';

import { LinearSearchChallenge } from './challenge-definitions/linear-search.challenge';
import { BubbleSortChallenge } from './challenge-definitions/bubble-sort.challenge';
import { NQueensChallenge } from './challenge-definitions/n-queens.challenge';

@Component({
  selector: 'app-challenge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './challenge.component.html',
  styleUrls: ['./challenge.component.css'],
})
export class ChallengeComponent implements OnInit {

  // ============================================
  // STATE
  // ============================================

  algorithmId = '';
  challengeSet: ChallengeSet | null = null;

  readonly modes: ChallengeMode[] = ['quiz', 'trace', 'predict', 'construct'];

  currentMode: ChallengeMode = 'quiz';
  currentQuestionIndex = 0;

  modeProgress: Record<ChallengeMode, ModeStatus> = {
    quiz: 'not-started',
    trace: 'locked',
    predict: 'locked',
    construct: 'locked',
  };

  selectedAnswer: string | null = null;
  feedback = '';
  explanation = '';
  isCorrect = false;

  showModeCompletion = false;

  attemptCount = 0;
  showHint = false;
  isQuestionLocked = false;

  canProceedAfterFailure = false;

  // ===============================
  // CONSTRUCT STATE
  // ===============================

  constructBoard: number[] = [];
  constructCurrentRow = 0;

  // Cells to highlight as "conflicting" — only the path from offending queen to clicked cell
  constructAttackCells = new Set<string>();

  // The cell currently shaking (invalid click)
  shakingCell: string | null = null;

  constructStatus: 'playing' | 'success' = 'playing';
  constructSize = 4;

  // Backtrack hint — shown only after user has tried 2+ invalid cells in current row
  showBacktrackHint = false;

  // How many invalid clicks the user has made in the current row
  failedAttemptsInRow = 0;

  // ============================================
  // UI HELPERS (REQUIRED BY TEMPLATE)
  // ============================================

  isModeUnlocked(mode: ChallengeMode): boolean {
    return this.modeProgress[mode] !== 'locked';
  }

  isModeCompleted(mode: ChallengeMode): boolean {
    return this.modeProgress[mode] === 'completed';
  }

  getModeIcon(mode: ChallengeMode): string {
    const icons: Record<ChallengeMode, string> = {
      quiz: '📝',
      trace: '🔍',
      predict: '🎯',
      construct: '🛠️',
    };
    return icons[mode];
  }

  getModeTitle(mode: ChallengeMode): string {
    const titles: Record<ChallengeMode, string> = {
      quiz: 'Quiz',
      trace: 'Trace',
      predict: 'Predict',
      construct: 'Construct',
    };
    return titles[mode];
  }

  getModeLockReason(mode: ChallengeMode): string {
    if (mode === 'trace') return 'Complete Quiz first to unlock Trace';
    if (mode === 'predict') return 'Complete Trace first to unlock Predict';
    return '';
  }

  // ============================================
  // GETTERS
  // ============================================

  get currentModeData(): ChallengeModeData | null {
    if (!this.challengeSet) return null;
    if (this.currentMode === 'construct') return null;
    return this.challengeSet[this.currentMode];
  }

  get currentQuestion(): ChallengeQuestion | null {
    return this.currentModeData
      ? this.currentModeData.questions[this.currentQuestionIndex]
      : null;
  }

  get totalQuestions(): number {
    return this.currentModeData?.questions.length ?? 0;
  }

  get progressPercentage(): number {
    if (!this.totalQuestions) return 0;
    return ((this.currentQuestionIndex + 1) / this.totalQuestions) * 100;
  }

  // ============================================
  // LIFECYCLE
  // ============================================

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.algorithmId = params['algorithm'];
      this.loadChallengeSet();

      this.currentMode = 'quiz';
      this.currentQuestionIndex = 0;
      this.resetQuestionState();
      this.showModeCompletion = false;
    });
  }

  // ============================================
  // DATA LOADING
  // ============================================

  loadChallengeSet(): void {
    switch (this.algorithmId) {
      case 'linear-search':
        this.challengeSet = LinearSearchChallenge;
        break;
      case 'bubble-sort':
        this.challengeSet = BubbleSortChallenge;
        break;
      case 'n-queens':
        this.challengeSet = NQueensChallenge;
        break;
      default:
        console.error('No challenge set found for:', this.algorithmId);
        this.challengeSet = null;
        return;
    }

    this.currentMode = 'quiz';
    this.currentQuestionIndex = 0;

    this.modeProgress = {
      quiz: 'not-started',
      trace: 'locked',
      predict: 'locked',
      construct: 'locked',
    };
  }

  // ============================================
  // MODE SWITCHING
  // ============================================

  switchMode(mode: ChallengeMode): void {
    if (this.modeProgress[mode] === 'locked') return;

    this.currentMode = mode;

    if (mode === 'construct') {
      this.initConstruct();
      return;
    }

    this.currentQuestionIndex = 0;
    this.resetQuestionState();

    if (this.modeProgress[mode] === 'not-started') {
      this.modeProgress[mode] = 'in-progress';
    }
  }

  initConstruct(): void {
    this.constructSize = this.challengeSet?.construct?.boardSize ?? 4;
    this.constructBoard = Array(this.constructSize).fill(-1);
    this.constructCurrentRow = 0;
    this.constructAttackCells.clear();
    this.shakingCell = null;
    this.constructStatus = 'playing';
    this.showBacktrackHint = false;
    this.failedAttemptsInRow = 0;

    if (this.modeProgress.construct === 'not-started') {
      this.modeProgress.construct = 'in-progress';
    }
  }

  // ============================================
  // CONSTRUCT: CELL CLICK
  // ============================================

  onConstructCellClick(row: number, col: number): void {
    if (this.constructStatus !== 'playing') return;
    if (row !== this.constructCurrentRow) return;

    if (!this.isSafe(row, col)) {
      // Highlight only the conflicting path from the offending queen to this cell
      this.highlightConflict(row, col);

      // Shake the clicked cell
      this.triggerShake(row, col);

      // Track failed attempts in this row
      this.failedAttemptsInRow++;

      // Only show the hint when the user has tried ALL columns in this row
      // and every single one was invalid — meaning they must backtrack
      if (this.failedAttemptsInRow >= this.constructSize && !this.hasValidMove(row)) {
        this.showBacktrackHint = true;
      }

      return;
    }

    // Valid placement — clear highlights, reset row attempt counter and hint
    this.constructAttackCells.clear();
    this.showBacktrackHint = false;
    this.failedAttemptsInRow = 0;

    // Place queen
    this.constructBoard[row] = col;
    this.constructCurrentRow++;

    if (this.constructCurrentRow === this.constructSize) {
      this.constructStatus = 'success';
      this.modeProgress.construct = 'completed';
    }
  }

  // ============================================
  // CONSTRUCT: CONFLICT HIGHLIGHTING
  // ============================================

  /**
   * Instead of highlighting ALL attack cells, we find WHICH placed queen
   * is in conflict with (targetRow, targetCol), then draw only the
   * cells along the conflicting row or diagonal between them.
   */
  highlightConflict(targetRow: number, targetCol: number): void {
    this.constructAttackCells.clear();

    for (let r = 0; r < targetRow; r++) {
      const c = this.constructBoard[r];
      if (c === -1) continue;

      const sameCol = c === targetCol;
      const sameDiag = Math.abs(c - targetCol) === Math.abs(r - targetRow);

      if (sameCol || sameDiag) {
        // Draw path from the offending queen to the target cell
        this.drawPath(r, c, targetRow, targetCol);
        // Mark the offending queen cell itself prominently
        this.constructAttackCells.add(`${r}-${c}`);
      }
    }
  }

  /**
   * Draw every cell along the straight line from (r1,c1) to (r2,c2).
   * Works for columns (c1===c2) and diagonals (|dc|===|dr|).
   */
  private drawPath(r1: number, c1: number, r2: number, c2: number): void {
    const dr = Math.sign(r2 - r1);
    const dc = Math.sign(c2 - c1);

    let r = r1;
    let c = c1;

    while (r !== r2 || c !== c2) {
      this.constructAttackCells.add(`${r}-${c}`);
      r += dr;
      c += dc;
    }
    // Include the target cell too
    this.constructAttackCells.add(`${r2}-${c2}`);
  }

  // ============================================
  // CONSTRUCT: SHAKE ANIMATION
  // ============================================

  triggerShake(row: number, col: number): void {
    const key = `${row}-${col}`;
    this.shakingCell = key;

    // Clear shake class after animation completes (500ms)
    setTimeout(() => {
      if (this.shakingCell === key) {
        this.shakingCell = null;
      }
    }, 500);
  }

  isShaking(row: number, col: number): boolean {
    return this.shakingCell === `${row}-${col}`;
  }

  // ============================================
  // CONSTRUCT: SAFETY CHECKS
  // ============================================

  isSafe(row: number, col: number): boolean {
    for (let r = 0; r < row; r++) {
      const c = this.constructBoard[r];
      if (c === col) return false;
      if (Math.abs(c - col) === Math.abs(r - row)) return false;
    }
    return true;
  }

  hasValidMove(row: number): boolean {
    for (let col = 0; col < this.constructSize; col++) {
      if (this.isSafe(row, col)) return true;
    }
    return false;
  }

  // ============================================
  // CONSTRUCT: CONTROLS
  // ============================================

  backtrack(): void {
    if (this.constructCurrentRow === 0) return;

    this.constructCurrentRow--;
    this.constructBoard[this.constructCurrentRow] = -1;

    this.constructAttackCells.clear();
    this.shakingCell = null;
    this.constructStatus = 'playing';
    this.showBacktrackHint = false;
    this.failedAttemptsInRow = 0;
  }

  resetConstruct(): void {
    this.initConstruct();
  }

  // ============================================
  // ANSWERS
  // ============================================

  submitAnswer(answer: string): void {
    if (!this.currentQuestion || this.isQuestionLocked) return;

    this.attemptCount++;
    this.selectedAnswer = answer;
    this.isCorrect = answer === this.currentQuestion.correctAnswer;

    if (!this.isCorrect) {
      const max = this.currentQuestion.maxAttempts ?? 3;

      if (this.attemptCount >= 2 && this.currentQuestion.hint) {
        this.showHint = true;
      }

      if (this.attemptCount >= max) {
        this.isQuestionLocked = true;
        this.canProceedAfterFailure = true;
        this.feedback = '❌ Incorrect. Maximum attempts reached. Please review the explanation.';
        this.explanation = this.currentQuestion.explanation;
        return;
      }

      this.feedback = '❌ Incorrect. Try again.';
      setTimeout(() => {
        this.selectedAnswer = null;
        this.feedback = '';
      }, 1200);

      return;
    }

    this.feedback = '✅ Correct!';
    this.explanation = this.currentQuestion.explanation;

    setTimeout(() => this.nextQuestion(), 2500);
  }

  nextQuestion(): void {
    this.currentQuestionIndex++;

    if (this.currentQuestionIndex >= this.totalQuestions) {
      this.completeMode();
      return;
    }

    this.resetQuestionState();
  }

  resetQuestionState(): void {
    this.selectedAnswer = null;
    this.feedback = '';
    this.explanation = '';
    this.isCorrect = false;
    this.attemptCount = 0;
    this.showHint = false;
    this.isQuestionLocked = false;
    this.canProceedAfterFailure = false;
  }

  // ============================================
  // MODE COMPLETION
  // ============================================

  completeMode(): void {
    this.modeProgress[this.currentMode] = 'completed';
    this.showModeCompletion = true;

    if (this.currentMode === 'quiz') this.modeProgress.trace = 'not-started';
    if (this.currentMode === 'trace') this.modeProgress.predict = 'not-started';
    if (this.currentMode === 'predict') this.modeProgress.construct = 'not-started';
  }

  continueToNextMode(): void {
    this.showModeCompletion = false;

    if (this.currentMode === 'quiz') this.switchMode('trace');
    else if (this.currentMode === 'trace') this.switchMode('predict');
    else if (this.currentMode === 'predict') this.switchMode('construct');
  }

  // ============================================
  // NAVIGATION
  // ============================================

  goBackToLearning(): void {
    this.router.navigate([`/${this.algorithmId}`]);
  }
}
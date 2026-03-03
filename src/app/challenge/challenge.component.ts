import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import {
  ChallengeSet,
  ChallengeMode,
  ModeStatus,
  ChallengeModeData,
  ChallengeQuestion,
} from './challenge-definitions/challenge.types';
import { LinearSearchChallenge } from './challenge-definitions/linear-search.challenge';
import { BubbleSortChallenge } from './challenge-definitions/bubble-sort.challenge';
import { NQueensChallenge } from './challenge-definitions/n-queens.challenge';
import { DfsChallenge } from './challenge-definitions/dfs.challenge';
import { DfsConstructComponent } from './construct/dfs.construct';
import { NQueensConstructComponent } from './construct/n-queens.construct';

@Component({
  selector: 'app-challenge',
  standalone: true,
  imports: [CommonModule, DfsConstructComponent, NQueensConstructComponent],
  templateUrl: './challenge.component.html',
  styleUrls: ['./challenge.component.css'],
})
export class ChallengeComponent implements OnInit {
  // ============================================
  // STATE
  // ============================================

  algorithmId = '';
  challengeSet: ChallengeSet | null = null;

  get availableModes(): ChallengeMode[] {
    const base: ChallengeMode[] = ['quiz', 'trace', 'predict'];
    if (this.challengeSet?.construct) {
      base.push('construct');
    }
    return base;
  }

  currentMode: ChallengeMode = 'quiz';
  currentQuestionIndex = 0;
  modeProgress: Partial<Record<ChallengeMode, ModeStatus>> = {};

  selectedAnswer: string | null = null;
  feedback = '';
  explanation = '';
  isCorrect = false;
  showModeCompletion = false;
  attemptCount = 0;
  showHint = false;
  isQuestionLocked = false;
  canProceedAfterFailure = false;

  /** Tracks if the full challenge set is complete (no construct mode) */
  showFinalCompletion = false;

  // ============================================
  // CONSTRUCT TYPE
  // Derived from challengeSet.construct.type —
  // drives which construct template block renders.
  // ============================================

  get constructType(): string {
    return this.challengeSet?.construct?.type ?? 'none';
  }

  // ============================================
  // N-QUEENS CONSTRUCT: callback from child component
  // ============================================

  onNQueensConstructComplete(): void {
    this.modeProgress.construct = 'completed';
    setTimeout(() => {
      this.showModeCompletion = true;
    }, 800);
  }

  // ============================================
  // UI HELPERS
  // ============================================

  isModeUnlocked(mode: ChallengeMode): boolean {
    return (
      this.modeProgress[mode] !== 'locked' &&
      this.modeProgress[mode] !== undefined
    );
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
    if (mode === 'construct') return 'Complete Predict first to unlock Construct';
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

  /** Whether this algorithm has a construct mode */
  get hasConstruct(): boolean {
    return !!this.challengeSet?.construct;
  }

  /** The mode that follows the current one, or null if we're at the end */
  get nextMode(): ChallengeMode | null {
    if (this.currentMode === 'quiz') return 'trace';
    if (this.currentMode === 'trace') return 'predict';
    if (this.currentMode === 'predict' && this.hasConstruct) return 'construct';
    return null;
  }

  // ============================================
  // LIFECYCLE
  // ============================================

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.algorithmId = params['algorithm'];
      this.loadChallengeSet();
      this.currentMode = 'quiz';
      this.currentQuestionIndex = 0;
      this.resetQuestionState();
      this.showModeCompletion = false;
      this.showFinalCompletion = false;
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
      case 'dfs':
        this.challengeSet = DfsChallenge;
        break;
      default:
        console.error('No challenge set found for:', this.algorithmId);
        this.challengeSet = null;
        return;
    }

    this.currentMode = 'quiz';
    this.currentQuestionIndex = 0;
<<<<<<< Updated upstream
    this.showFinalCompletion = false;
    this.modeProgress = {
      quiz: 'not-started',
      trace: 'locked',
      predict: 'locked',
      ...(this.challengeSet?.construct ? { construct: 'locked' } : {}),
=======

   this.modeProgress = {
    quiz: 'not-started',
    trace: 'locked',
    predict: 'locked',
    ...(this.challengeSet?.construct
      ? { construct: 'locked' }
      : {})
>>>>>>> Stashed changes
    };
  }

  // ============================================
  // MODE SWITCHING
  // ============================================

  switchMode(mode: ChallengeMode): void {
    if (this.modeProgress[mode] === 'locked') return;

    if (mode === 'construct') {
      if (!this.challengeSet?.construct) {
        console.warn('Construct mode not available for this algorithm');
        return;
      }
      this.currentMode = mode;
      this.showModeCompletion = false;
      // Both n-queens and dfs construct components self-initialise via ngOnInit
      if (this.modeProgress.construct === 'not-started') {
        this.modeProgress.construct = 'in-progress';
      }
      return;
    }

    this.currentMode = mode;
    this.currentQuestionIndex = 0;
    this.showModeCompletion = false;
    this.resetQuestionState();

    if (this.modeProgress[mode] === 'not-started') {
      this.modeProgress[mode] = 'in-progress';
    }
  }

  // ============================================
  // DFS CONSTRUCT: callback from child component
  // ============================================

  onDfsTraversalComplete(): void {
    this.modeProgress.construct = 'completed';
    setTimeout(() => {
      this.showModeCompletion = true;
    }, 800);
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
        this.feedback =
          '❌ Incorrect. Maximum attempts reached. Please review the explanation.';
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

    if (this.currentMode === 'quiz') {
      this.modeProgress.trace = 'not-started';
    } else if (this.currentMode === 'trace') {
      this.modeProgress.predict = 'not-started';
    } else if (this.currentMode === 'predict' && this.hasConstruct) {
      this.modeProgress.construct = 'not-started';
    }

    // No construct mode → show final completion after predict
    if (this.currentMode === 'predict' && !this.hasConstruct) {
      this.showFinalCompletion = true;
      return;
    }

    this.showModeCompletion = true;
  }

  continueToNextMode(): void {
    this.showModeCompletion = false;
    if (this.nextMode) {
      this.switchMode(this.nextMode);
    }
  }

  // ============================================
  // NAVIGATION
  // ============================================

  goBackToLearning(): void {
    this.router.navigate([`/${this.algorithmId}`]);
  }
}
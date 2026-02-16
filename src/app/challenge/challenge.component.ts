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

  readonly modes: ChallengeMode[] = ['quiz', 'trace', 'predict'];

  currentMode: ChallengeMode = 'quiz';
  currentQuestionIndex = 0;

  modeProgress: Record<ChallengeMode, ModeStatus> = {
    quiz: 'not-started',
    trace: 'locked',
    predict: 'locked',
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
  };
  return icons[mode];
}

getModeTitle(mode: ChallengeMode): string {
  const titles: Record<ChallengeMode, string> = {
    quiz: 'Quiz',
    trace: 'Trace',
    predict: 'Predict',
  };
  return titles[mode];
}

getModeLockReason(mode: ChallengeMode): string {
  if (mode === 'trace') {
    return 'Complete Quiz first to unlock Trace';
  }
  if (mode === 'predict') {
    return 'Complete Trace first to unlock Predict';
  }
  return '';
}

  // ============================================
  // GETTERS
  // ============================================

  get currentModeData(): ChallengeModeData | null {
    return this.challengeSet ? this.challengeSet[this.currentMode] : null;
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

    // Reset state safely
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

      default:
        console.error('No challenge set found for:', this.algorithmId);
        this.challengeSet = null;
        return;
    }

    // Reset state
    this.currentMode = 'quiz';
    this.currentQuestionIndex = 0;

    this.modeProgress = {
      quiz: 'not-started',
      trace: 'locked',
      predict: 'locked',
    };
  }

  // ============================================
  // MODE SWITCHING
  // ============================================

  switchMode(mode: ChallengeMode): void {
    if (this.modeProgress[mode] === 'locked') return;

    this.currentMode = mode;
    this.currentQuestionIndex = 0;
    this.resetQuestionState();

    if (this.modeProgress[mode] === 'not-started') {
      this.modeProgress[mode] = 'in-progress';
    }
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

    // Show hint after 2 failed attempts
    if (this.attemptCount >= 2 && this.currentQuestion.hint) {
      this.showHint = true;
    }

    // Lock question if max attempts exceeded
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

  // Correct answer
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

    if (this.currentMode === 'quiz') {
      this.modeProgress.trace = 'not-started';
    }

    if (this.currentMode === 'trace') {
      this.modeProgress.predict = 'not-started';
    }
  }

  continueToNextMode(): void {
    this.showModeCompletion = false;

    if (this.currentMode === 'quiz') {
      this.switchMode('trace');
    } else if (this.currentMode === 'trace') {
      this.switchMode('predict');
    }
  }

  // ============================================
  // NAVIGATION
  // ============================================

  goBackToLearning(): void {
    this.router.navigate([`/${this.algorithmId}`]);
  }
}
// ===============================
// BASIC TYPES
// ===============================

export type ChallengeMode = 'quiz' | 'trace' | 'predict';

export type ModeStatus =
  | 'locked'
  | 'not-started'
  | 'in-progress'
  | 'completed';

// ===============================
// QUESTION STRUCTURE
// ===============================

export interface ChallengeOption {
  label: string;
  value: string;
}

export interface ChallengeQuestion {
  id: string;
  prompt: string;
  options: ChallengeOption[];
  correctAnswer: string;
  explanation: string;
    hint?: string;
    maxAttempts?: number;
}

// ===============================
// MODE STRUCTURE
// ===============================

export interface ChallengeModeData {
  title: string;
  icon: string;
  questions: ChallengeQuestion[];
}

// ===============================
// FULL CHALLENGE SET
// ===============================

export interface ChallengeSet {
  algorithm: string;
  displayName: string;
  quiz: ChallengeModeData;
  trace: ChallengeModeData;
  predict: ChallengeModeData;
}

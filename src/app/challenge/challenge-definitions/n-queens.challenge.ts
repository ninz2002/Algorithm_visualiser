import { ChallengeSet } from './challenge.types';

export const NQueensChallenge: ChallengeSet = {
  algorithm: 'n-queens',
  displayName: 'N-Queens',

  // ============================================
  // QUIZ — CONCEPTUAL UNDERSTANDING
  // ============================================

  quiz: {
    title: 'Quiz',
    icon: '📝',
    questions: [
      {
        id: 'nq-q1',
        prompt: 'What is the main strategy used to solve the N-Queens problem?',
        options: [
          { label: 'Greedy approach', value: 'greedy' },
          { label: 'Divide and conquer', value: 'divide' },
          { label: 'Backtracking', value: 'backtracking' },
          { label: 'Dynamic programming', value: 'dp' },
        ],
        correctAnswer: 'backtracking',
        explanation:
          'The N-Queens problem is solved using backtracking, where queens are placed row by row and previous choices are undone if they lead to a conflict.',
        hint:
          'Think about what happens when a choice works initially but later causes a conflict. Does the algorithm go forward blindly, or does it undo earlier decisions?',
        maxAttempts: 2,
      },

      {
        id: 'nq-q2',
        prompt: 'Why is only one queen placed per row in the N-Queens algorithm?',
        options: [
          { label: 'To reduce board size', value: 'size' },
          { label: 'Because queens can attack horizontally', value: 'horizontal' },
          { label: 'To simplify visualization', value: 'visual' },
          { label: 'Because the problem requires it explicitly', value: 'explicit' },
        ],
        correctAnswer: 'horizontal',
        explanation:
          'Placing more than one queen in the same row would cause an immediate horizontal attack, so the algorithm places exactly one queen per row.',
        hint:
          'Ask yourself: if two queens are in the same row, can they attack each other?',
        maxAttempts: 3,
      },

      {
        id: 'nq-q3',
        prompt: 'When does the algorithm decide to backtrack?',
        options: [
          { label: 'When all queens are placed', value: 'done' },
          { label: 'When a conflict is detected', value: 'conflict' },
          { label: 'After trying all columns in a row without success', value: 'no-options' },
          { label: 'After placing a queen in the last column', value: 'last-col' },
        ],
        correctAnswer: 'no-options',
        explanation:
          'Backtracking occurs when no valid column is available in the current row, forcing the algorithm to undo the previous placement.',
        hint:
          'Backtracking is not triggered by a single conflict, but by running out of valid choices in a row.',
        maxAttempts: 3,
      },
    ],
  },

  // ============================================
  // TRACE — STEP-BY-STEP EXECUTION
  // ============================================

  trace: {
    title: 'Trace',
    icon: '🔍',
    questions: [
      {
        id: 'nq-t1',
        prompt:
          'For N = 4, a queen is placed at row 0, column 1.\nWhich column is tried first in row 1?',
        options: [
          { label: 'Column 0', value: '0' },
          { label: 'Column 1', value: '1' },
          { label: 'Column 2', value: '2' },
          { label: 'Column 3', value: '3' },
        ],
        correctAnswer: '0',
        explanation:
          'The algorithm tries columns from left to right. It always starts with column 0 in a new row.',
        hint:
          'The algorithm does not skip columns. It tries them in order.',
        maxAttempts: 2,
      },

      {
        id: 'nq-t2',
        prompt:
          'A queen is placed at row 0, column 0 and row 1, column 2.\nWhy does the algorithm reject column 1 in row 2?',
        options: [
          { label: 'Same column conflict', value: 'column' },
          { label: 'Diagonal conflict', value: 'diagonal' },
          { label: 'Row conflict', value: 'row' },
          { label: 'Board limit exceeded', value: 'limit' },
        ],
        correctAnswer: 'diagonal',
        explanation:
          'The queen at row 1, column 2 attacks row 2, column 1 diagonally.',
        hint:
          'Check diagonal positions: the difference between row and column matters.',
        maxAttempts: 3,
      },

      {
        id: 'nq-t3',
        prompt:
          'If no valid position is found in row 2, what is the NEXT action taken by the algorithm?',
        options: [
          { label: 'Restart from row 0', value: 'restart' },
          { label: 'Remove the queen from row 1', value: 'remove-prev' },
          { label: 'Try random columns', value: 'random' },
          { label: 'End the algorithm', value: 'end' },
        ],
        correctAnswer: 'remove-prev',
        explanation:
          'The algorithm backtracks by removing the queen placed in the previous row and continues trying other columns.',
        hint:
          'Backtracking always reverses the most recent decision.',
        maxAttempts: 2,
      },
    ],
  },

  // ============================================
  // PREDICT — REASONING & OUTCOMES
  // ============================================

  predict: {
    title: 'Predict',
    icon: '🎯',
    questions: [
      {
        id: 'nq-p1',
        prompt:
          'What happens if N = 3 in the N-Queens problem?',
        options: [
          { label: 'Exactly one solution exists', value: 'one' },
          { label: 'Multiple solutions exist', value: 'many' },
          { label: 'No solution exists', value: 'none' },
          { label: 'The algorithm loops forever', value: 'loop' },
        ],
        correctAnswer: 'none',
        explanation:
          'There is no way to place 3 queens on a 3×3 board without conflicts.',
        hint:
          'Try placing queens row by row and see if you ever reach the last row.',
        maxAttempts: 2,
      },

      {
        id: 'nq-p2',
        prompt:
          'If a solution is found for N = 4, what does it guarantee?',
        options: [
          { label: 'All solutions are found', value: 'all' },
          { label: 'At least one valid configuration exists', value: 'one' },
          { label: 'The solution is optimal', value: 'optimal' },
          { label: 'The board is symmetric', value: 'symmetric' },
        ],
        correctAnswer: 'one',
        explanation:
          'Finding a solution guarantees that at least one valid arrangement exists, not that all possible solutions are discovered.',
        hint:
          'The algorithm stops after the first success unless explicitly told to continue.',
        maxAttempts: 2,
      },
    ],
  },

  construct: {
    title: 'construct',
    icon: '🛠️',
    boardSize: 4,
    description:
      'Use the interactive board to place 4 queens. Try to find a valid configuration where no two queens attack each other.',
  },
};

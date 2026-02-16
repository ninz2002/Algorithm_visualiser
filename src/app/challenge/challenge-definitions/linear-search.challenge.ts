import { ChallengeSet } from './challenge.types';

export const LinearSearchChallenge: ChallengeSet = {
  algorithm: 'linear-search',
  displayName: 'Linear Search',

  // ============================================
  // QUIZ — CONCEPTUAL UNDERSTANDING
  // ============================================

  quiz: {
    title: 'Quiz',
    icon: '📝',
    questions: [
      {
        id: 'ls-q1',
        prompt: 'What is the worst-case time complexity of Linear Search?',
        options: [
          { label: 'O(1)', value: 'o1' },
          { label: 'O(log n)', value: 'ologn' },
          { label: 'O(n)', value: 'on' },
          { label: 'O(n²)', value: 'on2' },
        ],
        correctAnswer: 'on',
        explanation:
          'In the worst case, Linear Search checks every element once.',
        hint: "Imagine checking a list from the first item to the last. If the value you want is at the very end (or not present), you are forced to look at every single element. The time taken grows as the list grows.",
        maxAttempts: 3,
      },

      {
        id: 'ls-q2',
        prompt: 'When does Linear Search stop early?',
        options: [
          { label: 'When the array is sorted', value: 'sorted' },
          { label: 'When the target is found', value: 'found' },
          { label: 'After checking half the array', value: 'half' },
          { label: 'Only at the end of the array', value: 'end' },
        ],
        correctAnswer: 'found',
        explanation:
          'Linear Search stops immediately once the target is found.',
        hint: "Linear Search does not plan ahead. It simply checks each element and immediately stops the moment it sees the value it is looking for.",
        maxAttempts: 2,
      },

      {
        id: 'ls-q3',
        prompt:
          'If the target element appears multiple times, what does Linear Search return?',
        options: [
          { label: 'Last occurrence', value: 'last' },
          { label: 'All occurrences', value: 'all' },
          { label: 'First occurrence', value: 'first' },
          { label: 'It depends on the array size', value: 'depends' },
        ],
        correctAnswer: 'first',
        explanation:
          'Linear Search returns the first occurrence because it stops as soon as it finds the target.',
        hint: "Think about what happens the moment the target is found. Does the algorithm continue searching, or does it stop immediately?",
        maxAttempts: 3,
      },
    ],
  },

  // ============================================
  // TRACE — EXECUTION UNDERSTANDING
  // ============================================

  trace: {
    title: 'Trace',
    icon: '🔍',
    questions: [
      {
        id: 'ls-t1',
        prompt:
          'Array: [4, 7, 1, 9] | Target: 1\nWhich index is checked just before the target is found?',
        options: [
          { label: 'Index 0', value: '0' },
          { label: 'Index 1', value: '1' },
          { label: 'Index 2', value: '2' },
          { label: 'Index 3', value: '3' },
        ],
        correctAnswer: '1',
        explanation:
          'The algorithm checks indices 0 → 1 → 2. Index 1 is checked just before the target at index 2.',
        hint: "Write down the order in which indices are checked: start from index 0 and move one step at a time until the target appears.",
        maxAttempts: 2,
      },

      {
        id: 'ls-t2',
        prompt:
          'Array: [5, 3, 8, 2, 9] | Target: 9\nHow many elements are checked before the target is found?',
        options: [
          { label: '2', value: '2' },
          { label: '3', value: '3' },
          { label: '4', value: '4' },
          { label: '5', value: '5' },
        ],
        correctAnswer: '4',
        explanation:
          'The target is at index 4, so 4 elements are checked before it.',
        hint: "The index where the target is found tells you how many elements were already checked before it.",
        maxAttempts: 3,
      },

      {
        id: 'ls-t3',
        prompt:
          'Array: [6, 1, 4, 8] | Target: 10\nWhat happens?',
        options: [
          { label: 'Stops at index 2', value: '2' },
          { label: 'Stops early', value: 'early' },
          { label: 'Checks all elements and fails', value: 'fail' },
          { label: 'Returns index 0', value: '0' },
        ],
        correctAnswer: 'fail',
        explanation:
          'Since the target is not present, Linear Search checks all elements.',
        hint: "Ask yourself: if the value never appears, is there any reason for the algorithm to stop early?",
        maxAttempts: 2,
      },
    ],
  },

  // ============================================
  // PREDICT — REASONING & EDGE CASES
  // ============================================

  predict: {
    title: 'Predict',
    icon: '🎯',
    questions: [
      {
        id: 'ls-p1',
        prompt:
          'Array: [10, 20, 30, 40, 50]\nTarget: 60\nHow many comparisons are made?',
        options: [
          { label: '3', value: '3' },
          { label: '4', value: '4' },
          { label: '5', value: '5' },
          { label: '6', value: '6' },
        ],
        correctAnswer: '5',
        explanation:
          'All elements are checked because the target is not present.',
        hint: "If the value is not in the array, the algorithm has no choice but to compare the target with every element before giving up.",
        maxAttempts: 2,
      },

      {
        id: 'ls-p2',
        prompt:
          'What input causes the BEST-case performance for Linear Search?',
        options: [
          { label: 'Target at the end', value: 'end' },
          { label: 'Target in the middle', value: 'middle' },
          { label: 'Target at the beginning', value: 'start' },
          { label: 'Target not present', value: 'absent' },
        ],
        correctAnswer: 'start',
        explanation:
          'The best case is when the target is found at the first index.',
        hint: "Best case means the fewest possible checks. Think about where the target should be so the algorithm can stop immediately.",
        maxAttempts: 2,
      },
    ],
  },
};

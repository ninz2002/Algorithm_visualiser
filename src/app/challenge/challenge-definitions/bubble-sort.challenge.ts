import { ChallengeSet } from './challenge.types';

export const BubbleSortChallenge: ChallengeSet = {
  algorithm: 'bubble-sort',
  displayName: 'Bubble Sort',

  quiz: {
  title: 'Quiz',
  icon: '📝',
  questions: [
    {
      id: 'bs-q1',
      prompt:
        'After one full pass of Bubble Sort, which element is guaranteed to be in the correct position?',
      options: [
        { label: 'Smallest element', value: 'smallest' },
        { label: 'Largest element', value: 'largest' },
        { label: 'Middle element', value: 'middle' },
        { label: 'No element', value: 'none' },
      ],
      correctAnswer: 'largest',
      explanation:
        'In Bubble Sort, the largest unsorted element moves step-by-step to the end during each full pass.',
      hint:
        'Think about which value keeps moving right whenever two adjacent elements are swapped.',
      maxAttempts: 3,
    },

    {
      id: 'bs-q2',
      prompt: 'Why is Bubble Sort considered inefficient for large datasets?',
      options: [
        { label: 'It uses recursion', value: 'recursion' },
        { label: 'It performs many repeated comparisons', value: 'comparisons' },
        { label: 'It requires extra memory', value: 'memory' },
        { label: 'It only works on sorted arrays', value: 'sorted-only' },
      ],
      correctAnswer: 'comparisons',
      explanation:
        'Bubble Sort compares adjacent elements repeatedly, even if most of the array is already sorted.',
      hint:
        'Focus on how often elements are compared, not how memory is used.',
      maxAttempts: 2,
    },

    {
      id: 'bs-q3',
      prompt: 'What does Bubble Sort compare during each step?',
      options: [
        { label: 'First and last elements', value: 'ends' },
        { label: 'Random elements', value: 'random' },
        { label: 'Adjacent elements', value: 'adjacent' },
        { label: 'All elements at once', value: 'all' },
      ],
      correctAnswer: 'adjacent',
      explanation:
        'Bubble Sort works by comparing neighboring elements and swapping them if they are in the wrong order.',
      hint:
        'The name “bubble” comes from how values move locally, not globally.',
      maxAttempts: 2,
    },
  ],
},


  trace: {
  title: 'Trace',
  icon: '🔍',
  questions: [
    {
      id: 'bs-t1',
      prompt:
        'Array: [5, 3, 4]\nDuring the first pass, which pairs are compared?',
      options: [
        { label: '(5,3) only', value: 'first' },
        { label: '(3,4) only', value: 'second' },
        { label: '(5,3) and (3,4)', value: 'both' },
        { label: '(5,4) only', value: 'wrong' },
      ],
      correctAnswer: 'both',
      explanation:
        'Bubble Sort compares adjacent elements sequentially during a pass.',
      hint:
        'Write down the array indices and move one step at a time.',
      maxAttempts: 2,
    },

    {
      id: 'bs-t2',
      prompt:
        'Array: [4, 2, 1]\nAfter the first full pass, what will the array look like?',
      options: [
        { label: '[2, 1, 4]', value: '214' },
        { label: '[1, 2, 4]', value: '124' },
        { label: '[4, 2, 1]', value: '421' },
        { label: '[2, 4, 1]', value: '241' },
      ],
      correctAnswer: '214',
      explanation:
        'During the first pass, the largest value (4) moves to the end.',
      hint:
        'Track swaps step by step, not the final sorted array.',
      maxAttempts: 3,
    },

    {
      id: 'bs-t3',
      prompt:
        'Array: [3, 1, 2]\nWhich element is guaranteed to be fixed after the first pass?',
      options: [
        { label: '1', value: '1' },
        { label: '2', value: '2' },
        { label: '3', value: '3' },
        { label: 'None', value: 'none' },
      ],
      correctAnswer: '3',
      explanation:
        'The largest element always ends up in its correct position after one full pass.',
      hint:
        'Focus on which value moves right when swaps happen.',
      maxAttempts: 2,
    },
  ],
},


  predict: {
  title: 'Predict',
  icon: '🎯',
  questions: [
    {
      id: 'bs-p1',
      prompt:
        'Array: [1, 2, 3, 4]\nHow many swaps will Bubble Sort perform?',
      options: [
        { label: '0', value: '0' },
        { label: '1', value: '1' },
        { label: '2', value: '2' },
        { label: '3', value: '3' },
      ],
      correctAnswer: '0',
      explanation:
        'The array is already sorted, so no adjacent elements need to be swapped.',
      hint:
        'Swaps only happen when elements are out of order.',
      maxAttempts: 2,
    },

    {
      id: 'bs-p2',
      prompt:
        'What input arrangement causes the WORST performance for Bubble Sort?',
      options: [
        { label: 'Already sorted array', value: 'sorted' },
        { label: 'Random order', value: 'random' },
        { label: 'Reverse sorted array', value: 'reverse' },
        { label: 'Array with duplicates', value: 'duplicates' },
      ],
      correctAnswer: 'reverse',
      explanation:
        'In reverse order, every comparison leads to a swap, causing maximum work.',
      hint:
        'Think about when the most swaps are required.',
      maxAttempts: 2,
    },

    {
      id: 'bs-p3',
      prompt:
        'If an optimization stops Bubble Sort when no swaps occur, what improves?',
      options: [
        { label: 'Worst-case time', value: 'worst' },
        { label: 'Best-case time', value: 'best' },
        { label: 'Space complexity', value: 'space' },
        { label: 'Stability', value: 'stability' },
      ],
      correctAnswer: 'best',
      explanation:
        'Early exit optimization allows Bubble Sort to stop after one pass if the array is already sorted.',
      hint:
        'Which scenario benefits from stopping early?',
      maxAttempts: 3,
    },
  ],
},
};

import { ChallengeSet } from './challenge.types';

export const DfsChallenge: ChallengeSet = {
  algorithm: 'dfs',
  displayName: 'Depth-First Search',

  quiz: {
    title: 'Quiz',
    icon: '📝',
    questions: [
      {
        id: 'dfs-quiz-1',
        prompt:
          'Depth First Search (DFS) primarily uses which data structure internally?',
        options: [
          { label: 'Stack', value: 'stack' },
          { label: 'Queue', value: 'queue' },
          { label: 'Heap', value: 'heap' },
          { label: 'Hash Table', value: 'hash-table' },
        ],
        correctAnswer: 'stack',
        explanation:
          'DFS uses a stack (explicitly or via recursion) to explore nodes deeply before backtracking.',
        hint: 'Think about how DFS backtracks.',
        maxAttempts: 3,
      },

      {
        id: 'dfs-quiz-2',
        prompt:
          'What is the time complexity of DFS for a graph represented using adjacency lists?',
        options: [
          { label: 'O(V + E)', value: 'v-plus-e' },
          { label: 'O(V^2)', value: 'v-squared' },
          { label: 'O(E log V)', value: 'e-log-v' },
          { label: 'O(V * E)', value: 'v-times-e' },
        ],
        correctAnswer: 'v-plus-e',
        explanation:
          'DFS visits every vertex and edge exactly once.',
        hint: 'Each vertex and edge is processed once.',
        maxAttempts: 3,
      },

      {
        id: 'dfs-quiz-3',
        prompt:
          'Which of the following is NOT typically solved using DFS?',
        options: [
          { label: 'Cycle detection', value: 'cycle' },
          { label: 'Topological sorting', value: 'topo' },
          { label: 'Connected components', value: 'components' },
          { label: 'Shortest path in unweighted graph', value: 'shortest' },
        ],
        correctAnswer: 'shortest',
        explanation:
          'DFS does not guarantee shortest paths in unweighted graphs. BFS is better for that.',
        hint: 'Think about level-wise exploration.',
        maxAttempts: 3,
      },
    ],
  },

  trace: {
    title: 'Trace',
    icon: '🔍',
    questions: [
      {
        id: 'dfs-trace-1',
        prompt:
          'Given graph: A → B, A → C, B → D, B → E. Starting from A, what is the DFS order?',
        options: [
          { label: 'A → B → D → E → C', value: 'a-b-d-e-c' },
          { label: 'A → C → B → D → E', value: 'a-c-b-d-e' },
          { label: 'A → B → C → D → E', value: 'a-b-c-d-e' },
          { label: 'A → C → E → D → B', value: 'a-c-e-d-b' },
        ],
        correctAnswer: 'a-b-d-e-c',
        explanation:
          'DFS explores as deep as possible before backtracking.',
        hint: 'Go deep from B before visiting C.',
        maxAttempts: 3,
      },

      {
        id: 'dfs-trace-2',
        prompt:
          'If DFS starts at node A and neighbors are explored alphabetically, which node is visited immediately after B?',
        options: [
          { label: 'C', value: 'c' },
          { label: 'D', value: 'd' },
          { label: 'E', value: 'e' },
          { label: 'Back to A', value: 'a' },
        ],
        correctAnswer: 'd',
        explanation:
          'After visiting B, DFS explores its first unvisited neighbor D.',
        hint: 'DFS goes deeper before exploring siblings.',
        maxAttempts: 3,
      },

      {
        id: 'dfs-trace-3',
        prompt:
          'In DFS, when do we backtrack?',
        options: [
          { label: 'When we find a shorter path', value: 'shorter' },
          { label: 'When there are no unvisited neighbors', value: 'no-neighbor' },
          { label: 'After visiting two nodes', value: 'two-nodes' },
          { label: 'When stack becomes full', value: 'stack-full' },
        ],
        correctAnswer: 'no-neighbor',
        explanation:
          'DFS backtracks only when the current node has no unvisited adjacent nodes.',
        hint: 'Backtracking happens at dead ends.',
        maxAttempts: 3,
      },
    ],
  },

  predict: {
    title: 'Predict',
    icon: '🔮',
    questions: [
      {
        id: 'dfs-predict-1',
        prompt:
          'If DFS starts from A in the same graph, which node will be visited last?',
        options: [
          { label: 'B', value: 'b' },
          { label: 'C', value: 'c' },
          { label: 'D', value: 'd' },
          { label: 'E', value: 'e' },
        ],
        correctAnswer: 'c',
        explanation:
          'DFS fully explores the B branch first before visiting C last.',
        hint: 'C is explored after finishing the deep branch.',
        maxAttempts: 3,
      },

      {
        id: 'dfs-predict-2',
        prompt:
          'If we replace DFS with BFS in the same graph, which node would be visited first after A?',
        options: [
          { label: 'D', value: 'd' },
          { label: 'B', value: 'b' },
          { label: 'E', value: 'e' },
          { label: 'Back to A', value: 'a' },
        ],
        correctAnswer: 'b',
        explanation:
          'BFS explores neighbors level by level, so B is visited immediately after A.',
        hint: 'Think level-order traversal.',
        maxAttempts: 3,
      },
    ],
  },

  construct: {
    type: 'dfs',
    title: 'Construct',
    icon: '🛠️',
    description:
      'Act as the DFS pointer! Click nodes in the correct DFS order starting from A. Watch the stack grow and shrink as you go deep and backtrack.',
  },
};
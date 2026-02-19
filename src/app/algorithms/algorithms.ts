// ============================================
// TYPES
// ============================================

export interface LinearSearchStep {
  index: number;
  value: number;
  found: boolean;
}

export interface BubbleSortStep {
  array: number[];
  compared: [number, number];
  swapped: boolean;
}

export interface NQueensStep {
  board: number[][];
  row: number;
  col: number;
  action: 'place' | 'remove';
}

// ============================================
// LINEAR SEARCH
// ============================================

export function linearSearch(
  arr: number[],
  target: number
): { index: number; steps: LinearSearchStep[] } {
  const steps: LinearSearchStep[] = [];

  for (let i = 0; i < arr.length; i++) {
    const found = arr[i] === target;

    steps.push({
      index: i,
      value: arr[i],
      found,
    });

    if (found) {
      return { index: i, steps };
    }
  }

  return { index: -1, steps };
}

// ============================================
// BUBBLE SORT
// ============================================

export function bubbleSort(
  arr: number[]
): { result: number[]; steps: BubbleSortStep[] } {
  const a = [...arr];
  const steps: BubbleSortStep[] = [];

  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < a.length - i - 1; j++) {
      let swapped = false;

      if (a[j] > a[j + 1]) {
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
        swapped = true;
      }

      steps.push({
        array: [...a],
        compared: [j, j + 1],
        swapped,
      });
    }
  }

  return { result: a, steps };
}

// ============================================
// N QUEENS
// ============================================

export function solveNQueens(n: number): { solutions: number[][][]; steps: NQueensStep[] } {
  const solutions: number[][][] = [];
  const steps: NQueensStep[] = [];
  const board: number[][] = Array.from({ length: n }, () => Array(n).fill(0));

  function isSafe(row: number, col: number): boolean {
    for (let i = 0; i < row; i++) {
      if (board[i][col] === 1) return false;
    }
    
    for (let i = 0; i < row; i++) {
      if (board[i][row - i + col] === 1) return false;
    }

    for (let i = 0; i < row; i++) {
      if (board[i][col - row + i] === 1) return false;
    }

    return true;
  }

  function backtrack(row: number) {
    if (row === n) {
      solutions.push(board.map(row => [...row]));
      return;
    }

    for (let col = 0; col < n; col++) {
      if (isSafe(row, col)) {
        board[row][col] = 1;
        steps.push({ board: board.map(r => [...r]), row, col, action: 'place' });
        backtrack(row + 1);
        board[row][col] = 0;
        steps.push({ board: board.map(r => [...r]), row, col, action: 'remove' });
      }
    }
  }

  backtrack(0);

  return { solutions, steps };
}
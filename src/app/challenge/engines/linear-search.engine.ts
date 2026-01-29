// app/challenge/engines/linear-search.engine.ts

export type AlgorithmEventType =
  | 'compare'
  | 'move'
  | 'found'
  | 'not_found';

export interface AlgorithmEvent {
  type: AlgorithmEventType;
  payload?: any;
}

export class LinearSearchEngine {
  private pendingFound = false;
  private array: number[];
  private target: number;

  private index = 0;
  private comparisons = 0;
  private done = false;

  private listeners: ((e: AlgorithmEvent) => void)[] = [];

  constructor(array: number[], target: number) {
    this.array = [...array];
    this.target = target;
  }

  onEvent(cb: (e: AlgorithmEvent) => void) {
    this.listeners.push(cb);
  }

  step() {
    if (this.done) return;

    // End condition
    if (this.index >= this.array.length) {
      this.done = true;
      this.emit('not_found', { comparisons: this.comparisons });
      return;
    }

    const value = this.array[this.index];
    this.comparisons++;

    // Emit compare BEFORE deciding
    this.emit('compare', {
      index: this.index,
      value,
      target: this.target,
      comparisons: this.comparisons,
    });

    // If we already decided "found" in previous step
if (this.pendingFound) {
  this.done = true;
  this.emit('found', { index: this.index, comparisons: this.comparisons });
  return;
}

this.comparisons++;

this.emit('compare', {
  index: this.index,
  value,
  target: this.target,
  comparisons: this.comparisons,
});

// Decision is made HERE, but result is deferred
if (value === this.target) {
  this.pendingFound = true;
  return;
}

// Otherwise move forward
this.index++;
this.emit('move', { nextIndex: this.index });
  }

  getState() {
    return {
      index: this.index,
      comparisons: this.comparisons,
      done: this.done,
    };
  }

  private emit(type: AlgorithmEventType, payload?: any) {
    this.listeners.forEach(cb => cb({ type, payload }));
  }
}

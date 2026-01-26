import { Component, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

interface Step {
  step: number;
  line: number;
  action: string;
  variables: { i?: number };
  data: number[];
  message: string;
}

@Component({
  selector: 'app-linear-search',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './linear-search.component.html',
  styleUrls: ['./linear-search.component.css'],
})
export class LinearSearchComponent implements OnDestroy, AfterViewChecked {

  /* -------------------- DATA -------------------- */
  activeTab: 'overview' | 'visualization' | 'complexity' = 'visualization';

  array: number[] = [15, 7, 23, 9, 42, 18, 31];
  target = 42;
  arrayInput = '15, 7, 23, 9, 42, 18, 31';

  steps: Step[] = [];
  currentStepIndex = 0;

  isPlaying = false;
  speed = 1000;
  private intervalId: any = null;

  /* -------------------- SPLIT VIEW -------------------- */

  codePanelWidth = 45;
  private isResizing = false;

  private readonly MIN_WIDTH = 25;
  private readonly MAX_WIDTH = 70;

  /* -------------------- VIEW CHILDREN (for auto-scroll) -------------------- */

  @ViewChild('codeScroller') codeScroller!: ElementRef;
  @ViewChild('line1') line1!: ElementRef;
  @ViewChild('line2') line2!: ElementRef;
  @ViewChild('line3') line3!: ElementRef;
  @ViewChild('line4') line4!: ElementRef;
  @ViewChild('line5') line5!: ElementRef;

  private lastActiveLine = 0;

  constructor(private http: HttpClient) {}

  /* -------------------- GETTERS -------------------- */

  get currentStep(): Step | null {
    return this.steps.length ? this.steps[this.currentStepIndex] : null;
  }

  get progressPercentage(): number {
    return this.steps.length
      ? ((this.currentStepIndex + 1) / this.steps.length) * 100
      : 0;
  }

  /* -------------------- BACKEND -------------------- */

  runSearch(): void {
    this.parseArrayInput();

    if (!this.array.length) {
      alert('Please enter a valid array');
      return;
    }

    this.http
      .post<{ steps: Step[] }>('http://localhost:5000/linear-search', {
        array: this.array,
        target: this.target,
      })
      .subscribe({
        next: res => {
          this.steps = res.steps;
          this.currentStepIndex = 0;
          this.isPlaying = false;
          this.clearPlayInterval();
          
          // Auto-start playback after a brief delay
          setTimeout(() => {
            this.handlePlayPause();
          }, 500);
        },
        error: err => {
          console.error(err);
          alert('Flask backend not reachable on port 5000');
        },
      });
  }

  parseArrayInput(): void {
    this.array = this.arrayInput
      .split(',')
      .map(v => parseInt(v.trim(), 10))
      .filter(v => !isNaN(v));
  }

  resetToEdit(): void {
    this.steps = [];
    this.currentStepIndex = 0;
    this.isPlaying = false;
    this.clearPlayInterval();
  }

  /* -------------------- PLAYBACK -------------------- */

  handlePlayPause(): void {
    if (!this.steps.length) return;

    // If at end, restart from beginning
    if (this.currentStepIndex >= this.steps.length - 1 && !this.isPlaying) {
      this.currentStepIndex = 0;
    }

    this.isPlaying = !this.isPlaying;

    if (this.isPlaying) {
      this.startPlaying();
    } else {
      this.clearPlayInterval();
    }
  }

  startPlaying(): void {
    this.clearPlayInterval();

    this.intervalId = setInterval(() => {
      if (this.currentStepIndex < this.steps.length - 1) {
        this.currentStepIndex++;
      } else {
        this.isPlaying = false;
        this.clearPlayInterval();
      }
    }, this.speed);
  }

  clearPlayInterval(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  handleReset(): void {
    this.isPlaying = false;
    this.clearPlayInterval();
    this.currentStepIndex = 0;
  }

  handlePrevious(): void {
    this.isPlaying = false;
    this.clearPlayInterval();
    this.currentStepIndex = Math.max(0, this.currentStepIndex - 1);
  }

  handleNext(): void {
    this.isPlaying = false;
    this.clearPlayInterval();
    this.currentStepIndex = Math.min(
      this.steps.length - 1,
      this.currentStepIndex + 1
    );
  }

  onSpeedChange(): void {
    if (this.isPlaying) {
      this.startPlaying();
    }
  }

  /* -------------------- CODE LINE HIGHLIGHTING -------------------- */

  isLineActive(lineNumber: number): boolean {
    return this.currentStep?.line === lineNumber;
  }

  getLineExplanation(lineNumber: number): string {
  switch (lineNumber) {
    case 1:
      return 'Starting the linear search function. We receive an array and a target value to find.';
    case 2:
      return `We start looping through each element in the array, one by one from index 0 to ${this.array.length - 1}.`;
    case 3:
      return `Comparing the current element at index ${this.currentStep?.variables?.i ?? 0} with our target value ${this.target}.`;
    case 4:
      return `Match found! The target value ${this.target} is at index ${this.currentStep?.variables?.i ?? 0}. Returning this index and stopping the search.`;
    case 5:
      return `We've checked all ${this.array.length} elements in the array and didn't find the target value ${this.target}. Returning -1 to indicate "not found".`;
    default:
      return '';
  }
}

  /* -------------------- AUTO-SCROLL CODE -------------------- */

  ngAfterViewChecked(): void {
    if (this.currentStep && this.currentStep.line !== this.lastActiveLine) {
      this.scrollToActiveLine(this.currentStep.line);
      this.lastActiveLine = this.currentStep.line;
    }
  }

  private scrollToActiveLine(lineNumber: number): void {
    let lineElement: ElementRef | undefined;

    switch (lineNumber) {
      case 1: lineElement = this.line1; break;
      case 2: lineElement = this.line2; break;
      case 3: lineElement = this.line3; break;
      case 4: lineElement = this.line4; break;
      case 5: lineElement = this.line5; break;
    }

    if (lineElement && this.codeScroller) {
      const element = lineElement.nativeElement as HTMLElement;
      const container = this.codeScroller.nativeElement as HTMLElement;

      // Scroll to center the active line
      const elementTop = element.offsetTop;
      const containerHeight = container.clientHeight;
      const elementHeight = element.clientHeight;
      
      container.scrollTo({
        top: elementTop - (containerHeight / 2) + (elementHeight / 2),
        behavior: 'smooth'
      });
    }
  }

  /* -------------------- RESIZER -------------------- */

  onResizerMouseDown(event: MouseEvent): void {
    event.preventDefault();
    this.isResizing = true;

    window.addEventListener('mousemove', this.onMouseMove);
    window.addEventListener('mouseup', this.onMouseUp);
  }

  private onMouseMove = (event: MouseEvent): void => {
    if (!this.isResizing) return;

    const percentage = (event.clientX / window.innerWidth) * 100;
    this.codePanelWidth = this.clampWidth(percentage);
  };

  private onMouseUp = (): void => {
    this.isResizing = false;
    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('mouseup', this.onMouseUp);
  };

  onResizerTouchStart(event: TouchEvent): void {
    this.isResizing = true;

    window.addEventListener('touchmove', this.onTouchMove, { passive: false });
    window.addEventListener('touchend', this.onTouchEnd);
  }

  private onTouchMove = (event: TouchEvent): void => {
    if (!this.isResizing) return;

    const touch = event.touches[0];
    const percentage = (touch.clientX / window.innerWidth) * 100;
    this.codePanelWidth = this.clampWidth(percentage);
  };

  private onTouchEnd = (): void => {
    this.isResizing = false;
    window.removeEventListener('touchmove', this.onTouchMove);
    window.removeEventListener('touchend', this.onTouchEnd);
  };

  private clampWidth(value: number): number {
    return Math.min(this.MAX_WIDTH, Math.max(this.MIN_WIDTH, value));
  }

  /* -------------------- UI HELPERS -------------------- */

  getActionColor(action: string): string {
    switch (action) {
      case 'start': return '#3b82f6';
      case 'compare': return '#f59e0b';
      case 'found': return '#10b981';
      case 'not_found': return '#ef4444';
      default: return '#6b7280';
    }
  }

  getActionIcon(action: string): string {
    switch (action) {
      case 'start': return '🚀';
      case 'compare': return '🔍';
      case 'found': return '✅';
      case 'not_found': return '❌';
      default: return '•';
    }
  }

  getActionLabel(action: string): string {
    switch (action) {
      case 'start': return 'STARTING';
      case 'compare': return 'COMPARING';
      case 'found': return 'FOUND';
      case 'not_found': return 'NOT FOUND';
      default: return action.toUpperCase();
    }
  }

  isCurrentIndex(index: number): boolean {
    return this.currentStep?.variables?.i === index;
  }

  isFound(index: number): boolean {
    return this.currentStep?.action === 'found' && this.isCurrentIndex(index);
  }

  isTarget(value: number): boolean {
    return value === this.target;
  }

  getSpeedLabel(): string {
    return `${(2200 - this.speed) / 1000}x`;
  }

  /* -------------------- CLEANUP -------------------- */

  ngOnDestroy(): void {
    this.clearPlayInterval();
    this.onMouseUp();
    this.onTouchEnd();
  }
}
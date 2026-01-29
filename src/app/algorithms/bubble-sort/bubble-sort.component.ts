import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { AlgorithmService } from '../../services/algorithm.service';

interface Step {
  step: number;
  line: number;
  action: string;
  variables: { i?: number; j?: number; n?: number };
  data: number[];
  message: string;
}

@Component({
  selector: 'app-bubble-sort',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './bubble-sort.component.html',
  styleUrls: ['./bubble-sort.component.css'],
})
export class BubbleSortComponent implements OnDestroy, AfterViewChecked, OnInit {

  algorithmMeta: any = null;

  /* -------------------- DATA -------------------- */
  activeTab: 'overview' | 'visualization' | 'complexity' = 'visualization';

  array: number[] = [64, 34, 25, 12, 22, 11, 90];
  arrayInput = '64, 34, 25, 12, 22, 11, 90';

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
  @ViewChild('line6') line6!: ElementRef;
  @ViewChild('line7') line7!: ElementRef;

  private lastActiveLine = 0;

  constructor(
    private http: HttpClient,
    private algorithmService: AlgorithmService
  ) {}

  ngOnInit(): void {
    this.algorithmService.getAlgorithm('bubble-sort')
      .subscribe({
        next: data => {
          this.algorithmMeta = data;
          console.log('ALGO META:', data);
        },
        error: err => {
          console.error('Algorithm metadata load failed', err);
        }
      });
  }

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

  runSort(): void {
    this.parseArrayInput();

    if (!this.array.length) {
      alert('Please enter a valid array');
      return;
    }

    this.http
      .post<{ steps: Step[] }>('http://localhost:5000/bubble-sort', {
        array: this.array,
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
    const step = this.currentStep;
    if (!step) return '';

    switch (lineNumber) {
      case 1:
        return 'Starting the bubble sort function. We receive an array that needs to be sorted.';
      case 2:
        return `Getting the length of the array: n = ${step.variables?.n ?? this.array.length}. This helps us know how many passes we need.`;
      case 3:
        return `Outer loop iteration ${(step.variables?.i ?? 0) + 1} of ${step.variables?.n ?? this.array.length}. Each pass will bubble the largest unsorted element to its position.`;
      case 4:
        return `Inner loop comparing adjacent elements. We check up to index ${(step.variables?.n ?? this.array.length) - (step.variables?.i ?? 0) - 1} since the last ${step.variables?.i ?? 0} elements are already sorted.`;
      case 5:
        return `Comparing elements at index ${step.variables?.j ?? 0} (${step.data[step.variables?.j ?? 0]}) and ${(step.variables?.j ?? 0) + 1} (${step.data[(step.variables?.j ?? 0) + 1]}). Checking if they need to be swapped.`;
      case 6:
        return `Swapping! Element ${step.data[step.variables?.j ?? 0]} at index ${step.variables?.j ?? 0} is greater than ${step.data[(step.variables?.j ?? 0) + 1]} at index ${(step.variables?.j ?? 0) + 1}, so we swap them.`;
      case 7:
        return 'Bubble sort complete! The array is now fully sorted and we return the result.';
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
      case 6: lineElement = this.line6; break;
      case 7: lineElement = this.line7; break;
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
      case 'swap': return '#ec4899';
      case 'complete': return '#10b981';
      default: return '#6b7280';
    }
  }

  getActionIcon(action: string): string {
    switch (action) {
      case 'start': return '🚀';
      case 'compare': return '🔍';
      case 'swap': return '🔄';
      case 'complete': return '✅';
      default: return '•';
    }
  }

  getActionLabel(action: string): string {
    switch (action) {
      case 'start': return 'STARTING';
      case 'compare': return 'COMPARING';
      case 'swap': return 'SWAPPING';
      case 'complete': return 'COMPLETE';
      default: return action.toUpperCase();
    }
  }

  isComparingIndex(index: number): boolean {
    if (!this.currentStep) return false;
    const j = this.currentStep.variables?.j;
    if (j === undefined) return false;
    return index === j || index === j + 1;
  }

  isSwappingIndex(index: number): boolean {
    if (!this.currentStep || this.currentStep.action !== 'swap') return false;
    const j = this.currentStep.variables?.j;
    if (j === undefined) return false;
    return index === j || index === j + 1;
  }

  isSorted(index: number): boolean {
    if (!this.currentStep) return false;
    const n = this.currentStep.variables?.n ?? this.array.length;
    const i = this.currentStep.variables?.i ?? 0;
    // Elements from (n - i) onwards are sorted
    return index >= (n - i);
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
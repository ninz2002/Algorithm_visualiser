import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  AfterViewChecked,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

interface DfsStep {
  step: number;
  line: number;
  action: string;
  variables: { start?: string; node?: string; from?: string; to?: string };
  data: { stack: string[]; visited: string[] };
  message: string;
}

@Component({
  selector: 'app-dfs',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './dfs.component.html',
  styleUrls: ['./dfs.component.css'],
})
export class DfsComponent implements OnInit, OnDestroy, AfterViewChecked {
  constructor(private http: HttpClient) {}

  // ============================================================
  // TABS
  // ============================================================

  activeTab: 'overview' | 'visualization' | 'complexity' = 'visualization';

  // ============================================================
  // GRAPH DATA
  // ============================================================

  graphNodes: string[] = [];
  graphEdges: [string, string][] = [];
  adjacency: Record<string, string[]> = {};
  nodePositions: Record<string, { x: number; y: number }> = {};

  containerWidth = 680;
  containerHeight = 400;

  // ============================================================
  // CONFIG — nodes/edges with live clamping
  // ============================================================

  private _nodesInput = 6;

  get nodesInput(): number { return this._nodesInput; }
  set nodesInput(v: number) {
    this._nodesInput = Math.min(10, Math.max(4, +v));
    this._edgesInput = Math.min(this.maxEdges, Math.max(this.minEdges, this._edgesInput));
  }

  private _edgesInput = 7;

  get edgesInput(): number { return this._edgesInput; }
  set edgesInput(v: number) {
    this._edgesInput = Math.min(this.maxEdges, Math.max(this.minEdges, +v));
  }

  get minEdges(): number { return this._nodesInput - 1; }
  get maxEdges(): number { return this._nodesInput - 1 + Math.floor(this._nodesInput / 2); }

  // ============================================================
  // DFS STATE
  // ============================================================

  steps: DfsStep[] = [];
  currentStepIndex = 0;

  currentStack: string[] = [];
  currentVisited: string[] = [];
  currentNode: string | null = null;
  activeEdge: [string, string] | null = null;

  // ============================================================
  // PLAYBACK
  // ============================================================

  isPlaying = false;
  speed = 1400;
  private intervalId: any = null;

  // ============================================================
  // EXPLANATION (always-on, plain English, keyed by action)
  // ============================================================

  get explanationTitle(): string {
    switch (this.currentStep?.action) {
      case 'start_component':    return '🚀 Starting DFS';
      case 'pop':                return '📤 Popping from Stack';
      case 'skip':               return '⏭️ Already Visited — Skipping';
      case 'visit':              return '👁️ Marking as Visited';
      case 'push':               return '📥 Pushing Neighbor';
      case 'complete_component': return '🔗 Component Complete';
      case 'complete_all':       return '✅ DFS Finished!';
      default:                   return '💡 What\'s happening?';
    }
  }

  get explanationText(): string {
    const step = this.currentStep;
    if (!step) return '';
    switch (step.action) {
      case 'start_component':
        return `We begin DFS from node ${step.variables.start}. It's pushed onto the stack — our "to-do list". DFS always takes the most recent item off the top.`;

      case 'pop':
        return `Node ${step.variables.node} is taken off the top of the stack. Whatever was pushed last gets processed first — this LIFO order is what makes DFS go deep before going wide.`;

      case 'skip':
        return `Node ${step.variables.node} is already in our visited set, so we skip it. Without this check, we'd loop forever in graphs with cycles.`;

      case 'visit':
        return `First time seeing node ${step.variables.node}! We mark it visited and will now look at all its neighbors. Any unvisited ones get pushed onto the stack.`;

      case 'push':
        return `Neighbor ${step.variables.to} (found from ${step.variables.from}) hasn't been visited yet — it goes on top of the stack and will be explored before anything below it.`;

      case 'complete_component':
        return `Stack is empty — we've fully explored this connected component. If isolated nodes remain, DFS starts a new component from one of them.`;

      case 'complete_all':
        return `Done! Every node has been visited. The visited list shows the exact order DFS explored them — always diving deep before backtracking.`;

      default:
        return '';
    }
  }

  // ============================================================
  // SPLIT VIEW
  // ============================================================

  codePanelWidth = 42;
  private isResizing = false;
  private readonly MIN_WIDTH = 25;
  private readonly MAX_WIDTH = 70;

  // ============================================================
  // CODE SCROLL
  // ============================================================

  @ViewChild('codeScroller') codeScroller!: ElementRef;
  @ViewChild('line1') line1!: ElementRef;
  @ViewChild('line2') line2!: ElementRef;
  @ViewChild('line3') line3!: ElementRef;
  @ViewChild('line4') line4!: ElementRef;
  @ViewChild('line5') line5!: ElementRef;
  @ViewChild('line6') line6!: ElementRef;
  @ViewChild('line7') line7!: ElementRef;

  private lastActiveLine = 0;

  // ============================================================
  // LIFECYCLE
  // ============================================================

  ngOnInit(): void {}

  ngAfterViewChecked(): void {
    if (this.currentStep && this.currentStep.line !== this.lastActiveLine) {
      this.scrollToActiveLine(this.currentStep.line);
      this.lastActiveLine = this.currentStep.line;
    }
  }

  ngOnDestroy(): void {
    this.clearPlayInterval();
    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('mouseup', this.onMouseUp);
  }

  // ============================================================
  // GETTERS
  // ============================================================

  get currentStep(): DfsStep | null {
    return this.steps.length ? this.steps[this.currentStepIndex] : null;
  }

  get progressPercentage(): number {
    return this.steps.length
      ? ((this.currentStepIndex + 1) / this.steps.length) * 100
      : 0;
  }

  get hasGraph(): boolean { return this.graphNodes.length > 0; }

  get stackReversed(): string[] {
    return [...(this.currentStep?.data.stack ?? [])].reverse();
  }

  // ============================================================
  // BACKEND
  // ============================================================

  runDFS(): void {
    this.http
      .post<any>('http://127.0.0.1:5000/dfs', {
        nodes: this.nodesInput,
        edges: this.edgesInput,
      })
      .subscribe({
        next: (res) => {
          this.graphNodes = res.graph.nodes;
          this.graphEdges = res.graph.edges;
          this.adjacency = res.graph.adjacency;
          this.steps = res.steps;

          this.currentStepIndex = 0;
          this.isPlaying = false;
          this.clearPlayInterval();
          this.lastActiveLine = 0;

          this.generatePositions();
          this.updateStateFromStep();
          setTimeout(() => this.handlePlayPause(), 500);
        },
        error: () => alert('Flask backend not reachable on port 5000'),
      });
  }

  resetToEdit(): void {
    this.steps = [];
    this.graphNodes = [];
    this.graphEdges = [];
    this.adjacency = {};
    this.nodePositions = {};
    this.currentStepIndex = 0;
    this.isPlaying = false;
    this.clearPlayInterval();
    this.currentStack = [];
    this.currentVisited = [];
    this.currentNode = null;
    this.activeEdge = null;
  }

  // ============================================================
  // STEP LOGIC
  // ============================================================

  updateStateFromStep(): void {
    const step = this.currentStep;
    if (!step) return;

    this.currentStack = step.data.stack;
    this.currentVisited = step.data.visited;

    if (['pop', 'visit', 'skip'].includes(step.action)) {
      this.currentNode = step.variables.node ?? null;
    } else if (step.action === 'start_component') {
      this.currentNode = step.variables.start ?? null;
    } else if (step.action === 'push') {
      this.currentNode = step.variables.from ?? null;
      if (step.variables.from && step.variables.to) {
        this.activeEdge = [step.variables.from, step.variables.to];
      }
    } else {
      this.currentNode = null;
      this.activeEdge = null;
    }

    if (step.action !== 'push') this.activeEdge = null;
  }

  // ============================================================
  // PLAYBACK
  // ============================================================

  handlePlayPause(): void {
    if (!this.steps.length) return;

    if (this.currentStepIndex >= this.steps.length - 1 && !this.isPlaying) {
      this.currentStepIndex = 0;
      this.updateStateFromStep();
    }

    this.isPlaying = !this.isPlaying;
    this.isPlaying ? this.startPlaying() : this.clearPlayInterval();
  }

  startPlaying(): void {
    this.clearPlayInterval();
    this.intervalId = setInterval(() => {
      if (this.currentStepIndex < this.steps.length - 1) {
        this.currentStepIndex++;
        this.updateStateFromStep();
      } else {
        this.isPlaying = false;
        this.clearPlayInterval();
      }
    }, this.speed);
  }

  clearPlayInterval(): void {
    if (this.intervalId) { clearInterval(this.intervalId); this.intervalId = null; }
  }

  handleReset(): void {
    this.isPlaying = false;
    this.clearPlayInterval();
    this.currentStepIndex = 0;
    this.updateStateFromStep();
  }

  handlePrevious(): void {
    this.isPlaying = false;
    this.clearPlayInterval();
    this.currentStepIndex = Math.max(0, this.currentStepIndex - 1);
    this.updateStateFromStep();
  }

  handleNext(): void {
    this.isPlaying = false;
    this.clearPlayInterval();
    this.currentStepIndex = Math.min(this.steps.length - 1, this.currentStepIndex + 1);
    this.updateStateFromStep();
  }

  onSpeedChange(): void { if (this.isPlaying) this.startPlaying(); }
  getSpeedLabel(): string { return `${(2200 - this.speed) / 1000}x`; }

  // ============================================================
  // GRAPH LAYOUT
  // ============================================================

  generatePositions(): void {
    const n = this.graphNodes.length;
    const minDist = 90;
    this.nodePositions = {};
    const padding = 60;

    for (let i = 0; i < n; i++) {
      const node = this.graphNodes[i];
      const angle = (2 * Math.PI * i) / n - Math.PI / 2;
      this.nodePositions[node] = {
        x: this.containerWidth / 2 + (this.containerWidth - padding * 2) * 0.38 * Math.cos(angle),
        y: this.containerHeight / 2 + (this.containerHeight - padding * 2) * 0.38 * Math.sin(angle),
      };
    }

    for (let iter = 0; iter < 200; iter++) {
      let settled = true;
      for (const a of this.graphNodes) {
        for (const b of this.graphNodes) {
          if (a === b) continue;
          const pa = this.nodePositions[a]!;
          const pb = this.nodePositions[b]!;
          const dx = pa.x - pb.x, dy = pa.y - pb.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < minDist && dist > 0) {
            settled = false;
            const push = (minDist - dist) / 2 + 1;
            pa.x += (dx / dist) * push; pa.y += (dy / dist) * push;
            pb.x -= (dx / dist) * push; pb.y -= (dy / dist) * push;
          }
        }
      }
      for (const node of this.graphNodes) {
        const p = this.nodePositions[node]!;
        p.x = Math.max(padding, Math.min(this.containerWidth - padding, p.x));
        p.y = Math.max(padding, Math.min(this.containerHeight - padding, p.y));
      }
      if (settled) break;
    }
  }

  // ============================================================
  // NODE / EDGE HELPERS
  // ============================================================

  isVisited(node: string): boolean { return this.currentVisited.includes(node); }
  isCurrent(node: string): boolean { return this.currentNode === node; }
  isInStack(node: string): boolean { return this.currentStack.includes(node); }

  isActiveEdge(edge: [string, string]): boolean {
    if (!this.activeEdge) return false;
    const [a, b] = this.activeEdge;
    return (edge[0] === a && edge[1] === b) || (edge[0] === b && edge[1] === a);
  }

  isTraversedEdge(edge: [string, string]): boolean {
    return this.currentVisited.includes(edge[0]) && this.currentVisited.includes(edge[1]);
  }

  getNodeX(node: string): number { return this.nodePositions[node]?.x ?? 0; }
  getNodeY(node: string): number { return this.nodePositions[node]?.y ?? 0; }
  getNodeLeft(node: string): number { return (this.nodePositions[node]?.x ?? 0) - 22; }
  getNodeTop(node: string):  number { return (this.nodePositions[node]?.y ?? 0) - 22; }

  // ============================================================
  // CODE / ACTION HELPERS
  // ============================================================

  isLineActive(line: number): boolean { return this.currentStep?.line === line; }

  getActionColor(action: string): string {
    switch (action) {
      case 'start_component':    return '#3b82f6';
      case 'pop':                return '#f59e0b';
      case 'skip':               return '#6b7280';
      case 'visit':              return '#8b5cf6';
      case 'push':               return '#ec4899';
      case 'complete_component':
      case 'complete_all':       return '#10b981';
      default:                   return '#6b7280';
    }
  }

  getActionIcon(action: string): string {
    switch (action) {
      case 'start_component': return '🚀';
      case 'pop':             return '📤';
      case 'skip':            return '⏭️';
      case 'visit':           return '👁️';
      case 'push':            return '📥';
      case 'complete_component':
      case 'complete_all':    return '✅';
      default:                return '•';
    }
  }

  getActionLabel(action: string): string {
    switch (action) {
      case 'start_component':    return 'START';
      case 'pop':                return 'POP';
      case 'skip':               return 'SKIP';
      case 'visit':              return 'VISIT';
      case 'push':               return 'PUSH';
      case 'complete_component': return 'COMPONENT DONE';
      case 'complete_all':       return 'COMPLETE';
      default:                   return action.toUpperCase();
    }
  }

  // ============================================================
  // CODE AUTO-SCROLL
  // ============================================================

  private scrollToActiveLine(lineNumber: number): void {
    const refs: Record<number, ElementRef> = {
      1: this.line1, 2: this.line2, 3: this.line3,
      4: this.line4, 5: this.line5, 6: this.line6, 7: this.line7,
    };
    const ref = refs[lineNumber];
    if (ref && this.codeScroller) {
      const el = ref.nativeElement as HTMLElement;
      const c  = this.codeScroller.nativeElement as HTMLElement;
      c.scrollTo({ top: el.offsetTop - c.clientHeight / 2 + el.clientHeight / 2, behavior: 'smooth' });
    }
  }

  // ============================================================
  // RESIZER
  // ============================================================

  onResizerMouseDown(event: MouseEvent): void {
    event.preventDefault();
    this.isResizing = true;
    window.addEventListener('mousemove', this.onMouseMove);
    window.addEventListener('mouseup', this.onMouseUp);
  }

  private onMouseMove = (e: MouseEvent): void => {
    if (!this.isResizing) return;
    this.codePanelWidth = this.clampWidth((e.clientX / window.innerWidth) * 100);
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

  private onTouchMove = (e: TouchEvent): void => {
    if (!this.isResizing) return;
    this.codePanelWidth = this.clampWidth((e.touches[0].clientX / window.innerWidth) * 100);
  };

  private onTouchEnd = (): void => {
    this.isResizing = false;
    window.removeEventListener('touchmove', this.onTouchMove);
    window.removeEventListener('touchend', this.onTouchEnd);
  };

  private clampWidth(v: number): number {
    return Math.min(this.MAX_WIDTH, Math.max(this.MIN_WIDTH, v));
  }
}
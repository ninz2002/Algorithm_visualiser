import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

// ============================================
// GRAPH DEFINITION
// ============================================

export interface GraphNode {
  id: string;
  label: string;
  x: number; // percentage position for SVG layout
  y: number;
}

export interface GraphEdge {
  from: string;
  to: string;
}

// The graph: A is root, two main branches (B and C), with deeper children
// DFS order (alphabetical): A → B → D → F → (back) → E → G → (back) → C
// BFS order would be:       A → B → C → D → E → F → G
const GRAPH_NODES: GraphNode[] = [
  { id: 'A', label: 'A', x: 50,  y: 8  },
  { id: 'B', label: 'B', x: 25,  y: 28 },
  { id: 'C', label: 'C', x: 75,  y: 28 },
  { id: 'D', label: 'D', x: 15,  y: 52 },
  { id: 'E', label: 'E', x: 38,  y: 52 },
  { id: 'F', label: 'F', x: 10,  y: 76 },
  { id: 'G', label: 'G', x: 38,  y: 76 },
];

const GRAPH_EDGES: GraphEdge[] = [
  { from: 'A', to: 'B' },
  { from: 'A', to: 'C' },
  { from: 'B', to: 'D' },
  { from: 'B', to: 'E' },
  { from: 'D', to: 'F' },
  { from: 'E', to: 'G' },
];

// Adjacency list (sorted alphabetically so DFS is deterministic)
const ADJACENCY: Record<string, string[]> = {
  A: ['B', 'C'],
  B: ['D', 'E'],
  C: [],
  D: ['F'],
  E: ['G'],
  F: [],
  G: [],
};

// Pre-computed correct DFS visit order
const CORRECT_DFS_ORDER = ['A', 'B', 'D', 'F', 'E', 'G', 'C'];

@Component({
  selector: 'app-dfs-construct',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dfs-construct">

      <!-- HEADER -->
      <div class="dfs-header">
        <h3>Path Painter</h3>
        <p class="dfs-subtitle">
          You are the DFS pointer. Click nodes in DFS order starting from
          <strong>A</strong>. Go deep before going wide!
        </p>
      </div>

      <!-- MAIN LAYOUT: graph + stack side by side -->
      <div class="dfs-layout">

        <!-- GRAPH -->
        <div class="dfs-graph-wrap">
          <svg
            class="dfs-svg"
            viewBox="0 0 100 90"
            preserveAspectRatio="xMidYMid meet">

            <!-- EDGES -->
            <g class="edges">
              <line
                *ngFor="let edge of edges"
                [attr.x1]="getNode(edge.from)!.x"
                [attr.y1]="getNode(edge.from)!.y"
                [attr.x2]="getNode(edge.to)!.x"
                [attr.y2]="getNode(edge.to)!.y"
                [class.edge-traversed]="isEdgeTraversed(edge)"
                [class.edge-active]="isEdgeActive(edge)"
                class="graph-edge" />
            </g>

            <!-- NODES -->
            <g class="nodes" *ngFor="let node of nodes">
              <circle
                [attr.cx]="node.x"
                [attr.cy]="node.y"
                r="5.5"
                class="graph-node"
                [class.node-visited]="isVisited(node.id)"
                [class.node-current]="currentNode === node.id"
                [class.node-invalid-flash]="flashingNode === node.id"
                [class.node-on-stack]="isOnStack(node.id)"
                (click)="onNodeClick(node.id)" />
              <text
                [attr.x]="node.x"
                [attr.y]="node.y + 0.6"
                class="node-label"
                text-anchor="middle"
                dominant-baseline="middle">
                {{ node.label }}
              </text>
            </g>

          </svg>

          <!-- LEGEND -->
          <div class="dfs-legend">
            <span class="legend-item">
              <span class="legend-dot visited"></span> Visited
            </span>
            <span class="legend-item">
              <span class="legend-dot current"></span> Current
            </span>
            <span class="legend-item">
              <span class="legend-dot on-stack"></span> On Stack
            </span>
          </div>
        </div>

        <!-- GHOST STACK -->
        <div class="dfs-stack-panel">
          <div class="stack-title">
            <span class="stack-icon">📚</span>
            Call Stack
            <span class="stack-lifo">(LIFO)</span>
          </div>

          <div class="stack-body">
            <div class="stack-empty" *ngIf="stack.length === 0">
              Empty
            </div>

            <!-- Stack renders top-first so newest entry is visually at top -->
            <div
              *ngFor="let frame of stackDisplay; let i = index"
              class="stack-frame"
              [class.stack-frame-top]="i === 0"
              [class.stack-frame-popping]="frame.popping">
              <span class="stack-frame-label">{{ frame.node }}</span>
              <span class="stack-frame-arrow" *ngIf="i === 0">← top</span>
            </div>
          </div>

          <div class="stack-hint" *ngIf="stack.length > 0 && !isComplete">
            Next: explore deepest unvisited neighbour of
            <strong>{{ stack[stack.length - 1] }}</strong>
          </div>
        </div>

      </div>

      <!-- VISIT ORDER TRAIL -->
      <div class="dfs-trail">
        <span class="trail-label">Visit order:</span>
        <span
          *ngFor="let n of visitedOrder; let i = index"
          class="trail-node"
          [class.trail-node-first]="i === 0">
          {{ i > 0 ? '→ ' : '' }}{{ n }}
        </span>
      </div>

      <!-- FEEDBACK BAR -->
      <div
        class="dfs-feedback"
        *ngIf="feedbackMsg"
        [class.feedback-correct]="feedbackType === 'correct'"
        [class.feedback-wrong]="feedbackType === 'wrong'"
        [class.feedback-info]="feedbackType === 'info'">
        {{ feedbackMsg }}
      </div>

      <!-- SUCCESS STATE -->
      <div class="dfs-success" *ngIf="isComplete">
        <div class="success-icon">🎉</div>
        <h4>Perfect DFS Traversal!</h4>
        <p>You visited all {{ nodes.length }} nodes in correct DFS order!</p>
        <div class="success-order">
          <span *ngFor="let n of visitedOrder; let i = index" class="success-node">
            {{ i > 0 ? '→' : '' }} {{ n }}
          </span>
        </div>
      </div>

      <!-- CONTROLS -->
      <div class="dfs-controls">
        <button class="action-btn secondary" (click)="resetTraversal()">
          ↺ Reset
        </button>
      </div>

    </div>
  `,
  styles: [`
    /* ============================
       LAYOUT
       ============================ */
    .dfs-construct {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      padding: 0.5rem 0;
    }

    .dfs-header h3 {
      font-size: 1.1rem;
      font-weight: 700;
      color: var(--text-primary, #e2e8f0);
      margin: 0 0 0.25rem;
    }

    .dfs-subtitle {
      font-size: 0.82rem;
      color: var(--text-secondary, #94a3b8);
      margin: 0;
      line-height: 1.4;
    }

    .dfs-layout {
      display: flex;
      gap: 1.25rem;
      align-items: flex-start;
    }

    /* ============================
       GRAPH SVG
       ============================ */
    .dfs-graph-wrap {
      flex: 1 1 auto;
      min-width: 0;
    }

    .dfs-svg {
      width: 100%;
      max-width: 320px;
      height: auto;
      display: block;
      margin: 0 auto;
    }

    /* EDGES */
    .graph-edge {
      stroke: #334155;
      stroke-width: 0.8;
      transition: stroke 0.3s, stroke-width 0.3s;
    }
    .edge-traversed {
      stroke: #7c3aed;
      stroke-width: 1.2;
    }
    .edge-active {
      stroke: #a78bfa;
      stroke-width: 1.6;
      filter: drop-shadow(0 0 2px #7c3aed);
    }

    /* NODES */
    .graph-node {
      fill: #1e293b;
      stroke: #475569;
      stroke-width: 0.5;
      cursor: pointer;
      transition: fill 0.2s, stroke 0.2s, filter 0.2s;
    }
    .graph-node:hover {
      filter: brightness(1.3);
    }
    .node-visited {
      fill: #312e81;
      stroke: #6d28d9;
    }
    .node-current {
      fill: #7c3aed;
      stroke: #a78bfa;
      stroke-width: 0.8;
      filter: drop-shadow(0 0 3px #7c3aed);
    }
    .node-on-stack {
      fill: #1e1b4b;
      stroke: #4f46e5;
      stroke-dasharray: 1.2 0.6;
    }
    .node-invalid-flash {
      fill: #7f1d1d !important;
      stroke: #ef4444 !important;
      animation: shake-node 0.4s ease;
    }

    @keyframes shake-node {
      0%   { transform: translateX(0); }
      25%  { transform: translateX(-1px); }
      50%  { transform: translateX(1px); }
      75%  { transform: translateX(-1px); }
      100% { transform: translateX(0); }
    }

    .node-label {
      font-size: 3.5px;
      font-weight: 700;
      fill: #e2e8f0;
      pointer-events: none;
      user-select: none;
    }

    /* ============================
       LEGEND
       ============================ */
    .dfs-legend {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem 1rem;
      margin-top: 0.5rem;
      justify-content: center;
    }
    .legend-item {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      font-size: 0.72rem;
      color: var(--text-secondary, #94a3b8);
    }
    .legend-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      border: 1.5px solid;
    }
    .legend-dot.visited  { background: #312e81; border-color: #6d28d9; }
    .legend-dot.current  { background: #7c3aed; border-color: #a78bfa; }
    .legend-dot.on-stack { background: #1e1b4b; border-color: #4f46e5; border-style: dashed; }

    /* ============================
       GHOST STACK PANEL
       ============================ */
    .dfs-stack-panel {
      flex: 0 0 130px;
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }

    .stack-title {
      font-size: 0.8rem;
      font-weight: 700;
      color: var(--text-primary, #e2e8f0);
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }
    .stack-lifo {
      font-size: 0.68rem;
      font-weight: 400;
      color: #64748b;
    }

    .stack-body {
      background: #0f172a;
      border: 1px solid #1e293b;
      border-radius: 8px;
      padding: 0.5rem;
      min-height: 120px;
      display: flex;
      flex-direction: column;
      gap: 0.3rem;
    }

    .stack-empty {
      color: #334155;
      font-size: 0.75rem;
      text-align: center;
      margin-top: 0.5rem;
    }

    .stack-frame {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.3rem 0.5rem;
      border-radius: 5px;
      background: #1e293b;
      border: 1px solid #334155;
      font-size: 0.78rem;
      font-weight: 600;
      color: #c4b5fd;
      animation: slide-in 0.2s ease;
      transition: background 0.2s, opacity 0.2s;
    }
    .stack-frame-top {
      background: #312e81;
      border-color: #6d28d9;
      color: #a78bfa;
    }
    .stack-frame-popping {
      opacity: 0.3;
      background: #450a0a;
    }
    .stack-frame-label {
      font-size: 0.9rem;
    }
    .stack-frame-arrow {
      font-size: 0.62rem;
      color: #818cf8;
    }

    @keyframes slide-in {
      from { opacity: 0; transform: translateY(-6px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    .stack-hint {
      font-size: 0.7rem;
      color: #64748b;
      line-height: 1.4;
    }
    .stack-hint strong { color: #a78bfa; }

    /* ============================
       VISIT ORDER TRAIL
       ============================ */
    .dfs-trail {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.3rem;
      font-size: 0.8rem;
    }
    .trail-label {
      color: #64748b;
      font-size: 0.75rem;
    }
    .trail-node {
      color: #a78bfa;
      font-weight: 600;
    }
    .trail-node-first {
      color: #34d399;
    }

    /* ============================
       FEEDBACK
       ============================ */
    .dfs-feedback {
      padding: 0.5rem 0.75rem;
      border-radius: 8px;
      font-size: 0.82rem;
      font-weight: 500;
      animation: fade-in 0.2s ease;
    }
    .feedback-correct {
      background: #052e16;
      border: 1px solid #16a34a;
      color: #4ade80;
    }
    .feedback-wrong {
      background: #450a0a;
      border: 1px solid #dc2626;
      color: #fca5a5;
    }
    .feedback-info {
      background: #1e1b4b;
      border: 1px solid #4f46e5;
      color: #a5b4fc;
    }
    @keyframes fade-in {
      from { opacity: 0; transform: translateY(4px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    /* ============================
       SUCCESS
       ============================ */
    .dfs-success {
      background: linear-gradient(135deg, #0d1117 0%, #1a1040 100%);
      border: 1px solid #4f46e5;
      border-radius: 12px;
      padding: 1.25rem;
      text-align: center;
      animation: fade-in 0.4s ease;
    }
    .success-icon { font-size: 2rem; margin-bottom: 0.4rem; }
    .dfs-success h4 {
      font-size: 1rem;
      font-weight: 700;
      color: #e2e8f0;
      margin: 0 0 0.4rem;
    }
    .dfs-success p {
      font-size: 0.82rem;
      color: #94a3b8;
      margin: 0 0 0.75rem;
    }
    .dfs-success strong { color: #a78bfa; }
    .success-order {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 0.3rem;
    }
    .success-node {
      color: #34d399;
      font-weight: 700;
      font-size: 0.9rem;
    }

    /* ============================
       CONTROLS
       ============================ */
    .dfs-controls {
      display: flex;
      justify-content: center;
    }
  `]
})
export class DfsConstructComponent implements OnInit, OnDestroy {

  @Output() traversalComplete = new EventEmitter<void>();

  nodes: GraphNode[] = GRAPH_NODES;
  edges: GraphEdge[] = GRAPH_EDGES;

  // Traversal state
  visitedOrder: string[]  = [];   // nodes clicked in order
  visitedSet   = new Set<string>();
  stack        : string[] = [];   // explicit DFS call stack
  currentNode  : string | null = null;

  flashingNode : string | null = null;
  feedbackMsg  = '';
  feedbackType : 'correct' | 'wrong' | 'info' = 'info';
  isComplete   = false;

  private feedbackTimer: ReturnType<typeof setTimeout> | null = null;

  // ============================================
  // LIFECYCLE
  // ============================================

  ngOnInit(): void {
    this.resetTraversal();
  }

  ngOnDestroy(): void {
    if (this.feedbackTimer) clearTimeout(this.feedbackTimer);
  }

  // ============================================
  // RESET
  // ============================================

  resetTraversal(): void {
    this.visitedOrder = [];
    this.visitedSet   = new Set();
    this.stack        = [];
    this.currentNode  = null;
    this.flashingNode = null;
    this.feedbackMsg  = '';
    this.isComplete   = false;

    this.showFeedback('Click node A to begin the DFS traversal.', 'info', 3000);
  }

  // ============================================
  // NODE CLICK HANDLER
  // ============================================

  onNodeClick(nodeId: string): void {
    if (this.isComplete) return;

    // Already visited
    if (this.visitedSet.has(nodeId)) {
      this.triggerFlash(nodeId);
      this.showFeedback(`${nodeId} is already visited!`, 'wrong');
      return;
    }

    // First click must be A
    if (this.visitedOrder.length === 0) {
      if (nodeId !== 'A') {
        this.triggerFlash(nodeId);
        this.showFeedback('DFS starts from node A. Click A first!', 'wrong');
        return;
      }
      this.visitNode(nodeId);
      return;
    }

    // Subsequent clicks: must be a valid DFS next step
    if (!this.isValidNext(nodeId)) {
      this.triggerFlash(nodeId);
      this.showFeedback(
        `❌ Wrong! Remember: DFS goes deep before going wide.`,
        'wrong'
      );
      return;
    }

    this.visitNode(nodeId);
  }

  // ============================================
  // VISIT A NODE (valid click)
  // ============================================

  private visitNode(nodeId: string): void {
    // Push to stack, mark visited
    this.stack.push(nodeId);
    this.visitedSet.add(nodeId);
    this.visitedOrder.push(nodeId);
    this.currentNode = nodeId;

    const isFirst = this.visitedOrder.length === 1;
    this.showFeedback(
      isFirst
        ? `✅ Starting at ${nodeId}. Explore its deepest unvisited neighbour next.`
        : `✅ Visited ${nodeId}!`,
      'correct',
      1500
    );

    // Auto-backtrack: pop stack frames whose neighbours are all visited
    this.doBacktrack();

    // Check completion
    if (this.visitedOrder.length === GRAPH_NODES.length) {
      setTimeout(() => {
        this.isComplete = true;
        this.stack = [];
        this.currentNode = null;
        this.feedbackMsg = '';
        this.traversalComplete.emit();
      }, 600);
    }
  }

  // ============================================
  // AUTO BACKTRACK
  // Pop stack frames that have no more unvisited neighbours.
  // This is DFS backtracking — the user doesn't manually backtrack,
  // it happens automatically as in a real DFS, updating the visual stack.
  // ============================================

  private doBacktrack(): void {
    // Keep popping as long as the top of stack has no unvisited neighbours
    // But only if it's not the node we just visited (give it a chance to be explored)
    let safeLimit = GRAPH_NODES.length;
    while (
      this.stack.length > 0 &&
      !this.hasUnvisitedNeighbour(this.stack[this.stack.length - 1]) &&
      safeLimit-- > 0
    ) {
      const popped = this.stack.pop()!;
      // Don't pop the most recently placed node until next turn
      if (popped === this.currentNode) {
        this.stack.push(popped); // put it back
        break;
      }
    }
  }

  // ============================================
  // VALID NEXT NODE LOGIC
  //
  // The valid next click is the first unvisited neighbour (alphabetically)
  // of the current top of the DFS stack.
  // If the top has no unvisited neighbours, we pop and check the next frame.
  // ============================================

  isValidNext(nodeId: string): boolean {
    if (this.visitedSet.has(nodeId)) return false;
    return this.getValidNextNodes().includes(nodeId);
  }

  private getValidNextNodes(): string[] {
    if (this.stack.length === 0) return this.visitedSet.size === 0 ? ['A'] : [];

    // Walk down the stack from the top to find the deepest frame
    // that still has an unvisited neighbour
    for (let i = this.stack.length - 1; i >= 0; i--) {
      const frame = this.stack[i];
      const unvisitedNeighbours = (ADJACENCY[frame] || []).filter(
        (n) => !this.visitedSet.has(n)
      );
      if (unvisitedNeighbours.length > 0) {
        // Return only the first (DFS always picks the first unvisited in order)
        return [unvisitedNeighbours[0]];
      }
    }
    return [];
  }

  // ============================================
  // HELPERS
  // ============================================

  hasUnvisitedNeighbour(nodeId: string): boolean {
    return (ADJACENCY[nodeId] || []).some((n) => !this.visitedSet.has(n));
  }

  isVisited(nodeId: string): boolean {
    return this.visitedSet.has(nodeId);
  }

  isOnStack(nodeId: string): boolean {
    return this.stack.includes(nodeId) && nodeId !== this.currentNode;
  }

  getNode(id: string): GraphNode | undefined {
    return GRAPH_NODES.find((n) => n.id === id);
  }

  isEdgeTraversed(edge: GraphEdge): boolean {
    const fi = this.visitedOrder.indexOf(edge.from);
    const ti = this.visitedOrder.indexOf(edge.to);
    return fi !== -1 && ti !== -1 && ti === fi + 1;
  }

  isEdgeActive(edge: GraphEdge): boolean {
    return (
      edge.from === this.currentNode &&
      !this.visitedSet.has(edge.to)
    ) || (
      edge.to === this.currentNode &&
      !this.visitedSet.has(edge.from)
    );
  }

  // Ghost stack — displayed top-first
  get stackDisplay(): { node: string; popping: boolean }[] {
    return [...this.stack]
      .reverse()
      .map((n) => ({ node: n, popping: false }));
  }

  // ============================================
  // FLASH ANIMATION
  // ============================================

  private triggerFlash(nodeId: string): void {
    this.flashingNode = nodeId;
    setTimeout(() => {
      if (this.flashingNode === nodeId) this.flashingNode = null;
    }, 500);
  }

  // ============================================
  // FEEDBACK
  // ============================================

  private showFeedback(
    msg: string,
    type: 'correct' | 'wrong' | 'info' = 'info',
    duration = 2500
  ): void {
    if (this.feedbackTimer) clearTimeout(this.feedbackTimer);
    this.feedbackMsg  = msg;
    this.feedbackType = type;
    this.feedbackTimer = setTimeout(() => {
      this.feedbackMsg = '';
    }, duration);
  }
}
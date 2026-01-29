import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LinearSearchEngine, AlgorithmEvent } from './engines/linear-search.engine';

@Component({
  selector: 'app-challenge',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './challenge.component.html',
  styleUrls: ['./challenge.component.css'],
})
export class ChallengeComponent implements OnInit {

  // -------------------------------
  // Engine
  // -------------------------------
  engine!: LinearSearchEngine;

  // -------------------------------
  // Challenge state
  // -------------------------------
  array = [15, 7, 23, 9, 42];
  target = 42;

  currentIndex = 0;
  challengeFinished = false;
  challengeResult: 'found' | 'not_found' | null = null;


  prompt = '';
  options: { label: string; value: string }[] = [];
  feedback = '';
  explanation = '';

  private expectedAnswer: string | null = null;

  // -------------------------------
  // Init
  // -------------------------------
  ngOnInit(): void {
    this.startChallenge();
  }

  startChallenge(): void {
    this.challengeFinished = false;
    this.feedback = '';
    this.explanation = '';
    this.currentIndex = 0;

    this.engine = new LinearSearchEngine(this.array, this.target);

    this.engine.onEvent((event: AlgorithmEvent) => {
      this.handleEvent(event);
    });

    this.engine.step();
  }

  // -------------------------------
  // Event handling
  // -------------------------------
  handleEvent(event: AlgorithmEvent): void {

    if (event.type === 'compare') {
      this.pauseAndAsk(event);
    }

    if (event.type === 'found' || event.type === 'not_found') {
      this.challengeFinished = true;
      this.challengeResult = event.type;
}
  }

  // -------------------------------
  // Question logic
  // -------------------------------
 pauseAndAsk(event: AlgorithmEvent): void {
  this.currentIndex = event.payload.index; // ✅ FIX

  const { value, target } = event.payload;

  this.prompt = `At index ${event.payload.index}, what happens next?`;

  this.options = [
    { label: 'Move to next index', value: 'move' },
    { label: 'Element found → stop', value: 'found' },
  ];

  this.expectedAnswer = value === target ? 'found' : 'move';
}


  submit(answer: string): void {
    const correct = answer === this.expectedAnswer;

    if (!correct) {
      this.feedback = 'Don’t worry — you’re learning. Try again 💪';
      return;
    }

    this.feedback = 'Correct ✅';

    this.explanation =
      this.expectedAnswer === 'move'
        ? 'The current element does not match the target, so the search continues.'
        : 'The current element matches the target, so the search stops.';

    setTimeout(() => {
      this.feedback = '';
      this.explanation = '';
      this.engine.step();
    }, 2500);

    
  }
  restartChallenge(): void {
  this.challengeResult = null;
  this.challengeFinished = false;
  this.startChallenge();
}

goBackToLearning(): void {
  // for now, just reload learning mode safely
  window.history.back();
}

}

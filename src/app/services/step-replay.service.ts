import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StepReplayService {

  play(
    steps: any[],
    onStep: (step: any) => void,
    delay = 1000
  ) {
    let index = 0;

    const interval = setInterval(() => {
      onStep(steps[index]);
      index++;

      if (index >= steps.length) {
        clearInterval(interval);
      }
    }, delay);
  }
}

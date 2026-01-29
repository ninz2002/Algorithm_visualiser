import { Routes } from '@angular/router';
import { HomeComponent } from './homepage/homepage.component';
import { LinearSearchComponent } from './algorithms/linear-search/linear-search.component';
import { ChallengeComponent } from './challenge/challenge.component';
import { BubbleSortComponent } from './algorithms/bubble-sort/bubble-sort.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'linear-search', component: LinearSearchComponent },
  { path: 'challenge', component: ChallengeComponent },
  { path: 'bubble-sort', component: BubbleSortComponent },

];


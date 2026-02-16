import { Routes } from '@angular/router';
import { HomeComponent } from './homepage/homepage.component';
import { LinearSearchComponent } from './algorithms/linear-search/linear-search.component';
import { ChallengeComponent } from './challenge/challenge.component';
import { BubbleSortComponent } from './algorithms/bubble-sort/bubble-sort.component';
import { NQueensComponent } from './algorithms/n-queens/n-queens.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'linear-search', component: LinearSearchComponent },
  { path: 'challenge/:algorithm', component: ChallengeComponent },
  { path: 'bubble-sort', component: BubbleSortComponent },
  { path: 'n-queens', component: NQueensComponent },

];


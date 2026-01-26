import { Routes } from '@angular/router';
import { HomeComponent } from './homepage/homepage.component';
import { LinearSearchComponent } from './algorithms/linear-search/linear-search.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'linear-search', component: LinearSearchComponent },
  { path: '**', redirectTo: '' },
];

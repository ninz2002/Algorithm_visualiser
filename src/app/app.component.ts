import { Component} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './navbar/navbar.component';
import { ChallengeComponent } from "./challenge/challenge.component";
import { LinearSearchComponent } from "./algorithms/linear-search/linear-search.component";

type Mode = 'learning' | 'challenge';



@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, NavbarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  mode: Mode = 'learning';

  setMode(mode: Mode) {
  this.mode = mode;
}
}



import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, NavigationEnd } from '@angular/router';
import { SearchService } from '../services/search.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent {

  searchQuery = '';
  currentRoute: 'home' | 'learning' | 'challenge' = 'home';
  currentAlgorithm: string | null = null;

  constructor(
    private searchService: SearchService,
    private router: Router
  ) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.detectRoute(event.urlAfterRedirects);
      }
    });
  }

  private detectRoute(url: string) {
  if (url === '/') {
    this.currentRoute = 'home';
    this.currentAlgorithm = null;
    return;
  }

  // Challenge route
  if (url.startsWith('/challenge/')) {
    this.currentRoute = 'challenge';
    this.currentAlgorithm = url.split('/')[2];
    return;
  }

  // Learning route (any algorithm)
  this.currentRoute = 'learning';
  this.currentAlgorithm = url.split('/')[1];
}


  setMode(mode: 'learning' | 'challenge') {
  if (this.currentRoute === 'home' || !this.currentAlgorithm) return;

  if (mode === 'learning') {
    this.router.navigate([`/${this.currentAlgorithm}`]);
  } else {
    this.router.navigate([`/challenge/${this.currentAlgorithm}`]);
  }
}

  onSearchChange(): void {
    this.searchService.setSearchQuery(this.searchQuery);
  }
}

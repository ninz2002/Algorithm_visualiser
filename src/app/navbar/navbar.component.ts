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
  currentRoute: 'home' | 'linear' | 'challenge' = 'home';

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
    } else if (url.startsWith('/linear-search')) {
      this.currentRoute = 'linear';
    } else if (url.startsWith('/challenge')) {
      this.currentRoute = 'challenge';
    }
  }

  setMode(mode: 'learning' | 'challenge') {
    // 🚫 Disable toggle on home
    if (this.currentRoute === 'home') return;

    if (mode === 'learning') {
      this.router.navigate(['/linear-search']);
    } else {
      this.router.navigate(['/challenge']);
    }
  }

  onSearchChange(): void {
    this.searchService.setSearchQuery(this.searchQuery);
  }
}

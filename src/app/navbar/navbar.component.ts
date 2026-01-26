import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SearchService } from '../services/search.service';

type Mode = 'learning' | 'challenge';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent {
  mode: Mode = 'learning';
  searchQuery = '';

  constructor(private searchService: SearchService) {}

  setMode(mode: Mode): void {
    this.mode = mode;
  }

  onSearchChange(): void {
    this.searchService.setSearchQuery(this.searchQuery);
  }
}

import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { SearchService } from '../services/search.service';

interface Algorithm {
  title: string;
  tagline: string;
  route: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.css'],
})
export class HomeComponent implements OnInit, OnDestroy {

  private searchSub!: Subscription;
  searchQuery = '';

  algorithms: Algorithm[] = [
    {
      title: 'Linear Search',
      tagline: 'One element at a time',
      route: '/linear-search',
    },
  ];

  constructor(
    private router: Router,
    private searchService: SearchService
  ) {}

  ngOnInit(): void {
    this.searchSub = this.searchService.searchQuery$
      .subscribe(query => {
        this.searchQuery = query;
      });
  }

  ngOnDestroy(): void {
    this.searchSub.unsubscribe();
  }

  get filteredAlgorithms(): Algorithm[] {
    return this.algorithms.filter(algo =>
      algo.title.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  goToAlgorithm(route: string): void {
    this.router.navigateByUrl(route);
  }
}

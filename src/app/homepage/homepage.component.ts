import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { SearchService } from '../services/search.service';

interface Algorithm {
  title: string;
  tagline: string;
  route: string;
  category: string;
}

interface AlgorithmCategory {
  name: string;
  algorithms: Algorithm[];
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
      category: 'Searching',
    },
    {
      title: 'Bubble Sort',
      tagline: 'Bubble the largest to the end',
      route: '/bubble-sort',
      category: 'Sorting',
    },
    {
      title: "N - Queens",
      tagline: "Place N queens on an N x N chessboard",
      route: "/n-queens",
      category: "Backtracking"
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

  get categorizedAlgorithms(): AlgorithmCategory[] {
    const filtered = this.algorithms.filter(algo =>
      algo.title.toLowerCase().includes(this.searchQuery.toLowerCase())
    );

    // Group by category
    const grouped = filtered.reduce((acc, algo) => {
      if (!acc[algo.category]) {
        acc[algo.category] = [];
      }
      acc[algo.category].push(algo);
      return acc;
    }, {} as Record<string, Algorithm[]>);

    // Convert to array format
    return Object.entries(grouped).map(([name, algorithms]) => ({
      name,
      algorithms,
    }));
  }

  goToAlgorithm(route: string): void {
    this.router.navigateByUrl(route);
  }
}
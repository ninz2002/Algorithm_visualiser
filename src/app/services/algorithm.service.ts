import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Algorithm {
  key: string;
  name: string;
  short_description: string;
  time_complexity: string;
  best_case: string;
  average_case: string;
  worst_case: string;
  space_complexity: string;
  difficulty: string;
  category: string;
}

@Injectable({
  providedIn: 'root'
})
export class AlgorithmService {

  private API_URL = 'http://localhost:5000/api/algorithms';

  constructor(private http: HttpClient) {}

  getAlgorithm(key: string): Observable<Algorithm> {
    return this.http.get<Algorithm>(`${this.API_URL}/${key}`);
  }

  solveNQueens(n: number) {
  return this.http.post<any>('http://localhost:5000/n-queens', {
    n: n
  });
}

}

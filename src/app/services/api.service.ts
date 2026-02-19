import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private http: HttpClient) { }

  // New method to get linear search steps 
  getLinearSearchSteps(): Observable<any> {
    return this.http.post<any>(
      'http://localhost:5000/linear-search',
      {
        array: [4, 1, 3, 7, 9, 2, 6, 5, 8],
        target: 5
      }
    );
  }

  getBubbleSortSteps(): Observable<any> {
  return this.http.post<any>(
    'http://localhost:5000/api/bubble-sort',
    {
      array: [5, 3, 4]
    }
  );
}

}
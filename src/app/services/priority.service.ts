import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {PageResponse} from '../models/page.response';

// Define the interface
export interface Priority {
  id: number;
  name: string;
  active: boolean;
  companyId: number;
  priorityLevel: number;
}


@Injectable({
  providedIn: 'root',
})
export class PriorityService {
  private baseUrl = 'http://localhost:8080/priorities'; // Base URL for the REST endpoint

  constructor(private http: HttpClient) {
    console.log('Testing Service')
  }
  getByCompanyId(companyId:number): Observable<PageResponse> {
    return this.http.get<PageResponse>(`${this.baseUrl}/search/findByCompanyIdAndActive?companyId=${companyId}&active=1&sort=priorityLevel,asc`).pipe(
      catchError(this.handleError)
    );
  }
  // Get by ID
  getById(id: number): Observable<Priority> {
    return this.http.get<Priority>(`${this.baseUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  // Create a new Priority
  create(model: Priority): Observable<Priority> {
    const { id, ...payload } = model;
    return this.http.post<Priority>(this.baseUrl, payload).pipe(
      catchError(this.handleError)
    );
  }

  // Update an existing record
  update(pkId: number, model: Priority): Observable<Priority> {
    const { id, ...payload } = model;
    return this.http.put<Priority>(`${this.baseUrl}/${pkId}`, payload).pipe(
      catchError(this.handleError)
    );
  }

  // Delete a record
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  // Error handling
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    return throwError(errorMessage);
  }
}

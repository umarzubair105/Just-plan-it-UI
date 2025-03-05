import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {PageResponse} from '../models/page.response';
import {Role} from '../models/basic';
import {AppConstants} from '../configuration/app.constants';

// Define the interface



@Injectable({
  providedIn: 'root',
})
export class RoleService {
  private baseUrl = AppConstants.API_URL+'/roles'; // Base URL for the REST endpoint

  constructor(private http: HttpClient) {
    console.log('Testing Service')
  }
  getByCompanyId(companyId:number): Observable<PageResponse> {
    return this.http.get<PageResponse>(`${this.baseUrl}/search/findByCompanyIdAndActive?companyId=${companyId}&active=1&sort=name,asc`).pipe(
      catchError(this.handleError)
    );
  }
  // Get by ID
  getById(id: number): Observable<Role> {
    return this.http.get<Role>(`${this.baseUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  // Create a new Role
  create(model: Role): Observable<Role> {
    const { id, ...payload } = model;
    return this.http.post<Role>(this.baseUrl, payload).pipe(
      catchError(this.handleError)
    );
  }

  // Update an existing record
  update(pkId: number, model: Role): Observable<Role> {
    const { id, ...payload } = model;
    return this.http.put<Role>(`${this.baseUrl}/${pkId}`, payload).pipe(
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

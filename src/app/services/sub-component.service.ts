import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import { catchError } from 'rxjs/operators';
import {PageResponse} from '../models/page.response';
import {SubComponent} from '../models/basic';

@Injectable({
  providedIn: 'root'
})
export class SubComponentService {
  private baseUrl = 'http://localhost:8080/components'; // Base URL for the REST endpoint

  constructor(private http: HttpClient) {
    console.log('Testing Service')
  }
  getByCompanyId(companyId:number): Observable<PageResponse> {
    return this.http.get<PageResponse>(`${this.baseUrl}/search/findByCompanyIdAndActiveIsTrue?companyId=${companyId}`).pipe(
      catchError(this.handleError)
    );
  }

  getAll(): Observable<PageResponse> {
    return this.http.get<PageResponse>(this.baseUrl).pipe(
      catchError(this.handleError)
    );
  }
  getById(id: number): Observable<SubComponent> {
    return this.http.get<SubComponent>(`${this.baseUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }
  create(model: SubComponent): Observable<SubComponent> {
    const { id, ...payload } = model;
    return this.http.post<SubComponent>(this.baseUrl, payload).pipe(
      catchError(this.handleError)
    );
  }
  update(id: number, model: SubComponent): Observable<SubComponent> {
    return this.http.put<SubComponent>(`${this.baseUrl}/${id}`, model).pipe(
      catchError(this.handleError)
    );
  }
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

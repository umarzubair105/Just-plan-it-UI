import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import { catchError } from 'rxjs/operators';
import {PageResponse} from '../models/page.response';
import {Company} from './company.service';
export interface Section {
  id: number;
  name: string;
  companyId: number;
}
@Injectable({
  providedIn: 'root'
})
export class SectionService {
  private baseUrl = 'http://localhost:8080/components'; // Base URL for the REST endpoint

  constructor(private http: HttpClient) {
    console.log('Testing Service')
  }

  getAll(): Observable<PageResponse> {
    return this.http.get<PageResponse>(this.baseUrl).pipe(
      catchError(this.handleError)
    );
  }
  getById(id: number): Observable<Section> {
    return this.http.get<Section>(`${this.baseUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }
  create(model: Section): Observable<Section> {
    const { id, ...payload } = model;
    return this.http.post<Section>(this.baseUrl, payload).pipe(
      catchError(this.handleError)
    );
  }
  update(id: number, model: Section): Observable<Section> {
    return this.http.put<Section>(`${this.baseUrl}/${id}`, model).pipe(
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

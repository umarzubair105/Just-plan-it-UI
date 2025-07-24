import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {PageResponse} from '../models/page.response';
import {AppConstants} from '../configuration/app.constants';
import {Designation} from '../models/basic';
import {handleError} from '../utils/helper';

// Define the interface


@Injectable({
  providedIn: 'root',
})
export class DesignationService {
  private baseUrl = AppConstants.API_URL+'/designations'; // Base URL for the REST endpoint

  constructor(private http: HttpClient) {
    console.log('Testing Service')
  }
  getByCompanyId(companyId:number): Observable<PageResponse> {
    return this.http.get<PageResponse>(`${this.baseUrl}/search/findByCompanyId?companyId=${companyId}&sort=name,asc`).pipe(
      catchError(handleError)
    );
  }
  // Get by ID
  getById(id: number): Observable<Designation> {
    return this.http.get<Designation>(`${this.baseUrl}/${id}`).pipe(
      catchError(handleError)
    );
  }

  // Create a new Designation
  create(model: Designation): Observable<Designation> {
    const { id, ...payload } = model;
    return this.http.post<Designation>(this.baseUrl, payload).pipe(
      catchError(handleError)
    );
  }

  // Update an existing record
  update(pkId: number, fieldsToUpdate: Partial<{}>): Observable<Designation> {
    return this.http.patch<Designation>(`${this.baseUrl}/${pkId}`, fieldsToUpdate).pipe(
      catchError(handleError)
    );
  }

  // Delete a record
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      catchError(handleError)
    );
  }

}

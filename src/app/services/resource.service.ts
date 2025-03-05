import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {PageResponse} from '../models/page.response';
import {Resource, Role} from '../models/basic';
import {handleError} from '../utils/helper';
import {AppConstants} from '../configuration/app.constants';

// Define the interface



@Injectable({
  providedIn: 'root',
})
export class ResourceService {
  private baseUrl = AppConstants.API_URL+'/resources'; // Base URL for the REST endpoint

  constructor(private http: HttpClient) {
    console.log('Testing Service')
  }
  getByCompanyId(companyId:number): Observable<PageResponse> {
    return this.http.get<PageResponse>(`${this.baseUrl}/search/findByCompanyIdAndActiveIsTrue?companyId=${companyId}`).pipe(
      catchError(handleError)
    );
  }
  getByProductId(productId:number): Observable<PageResponse> {
    return this.http.get<PageResponse>(`${this.baseUrl}/search/findResourcesByProductId?productId=${productId}`).pipe(
      catchError(handleError)
    );
  }

  // Get by ID
  getById(id: number): Observable<Resource> {
    return this.http.get<Resource>(`${this.baseUrl}/${id}`).pipe(
      catchError(handleError)
    );
  }

  // Create a new Role
  create(model: Resource): Observable<Resource> {
    const { id, ...payload } = model;
    return this.http.post<Resource>(this.baseUrl, payload).pipe(
      catchError(handleError)
    );
  }

  // Update an existing record
  update(pkId: number, model: Resource): Observable<Resource> {
    const { id, ...payload } = model;
    return this.http.put<Resource>(`${this.baseUrl}/${pkId}`, payload).pipe(
      catchError(handleError)
    );
  }

  // Delete a record
  delete(id: number): Observable<any> {
    const updatedFields = {active: false};
    return this.http.patch(`${this.baseUrl}/${id}`, updatedFields).pipe(
      catchError(handleError)
    );
  }

}

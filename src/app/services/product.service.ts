import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {PageResponse} from '../models/page.response';
import {ProductResource, Resource, Role} from '../models/basic';
import {handleError} from '../utils/helper';
import {AppConstants} from '../configuration/app.constants';
import {Product} from '../models/planning';

// Define the interface



@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private baseUrl = AppConstants.API_URL+'/products'; // Base URL for the REST endpoint

  constructor(private http: HttpClient) {
    console.log('Testing Service')
  }
  getByCompanyId(companyId:number): Observable<PageResponse> {
    return this.http.get<PageResponse>(`${this.baseUrl}/search/findByCompanyIdAndActiveIsTrue?companyId=${companyId}`).pipe(
      catchError(handleError)
    );
  }
  // Get by ID


  // Create a new Role
  create(model: Product): Observable<Product> {
    const { id, ...payload } = model;
    return this.http.post<Product>(this.baseUrl, payload).pipe(
      catchError(handleError)
    );
  }

  // Update an existing record
  update(pkId: number, model: Product): Observable<Product> {
    const { id, ...payload } = model;
    return this.http.put<Product>(`${this.baseUrl}/${pkId}`, payload).pipe(
      catchError(handleError)
    );
  }
  updateSpecificFieldsPasses(id: number, fieldsToUpdate: Partial<{}>): Observable<any> {
    return this.http.patch(`${this.baseUrl}/${id}`, fieldsToUpdate).pipe(
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

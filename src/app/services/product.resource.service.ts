import { Injectable } from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpParams} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {PageResponse} from '../models/page.response';
import {ProductResource, Resource, Role} from '../models/basic';
import {handleError} from '../utils/helper';
import {AppConstants} from '../configuration/app.constants';

// Define the interface



@Injectable({
  providedIn: 'root',
})
export class ProductResourceService {
  private baseUrl = AppConstants.API_URL+'/productResources'; // Base URL for the REST endpoint

  constructor(private http: HttpClient) {
    console.log('Testing Service')
  }
  getByProductId(productId:number): Observable<PageResponse> {
    return this.http.get<PageResponse>(`${this.baseUrl}/search/findByProductIdAndActive?productId=${productId}&active=true`).pipe(
      catchError(handleError)
    );
  }
  getByResourceIds(params:HttpParams): Observable<PageResponse> {
    return this.http.get<PageResponse>(`${this.baseUrl}/search/findByResourceIdInAndActiveIsTrue`,{params}).pipe(
      catchError(handleError)
    );
  }
  // Get by ID


  // Create a new Role
  create(model: ProductResource): Observable<ProductResource> {
    const { id, ...payload } = model;
    return this.http.post<ProductResource>(this.baseUrl, payload).pipe(
      catchError(handleError)
    );
  }

  // Update an existing record
  update(pkId: number, model: ProductResource): Observable<ProductResource> {
    const { id, ...payload } = model;
    return this.http.put<ProductResource>(`${this.baseUrl}/${pkId}`, payload).pipe(
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

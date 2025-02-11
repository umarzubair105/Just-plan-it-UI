import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {PageResponse} from '../models/page.response';

// Define the Company interface
export interface Company {
  id: number;
  name: string;
  sample: boolean;
}

export interface BaseModel {
  id: number;
  name: string;
  code: string;
}


export interface AddCompany {
  name: string;
  email: string;
  resourceName: string;
  designation: string;
  mobileNumber: string;
  password: string;
  sampleCompanyId: number;
  countryId: number
}

export interface AddProduct {
  name: string;
  emailProductManager: string;
  emailProductOwner: string;
  companyId: number
}

export interface AddResource {
  companyId: number;
  productId?: number;
  email: string;
  name?: string;
  designation?: string;
  mobileNumber?: string;
  dateOfBirth?: string;
  lead?: string;
  dateFormat?: string;
}

export interface AddEpic {
  productId: number;
  title: string;
  details: string;
  component: string;
  requiredBy: string;
  dateFormat: string;
  priority: string;
  comments: string;
  risks: string;
  valueGain: string;
}

export interface CommonResp {
  id: number;
  context: string;
  message: string;
}

export interface MapDesignation {
  designationId: number;
  roleId: number;
}

@Injectable({
  providedIn: 'root',
})
export class CompanyService {
  private baseHost = 'http://localhost:8080'; // Base URL for the REST endpoint
  private baseUrl = 'http://localhost:8080/companies'; // Base URL for the REST endpoint
  private baseUrlComDashboard = 'http://localhost:8080/company-dashboard'; // Base URL for the REST endpoint
  private http = inject(HttpClient);
  //constructor(private http: HttpClient) {
    //console.log('Testing Service')
  //}

  login(body: any): Observable<any> {
    console.log(body);
    //const { id, ...payload } = company;
    //console.log(payload);
    return this.http.post<any>('http://localhost:8080/api/auth/authenticate', body).pipe(
      catchError(this.handleError)
    );
  }

  addCompany(company: AddCompany): Observable<CommonResp> {
    console.log(company);
    //const { id, ...payload } = company;
    //console.log(payload);
    return this.http.post<CommonResp>(this.baseUrlComDashboard+'/add-company', company).pipe(
      catchError(this.handleError)
    );
  }

  mapDesignation(model: MapDesignation): Observable<CommonResp> {
    return this.http.post<CommonResp>(this.baseUrlComDashboard+'/map-designation', model).pipe(
      catchError(this.handleError)
    );
  }
  addProduct(model: AddProduct): Observable<CommonResp> {
    console.log(model);
    //const { id, ...payload } = company;
    //console.log(payload);
    return this.http.post<CommonResp>(this.baseUrlComDashboard+'/add-product', model).pipe(
      catchError(this.handleError)
    );
  }
  addResource(resource: AddResource): Observable<CommonResp[]> {
    console.log(resource);
    //const { id, ...payload } = company;
    //console.log(payload);
    return this.http.post<CommonResp[]>(this.baseUrlComDashboard+'/add-resource', resource).pipe(
      catchError(this.handleError)
    );
  }
  addEpics(models: AddEpic[]): Observable<CommonResp[]> {
    return this.http.post<CommonResp[]>(this.baseUrlComDashboard+'/add-epics', models).pipe(
      catchError(this.handleError)
    );
  }
  addResources(models: AddResource[]): Observable<CommonResp[]> {
    return this.http.post<CommonResp[]>(this.baseUrlComDashboard+'/add-resources', models).pipe(
      catchError(this.handleError)
    );
  }
  getAllCountries(): Observable<PageResponse> {
    return this.http.get<PageResponse>(this.baseHost+"/countries?active=1").pipe(
      catchError(this.handleError)
    );
  }
  getMetadata(): Observable<any> {
    return this.http.get<any>(this.baseHost+"/api/auth/metadata").pipe(
      catchError(this.handleError)
    );
  }
  getRoles(companyId:number): Observable<PageResponse> {
    return this.http.get<PageResponse>(`${this.baseHost}/roles/search/findByCompanyIdAndActive?companyId=${companyId}&active=1`).pipe(
      catchError(this.handleError)
    );
  }
  // Get all companies
  getAllCompanies(): Observable<PageResponse> {
    return this.http.get<PageResponse>(this.baseUrl).pipe(
      catchError(this.handleError)
    );
  }
 /* getAllCompanies(): Observable<Company[]> {
    return this.http.get<Company[]>(this.baseUrl).pipe(
      catchError(this.handleError)
    );
  }*/
  // Get a single company by ID
  getCompanyById(id: number): Observable<Company> {
    return this.http.get<Company>(`${this.baseUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  // Create a new company
  createCompany(company: Company): Observable<Company> {
    console.log(company);
    const { id, ...payload } = company;
    console.log(payload);
    return this.http.post<Company>(this.baseUrl, payload).pipe(
      catchError(this.handleError)
    );
  }

  // Update an existing company
  updateCompany(id: number, company: Company): Observable<Company> {
    return this.http.put<Company>(`${this.baseUrl}/${id}`, company).pipe(
      catchError(this.handleError)
    );
  }

  // Delete a company
  deleteCompany(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  // Error handling
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred!';
    console.log(error);
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error--: ${error.error.message}`;
    } else {
      // Server-side error
      console.log(error.error);
      errorMessage = error.error.message;
      //errorMessage = `Error Code-----: ${error.status}\nMessage: ${error.message}`;
    }
    return throwError(errorMessage);
  }
}

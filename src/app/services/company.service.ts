import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {PageResponse} from '../models/page.response';
import {handleError, messageChange, ReleaseIteration} from '../utils/helper';
import {AuthResponse, Company, ContactUs, Resource, ResourceRightBean} from '../models/basic';
import {AppConstants} from '../configuration/app.constants';

// Define the Company interface


export interface BaseModel {
  id: number;
  name: string;
  code: string;
}


export class AddCompany {
  name: string ='';
  email: string ='';
  resourceName: string = '';
  designation: string='';
  mobileNumber: string='';
  //password: string='';
  confirmPassword: string='';
  sampleCompanyId: number | null= null;
  countryId: number | null= null;
}


export class AddProduct {
  name: string = '';
  emailProductManager: string = '';
  code: string = '';
  companyId: number|null=null;
  otherActivitiesPercentTime: number=10;
  releaseIteration: ReleaseIteration | null= null;
  startDate: Date | null=null;
  endDate: Date | null=null;
}
export class AddResource {
  companyId: number =0;
  productId: number =0;
  email: string = '';
  name: string = '';
  designation: string = '';
  mobileNumber: string = '';
  dateOfBirth: string ='';
  dateOfBirthDate: Date | null = null;
  lead: string ='';
  leadResourceId: number = 0;
  dateFormat: string = '';
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
  private readonly baseHost = AppConstants.API_URL; // Base URL for the REST endpoint
  private readonly baseAuthUrl = AppConstants.API_URL+'/api/auth'; // Base URL for the REST endpoint
  private readonly baseUrl = AppConstants.API_URL+'/companies'; // Base URL for the REST endpoint
  private readonly baseUrlComDashboard = AppConstants.API_URL+'/company-dashboard'; // Base URL for the REST endpoint
  private http = inject(HttpClient);
  //constructor(private http: HttpClient) {
    //console.log('Testing Service')
  //}

  login(body: any): Observable<AuthResponse> {
    console.log(body);
    //const { id, ...payload } = company;
    //console.log(payload);
    return this.http.post<AuthResponse>(this.baseAuthUrl+'/authenticate', body).pipe(
      catchError(handleError)
    );
  }

  resetPassword(body: any): Observable<CommonResp> {
    console.log(body);
    //const { id, ...payload } = company;
    //console.log(payload);
    return this.http.post<any>(this.baseAuthUrl+'/reset-password', body).pipe(
      catchError(handleError)
    );
  }
  contactUs(model: ContactUs): Observable<CommonResp> {
    const { id, ...payload } = model;
    return this.http.post<CommonResp>(this.baseAuthUrl+'/contact-us', payload).pipe(
      catchError(handleError)
    );
  }
  addCompany(company: AddCompany): Observable<CommonResp> {
    console.log(company);
    //const { id, ...payload } = company;
    //console.log(payload);
    return this.http.post<CommonResp>(this.baseUrlComDashboard+'/add-company', company).pipe(
      catchError(handleError)
    );
  }

  mapDesignation(model: MapDesignation): Observable<CommonResp> {
    return this.http.post<CommonResp>(this.baseUrlComDashboard+'/map-designation', model).pipe(
      catchError(handleError)
    );
  }
  addProduct(model: AddProduct): Observable<CommonResp> {
    console.log(model);
    //const { id, ...payload } = company;
    //console.log(payload);
    return this.http.post<CommonResp>(this.baseUrlComDashboard+'/add-product', model).pipe(
      catchError(handleError)
    );
  }
  addResourceMultiple(resource: AddResource): Observable<CommonResp[]> {
    console.log(resource);
    //const { id, ...payload } = company;
    //console.log(payload);
    return this.http.post<CommonResp[]>(this.baseUrlComDashboard+'/add-resource-multiple', resource).pipe(
      catchError(handleError)
    );
  }
  addResource(resource: Resource): Observable<CommonResp> {
    console.log(resource);
    const { id, ...payload } = resource;
    //console.log(payload);
    return this.http.post<CommonResp>(this.baseUrlComDashboard+'/add-resource', payload).pipe(
      catchError(handleError)
    );
  }
  addEpics(models: AddEpic[]): Observable<CommonResp[]> {
    return this.http.post<CommonResp[]>(this.baseUrlComDashboard+'/add-epics', models).pipe(
      catchError(handleError)
    );
  }
  addResources(models: AddResource[]): Observable<CommonResp[]> {
    return this.http.post<CommonResp[]>(this.baseUrlComDashboard+'/add-resources', models).pipe(
      catchError(handleError)
    );
  }
  getResourceRights(resourceId: number, productId: number|null): Observable<ResourceRightBean> {
    return this.http.get<ResourceRightBean>(`${this.baseUrlComDashboard}/get-rights?resourceId=${resourceId}&productId=${productId}`).pipe(
      catchError(handleError)
    );
  }
  getAllCountries(): Observable<PageResponse> {
    return this.http.get<PageResponse>(this.baseHost+"/countries?active=1").pipe(
      catchError(handleError)
    );
  }
  getMetadata(): Observable<any> {
    return this.http.get<any>(this.baseHost+"/api/auth/metadata").pipe(
      catchError(handleError)
    );
  }
  getRoles(companyId:number): Observable<PageResponse> {
    return this.http.get<PageResponse>(`${this.baseHost}/roles/search/findByCompanyIdAndActive?companyId=${companyId}&active=1`).pipe(
      catchError(handleError)
    );
  }
  // Get all companies
  getAllCompanies(): Observable<PageResponse> {
    return this.http.get<PageResponse>(this.baseUrl).pipe(
      catchError(handleError)
    );
  }
 /* getAllCompanies(): Observable<Company[]> {
    return this.http.get<Company[]>(this.baseUrl).pipe(
      catchError(handleError)
    );
  }*/
  // Get a single company by ID
  getCompanyById(id: number): Observable<Company> {
    return this.http.get<Company>(`${this.baseUrl}/${id}`).pipe(
      catchError(handleError)
    );
  }

  // Create a new company
  createCompany(company: Company): Observable<Company> {
    console.log(company);
    const { id, ...payload } = company;
    console.log(payload);
    return this.http.post<Company>(this.baseUrl, payload).pipe(
      catchError(handleError)
    );
  }

  // Update an existing company
  updateCompany(id: number, company: Company): Observable<Company> {
    return this.http.put<Company>(`${this.baseUrl}/${id}`, company).pipe(
      catchError(handleError)
    );
  }

  // Delete a company
  deleteCompany(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      catchError(handleError)
    );
  }

}

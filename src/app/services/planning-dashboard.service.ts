import { Injectable } from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpParams} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {PageResponse} from '../models/page.response';
import {AppConstants} from '../configuration/app.constants';
import {handleError} from '../utils/helper';
import {Epic, EpicBean, ReleaseDetailBean, ReleaseStatusEnum, ScheduleEpic} from '../models/planning';
import {CommonResp} from './company.service';

// Def


@Injectable({
  providedIn: 'root',
})
export class PlanningDashboardService {
  private readonly baseUrl = AppConstants.API_URL+'/planning-dashboard'; // Base URL for the REST endpoint

  constructor(private readonly http: HttpClient) {}

  getUnplannedReleasesByProductId(productId:number): Observable<ReleaseDetailBean[]> {
    let params = new HttpParams();
    params = params.append('productId', productId);
    return this.http.get<ReleaseDetailBean[]>(`${this.baseUrl}/findUnplannedReleasesByProductId`,
      { params }).pipe(
      catchError(handleError)
    );
  }
  getUnplannedEpicBeansByProductId(companyId:number,productId:number): Observable<EpicBean[]> {
    let params = new HttpParams();
    params = params.append('companyId', companyId);
    params = params.append('productId', productId);
    return this.http.get<EpicBean[]>(`${this.baseUrl}/findUnplannedEpics`,
      { params }).pipe(
      catchError(handleError)
    );
  }

  getPlannedReleasesByProductId(productId:number): Observable<ReleaseDetailBean[]> {
    let params = new HttpParams();
    params = params.append('productId', productId);
    return this.http.get<ReleaseDetailBean[]>(`${this.baseUrl}/findPlannedReleasesByProductId`,
      { params }).pipe(
      catchError(handleError)
    );
  }
  getStartedReleasesByProductId(productId:number): Observable<ReleaseDetailBean[]> {
    let params = new HttpParams();
    params = params.append('productId', productId);
    return this.http.get<ReleaseDetailBean[]>(`${this.baseUrl}/findStartedReleasesByProductId`,
      { params }).pipe(
      catchError(handleError)
    );
  }

  getOldReleasesByProductId(productId:number): Observable<ReleaseDetailBean[]> {
    let params = new HttpParams();
    params = params.append('productId', productId);
    return this.http.get<ReleaseDetailBean[]>(`${this.baseUrl}/findOldReleasesByProductId`,
      { params }).pipe(
      catchError(handleError)
    );
  }

  getReleaseDetailByReleaseId(releaseId: number): Observable<ReleaseDetailBean> {
    let params = new HttpParams();
    params = params.append('releaseId', releaseId);
    return this.http.get<ReleaseDetailBean>(`${this.baseUrl}/findReleaseDetailByReleaseId`,
      { params }).pipe(
      catchError(handleError)
    );
  }
  getResourceDashboard(resourceId:number): Observable<ReleaseDetailBean[]> {
    let params = new HttpParams();
    params = params.append('resourceId', resourceId);
    return this.http.get<ReleaseDetailBean[]>(`${this.baseUrl}/findResourceDashboard`,
      { params }).pipe(
      catchError(handleError)
    );
  }
  planEpic(id: number): Observable<ScheduleEpic> {
    let params = new HttpParams();
    params = params.append('epicId', id);
    return this.http.post<ScheduleEpic>(`${this.baseUrl}/planEpic`, params,{}).pipe(
      catchError(handleError)
    );
  }

  unplanEpic(id: number): Observable<CommonResp> {
    let params = new HttpParams();
    params = params.append('epicId', id);
    return this.http.post<CommonResp>(`${this.baseUrl}/unplanEpic`, params,{}).pipe(
      catchError(handleError)
    );
  }
  getByReleaseId(releaseId:number): Observable<PageResponse> {
    let params = new HttpParams();
    params = params.append('releaseId', releaseId);
    return this.http.get<PageResponse>(`${this.baseUrl}/search/findByReleaseIdAndActiveIsTrue`,
      { params }).pipe(
      catchError(handleError)
    );
  }

}

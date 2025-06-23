import { Injectable } from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpParams} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {PageResponse} from '../models/page.response';
import {AppConstants} from '../configuration/app.constants';
import {handleError} from '../utils/helper';
import {Epic, EpicBean, EpicDetail, EpicLink, ReleaseStatusEnum, ScheduleEpic} from '../models/planning';

// Def


@Injectable({
  providedIn: 'root',
})
export class EpicService {
  private readonly baseUrl = AppConstants.API_URL+'/epics'; // Base URL for the REST endpoint
  private readonly epicDetailsUrl = AppConstants.API_URL+'/epicDetails'; // Base URL for the REST endpoint
  private readonly epicLinksUrl = AppConstants.API_URL+'/epicLinks'; // Base URL for the REST endpoint

  constructor(private readonly http: HttpClient) {}

  getById(id:number): Observable<Epic> {
    return this.http.get<Epic>(`${this.baseUrl}/${id}`).pipe(
      catchError(handleError)
    );
  }

  getByCompanyIdAndCode(companyId:number, code:string): Observable<PageResponse> {
    return this.http.get<PageResponse>(`${this.baseUrl}/search/findByCompanyIdAndCode?companyId=${companyId}&code=${code}`).pipe(
      catchError(handleError)
    );
  }
  getEpicBeanByCompanyIdAndCode(companyId:number, code:string): Observable<EpicBean> {
    return this.http.get<EpicBean>(`${this.baseUrl}/findEpicByCompanyIdAndCode?companyId=${companyId}&code=${code}`).pipe(
      catchError(handleError)
    );
  }  // Get by ID

  create(model: Epic): Observable<Epic> {
    const { id, ...payload } = model;
    return this.http.post<Epic>(`${this.baseUrl}/create`, payload).pipe(
      catchError(handleError)
    );
  }

  // Update an existing record
  update(pid: number, model: Epic): Observable<Epic> {
    const { id, ...payload } = model;
    return this.http.put<Epic>(`${this.baseUrl}/${pid}`, payload).pipe(
      catchError(handleError)
    );
  }

  updateSpecificFields(id: number, fieldsToUpdate: Partial<{ status: string; startDate: string }>): Observable<any> {
    return this.http.patch(`${this.baseUrl}/${id}`, fieldsToUpdate).pipe(
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
    const updatedFields = { active: false };
    return this.http.patch(`${this.baseUrl}/${id}`, updatedFields).pipe(
      catchError(handleError)
    );
  }


  getEpicDetails(epicId:number): Observable<PageResponse> {
    let params = new HttpParams();
    params = params.append('epicId', epicId);
    return this.http.get<PageResponse>(`${this.epicDetailsUrl}/search/findByEpicIdAndActiveIsTrueOrderByCreatedDateDesc`,
      { params }).pipe(
      catchError(handleError)
    );
  }

  createEpicDetail(model: EpicDetail): Observable<EpicDetail> {
    const { id, ...payload } = model;
    return this.http.post<EpicDetail>(this.epicDetailsUrl, payload).pipe(
      catchError(handleError)
    );
  }

  // Update an existing record
  updateEpicDetail(eid: number, model: EpicDetail): Observable<EpicDetail> {
    const { id, ...payload } = model;
    return this.http.put<EpicDetail>(`${this.epicDetailsUrl}/${eid}`, payload).pipe(
      catchError(handleError)
    );
  }

  updateSpecificFieldsPassedEpicDetail(id: number, fieldsToUpdate: Partial<{}>): Observable<any> {
    return this.http.patch(`${this.epicDetailsUrl}/${id}`, fieldsToUpdate).pipe(
      catchError(handleError)
    );
  }
  // Delete a record
  deleteEpicDetail(id: number): Observable<any> {
    const updatedFields = { active: false };
    return this.http.patch(`${this.epicDetailsUrl}/${id}`, updatedFields).pipe(
      catchError(handleError)
    );
  }

  uploadEpicDetailFile(id: number, uploadedFile: File, desc: string): Observable<EpicDetail> {
    var metadata = {
      details: desc
    };
    const formData = new FormData();
    formData.append('file', uploadedFile);
    formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));

/*    this.http.post('/api/files/uploadWithJson', formData).subscribe(
      res => console.log('Upload success', res),
      err => console.error('Upload failed', err)
    );*/

    return this.http.post<EpicDetail>(`${this.baseUrl}/${id}/upload`, formData).pipe(
      catchError(handleError)
    );
  }
  downloadEpicDetailFile(id: number) {
    return this.http.get(`${this.baseUrl}/${id}/download`, {
      responseType: 'blob' // Very important: we expect a binary file
    });
  }

  getEpicLinks(epicId:number): Observable<PageResponse> {
    let params = new HttpParams();
    params = params.append('epicId', epicId);
    return this.http.get<PageResponse>(`${this.epicLinksUrl}/search/findByEpicIdAndActiveIsTrueOrderByCreatedDateAsc`,
      { params }).pipe(
      catchError(handleError)
    );
  }

  createEpicLink(model: EpicLink): Observable<EpicLink> {
    const { id, ...payload } = model;
    return this.http.post<EpicLink>(this.epicLinksUrl, payload).pipe(
      catchError(handleError)
    );
  }

  // Update an existing record
  updateEpicLink(eid: number, model: EpicLink): Observable<EpicLink> {
    const { id, ...payload } = model;
    return this.http.put<EpicLink>(`${this.epicLinksUrl}/${eid}`, payload).pipe(
      catchError(handleError)
    );
  }

  updateSpecificFieldsPassedEpicLink(id: number, fieldsToUpdate: Partial<{}>): Observable<any> {
    return this.http.patch(`${this.epicLinksUrl}/${id}`, fieldsToUpdate).pipe(
      catchError(handleError)
    );
  }
  // Delete a record
  deleteEpicLink(id: number): Observable<any> {
    const updatedFields = { active: false };
    return this.http.patch(`${this.epicLinksUrl}/${id}`, updatedFields).pipe(
      catchError(handleError)
    );
  }
}

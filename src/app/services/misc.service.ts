import { Injectable } from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpParams} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {AppConstants} from '../configuration/app.constants';
import {handleError} from '../utils/helper';
import {
  EntityDetail,
  EntityType,
} from '../models/planning';

// Def


@Injectable({
  providedIn: 'root',
})
export class MiscService {
  private readonly baseUrl = AppConstants.API_URL+'/misc'; // Base URL for the REST endpoint
  private readonly entityDetailsUrl = AppConstants.API_URL+'/entityDetails'; // Base URL for the REST endpoint

  constructor(private readonly http: HttpClient) {}

  getEntityDetailsByIdAndType(entityType: EntityType, entityId:number): Observable<EntityDetail[]> {
    let params = new HttpParams();
    params = params.append('entityId', entityId);
    params = params.append('entityType', entityType);
    return this.http.get<EntityDetail[]>(`${this.baseUrl}/entity-details`,{params}).pipe(
      catchError(handleError)
    );
  }
  createEntityDetail(model: EntityDetail): Observable<EntityDetail> {
    const { id, ...payload } = model;
    return this.http.post<EntityDetail>(this.entityDetailsUrl, payload).pipe(
      catchError(handleError)
    );
  }

  // Delete a record
  delete(id: number): Observable<any> {
    const updatedFields = { active: false };
    return this.http.patch(`${this.entityDetailsUrl}/${id}`, updatedFields).pipe(
      catchError(handleError)
    );
  }


  uploadEntityDetailFile(companyId: number,entityType: EntityType, entityId:number, uploadedFile: File, desc: string): Observable<EntityDetail> {
    var metadata = {
      details: desc
    };
    const formData = new FormData();
    formData.append('file', uploadedFile);
    formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    return this.http.post<EntityDetail>(`${this.baseUrl}/entity-details/${entityId}/${companyId}/${entityType}/upload`, formData).pipe(
      catchError(handleError)
    );
  }
  downloadEntityDetailFile(id: number) {
    return this.http.get(`${this.baseUrl}/entity-details/${id}/download`, {
      responseType: 'blob' // Very important: we expect a binary file
    });
  }

}

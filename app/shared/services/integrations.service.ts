import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class IntegrationsService {
  REST_URL = environment.REST_URL;
  baseUrl = this.REST_URL + '/api/';

  constructor(private httpClient: HttpClient) {}

  getIntegrations(params): Observable<any> {
    const url = this.baseUrl + 'integrations';

    return this.httpClient.get<any>(url, { params }).pipe(map((data) => data));
  }

  postIntegration(params: any, isEdit, appendQuery?): Observable<any> {
    let url = this.baseUrl + 'integrations';
    const query = JSON.stringify({ validation: true });

    if (isEdit) {
      url = `${url}/${params._id}`;
      if (appendQuery) {
        url = `${url}?query=${query}`;
      }

      return this.httpClient.patch<any>(url, params).pipe(map((data) => data));
    }
    if (appendQuery) {
      url = `${url}?query=${query}`;
    }

    return this.httpClient
      .post<any>(url, params)
      .pipe(map((response) => response));
  }

  deleteIntegration(params): Observable<any> {
    const url = this.baseUrl + 'integrations/' + params._id;

    return this.httpClient.delete<any>(url).pipe(map((data) => data));
  }

  publishIntegration(id): Observable<any> {
    const url = this.baseUrl + `integrations/startpublish/${id}`;

    return this.httpClient.post<any>(url, {}).pipe(map((data) => data));
  }

  getNextRuns(id): Observable<any> {
    const url = this.baseUrl + `integrations/${id}/nextRuns`;

    return this.httpClient.get<any>(url, {}).pipe(map((data) => data));
  }

  resumeIntegration(id): Observable<any> {
    const url = this.baseUrl + `integrations/resume/${id}`;

    return this.httpClient.post<any>(url, {}).pipe(map((data) => data));
  }

  pauseIntegration(id): Observable<any> {
    const url = this.baseUrl + `integrations/pause/${id}`;

    return this.httpClient.post<any>(url, {}).pipe(map((data) => data));
  }

  cancelIntegration(params, query): Observable<any> {
    const url = `${this.baseUrl}integrations/unpublish/${params._id}?query=${query}`;

    return this.httpClient.post<any>(url, {}).pipe(map((data) => data));
  }

  getIntegrationStatus(id): Observable<any> {
    const url = this.baseUrl + `integrations/status/${id}`;

    return this.httpClient.post<any>(url, {}).pipe(map((data) => data));
  }

  runOnceIntegration(id): Observable<any> {
    const url = this.baseUrl + `integrations/runonce/${id}`;

    return this.httpClient.post<any>(url, {}).pipe(map((data) => data));
  }

  getRunHistories(params: any): Observable<any> {
    const url = this.baseUrl + 'runhistories';

    return this.httpClient.get<any>(url, { params }).pipe(map((res) => res));
  }
}

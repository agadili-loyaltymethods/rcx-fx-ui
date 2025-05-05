import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class RunhistoriesService {
  REST_URL = environment.REST_URL;
  baseUrl = this.REST_URL + '/api/';

  constructor(private httpClient: HttpClient) {}

  getRunHistories(params: any): Observable<any> {
    const url = this.baseUrl + 'runhistories';

    return this.httpClient.get<any>(url, { params }).pipe(map((res) => res));
  }

  downloadFile(body: any): Observable<any> {
    const url = this.baseUrl + 'downloadfile';

    return this.httpClient.post<any>(url, body).pipe(map((res) => res));
  }

  getLogFile(params: any): Observable<any> {
    const url =
      this.baseUrl +
      'integrations/' +
      params.integrationId +
      '/' +
      params.runId +
      '/log';

    return this.httpClient
      .get<any>(url, { observe: 'response' })
      .pipe(map((res) => res));
  }
}

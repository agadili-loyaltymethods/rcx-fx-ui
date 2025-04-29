import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ConnectionsService {
  REST_URL = environment.REST_URL;
  baseUrl = this.REST_URL + '/api/';

  constructor(private httpClient: HttpClient) {}

  getConnections(type, params): Observable<any> {
    const url = this.baseUrl + `${type}connections`;

    return this.httpClient.get<any>(url, { params }).pipe(map((data) => data));
  }

  postConnections(params, isEdit, data): Observable<any> {
    let url =
      this.baseUrl + 
      (data.connectionType === 'S3' ? 's3connections' : 'sftpconnections');

    if (isEdit) {
      url = `${url}/${data._id}`;

      return this.httpClient.patch<any>(url, params).pipe(map((data) => data));
    }

    return this.httpClient.post<any>(url, params).pipe(map((data) => data));
  }

  deleteConnections(params) {
    const url =
      this.baseUrl +
      (params.connectionType === 'S3' ? 's3connections' : 'sftpconnections') +
      `/${params._id}`;

    return this.httpClient.delete<any>(url).pipe(map((data) => data));
  }

  connectionsValidate(params): Observable<any> {
    const url = this.baseUrl + 'testconnections';

    return this.httpClient.post<any>(url, params).pipe(map((data) => data));
  }
}

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TemplatesService {
  REST_URL = environment.REST_URL;
  baseUrl = this.REST_URL + '/api/';

  constructor(private httpClient: HttpClient) {}

  getTemplates(params): Observable<any> {
    const url = this.baseUrl + 'integrationtemplates';

    return this.httpClient.get<any>(url, { params }).pipe(map((data) => data));
  }

  deleteTemplates(params): Observable<any> {
    const url = this.baseUrl + 'integrationtemplates/' + params._id;

    return this.httpClient.delete<any>(url).pipe(map((data) => data));
  }

  postIntegrationTemplate(params, isEdit, appendQuery?): Observable<any> {
    let url = this.baseUrl + 'integrationtemplates';
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

    return this.httpClient.post<any>(url, params).pipe(map((data) => data));
  }

  validateFile(formData): Observable<any> {
    const url = this.baseUrl + 'templates/validate';

    return this.httpClient.post<any>(url, formData).pipe(map((data) => data));
  }

  importTemplates(formData): Observable<any> {
    const url = this.baseUrl + 'templates/import';

    return this.httpClient.post<any>(url, formData).pipe(map((data) => data));
  }

  importStatus(): Observable<any> {
    const url = this.baseUrl + 'templates/importstatus';

    return this.httpClient.get<any>(url).pipe(map((data) => data));
  }
}

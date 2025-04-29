import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ProgramsService {
  REST_URL = environment.REST_URL;
  baseUrl = this.REST_URL + '/api/';

  constructor(private httpClient: HttpClient) {}

  getEnums(params): Observable<any> {
    const query = params && params.query && JSON.parse(params.query);

    if (query) {
      query.status = 'Active';
      params.query = JSON.stringify(query);
    }
    const url = this.baseUrl + 'enums';

    return this.httpClient.get<any>(url, { params }).pipe(map((data) => data));
  }

  getProgramDetails(): Observable<any> {
    const url = this.baseUrl + 'programs';

    return this.httpClient.get<any>(url).pipe(map((data) => data));
  }
}

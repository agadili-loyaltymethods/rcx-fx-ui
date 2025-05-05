import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PartnersService {
  REST_URL = environment.REST_URL;
  baseUrl = this.REST_URL + '/api/';

  constructor(private httpClient: HttpClient) {}

  getPartners(params): Observable<any> {
    const url = this.baseUrl + 'partners';

    return this.httpClient.get<any>(url, { params }).pipe(map((data) => data));
  }

  updatePartner(params, isEdit): Observable<any> {
    let url = this.baseUrl + 'partners';

    if (isEdit) {
      url = url + '/' + params._id;

      return this.httpClient.put<any>(url, params).pipe(map((data) => data));
    }

    return this.httpClient.post<any>(url, params).pipe(map((data) => data));
  }

  deletePartner(params): Observable<any> {
    const url = this.baseUrl + 'partners/' + params._id;

    return this.httpClient.delete<any>(url).pipe(map((data) => data));
  }

  deleteUser(params): Observable<any> {
    const url = this.baseUrl + 'users/' + params._id;

    return this.httpClient.delete<any>(url).pipe(map((data) => data));
  }

  createUpdateUser(query, isEdit): Observable<any> {
    let url = this.baseUrl + 'users';
    const { body, populateQuery } = query;

    if (isEdit) {
      url = url + '/' + body._id;

      return this.httpClient.put<any>(url, body).pipe(map((data) => data));
    }

    return this.httpClient
      .post<any>(url, body, { params: populateQuery })
      .pipe(map((data) => data));
  }

  getUsers(params): Observable<any> {
    const url = this.baseUrl + 'users';

    return this.httpClient.get<any>(url, { params }).pipe(map((data) => data));
  }

  getRoles(): Observable<any> {
    const url = this.baseUrl + 'acl/roles';

    return this.httpClient.get<any>(url, {}).pipe(map((data) => data));
  }

  getPermissions(params): Observable<any> {
    const url = this.baseUrl + 'acl/roles' + '/' + params.role;

    return this.httpClient.get<any>(url, {}).pipe(map((data) => data));
  }

  addRole(user, body): Observable<any> {
    const url = this.baseUrl + `acl/assign/${user}`;

    return this.httpClient.post<any>(url, body).pipe(map((data) => data));
  }

  getUserRole(params): Observable<any> {
    const url = `${this.baseUrl}acl/users/${params.user}/roles`;

    return this.httpClient.get<any>(url, {}).pipe(map((data) => data));
  }

  revokeRole(user, role): Observable<any> {
    const url = this.baseUrl + `acl/revoke/${user}/${role}`;

    return this.httpClient.delete<any>(url).pipe(map((data) => data));
  }
}

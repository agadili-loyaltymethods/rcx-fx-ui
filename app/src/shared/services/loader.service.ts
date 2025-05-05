import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LoaderService {
  private isLoading = new Subject<boolean>();
  constructor() {}

  setIsLoading(bool: boolean): void {
    this.isLoading.next(bool);
  }

  getIsLoading(): Observable<boolean> {
    return this.isLoading.asObservable();
  }
}

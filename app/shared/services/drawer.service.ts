import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class DrawerService {
  private isDrawerOpen = false;

  setDrawerState(isOpen: boolean) {
    this.isDrawerOpen = isOpen;
  }

  getDrawerState() {
    return this.isDrawerOpen;
  }
}

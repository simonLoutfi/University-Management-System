import { Injectable, Inject } from '@angular/core';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class PlatformCheckService {
  constructor(
    @Inject(PLATFORM_ID) private platformId: any
  ) {}

  isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  getLocalStorage(key: string): string | null {
    if (!this.isBrowser()) {
      return null;
    }
    return localStorage.getItem(key);
  }

  setLocalStorage(key: string, value: string): void {
    if (!this.isBrowser()) {
      return;
    }
    localStorage.setItem(key, value);
  }

  removeLocalStorage(key: string): void {
    if (!this.isBrowser()) {
      return;
    }
    localStorage.removeItem(key);
  }
}

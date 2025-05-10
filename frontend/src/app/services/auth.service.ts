import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Injectable, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:8000'; // adjust if hosted differently
  private document: Document | null = null;

  constructor(private http: HttpClient) {
    try {
      this.document = inject(DOCUMENT);
    } catch {
      // Handle SSR case where document is not available
      this.document = null;
    }
  }

  private getLocalStorage(): Storage | null {
    if (!this.document || !this.document.defaultView) {
      return null;
    }
    return this.document.defaultView.localStorage;
  }


  logout(): void {
    const storage = this.getLocalStorage();
    if (storage) {
      storage.removeItem('access_token');
      storage.removeItem('user');
    }
  }

professorSignup(formData: FormData): Observable<any> {
  return this.http.post(`${this.apiUrl}/signup/professor/`, formData).pipe(
    map((response: any) => {
      console.log('Signup Response:', response);
      const storage = this.getLocalStorage();
      if (storage) {
        storage.setItem('access_token', response.access_token);
        if (response.user) {
          storage.setItem('user', JSON.stringify(response.user));
        } else {
          console.warn('No user data in response');
          storage.removeItem('user'); // Ensure no invalid data is stored
        }
      }
      return response;
    }),
    catchError((error: any) => throwError(() => this.handleError(error)))
  );
}

login(username: string, password: string): Observable<any> {
  const url = `${this.apiUrl}/login/`;
  const formData = new FormData();
  formData.append('username', username);
  formData.append('password', password);

  return this.http.post(url, formData).pipe(
    map((response: any) => {
      if (!response || !response.access_token) {
        throw new Error('Invalid response from server');
      }

      const userData = response.user;
      if (!userData || !userData.user_type) {
        throw new Error('No user data in response');
      }

      const token = response.access_token;
      const storage = this.getLocalStorage();
      if (storage) {
        storage.setItem('access_token', token);
        storage.setItem('user', JSON.stringify(userData));
      }

      // Return the user type for routing
      return {
        token,
        user: userData,
        userType: userData.user_type
      };
    }),
    catchError((error: any) => {
      console.error('Login error:', error);
      if (error.error && error.error.error) {
        throw new Error(error.error.error);
      }
      return throwError(() => this.handleError(error));
    })
  );
}

  private handleError(error: any): string {
    let errorMessage = 'An error occurred';
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    return errorMessage;
  }


studentSignup(formData: FormData): Observable<any> {
  return this.http.post(`${this.apiUrl}/signup/student/`, formData).pipe(
    map((response: any) => {
      console.log('Signup Response:', response);
      const localStorage = this.getLocalStorage();
      if (localStorage) {
        localStorage.setItem('access_token', response.access_token); // Store the token
        localStorage.setItem('refresh_token', response.refresh_token); // Store the refresh token
        localStorage.setItem('user', JSON.stringify(response.user)); // Store user data
      }
      return response;
    }),
    catchError((error: any) => throwError(() => this.handleError(error)))
  );
}

}
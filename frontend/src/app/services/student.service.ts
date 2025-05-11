import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { PlatformCheckService } from './platform-check.service';

@Injectable({
  providedIn: 'root',
})
export class StudentService {
  private apiUrl = 'http://localhost:8000';

  constructor(private http: HttpClient, private platformCheck: PlatformCheckService) {}

private getHeaders(): HttpHeaders {
  const token = this.platformCheck.getLocalStorage('access_token');
  if (!token) {
    console.error('No access token found in localStorage');
    return new HttpHeaders({
      'Content-Type': 'application/json'
    });
  }

  return new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  });
}


  private handleError(error: any): Observable<never> {
    console.error('API Error:', error);
    
    // Handle common error cases
    if (error.status === 401) {
      console.error('Unauthorized access - redirecting to login');
      // Implement proper redirect to login
      // You might want to use a router service here
      return throwError(() => new Error('Unauthorized'));
    }
    
    if (error.status === 404) {
      console.error('Resource not found');
      return throwError(() => new Error('Resource not found'));
    }
    
    if (error.status === 500) {
      console.error('Internal server error');
      return throwError(() => new Error('Internal server error'));
    }
    
    return throwError(() => error);
  }

  getStudentDashboard(): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get(
      `${this.apiUrl}/student/dashboard/`,
      { headers }
    ).pipe(
      catchError(this.handleError)
    );
  }


// ...existing code...

updateEmail(email: string): Observable<any> {
  const headers = this.getHeaders();
  const payload = { 
    email: email,
    username: email  // Add username to payload
  };
  
  return this.http.post(
    `${this.apiUrl}/update-email/`, 
    payload, 
    { headers }
  ).pipe(
    catchError(error => {
      console.error('Error updating email:', error);
      return throwError(() => error.error?.error || 'Failed to update email and username.');
    })
  );
}

// ...existing code...


  enrollCourse(courseId: number): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post(
      `${this.apiUrl}/enroll/${courseId}/`,
      {},
      { headers }
    ).pipe(
      catchError(this.handleError)
    );
  }

  unenrollCourse(courseId: number): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post(
      `${this.apiUrl}/unenroll/${courseId}/`,
      {},
      { headers }
    ).pipe(
      catchError(this.handleError)
    );
  }

  
}
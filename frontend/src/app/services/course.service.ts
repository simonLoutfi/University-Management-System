import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { DOCUMENT } from '@angular/common';

interface Course {
  id: number;
  title: string;
  code: string;
  students?: Array<{
    student_id: string;
    name: string;
    email: string;
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  private apiUrl = 'http://localhost:8000';
  private document = inject(DOCUMENT);

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = this.document.defaultView?.localStorage?.getItem('access_token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  addCourse(courseData: any): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/professor/course/add/`,
      courseData,
      { headers: this.getHeaders() }
    ).pipe(
      catchError(error => {
        if (error.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          throw new Error('Session expired. Please login again.');
        }
        return this.handleError(error);
      })
    );
  }

  updateCourse(courseId: number, courseData: any): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/professor/course/update/${courseId}/`,
      courseData,
      { headers: this.getHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  deleteCourse(courseId: number): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}/professor/course/delete/${courseId}/`,
      { 
        headers: this.getHeaders(),
        responseType: 'text'  // Change to text to handle HTML response
      }
    ).pipe(
      map(response => {
        // If we get a response, assume it's a success
        return { success: true };
      }),
      catchError(error => {
        console.error('Error deleting course:', error);
        // Check if we got a 200 response with HTML
        if (error.status === 200) {
          return of({ success: true });
        }
        throw error;
      })
    );
  }

  getAllCourses(): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/courses/`,
      { headers: this.getHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  getProfessorCourses(): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/api/professor/courses/`,
      { 
        headers: this.getHeaders()
      }
    ).pipe(
      catchError(this.handleError)
    );
  }

  getCourse(courseId: number): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/api/professor/courses/${courseId}/`,
      { 
        headers: this.getHeaders()
      }
    ).pipe(
      catchError(this.handleError)
    );
  }
  getStudents(): Observable<any> {
    return this.http.get<Course[]>(
      `${this.apiUrl}/api/professor/courses/`,  // Use the professor courses endpoint
      { headers: this.getHeaders() }
    ).pipe(
      map((courses) => {
        // Extract students from the courses response
        const students = new Set();
        courses.forEach((course) => {
          if (course.students) {
            course.students.forEach((student) => students.add(student));
          }
        });
        return Array.from(students);
      }),
      catchError(this.handleError)
    );
  }
  enrollCourse(courseId: number): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/enroll/${courseId}/`,
      {},
      { headers: this.getHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  unenrollCourse(courseId: number): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/unenroll/${courseId}/`,
      {},
      { headers: this.getHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: any) {
    console.error('API Error:', error);
    return throwError(error);
  }

searchStudents(query: string): Observable<any> {
  const params = new HttpParams().set('search', query);
  return this.http.get(
    `${this.apiUrl}/api/professor/students/search/`,
    { 
      headers: this.getHeaders(),
      params: params
    }
  ).pipe(
    catchError(this.handleError)
  );
}
}

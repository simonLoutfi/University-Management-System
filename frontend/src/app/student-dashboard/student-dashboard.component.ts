import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { StudentService } from '../services/student.service';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { PlatformCheckService } from '../services/platform-check.service';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './student-dashboard.component.html',
  styleUrls: ['./student-dashboard.component.css']
})
export class StudentDashboardComponent implements OnInit {
  studentName: string = '';
  studentId: string = '';
  email: string = '';
  enrolled_courses: any[] = [];
  available_courses: any[] = [];
  loading = true;
  error: string | null = null;
  sortBy = 'title';
  searchQuery: string = '';
sortOrder: 'asc' | 'desc' = 'asc';
sortField: 'title' | 'code' | 'professor__name' = 'title';
  private originalEnrolledCourses: any[] = [];

  constructor(
    private studentService: StudentService,
    private router: Router,
    private platformCheck: PlatformCheckService
  ) {}

  ngOnInit(): void {
    // Check if we're in the browser environment
    if (!this.platformCheck.isBrowser()) {
      console.log('Skipping initialization during SSR');
      return;
    }

    // Check if we have a valid token before loading data
    const token = this.platformCheck.getLocalStorage('access_token');
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    this.loadStudentData();
    this.loadCourses();
  }

async loadStudentData() {
  try {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user');
      if (userData) {
        try {
          const user = JSON.parse(userData);
          console.log('User data:', user); // Debugging line

          const profile = user.profile || user.student_profile;

          if (profile) {
            this.studentName = profile.name || '';
            this.studentId = profile.student_id || '';
          }
        } catch (parseError) {
          console.error('Error parsing user data:', parseError);
          this.error = 'Failed to parse user data';
        }
      }
    }
  } catch (error) {
    console.error('Error loading student data:', error);
    this.error = 'Failed to load student data';
  }
}


  async loadCourses() {
  try {
    this.loading = true;
    const response = await firstValueFrom(this.studentService.getStudentDashboard());
    if (response) {
      this.enrolled_courses = response.enrolled_courses || [];
      this.originalEnrolledCourses = [...this.enrolled_courses]; // Update original data
      this.available_courses = response.available_courses || [];
    } else {
      throw new Error('No response received from server');
    }
    this.searchAndSortCourses(); // Apply search and sort after loading
    this.loading = false;
  } catch (error: any) {
    console.error('Failed to load courses:', error);
    this.error = error.message || 'Failed to load courses';
    this.loading = false;
  }
}

searchAndSortCourses(): void {
  const query = this.searchQuery.trim().toLowerCase();

  // Apply filter and sort to enrolled courses
  let filteredEnrolledCourses = query ? this.filterCourses(this.originalEnrolledCourses, query) : [...this.originalEnrolledCourses];
  this.enrolled_courses = this.sortCourses(filteredEnrolledCourses);

  // Apply filter and sort to available courses
  let filteredAvailableCourses = query ? this.filterCourses(this.available_courses, query) : [...this.available_courses];
  this.available_courses = this.sortCourses(filteredAvailableCourses);
}


private filterCourses(courses: any[], query: string): any[] {
  return courses.filter(course =>
    course.title.toLowerCase().includes(query) ||
    course.code.toLowerCase().includes(query) 
  );
}

private sortCourses(courses: any[]): any[] {
  return courses.sort((a, b) => {
    const valueA = a[this.sortField]?.toString().toLowerCase() || '';
    const valueB = b[this.sortField]?.toString().toLowerCase() || '';

    return this.sortOrder === 'asc' ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
  });
}


private filterAndSortCourses(courses: any[]): any[] {
  let filteredCourses = [...courses];

  // Apply search filter
  if (this.searchQuery) {
    const query = this.searchQuery.toLowerCase();
    filteredCourses = filteredCourses.filter(course =>
      course.title.toLowerCase().includes(query) ||
      course.code.toLowerCase().includes(query) ||
      (course.professor__name && course.professor__name.toLowerCase().includes(query))
    );
  }

  // Apply sorting
  filteredCourses.sort((a, b) => {
    const valueA = a[this.sortField]?.toString().toLowerCase() || '';
    const valueB = b[this.sortField]?.toString().toLowerCase() || '';

    return this.sortOrder === 'asc'
      ? valueA.localeCompare(valueB)
      : valueB.localeCompare(valueA);
  });

  return filteredCourses;
}
toggleSortOrder(): void {
  this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
  this.searchAndSortCourses();
}

  async enrollCourse(courseId: number) {
    try {
      await firstValueFrom(this.studentService.enrollCourse(courseId));
      this.loadCourses();
      alert('Successfully enrolled in the course!');
    } catch (error: any) {
      console.error('Error enrolling in course:', error);
      alert('Failed to enroll in the course. Please try again.');
    }
  }

  // sortCourses() {
  //   this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
  //   this.enrolled_courses.sort((a: any, b: any) => {
  //     const valueA = a[this.sortBy].toString().toLowerCase();
  //     const valueB = b[this.sortBy].toString().toLowerCase();
      
  //     if (this.sortOrder === 'asc') {
  //       return valueA.localeCompare(valueB);
  //     } else {
  //       return valueB.localeCompare(valueA);
  //     }
  //   });
  // }

  searchCourses() {
    if (!this.searchQuery) {
      this.loadCourses();
      return;
    }

    this.enrolled_courses = this.enrolled_courses.filter(course =>
      course.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      course.code.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  async updateEmail() {
    try {
      await this.studentService.updateEmail(this.email);
      this.error = null;
    } catch (error) {
      this.error = 'Failed to update email';
    }
  }

  async unenrollCourse(courseId: number) {
    if (!confirm('Are you sure you want to unenroll from this course?')) {
      return;
    }

    try {
      await firstValueFrom(this.studentService.unenrollCourse(courseId));
      this.loadCourses();
      alert('Successfully unenrolled from the course!');
    } catch (error: any) {
      console.error('Error unenrolling from course:', error);
      alert('Failed to unenroll from the course. Please try again.');
    }
  }

  getPdfLink(): void {
  try {
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      const documentPath = user.profile?.document;

      if (documentPath) {
        const pdfUrl = `http://localhost:8000${documentPath}`;
        window.open(pdfUrl, '_blank');
      } else {
        alert('No PDF document available for this user.');
      }
    } else {
      alert('User data not found in local storage.');
    }
  } catch (error) {
    console.error('Error retrieving PDF link:', error);
    alert('Failed to retrieve the PDF link.');
  }
}



}

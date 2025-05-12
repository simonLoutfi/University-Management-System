import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { StudentService } from '../services/student.service';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { PlatformCheckService } from '../services/platform-check.service';
import { AuthService } from '../services/auth.service';

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
  private originalAvailableCourses: any[] = [];

  constructor(
    private studentService: StudentService,
    private router: Router,
    private authService: AuthService,
    private platformCheck: PlatformCheckService
  ) {}

  ngOnInit(): void {
    if (!this.platformCheck.isBrowser()) {
      console.log('Skipping initialization during SSR');
      return;
    }

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
          console.log('User data:', user); 

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
      this.originalEnrolledCourses = [...this.enrolled_courses];
      this.available_courses = response.available_courses || [];
      this.originalAvailableCourses = [...this.available_courses];
    } else {
      throw new Error('No response received from server');
    }
    this.searchAndSortCourses();
    this.loading = false;
  } catch (error: any) {
    console.error('Failed to load courses:', error);
    this.error = error.message || 'Failed to load courses';
    this.loading = false;
  }
}

searchAndSortCourses(): void {
  const query = this.searchQuery.trim().toLowerCase();

  if (!query) {
    this.enrolled_courses = [...this.originalEnrolledCourses];
    this.available_courses = [...this.originalAvailableCourses];
  } else {
    this.enrolled_courses = this.filterCourses(this.originalEnrolledCourses, query);
    this.available_courses = this.filterCourses(this.originalAvailableCourses, query); 
  }

  this.enrolled_courses = this.sortCourses(this.enrolled_courses);
  this.available_courses = this.sortCourses(this.available_courses);
}

private filterCourses(courses: any[], query: string): any[] {
  return courses.filter(course =>
    course.title.toLowerCase().includes(query) ||
    course.code.toLowerCase().includes(query) 
  );
}

async logout(): Promise<void> {
    try {
      this.authService.logout();
      await this.router.navigate(['/login']);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }
private sortCourses(courses: any[]): any[] {
  return courses.sort((a, b) => {
    const valueA = a[this.sortField]?.toString().toLowerCase() || '';
    const valueB = b[this.sortField]?.toString().toLowerCase() || '';

    return this.sortOrder === 'asc' ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
  });
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

async updateEmail(): Promise<void> {
  if (!this.isEmailValid) {
    alert('Please enter a valid email address');
    return;
  }

  try {
    const response = await firstValueFrom(this.studentService.updateEmail(this.email));
    
    const userData = this.platformCheck.getLocalStorage('user');
    if (userData) {
      const user = JSON.parse(userData);
      if (user) {
        user.username = this.email;
        user.email = this.email;
        if (user.profile || user.student_profile) {
          const profile = user.profile || user.student_profile;
          profile.email = this.email;
        }
        this.platformCheck.setLocalStorage('user', JSON.stringify(user));
      }
    }

    alert('Email updated successfully!');
    this.error = null;
    this.loadStudentData();
    
  } catch (error: any) {
    console.error('Failed to update email and username:', error);
    this.error = error.message || 'Failed to update email and username. Please try again.';
    alert(this.error);
  }
}

public isValidEmail(email: string): boolean {
  const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
  return emailPattern.test(email);
}
public get isEmailValid(): boolean {
  return !!this.email && this.isValidEmail(this.email);
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

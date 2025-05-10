import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { CourseService } from '../services/course.service';
import { StudentService } from '../services/student.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-professor-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HttpClientModule],
  templateUrl: './professor-dashboard.component.html',
  styleUrls: ['./professor-dashboard.component.css']
})
export class ProfessorDashboardComponent implements OnInit {
  profilePictureUrl: string | null = null;
  professorName: string = '';
  department: string = '';
  sortBy = 'title';
  sortOrder = 'asc';
  searchQuery = '';
  courses: any[] = [];
  students: any[] = [];
  loading = true;
  error: string | null = null;

  constructor(
    private courseService: CourseService,
    private studentService: StudentService,
    private authService: AuthService,
    private router: Router
  ) {
  }

  ngOnInit(): void {
    const token = this.getLocalStorageItem('access_token');

    if (!token) {
      console.warn('No authentication token found');
      this.router.navigate(['/login']);
      return;
    }

    this.loadProfessorData().then(() => {
      if (!this.error) {
        this.loadCourses();
        this.loadStudents();
      }
    });
  }

  private getLocalStorageItem(key: string): string | null {
    if (typeof window !== 'undefined' && localStorage) {
      return localStorage.getItem(key);
    }
    return null;
  }

  async loadProfessorData(): Promise<void> {
    try {
      const userStr = this.getLocalStorageItem('user');

      if (!userStr) {
        throw new Error('No user data found in local storage');
      }

      const user = JSON.parse(userStr);
      const profile = user.profile;
      this.professorName = profile.name || user.username;
      this.department = profile.department || '';

      if (profile.profile_picture) {
        // Get just the filename from the path
        const filename = profile.profile_picture.split('/').pop() || '';
        // Use the Django backend URL to serve the media file
        this.profilePictureUrl = `http://localhost:8000/media/professors/${filename}`;
      } else {
        this.profilePictureUrl = null; // Clear any existing URL if no picture
      }
      console.log('Profile Picture URL:', this.profilePictureUrl);


    } catch (error) {
      console.error('Error loading professor data:', error);
      this.error = 'Failed to load professor data. Please log in again.';
      this.router.navigate(['/login']);
    }
  }
  
  loadCourses(): void {
    this.loading = true;
    this.courseService.getProfessorCourses().subscribe({
      next: (response: any) => {
        // Sort the courses based on current sort settings
        this.courses = [...response].sort((a: any, b: any): number => {
          const aValue = this.sortBy === 'title' ? a.title : a.code;
          const bValue = this.sortBy === 'title' ? b.title : b.code;
          
          if (typeof aValue === 'string' && typeof bValue === 'string') {
            return this.sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
          }
          
          return this.sortOrder === 'asc' ? (aValue > bValue ? 1 : -1) : (bValue > aValue ? 1 : -1);
        });
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading courses:', error);
        this.error = error.error?.message || 'Failed to load courses';
        this.loading = false;
      }
    });
  }

  loadStudents(): void {
    this.courseService.getStudents().subscribe({
      next: (response: any) => {
        this.students = response;
      },
      error: (error: any) => {
        console.error('Error loading students:', error);
        this.error = error.error?.message || 'Failed to load students';
      }
    });
  }

  sortCourses(field: string): void {
    this.sortBy = field;
    this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    
    const compare = (a: any, b: any): number => {
      const aValue = a[field];
      const bValue = b[field];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return this.sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }
      
      return this.sortOrder === 'asc' ? (aValue > bValue ? 1 : -1) : (bValue > aValue ? 1 : -1);
    };
    
    this.courses.sort(compare);
  }

  async logout(): Promise<void> {
    try {
      this.authService.logout();
      await this.router.navigate(['/login']);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  deleteCourse(courseId: number): void {
    if (!confirm('Are you sure you want to delete this course?')) {
      return;
    }

    this.loading = true;
    this.courseService.deleteCourse(courseId).subscribe({
      next: (response) => {
        if (response && response.success) {
          this.loading = false;
          alert('Course deleted successfully');
          this.loadCourses();
        } else {
          this.loading = false;
          alert('Failed to delete course. Please try again.');
        }
      },
      error: (error: any) => {
        this.loading = false;
        console.error('Error deleting course:', error);
        this.error = error.error?.message || 'Failed to delete course';
        alert('Error: ' + (error.error?.message || 'Failed to delete course'));
      }
    });
  }

  
}

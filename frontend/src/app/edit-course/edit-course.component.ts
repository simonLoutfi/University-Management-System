import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { CourseService } from '../services/course.service';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-edit-course',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './edit-course.component.html',
  styleUrls: ['./edit-course.component.css']
})
export class EditCourseComponent implements OnInit {
  courseId: number | null = null;
  courseData: any = {
    title: '',
    code: '',
    description: ''
  };
  loading = true;
  error: string | null = null;
  private document = inject(DOCUMENT);
  private courseService = inject(CourseService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  async ngOnInit(): Promise<void> {
    try {
      const token = this.document.defaultView?.localStorage?.getItem('access_token');
      if (!token) {
        this.error = 'Not authenticated. Please login again.';
        this.router.navigate(['/login']);
        return;
      }

      this.courseId = Number(this.route.snapshot.paramMap.get('id'));
      if (!this.courseId) {
        this.error = 'Invalid course ID';
        return;
      }

      try {
        // Get course data from the list of professor courses
        const response = await this.courseService.getProfessorCourses().toPromise();
        const course = response.find((c: any) => c.id === this.courseId);
        
        if (!course) {
          this.error = 'Course not found';
          return;
        }

        this.courseData = {
          title: course.title,
          code: course.code,
          description: course.description
        };
        this.loading = false;
      } catch (error: any) {
        console.error('Error loading course:', error);
        this.error = error.error?.message || error.message || 'Failed to load course data';
        this.loading = false;
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      this.error = 'An unexpected error occurred';
      this.loading = false;
    }
  }

  async onSubmit() {
    if (!this.courseId) {
      this.error = 'Invalid course ID';
      return;
    }

    try {
      await this.courseService.updateCourse(this.courseId, this.courseData).toPromise();
      this.router.navigate(['/dashboard/professor']);
    } catch (error) {
      console.error('Error updating course:', error);
      this.error = 'Failed to update course';
    }
  }

  onCancel() {
    this.router.navigate(['/dashboard/professor']);
  }
}

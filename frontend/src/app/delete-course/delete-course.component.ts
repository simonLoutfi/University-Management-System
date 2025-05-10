import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { CourseService } from '../services/course.service';

@Component({
  selector: 'app-delete-course',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './delete-course.component.html',
  styleUrls: ['./delete-course.component.css']
})
export class DeleteCourseComponent {
  @Input() course: { id: number; title: string; code: string; studentsCount: number } | null | undefined = null;

  private courseService = inject(CourseService);
  private router = inject(Router);

  onDelete() {
    if (!this.course) {
      console.warn('No course data provided for deletion.');
      return;
    }

    const { id, title } = this.course;

    this.courseService.deleteCourse(id).subscribe({
      next: () => {
        alert(`Course "${title}" deleted successfully.`);
        this.router.navigate(['/dashboard/professor']);
      },
      error: (error) => {
        console.error('Error deleting course:', error);
        alert('An error occurred while deleting the course.');
      }
    });
  }

  cancel() {
    this.router.navigate(['/dashboard/professor']);
  }
}

import { Component } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-update-course',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],  // <-- Import required modules here
  templateUrl: './update-course.component.html',
  styleUrls: ['./update-course.component.css']
})
export class UpdateCourseComponent {
  courseForm: FormGroup;
  courseCode: string = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.courseForm = this.fb.group({
      title: ['', Validators.required],
      code: ['', Validators.required],
      description: ['', Validators.required],
    });

    const courseId = this.route.snapshot.paramMap.get('id');
    if (courseId) {
      // Load course data from a service (hardcoded here for example)
      this.courseForm.patchValue({
        title: 'Sample Course',
        code: 'CS101',
        description: 'Intro to CS',
      });
      this.courseCode = 'CS101';
    }
  }

  onSubmit() {
    if (this.courseForm.valid) {
      console.log('Updated course:', this.courseForm.value);
      this.router.navigate(['/dashboard/professor']);
    }
  }

  onCancel() {
    this.router.navigate(['/dashboard/professor']);
  }
}

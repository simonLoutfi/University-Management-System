import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { CourseService } from '../services/course.service';

@Component({
selector: 'app-add-course',
standalone: true,
imports: [CommonModule, FormsModule, RouterModule],
templateUrl: './add-course.component.html',
styleUrls: ['./add-course.component.css']
})
export class AddCourseComponent {
course = {
title: '',
code: '',
description: ''
};

messages: string[] = [];

constructor(private courseService: CourseService, private router: Router) {}

submitForm() {
if (this.course.title && this.course.code) {
this.courseService.addCourse(this.course).subscribe({
next: (res: any) => {
this.messages = ['Course saved successfully!'];
this.router.navigate(['/dashboard/professor']);
},
error: () => {
this.messages = ['Failed to save course. Please try again.'];
}
});
} else {
this.messages = ['Please fill out all required fields.'];
}
}

cancel() {
this.router.navigate(['/dashboard/professor']);
}
}
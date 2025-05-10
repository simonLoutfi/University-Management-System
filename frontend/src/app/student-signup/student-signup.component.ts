import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-student-signup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './student-signup.component.html',
  styleUrls: ['./student-signup.component.css']
})
export class StudentSignupComponent {
  name = '';
  email = '';
  password = '';           // Added password field
  confirmPassword = '';    // Added confirmPassword field
  studentId = '';
  document: File | null = null;
  errorMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

onSignup(): void {
  if (this.password !== this.confirmPassword) {
    this.errorMessage = 'Passwords do not match!';
    return;
  }

  const formData = new FormData();
  formData.append('username', this.email); // Use email as username
  formData.append('password', this.password);
  formData.append('name', this.name);
  formData.append('email', this.email);
  formData.append('student_id', this.studentId);
  if (this.document) {
    formData.append('document', this.document, this.document.name);
  }

  this.authService.studentSignup(formData).subscribe(
    (response) => {
      console.log('Signup successful:', response);
      this.router.navigate(['/dashboard/student']);
    },
    (error) => {
      console.error('Signup failed:', error);
      this.errorMessage = error.error ? JSON.stringify(error.error) : 'An unknown error occurred during signup.';
    }
  );
}

  onFileChange(event: any): void {
    this.document = event.target.files[0];
  }

  
}

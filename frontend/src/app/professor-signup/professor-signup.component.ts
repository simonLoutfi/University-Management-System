import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { FormsModule } from '@angular/forms'; // Import FormsModule
import { CommonModule } from '@angular/common'; // Import CommonModule, needed for standalone components

@Component({
  selector: 'app-professor-signup',
  standalone: true, // Standalone component
  imports: [CommonModule, FormsModule], // Include FormsModule here
  templateUrl: './professor-signup.component.html',
  styleUrls: ['./professor-signup.component.css']
})
export class ProfessorSignupComponent {
  username = '';
  email = '';
  password = '';
  confirmPassword = '';
  name = ''; // Added name field
  department = ''; // Added department field
  profilePicture: File | null = null; // Corrected to use profilePicture instead of profile_picture
  errorMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

// ...existing code...
  onSignup(): void {
    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match!';
      return;
    }

    const formData = new FormData();
    formData.append('username', this.email); // Using email as username
    formData.append('password', this.password);
    formData.append('name', this.name);
    formData.append('email', this.email);
    formData.append('department', this.department);
    if (this.profilePicture) {
      formData.append('profile_picture', this.profilePicture, this.profilePicture.name);
    }

    this.authService.professorSignup(formData).subscribe(
      (response) => {
        // After successful signup, login automatically
        const loginData = {
          username: this.email,
          password: this.password
        };
        
        this.authService.login(loginData.username, loginData.password).subscribe(
          (loginResponse) => {
            console.log('Login successful:', loginResponse);
            this.router.navigate(['/dashboard/professor']);
          },
          (loginError) => {
            console.error('Auto-login failed:', loginError);
            this.router.navigate(['/login']);
          }
        );
      },
      (error) => {
        console.error('Signup failed:', error);
        this.errorMessage = error.error ? JSON.stringify(error.error) : 'An unknown error occurred during signup.';
      }
    );
  }

  onFileChange(event: any): void {
    this.profilePicture = event.target.files[0]; // Corrected to update profilePicture
  }
}

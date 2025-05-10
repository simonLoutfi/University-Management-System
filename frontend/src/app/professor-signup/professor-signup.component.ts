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

  onSignup(): void {
    const formData = new FormData();
    formData.append('username', this.email); // Using email as username, can be changed as needed
    formData.append('password', this.password);
    formData.append('name', this.name); // Added name field
    formData.append('email', this.email);
    formData.append('department', this.department); // Added department field
    if (this.profilePicture) {
      formData.append('profile_picture', this.profilePicture, this.profilePicture.name); // Ensure file is appended correctly
    }

    this.authService.professorSignup(formData).subscribe(
      (response) => {
        console.log('Signup successful:', response);
        this.router.navigate(['/dashboard/professor']); // Redirect to dashboard on success
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

import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms'; 
import { CommonModule } from '@angular/common'; 
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { DOCUMENT } from '@angular/common';
import { response } from 'express';

@Component({
  selector: 'app-login',
  standalone: true, 
  imports: [CommonModule, FormsModule,RouterModule], 
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  username = '';
  password = '';
  errorMessage: string | null = null;
  private document: Document | null = null;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {
    try {
      this.document = inject(DOCUMENT);
    } catch {
      this.document = null;
    }
  }

  ngOnInit(): void {
  }

  onLogin(): void {
    this.errorMessage = null;
    this.authService.login(this.username, this.password).subscribe({
      next: (response: any) => {
        const userType = response.userType;
        const route = userType === 'professor' 
          ? ['dashboard', 'professor'] 
          : ['dashboard', 'student'];
        this.router.navigate(route);
      },
      error: (error: any) => {
        console.log(this.username, this.password);
        console.error('Login error:', error);
        this.errorMessage = error.error?.message || 'Invalid credentials. Please try again.';
      }
    });
  }
}

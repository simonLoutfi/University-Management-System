import { Component } from '@angular/core';
import { CourseService } from '../services/course.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-student-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="search-container">
      <input 
        type="text" 
        [(ngModel)]="searchQuery" 
        (input)="onSearch()"
        placeholder="Search students..."
        class="search-input"
      />
      
      <div class="results" *ngIf="searchResults.length > 0">
        <div class="student-item" *ngFor="let student of searchResults">
          <p>{{student.name}}</p>
          <p>{{student.email}}</p>
          <p>ID: {{student.student_id}}</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .search-container {
      margin: 20px;
    }
    .search-input {
      width: 100%;
      padding: 8px;
      margin-bottom: 10px;
    }
    .student-item {
      padding: 10px;
      border-bottom: 1px solid #eee;
    }
  `]
})
export class StudentSearchComponent {
  searchQuery = '';
  searchResults: any[] = [];
  private searchTimeout: any;

  constructor(private courseService: CourseService) {}

  onSearch() {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    this.searchTimeout = setTimeout(() => {
      if (this.searchQuery.length >= 2) {
        this.courseService.searchStudents(this.searchQuery)
          .subscribe({
            next: (results) => {
              console.log('Search results:', results);
              this.searchResults = results;
            },
            error: (error) => {
              console.error('Search error:', error);
            }
          });
      } else {
        this.searchResults = [];
      }
    }, 300);
  }
}
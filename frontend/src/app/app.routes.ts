import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { SignupChoiceComponent } from './signup-choice/signup-choice.component';
import { ProfessorSignupComponent } from './professor-signup/professor-signup.component';
import { ProfessorDashboardComponent } from './professor-dashboard/professor-dashboard.component';
import { StudentDashboardComponent } from './student-dashboard/student-dashboard.component';
import { AddCourseComponent } from './add-course/add-course.component';
import { EditCourseComponent } from './edit-course/edit-course.component';
import { DeleteCourseComponent } from './delete-course/delete-course.component';
import { StudentSignupComponent } from './student-signup/student-signup.component';

export const routes: Routes = [
    { path: 'signup/choice', component: SignupChoiceComponent },
    { path: 'signup/professor', component: ProfessorSignupComponent },
    { path: 'signup/student', component: StudentSignupComponent },
    { path: 'dashboard/professor', component: ProfessorDashboardComponent },
    { path: 'dashboard/professor/add-course', component: AddCourseComponent },
    { path: 'dashboard/professor/delete-course/:id', component: DeleteCourseComponent },
    { path: 'dashboard/professor/update-course/:id', component: EditCourseComponent },
    { path: 'dashboard/student', component: StudentDashboardComponent },
    { path: 'login', component: LoginComponent },
    { path: '', redirectTo: 'signup/choice', pathMatch: 'full' }
  ];
  

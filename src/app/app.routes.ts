import { Routes } from '@angular/router';
import { SignupComponent } from './signup/signup.component';
import { LoginComponent } from './login/login.component';
import { TodoComponent } from './todo/todo.component';
import { AuthGuard } from './auth.guard';


export const routes: Routes = [
    { path: '', component: SignupComponent },
    { path: 'signup', component: SignupComponent },
    { path: 'login', component: LoginComponent },
    { path: 'todo', component: TodoComponent, canActivate: [AuthGuard] },
    //{ path: 'todo', component: TodoComponent },
];

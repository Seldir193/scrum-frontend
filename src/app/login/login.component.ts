import { Component,OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../auth.service';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit  {

  form: FormGroup;
loginError: string | null = null;

constructor(
  private fb: FormBuilder,
  private authService: AuthService,
  private router: Router
) {
  this.form = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.required, Validators.minLength(3)]],
    rememberMe: [false]
  });
}



ngOnInit(): void {
  this.loadSavedCredentials();

  const token = localStorage.getItem('access_token');
  if (token && !this.isTokenExpired(token)) {
    // Wenn der Token vorhanden und gültig ist, umleiten zur Todo-Seite
    this.router.navigate(['/todo']);
  }
}

private isTokenExpired(token: string): boolean {
  const payload = this.decodeToken(token);
  const expirationDate = new Date(payload.exp * 1000);
  return new Date() > expirationDate;
}

private decodeToken(token: string): any {
  const payload = token.split('.')[1];
  return JSON.parse(atob(payload));
}



login() {
  const val = this.form.value;

  if (this.form.valid) {
    this.authService.login(val.username, val.password).subscribe(
      (response) => {

        const storage = val.rememberMe ? localStorage : sessionStorage;
        
        localStorage.setItem('access_token', response.access);
        localStorage.setItem('refresh_token', response.refresh);
       
        if (val.rememberMe) {
          localStorage.setItem('saved_username', val.username);
          localStorage.setItem('saved_password', val.password);
        } else {
          // Remove saved credentials if Remember Me is not checked
          localStorage.removeItem('saved_username');
          localStorage.removeItem('saved_password');
        }

        this.router.navigateByUrl('/summary');
      },
      (error) => {
        console.error('Login failed:', error);
        this.loginError = error.message || 'Login failed, please try again.';
      }
    );
  } else {
    this.loginError = 'Username and password are required and must be at least 3 characters long.';
  }
}

private loadSavedCredentials() {
  const savedUsername = localStorage.getItem('saved_username');
  const savedPassword = localStorage.getItem('saved_password');
  if (savedUsername && savedPassword) {
    this.form.patchValue({
      username: savedUsername,
      password: savedPassword,
      rememberMe: true
    });
  }
}

  navigateToLogin() {
    this.router.navigate(['/signup']); 
  }

  guestLogin() {
    this.authService.login('guest', 'guestpassword').subscribe(
      (response) => {
        localStorage.setItem('access_token', response.access);
        localStorage.setItem('refresh_token', response.refresh);
        this.router.navigateByUrl('/todo');
      },
      (error) => {
        console.error('Guest login failed:', error);
        this.loginError = 'Gast-Anmeldung fehlgeschlagen. Bitte versuche es später erneut.';
      }
    );
  }
  
}



    

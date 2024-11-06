import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent {
  username: string = '';
  email: string = '';
  password: string = '';
  acceptedPrivacyPolicy: boolean = false; 
  showPrivacyWarning: boolean = false; 
  registrationError: string | null = null;

  constructor(private http: HttpClient, private router: Router) {}

  isFormValid(): boolean {
    return Boolean(this.username) && this.username.length >= 3 &&
           Boolean(this.password) && this.password.length >= 3 &&
           Boolean(this.email) && this.acceptedPrivacyPolicy;
  }
  
  register() {
    if (!this.acceptedPrivacyPolicy) {
      this.showPrivacyWarning = true;
      return; 
    }
    this.showPrivacyWarning = false; 
    const user = { username: this.username, email: this.email, password: this.password };
    
    this.http.post<any>('http://localhost:8000/api/register/', user).pipe(
      catchError(error => {
        console.error('Registration error:', error);
        if (error.error && error.error.email) {
          this.registrationError = 'Diese E-Mail-Adresse wird bereits verwendet.';
        } else {
          this.registrationError = 'Registrierung fehlgeschlagen. Bitte versuchen Sie es erneut.';
        }
        return throwError(() => new Error('Registration failed, please try again.'));
      })
    ).subscribe((response) => {
      if (response.message === 'User registered successfully') {
        this.router.navigate(['/login']); 
      } else {
        console.error('Invalid registration response:', response);
      }
    });
  }
  
  navigateToLogin() {
    this.router.navigate(['/login']); 
  }

  navigateToLegalNotice() {
    this.router.navigate(['/legal-notice']);
  }
}

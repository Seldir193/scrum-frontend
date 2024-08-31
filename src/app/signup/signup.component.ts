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
  styleUrls: ['./signup.component.scss'] // Korrektur: styleUrls statt styleUrl
})
export class SignupComponent {
  username: string = '';
  email: string = '';
  password: string = '';

  constructor(private http: HttpClient, private router: Router) {}


  register() {
    const user = { username: this.username, email: this.email, password: this.password };
    
    this.http.post<any>('http://localhost:8000/register/', user).pipe(
      catchError(error => {
        console.error('Registration error:', error);
        return throwError(() => new Error('Registration failed, please try again.'));
      })
    ).subscribe((response) => {
      if (response.message === 'User registered successfully') {
        // Erfolgreiche Registrierung, zur Login-Seite weiterleiten
        this.router.navigate(['/login']);
      } else {
        console.error('Invalid registration response:', response);
      }
    });
  }
  
  navigateToLogin() {
    this.router.navigate(['/login']); // Navigiert zur Login-Seite
  }
}


import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost:8000/api/';  

  constructor(private http: HttpClient, private router: Router) {}

login(username: string, password: string): Observable<any> {
  return this.http.post<any>(`${this.baseUrl}login/`, { username, password }).pipe(
    tap(response => {
      console.log('Login response:', response);  
      if (response.access && response.refresh) {
        localStorage.setItem('access_token', response.access);
        localStorage.setItem('refresh_token', response.refresh);
      } else {
        console.error('Unexpected response format:', response);
      }
    }),
    catchError(error => {
      console.error('Login error status:', error.status);  
      console.error('Login error message:', error.message);  
      console.error('Login error details:', error.error);    
      return throwError(() => new Error('Login failed, please try again.'));
    })
  );
}

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }
}






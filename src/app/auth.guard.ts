import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean {
    const token = localStorage.getItem('access_token');
    if (token && !this.isTokenExpired(token)) {
      return true;
    } else {

      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');

      this.router.navigate(['/login']);
      return false;
    }
  }

  private isTokenExpired(token: string): boolean {
    const payload = this.decodeToken(token);
    const expirationDate = new Date(payload.exp * 10000);
    return new Date() > expirationDate;
  }

  private decodeToken(token: string): any {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  }
}

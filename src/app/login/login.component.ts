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
    username: ['', Validators.required],
    password: ['', Validators.required]
  });
}



ngOnInit(): void {
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

  if (val.username && val.password) {
    this.authService.login(val.username, val.password).subscribe(
      (response) => {
        console.log('Kullanıcı giriş yaptı');
        // Tokens im localStorage kaydet
        localStorage.setItem('access_token', response.access);
        localStorage.setItem('refresh_token', response.refresh);
        // Korumalı sayfaya yönlendirme, örneğin "/todo"
        this.router.navigateByUrl('/todo');
      },
      (error) => {
        console.error('Giriş başarısız:', error);
        // Burada hata mesajını göstermek veya ek hata işleme gerçekleştirmek için
        if (error.error) {
          console.error('Sunucu Hatası:', error.error);
        }
        if (error.status) {
          console.error('HTTP Durumu:', error.status);
        }
        // Giriş hata değişkenini hata mesajını göstermek için atama
        this.loginError = error.message || 'Giriş başarısız, lütfen tekrar deneyin.';
      }
    );
  } else {
    console.warn('Kullanıcı adı ve şifre sağlanmalıdır');
    // Giriş hata değişkenini hata mesajını göstermek için atama
    this.loginError = 'Kullanıcı adı ve şifre gereklidir.';
  }
}

  navigateToLogin() {
    this.router.navigate(['/signup']); 
  }
}



    

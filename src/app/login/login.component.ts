import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  email: string = '';
  password: string = '';

  constructor(private http: HttpClient,private router: Router) {}

  login(){
    const credentials = { email: this.email, password: this.password };
    this.http.post('http://localhost:4200/api/login', credentials).subscribe((response) => {
      this.router.navigate(['/todo']);
    });
  }

  navigateToLogin() {
    this.router.navigate(['/todo']); // Navigiert zur Login-Seite
  }

}

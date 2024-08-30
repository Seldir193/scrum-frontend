import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss'
})
export class SignupComponent {
  username: string = '';
  email: string = '';
  password: string = '';

  constructor(private http: HttpClient,private router: Router) {}

  register(){
    const user = { username: this.username, email: this.email, password: this.password };
    this.http.post('http://localhost:4200/api/register', user).subscribe((response) => {
      this.router.navigate(['/login']);
    });
  }

  navigateToLogin() {
    this.router.navigate(['/login']); // Navigiert zur Login-Seite
  }
}

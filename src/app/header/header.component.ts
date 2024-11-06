import { Component } from '@angular/core';
import {MatMenuModule} from '@angular/material/menu';
import {MatButtonModule} from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TaskService } from '../task.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [MatButtonModule, MatMenuModule,CommonModule,RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  constructor(private taskService: TaskService , private router: Router,public dialog: MatDialog ) {
  }

  logout() {
    this.taskService.logout().subscribe(
      () => {
        console.log("Logout successful, removing tokens and redirecting to login.");
        this.handleLogout();
      },
      (error) => {
        console.error("Logout failed:", error);
        this.handleLogout();
      }
    );
  }
  
  private handleLogout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    this.router.navigate(['/login']);
  }
}



import { Component } from '@angular/core';
import { TodoComponent } from '../todo/todo.component';
import {MatMenuModule} from '@angular/material/menu';
import {MatButtonModule} from '@angular/material/button';
import { ContactDialogComponent ,ContactDialogData } from '../contact-dialog/contact-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TodoService } from '../todo.service';







@Component({
  selector: 'app-header',
  standalone: true,
  imports: [TodoComponent,MatButtonModule, MatMenuModule,CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  contacts: ContactDialogData[] = [];

  constructor( private todoService: TodoService, private router: Router,public dialog: MatDialog ) {
   
  }

  openContactDialog(): void {
    const dialogRef = this.dialog.open(ContactDialogComponent, {
      width: '400px',
      data: { contact: { name: '', email: '', phoneNumber: '' } }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.contacts.push(result);  // Kontakt zur Liste hinzufügen
      }
    });
  }


  
  logout() {
    this.todoService.logout().subscribe(
      () => {
        console.log("Logout successful, removing tokens and redirecting to login.");
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        this.router.navigate(['/login']);
      },
      (error) => {
        console.error("Logout failed:", error);
      }
    );
  }


}



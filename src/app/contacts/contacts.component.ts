import { Component } from '@angular/core';
import { ContactService } from '../contact.service';
import { Contact } from '../task.model';
import { Router } from '@angular/router';
import { ContactDialogData } from '../task.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ContactDialogComponent } from '../contact-dialog/contact-dialog.component';
import { MatButtonModule } from '@angular/material/button';
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'app-contacts',
  standalone: true,
  imports: [CommonModule,FormsModule,ContactDialogComponent,MatButtonModule,HeaderComponent],
  templateUrl: './contacts.component.html',
  styleUrl: './contacts.component.scss'
})

export class ContactsComponent {
  contacts: Contact[] = [];

  constructor(private contactService: ContactService, private router: Router,public dialog: MatDialog,){
    this.loadContacts();
  }

  private loadContacts(): void {
    this.contactService.getContacts().subscribe(
      (contacts: Contact[]) => {
        this.contacts = contacts;
      },
      (error) => {
        console.error('Failed to load contacts', error);
      }
    );
  }

  deleteContact(id: number | undefined): void {
    if (id !== undefined) {
      this.contactService.deleteContact(id).subscribe(() => {
        this.contacts = this.contacts.filter(contact => contact.id !== id);
      });
    }
  }


  openContactDialog(): void {
    const dialogRef = this.dialog.open(ContactDialogComponent, {
      width: '400px',
      data: { name: '', email: '', phone_number: '' }
    });
  
    dialogRef.afterClosed().subscribe((result: ContactDialogData) => {
      if (result) {
        const duplicateContact = this.contacts.find(contact => contact.email === result.email);
  
        if (duplicateContact) {
          console.error('Kontakt mit dieser E-Mail-Adresse existiert bereits.');
          return;
        }
  
        this.contactService.addContact(result).subscribe(newContact => {
          this.contacts.push(newContact);
        });
      }
    });
  }


  }
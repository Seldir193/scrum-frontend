// task-dialog.component.ts
import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ContactService } from '../contact.service'; // Importiere den ContactService
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { Contact } from '../contact.model';


export interface TaskDialogData {
  name: string;
  description?: string;
  contacts: Contact[];
  selectedContacts: Contact[];
  category: 'do-today' | 'other';
}

@Component({
  selector: 'app-task-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatDialogModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule
  ],
  templateUrl: './task-dialog.component.html',
  styleUrls: ['./task-dialog.component.scss']
})
export class TaskDialogComponent implements OnInit {
  task: TaskDialogData;
  selectedContacts: Contact[] = [];
  allContacts: Contact[] = [];

  

  constructor(
    public dialogRef: MatDialogRef<TaskDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: TaskDialogData,
    private contactService: ContactService // Injiziere den ContactService
  ) {
    this.task = data || { name: '', description: '', contacts: [], selectedContacts: [] };
    if (data) {
      this.task = { ...data };
      this.selectedContacts = data.selectedContacts || [];
      
    }
  }

  ngOnInit(): void {
    this.loadContacts();
  }


  loadContacts(): void {
    this.contactService.getContacts().subscribe(
      (contacts: Contact[]) => {
        this.allContacts = contacts; // Kontakte zur Auswahl bereitstellen
      },
      (error) => {
        console.error('Failed to load contacts', error);
      }
    );
  }


  save(): void {
    this.dialogRef.close({
      name: this.task.name,
      description: this.task.description,
      selectedContacts: this.selectedContacts
    });
  }


  close(): void {
    this.dialogRef.close();
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
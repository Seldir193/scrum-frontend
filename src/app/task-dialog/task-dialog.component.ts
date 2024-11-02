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
import { Contact,TaskDialogData } from '../task.model';



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
    MatSelectModule,
    
  ],
  templateUrl: './task-dialog.component.html',
  styleUrls: ['./task-dialog.component.scss']
})
export class TaskDialogComponent implements OnInit {
  task: TaskDialogData;
  selectedContacts: Contact[] = [];
  allContacts: Contact[] = [];

  

  priorityOptions = [
    { value: 'urgent', viewValue: 'Urgent' },
    { value: 'medium', viewValue: 'Medium' },
    { value: 'low', viewValue: 'Low' }
];


  

  constructor(
    public dialogRef: MatDialogRef<TaskDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: TaskDialogData,
    private contactService: ContactService
  ) {
    this.task = data || { name: '', description: '', contacts: [], selectedContacts: [], priority: '', dueDate: null };
    if (data) {
      this.task = { ...data };
      this.selectedContacts = data.selectedContacts || [];

      if (typeof data.dueDate === 'string') {
        this.task.dueDate = new Date(data.dueDate);
      }
      
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
    console.log('Due Date in save before sending to backend:', this.task.dueDate); 
    this.dialogRef.close({
      name: this.task.name,
      description: this.task.description,
      selectedContacts: this.selectedContacts,
      priority: this.task.priority ,
      //dueDate: this.task.dueDate 
      dueDate: this.task.dueDate ? this.task.dueDate.toISOString() : null // ISO-Format
     
       
    });
  }

  close(): void {
    this.dialogRef.close();
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
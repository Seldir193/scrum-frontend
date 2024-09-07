
import { Component, OnInit } from '@angular/core';
import { TodoService, Todo } from '../todo.service'; // Verwende denselben Service
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContactService } from '../contact.service';
import { Contact } from '../contact.model';
import { MatDialog } from '@angular/material/dialog';
import { TaskDialogComponent } from '../task-dialog/task-dialog.component';
import { Router } from '@angular/router';
import { TaskDialogData } from '../task-dialog/task-dialog.component';
import { TodayTaskService } from '../today-task.service';
import { TodayTask } from '../today-task.service';
import { TodoComponent } from '../todo/todo.component';
import { InProgressService } from '../in-progress.service';
import { InProgress } from '../in-progress.service';
import { CdkDragDrop, moveItemInArray,transferArrayItem } from '@angular/cdk/drag-drop';
import { DragDropModule } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-in-progress',
  standalone: true,
  imports: [CommonModule, FormsModule,TodoComponent,DragDropModule],
  templateUrl: './in-progress.component.html',
  styleUrl: './in-progress.component.scss'

})
export class InProgressComponent implements OnInit {
  todos: Todo[] = [];
  allContacts: Contact[] = [];
  selectedContacts: Contact[] = [];
  newTodo: Todo = { id: 0, text: '', delayed: false, user: 0, contacts: [] };
  contacts: Contact[] = [];
  inProgress: InProgress[] = [];
  selectedTodo: Todo | null = null; // Hinzufügen von 'selectedTodo'

  constructor(
    private todoService: TodoService,
    private contactService: ContactService ,
    private dialog: MatDialog,
    private todayTaskService: TodayTaskService,
    private router: Router,
    private inProgressService: InProgressService,
  ) {}

  ngOnInit(): void {
    this.getInProgress();
    this.loadContacts();
    //this.loadTodayTasks();
    this.getContacts(); // Kontakte beim Initialisieren abrufen
  }

  private getContacts(): void {
    this.contactService.getContacts().subscribe(
      (data: Contact[]) => this.contacts = data, // Setze die Kontakte in den lokalen Zustand
      (error) => console.error('Failed to load contacts', error)
    );
  }

  getInProgress(): void {
    this.inProgressService.getInProgress().subscribe(progress => {
      this.inProgress = progress; // Nur Aufgaben für Do Today laden
    });
  }

  drop(event: CdkDragDrop<InProgress[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
     
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }
  }



  toggleDelayed(progress: InProgress): void {
    progress.delayed = !progress.delayed;
    
    // Verwende den todayTaskService, um die Änderungen im Backend zu speichern
    this.inProgressService.updateInProgress(progress).subscribe(
      () => {
        console.log('Task updated successfully:', progress);
      },
      (error) => {
        console.error('Error updating task:', error);
      }
    );
  }
  
  openAddInProgressDialog(): void {
    const dialogRef = this.dialog.open(TaskDialogComponent, {
      width: '400px',
      data: {
        name: '',
        description: '',
        contacts: this.contacts, // Alle verfügbaren Kontakte
        selectedContacts: [] // Initial keine ausgewählten Kontakte
      }
    });
  
    dialogRef.afterClosed().subscribe((result: TaskDialogData & { selectedContacts: Contact[] }) => {
      if (result) {
        const newTask: InProgress = {
          id: 0,
          text: result.name,
          delayed: false,
          user: this.getUserId(),
          description: result.description,
          contacts: result.selectedContacts || [] // Übergeben der ausgewählten Kontakte
        };
  
        console.log('Adding new TodayTask:', newTask);
        this.inProgressService.addInProgress(newTask).subscribe(
          addedTask => {
            console.log('Added TodayTask:', addedTask);
            this.inProgress.push(addedTask);
          },
          error => {
            console.error('Fehler beim Hinzufügen der TodayTask:', error);
          }
        );
      }
    });
  }
  
  getUserId(): number {
    const token = this.getToken();
    if (token) {
      const payload = this.decodeToken(token);
      return payload.user_id;
    } else {
      console.error('No token found');
      return 0;
    }
  }

  private decodeToken(token: string): any {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  }

  private getToken(): string | null {
    return localStorage.getItem('access_token');
  }
  
  deleteInProgress(id: number): void {
    this.inProgressService.deleteInProgress(id).subscribe(
      () => {
        this.inProgress = this.inProgress.filter(progress => progress.id !== id);
      },
      (error) => {
        console.error('Fehler beim Löschen der TodayTask:', error);
      }
    );
  }

  loadContacts(): void {
    this.contactService.getContacts().subscribe(contacts => {
      this.allContacts = contacts; // Kontakte zur Auswahl bereitstellen
    });
  }

  addContactsInProgress(progress: InProgress): void {
    const dialogRef = this.dialog.open(TaskDialogComponent, {
      width: '400px',
      data: {
        name: progress.text,
        description: progress.description,
        contacts: this.allContacts, // Alle verfügbaren Kontakte
        selectedContacts: progress.contacts // Bereits zugewiesene Kontakte
      }
    });
  
    dialogRef.afterClosed().subscribe((result: TaskDialogData & { selectedContacts: Contact[] }) => {
      if (result) {
        progress.text = result.name;
        progress.description = result.description;
        progress.contacts = result.selectedContacts || [];
        
        this.inProgressService.updateInProgress(progress).subscribe(() => {
          console.log('Updated task with new contacts');
  
          const index = this.inProgress.findIndex(t => t.id === progress.id);
          if (index !== -1) {
            this.inProgress[index] = progress;
          }
  
          this.selectedTodo = progress;
        });
      }
    });
  }
  
}

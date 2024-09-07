
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
import { DoneService } from '../done.service';
import { Done } from '../done.service';
import { CdkDragDrop, moveItemInArray,transferArrayItem } from '@angular/cdk/drag-drop';
import { DragDropModule } from '@angular/cdk/drag-drop';


@Component({
  selector: 'app-done',
  standalone: true,
  imports: [CommonModule, FormsModule,TodoComponent,DragDropModule],
  templateUrl: './done.component.html',
  styleUrl: './done.component.scss'

})
export class DoneComponent implements OnInit {
  todos: Todo[] = [];
  allContacts: Contact[] = [];
  selectedContacts: Contact[] = [];
  newTodo: Todo = { id: 0, text: '', delayed: false, user: 0, contacts: [] };
  contacts: Contact[] = [];
  done: Done[] = [];
  selectedTodo: Todo | null = null; // Hinzufügen von 'selectedTodo'

  constructor(
    private todoService: TodoService,
    private contactService: ContactService ,
    private dialog: MatDialog,
    private todayTaskService: TodayTaskService,
    private router: Router,
    private inProgressService: InProgressService,
    private doneService: DoneService
  ) {}

  ngOnInit(): void {
    this.getDone();
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

  getDone(): void {
    this.doneService.getDone().subscribe(done => {
      this.done = done; // Nur Aufgaben für Do Today laden
    });
  }

  drop(event: CdkDragDrop<Done[]>) {
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


  toggleDelayed(done: Done): void {
    done.delayed = !done.delayed;
    
    // Verwende den todayTaskService, um die Änderungen im Backend zu speichern
    this.doneService.updateDone(done).subscribe(
      () => {
        console.log('Task updated successfully:', done);
      },
      (error) => {
        console.error('Error updating task:', error);
      }
    );
  }
  
  openAddDoneDialog(): void {
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
        const newTask: Done = {
          id: 0,
          text: result.name,
          delayed: false,
          user: this.getUserId(),
          description: result.description,
          contacts: result.selectedContacts || [] // Übergeben der ausgewählten Kontakte
        };
  
        console.log('Adding new TodayTask:', newTask);
        this.doneService.addDone(newTask).subscribe(
          addedTask => {
            console.log('Added TodayTask:', addedTask);
            this.done.push(addedTask);
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
  
  deleteDone(id: number): void {
    this.doneService.deleteDone(id).subscribe(
      () => {
        this.done = this.done.filter(done => done.id !== id);
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

  addContactsDone(done: Done): void {
    const dialogRef = this.dialog.open(TaskDialogComponent, {
      width: '400px',
      data: {
        name: done.text,
        description: done.description,
        contacts: this.allContacts, // Alle verfügbaren Kontakte
        selectedContacts: done.contacts // Bereits zugewiesene Kontakte
      }
    });
  
    dialogRef.afterClosed().subscribe((result: TaskDialogData & { selectedContacts: Contact[] }) => {
      if (result) {
        done.text = result.name;
        done.description = result.description;
        done.contacts = result.selectedContacts || [];
        
        this.doneService.updateDone(done).subscribe(() => {
          console.log('Updated task with new contacts');
  
          const index = this.done.findIndex(t => t.id === done.id);
          if (index !== -1) {
            this.done[index] = done;
          }
  
          this.selectedTodo = done;
        });
      }
    });
  }
  
}

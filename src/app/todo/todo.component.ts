import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { TaskDialogComponent } from '../task-dialog/task-dialog.component';
import { TodoService } from '../todo.service';
import { MatButtonModule } from '@angular/material/button';
import { TaskDialogData } from '../task-dialog.model';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { ContactDialogComponent } from '../contact-dialog/contact-dialog.component';
import { ContactDialogData } from '../contact-dialog/contact-dialog.component';
import { HeaderComponent } from '../header/header.component';
import { ContactService } from '../contact.service'; // Importiere den ContactService
import { Contact } from '../contact.model';
import { DoTodayComponent } from '../do-today/do-today.component';
import { InProgressComponent } from '../in-progress/in-progress.component';
import { DoneComponent } from '../done/done.component';
import { CdkDragDrop, moveItemInArray,transferArrayItem }  from '@angular/cdk/drag-drop';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { TodayTaskService , TodayTask} from '../today-task.service';

import { InProgressService,InProgress } from '../in-progress.service';
import { DoneService,Done } from '../done.service';
import { TaskmanagerService } from '../taskmanager.service';

export interface Todo {
  id: number;
  text: string;
  delayed: boolean;
  user: number;
  isEditing?: boolean;
  description?: string;
  contacts: Contact[];
  status?: string;
  
}

@Component({
  selector: 'app-todo',
  standalone: true,
  imports: [CommonModule,DoTodayComponent,DragDropModule,InProgressComponent,DoneComponent, FormsModule,HeaderComponent, TaskDialogComponent, MatButtonModule, MatDatepickerModule, MatNativeDateModule, ContactDialogComponent],
  templateUrl: './todo.component.html',
  styleUrls: ['./todo.component.scss']
})
export class TodoComponent implements OnInit {
  todos: Todo[] = [];
  newTodo: string = '';
  selectedTodo: Todo | null = null;
  task: TaskDialogData = { name: '' };
  contacts: Contact[] = [];
  
   
  constructor(
     private todoService: TodoService, 
     private router: Router, public dialog: MatDialog,
     private contactService: ContactService,
     private todayTaskService: TodayTaskService,
     private inProgressService: InProgressService,
     private doneService: DoneService,
     private taskmanagerService: TaskmanagerService
  )
     {}

  ngOnInit(): void {
    this.checkAuthentication();
    window.onpopstate = () => {
      this.checkAuthentication();
    };
    this.getContacts(); // Kontakte beim Initialisieren abrufen

    this.loadContacts();
    this.loadTodos();
  }

  private getContacts(): void {
    this.contactService.getContacts().subscribe(
      (data: Contact[]) => this.contacts = data, // Setze die Kontakte in den lokalen Zustand
      (error) => console.error('Failed to load contacts', error)
    );
  }

  loadTodos(): void {
    this.todoService.getTodos().subscribe(
      (todos) => this.todos = todos,
      (error) => console.error('Failed to load todos', error)
    );
  }
  
  private checkAuthentication() {
    const token = this.getToken();
    if (!token || this.isTokenExpired(token)) {
      this.router.navigate(['/login']);
    } else {
      this.getTodos();
    }
  }

  private isTokenExpired(token: string): boolean {
    const payload = this.decodeToken(token);
    const expirationDate = new Date(payload.exp * 1000);
    return new Date() > expirationDate;
  }

  private getToken(): string | null {
    return localStorage.getItem('access_token');
  }


  drop(event: CdkDragDrop<Todo[] | TodayTask[] | InProgress[] | Done[]>) {
    this.taskmanagerService.handleDrop(event);
  }


  editTodoText(todo: Todo, newText: string) {
    if (newText.trim()) {
      todo.text = newText;
      this.todoService.updateTodo(todo).subscribe();
    }
  }


  deleteContact(id: number | undefined): void {
    if (id !== undefined) {
      this.contactService.deleteContact(id).subscribe(() => {
        this.contacts = this.contacts.filter(contact => contact.id !== id);
      });
    }
  }

  
  getTodos() {
    this.todoService.getTodos().subscribe(data => this.todos = data);
  }

  addTodo() {
    const userId = this.getUserId();
    const todo: Todo = { id: 0, text: this.newTodo, delayed: false, user: userId , contacts: []};
    this.todoService.addTodo(todo).subscribe(newTodo => {
      this.todos.push(newTodo);
      this.newTodo = '';
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

  updateTodo(todo: Todo) {
    this.todoService.updateTodo(todo).subscribe();
  }

  toggleDelayed(todo: Todo) {
    todo.delayed = !todo.delayed;
    this.updateTodo(todo);
  }

  openEditDialog(todo?: Todo): void {
    const dialogRef = this.dialog.open(TaskDialogComponent, {
      width: '400px',
      data: {
        name: todo ? todo.text : '',
        description: todo ? todo.description : '',
        contacts: this.contacts,
        selectedContacts: todo ? todo.contacts : []
      }
    });
  
    dialogRef.afterClosed().subscribe((result: TaskDialogData & { selectedContacts: Contact[] }) => {
      if (result) {
        if (todo) {
          todo.text = result.name;
          todo.description = result.description;
          todo.contacts = result.selectedContacts || [];
          this.updateTodo(todo); // Hier könnte der Fehler auftreten
          this.selectedTodo = todo;
        } else {
          const newTask: Todo = {
            id: 0,
            text: result.name,
            delayed: false,
            user: this.getUserId(),
            description: result.description,
            contacts: result.selectedContacts || []
          };
          this.todoService.addTodo(newTask).subscribe(addedTask => {
            this.todos.push(addedTask);
            this.selectedTodo = addedTask;
          });
        }
      }
    });
  }

  openEditCard(todo: Todo): void {
    this.selectedTodo = todo;
  }

  deleteTodo(id: number): void {
    this.todoService.deleteTodo(id).subscribe(() => {
      this.todos = this.todos.filter(t => t.id !== id);
  
      if (this.selectedTodo && this.selectedTodo.id === id) {
        this.selectedTodo = null;
      }
    });
  }

  private loadContacts(): void {
    this.contactService.getContacts().subscribe(
      (contacts: Contact[]) => {
        this.contacts = contacts;  // Kontakte speichern
      },
      (error) => {
        console.error('Failed to load contacts', error);  // Fehlerbehandlung
      }
    );
  }

  openContactDialog(): void {
    const dialogRef = this.dialog.open(ContactDialogComponent, {
      width: '400px',
      data: { name: '', email: '', phoneNumber: '' }
    });
  
    dialogRef.afterClosed().subscribe((result: ContactDialogData) => {
      if (result) {
        // Überprüfen, ob ein Kontakt mit der gleichen E-Mail-Adresse bereits existiert
        const duplicateContact = this.contacts.find(contact => contact.email === result.email);
  
        if (duplicateContact) {
          console.error('Kontakt mit dieser E-Mail-Adresse existiert bereits.');
          return; // Verhindert das Hinzufügen des doppelten Kontakts
        }
  
        this.contactService.addContact(result).subscribe(newContact => {
          this.contacts.push(newContact);  // Den neuen Kontakt zur Liste hinzufügen
        });
      }
    });
  }
  
  addNewTask(): void {
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
        const newTask: Todo = {
          id: 0,
          text: result.name,
          delayed: false,
          user: this.getUserId(),
          description: result.description,
          contacts: result.selectedContacts || [] // Übergeben der ausgewählten Kontakte
        } ;
  
        console.log('Adding new task:', newTask);
        this.todoService.addTodo(newTask).subscribe(addedTask => {
          console.log('Added task:', addedTask);
          this.todos.push(addedTask);
          this.selectedTodo = addedTask; // Die neue Karte anzeigen
        });
      }
    });
  }
}














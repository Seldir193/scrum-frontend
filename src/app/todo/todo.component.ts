import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { TaskDialogComponent } from '../task-dialog/task-dialog.component';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { ContactDialogComponent } from '../contact-dialog/contact-dialog.component';
import { HeaderComponent } from '../header/header.component';
import { ContactService } from '../contact.service'; 
import { CdkDragDrop} from '@angular/cdk/drag-drop';
import { TaskmanagerService } from '../taskmanager.service';
import { TaskService } from '../task.service'; 
import { Todo, Contact, TaskDialogData } from '../task.model';
import { DoTodayComponent } from '../do-today/do-today.component';
import { InProgressComponent } from '../in-progress/in-progress.component';
import { DoneComponent } from '../done/done.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ContactDetailsDialogComponent } from '../contact-details-dialog/contact-details-dialog.component';
import { MatTooltip } from '@angular/material/tooltip';

 @Component({
  selector: 'app-todo',
  standalone: true,
  imports: [CommonModule, FormsModule,DragDropModule,HeaderComponent,MatTooltip, TaskDialogComponent, MatButtonModule, MatDatepickerModule, MatNativeDateModule, ContactDialogComponent,DoTodayComponent,InProgressComponent,DoneComponent],
  templateUrl: './todo.component.html',
  styleUrls: ['./todo.component.scss']
})
export class TodoComponent implements OnInit {
  todos: Todo[] = [];
  newTodo: string = '';
  selectedTodo: Todo | null = null;
  contacts: Contact[] = [];
  allContacts: Contact[] = [];

  constructor(
     private router: Router, 
     public dialog: MatDialog,
     private contactService: ContactService,
     private taskmanagerService: TaskmanagerService,
     private taskService: TaskService 
  ){}

  ngOnInit(): void {
    this.checkAuthentication();
    window.onpopstate = () => {
      this.checkAuthentication();
    };
    this.getContacts();
    this.getTasks();  
  }

  private getContacts(): void {
    this.contactService.getContacts().subscribe(
      (data: Contact[]) => this.contacts = data,
      (error) => console.error('Failed to load contacts', error)
    );
  }

  private checkAuthentication() {
    const token = this.getToken();
    if (!token || this.isTokenExpired(token)) {
      this.router.navigate(['/login']);
    } else {
      this.getTasks();  
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

  drop(event: CdkDragDrop<Todo[]>) {
    this.taskmanagerService.handleDrop(event);  
  }

  openContactShowDialog(contact: any): void {
    this.dialog.open(ContactDetailsDialogComponent, {
      data: contact
    });
  }

  getHiddenContacts(contacts: any[]): string {
    return contacts.slice(5).map(contact => contact.name).join(', ');
  }

  editTodoText(todo: Todo, newText: string) {
    if (newText.trim()) {
      todo.text = newText;
      this.taskService.updateTask(todo).subscribe();
    }
  }

  getTasks() {
    this.taskService.getTasks('todos').subscribe(data => this.todos = data);
  }

  addTodo() {
    const userId = this.getUserId();
    const todo: Todo = { id: 0, text: this.newTodo, delayed: false, user: userId, contacts: [] };
    this.taskService.addTask(todo).subscribe(newTodo => {
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
    this.taskService.updateTask(todo).subscribe();
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
          this.updateTodo(todo);
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
          this.taskService.addTask(newTask).subscribe(addedTodo => {
            this.todos.push(addedTodo); 
            this.selectedTodo = addedTodo;
          });
        }
      }
    });
  }

  openEditCard(todo: Todo): void {
    this.selectedTodo = todo;
  }

  deleteTodo(id: number): void {
    this.taskService.deleteTask(id).subscribe(() => {
      this.todos = this.todos.filter(t => t.id !== id);
      if (this.selectedTodo && this.selectedTodo.id === id) {
        this.selectedTodo = null;
      }
    });
  }

  addNewTask(): void {
    const dialogRef = this.dialog.open(TaskDialogComponent, {
      width: '400px',
      data: {
        name: '',
        description: '',
        contacts: this.contacts,
        selectedContacts: []
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
          contacts: result.selectedContacts || [],
          status: 'todos'
        };
  
        this.taskService.addTask(newTask).subscribe(addedTask => {
          this.todos.push(addedTask);
          this.selectedTodo = addedTask;
          this.getTasks();
        });
      }
    });
  }
}














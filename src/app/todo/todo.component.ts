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

  getTasks(): void {
    this.taskService.getTasks('todos').subscribe(todosTasks => {
      this.todos = todosTasks.map(task => ({
        ...task,
        dueDate: task.due_date // Mapping von `due_date` auf `dueDate` für das Frontend
      }));
      console.log(this.todos); // Debugging, um sicherzustellen, dass `dueDate` existiert
    });
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

  openEditDialog(todo: Todo): void {
    const dialogRef = this.dialog.open(TaskDialogComponent, {
      width: '400px',
      data: {
        name: todo ? todo.text : '',
        description: todo ? todo.description : '',
        contacts: this.contacts,
        selectedContacts: todo ? todo.contacts : [],
        priority: todo.priority,
        dueDate: todo.dueDate,
        category: todo.category 
      }
    });
  
    dialogRef.afterClosed().subscribe((result: TaskDialogData & { selectedContacts: Contact[], priority: string, dueDate: Date | null,category:string }) => {
      if (result) {
        // Wenn der bestehende Todo bearbeitet wird
        if (todo) {
          todo.text = result.name;
          todo.description = result.description;
          todo.contacts = result.selectedContacts || [];
          todo.priority = result.priority;
          todo.dueDate = result.dueDate;
          todo.category = result.category
  
          // Anstatt das Due Date hier zu formatieren, übergeben wir das `todo` direkt an den TaskService
          this.taskService.updateTask(todo).subscribe(() => {
            console.log('Updated task with new contacts');
  
            // Aktualisiere die lokale Liste der Todos
            const index = this.todos.findIndex(t => t.id === todo.id);
            if (index !== -1) {
              this.todos[index] = { ...todo };
            }
  
            this.selectedTodo = todo;
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
    // Öffne den Dialog, um einen neuen Task hinzuzufügen
    const dialogRef = this.dialog.open(TaskDialogComponent, {
      width: '400px',
      data: {
        name: '',
        description: '',
        contacts: this.contacts,
        selectedContacts: [],
        priority: '',
        dueDate: null,
        category: 'Technical Tasks' 
      }
    });
  
    // Bearbeite das Ergebnis nach dem Schließen des Dialogs
    dialogRef.afterClosed().subscribe((result: TaskDialogData & { selectedContacts: Contact[], priority: string, dueDate: Date | null }) => {
      if (result) {
        // Neues Task-Objekt erstellen
        const newTask: Todo = {
          id: 0, // Die ID wird nach dem Speichern generiert
          text: result.name,
          delayed: false,
          user: this.getUserId(),
          description: result.description,
          contacts: result.selectedContacts || [],
          status: 'todos',
          priority: result.priority,
          dueDate: result.dueDate,
          category: result.category 
        };
  
        // Task hinzufügen und im Backend speichern
        this.taskService.addTask(newTask).subscribe(addedTask => {
          console.log('Added new task:', addedTask);
          this.todos.push(addedTask); // Der neue Task wird der lokalen Liste hinzugefügt
          this.selectedTodo = addedTask; // Der neue Task wird als "ausgewählt" markiert
          this.getTasks(); // Aktualisiere die Liste der Tasks
        }, error => {
          console.error('Fehler beim Hinzufügen des neuen Tasks:', error);
        });
      }
    });
  }
  
  
}














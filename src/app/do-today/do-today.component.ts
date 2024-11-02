import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContactService } from '../contact.service';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { TaskmanagerService } from '../taskmanager.service';
import { TaskService } from '../task.service';  // Import TaskService
import { TodayTask, Todo, Contact, TaskDialogData } from '../task.model';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { TaskDialogComponent } from '../task-dialog/task-dialog.component';
import { MatButtonModule } from '@angular/material/button';
import { ContactDetailsDialogComponent } from '../contact-details-dialog/contact-details-dialog.component';
import { MatTooltipModule } from '@angular/material/tooltip';


@Component({
  selector: 'app-do-today',
  standalone: true,
  imports: [CommonModule,MatButtonModule, FormsModule,DragDropModule,MatTooltipModule],
  templateUrl: './do-today.component.html',
  styleUrls: ['./do-today.component.scss']
})
export class DoTodayComponent implements OnInit {
  todos: Todo[] = [];
  allContacts: Contact[] = [];
  selectedContacts: Contact[] = [];
  newTodo: Todo = { id: 0, text: '', delayed: false, user: 0, contacts: [] };
  contacts: Contact[] = [];
  
  todayTasks: TodayTask[] = [];
  selectedTodo: Todo | null = null;

  constructor(
    private contactService: ContactService,
    private dialog: MatDialog,
    private router: Router,
    private taskmanagerService: TaskmanagerService,
    private taskService: TaskService  // Verwende den TaskService
  ) {}

  ngOnInit(): void {
    this.getTodayTasks();
    this.loadContacts();
    this.getContacts();
  }

  
  private getContacts(): void {
    this.contactService.getContacts().subscribe(
      (data: Contact[]) => this.contacts = data,
      (error) => console.error('Failed to load contacts', error)
    );
  }

  getTodayTasks(): void {
    this.taskService.getTasks('todaytasks').subscribe(todayTasks => {
      this.todayTasks = todayTasks.map(task => ({
        ...task,
        dueDate: task.due_date // Mapping von `due_date` auf `dueDate` für das Frontend
      }));
      console.log(this.todayTasks); // Debugging, um sicherzustellen, dass `dueDate` existiert
    });
  }


  
  openContactDialog(contact: any): void {
    this.dialog.open(ContactDetailsDialogComponent, {
      data: contact
    });
  }

  getHiddenContacts(contacts: any[]): string {
    return contacts.slice(5).map(contact => contact.name).join(', ');
  }

  drop(event: CdkDragDrop<Todo[] | TodayTask[]>) {
    this.taskmanagerService.handleDrop(event);
  }

  toggleDelayed(task: TodayTask): void {
    task.delayed = !task.delayed;

    // Verwende den TaskService für die Statusaktualisierung
    this.taskService.updateTask(task).subscribe(
      () => {
        console.log('Task updated successfully:', task);
      },
      (error) => {
        console.error('Error updating task:', error);
      }
    );
  }

  
  openAddDoTodayDialog(): void {
    const dialogRef = this.dialog.open(TaskDialogComponent, {
      width: '400px',
      data: {
        name: '',
        description: '',
        contacts: this.contacts,
        selectedContacts: [],
        priority: '',
        dueDate: null
       
      }
    });

    dialogRef.afterClosed().subscribe((result: TaskDialogData & { selectedContacts: Contact[]  }) => {
      if (result) {
        const newTask: TodayTask = {
          id: 0,
          text: result.name,
          delayed: false,
          user: this.getUserId(),
          description: result.description,
          contacts: result.selectedContacts || [], 
          status: 'todaytasks',
          priority: result.priority ,
          dueDate: result.dueDate
        };

    console.log('Adding new TodayTask:', newTask);
    this.taskService.addTask(newTask).subscribe(
      addedTask => {
        console.log('Added TodayTask:', addedTask);
        this.todayTasks.push(addedTask);
        this.getTodayTasks();
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

  deleteDoTodayTask(id: number): void {
    this.taskService.deleteTask(id).subscribe(
      () => {
        this.todayTasks = this.todayTasks.filter(task => task.id !== id);
      },
      (error) => {
        console.error('Fehler beim Löschen der TodayTask:', error);
      }
    );
  }

  loadContacts(): void {
    this.contactService.getContacts().subscribe(contacts => {
      this.allContacts = contacts;
    });
  }

  addContactsToTask(task: TodayTask): void {
    const dialogRef = this.dialog.open(TaskDialogComponent, {
      width: '400px',
      data: {
        name: task.text,
        description: task.description,
        contacts: this.allContacts.length > 0 ? this.allContacts : [],
        selectedContacts: task.contacts.length > 0 ? task.contacts : [],
        priority: task.priority,
        dueDate: task.dueDate // Füge dueDate hinzu
      }
    });
  
    dialogRef.afterClosed().subscribe((result: TaskDialogData & { selectedContacts: Contact[], priority: string, dueDate: Date | null }) => {
      if (result) {
        task.text = result.name;
        task.description = result.description;
        task.contacts = result.selectedContacts || [];
        task.priority = result.priority;
        task.dueDate = result.dueDate; // Aktualisiere das dueDate
  
        const formattedDueDate = task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : null;
        const updatedTask = { ...task, due_date: formattedDueDate }; // dueDate zu due_date für das Backend
  
        this.taskService.updateTask(updatedTask).subscribe(() => {
          console.log('Updated task with new contacts and due date');
  
          // Finde die Position der Aufgabe und aktualisiere sie in der Liste
          const index = this.todayTasks.findIndex(t => t.id === task.id);
          if (index !== -1) {
            this.todayTasks[index] = { ...task, dueDate: formattedDueDate }; // Mappe due_date zu dueDate für das Frontend
          }
  
          this.selectedTodo = task;
        });
      }
    });
  }
}

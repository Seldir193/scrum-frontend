import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContactService } from '../contact.service';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { TaskmanagerService } from '../taskmanager.service';
import { TaskService } from '../task.service';  // Import TaskService
import { Done, Todo, Contact, TaskDialogData } from '../task.model';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { TaskDialogComponent } from '../task-dialog/task-dialog.component';
import { MatButtonModule } from '@angular/material/button';
import { ContactDetailsDialogComponent } from '../contact-details-dialog/contact-details-dialog.component';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-done',
  standalone: true,
  imports: [CommonModule, FormsModule,MatButtonModule,DragDropModule,MatTooltipModule],
  templateUrl: './done.component.html',
  styleUrls: ['./done.component.scss']
})
export class DoneComponent implements OnInit {
  todos: Todo[] = [];
  allContacts: Contact[] = [];
  selectedContacts: Contact[] = [];
  newTodo: Todo = { id: 0, text: '', delayed: false, user: 0, contacts: [] };
  contacts: Contact[] = [];
  done: Done[] = [];
  selectedTodo: Todo | null = null;
  

  constructor(
    private contactService: ContactService,
    private dialog: MatDialog,
    private router: Router,
    private taskmanagerService: TaskmanagerService,
    private taskService: TaskService  // Verwende den TaskService
  ) {}

  ngOnInit(): void {
    this.getDoneTasks();
    this.loadContacts();
    this.getContacts();
  }

  private getContacts(): void {
    this.contactService.getContacts().subscribe(
      (data: Contact[]) => this.contacts = data,
      (error) => console.error('Failed to load contacts', error)
    );
  }

  getDoneTasks(): void {
    this.taskService.getTasks('done').subscribe(doneTasks => {
      this.done = doneTasks.map(task => ({
        ...task,
        dueDate: task.due_date // Mapping von `due_date` auf `dueDate` für das Frontend
      }));
      console.log(this.done); // Debugging, um sicherzustellen, dass `dueDate` existiert
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

  drop(event: CdkDragDrop<Todo[] | Done[]>) {
    this.taskmanagerService.handleDrop(event);
  }

  toggleDelayed(done: Done): void {
    done.delayed = !done.delayed;

    // Verwende den TaskService für die Statusaktualisierung
    this.taskService.updateTask(done).subscribe(
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
        contacts: this.contacts,
        selectedContacts: [],
        priority: '',
        dueDate: null
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
          contacts: result.selectedContacts || [],
          status: 'done',
          priority: result.priority ,
          dueDate: result.dueDate
        };

        console.log('Adding new DoneTask:', newTask);
        this.taskService.addTask(newTask).subscribe(
          addedTask => {
            console.log('Added DoneTask:', addedTask);
            this.done.push(addedTask);
            this.getDoneTasks();
          },
          error => {
            console.error('Fehler beim Hinzufügen der DoneTask:', error);
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
    this.taskService.deleteTask(id).subscribe(
      () => {
        this.done = this.done.filter(done => done.id !== id);
      },
      (error) => {
        console.error('Fehler beim Löschen der DoneTask:', error);
      }
    );
  }

  loadContacts(): void {
    this.contactService.getContacts().subscribe(contacts => {
      this.allContacts = contacts;
    });
  }

  addContactsDone(done: Done): void {
    const dialogRef = this.dialog.open(TaskDialogComponent, {
      width: '400px',
      data: {
        name: done.text,
        description: done.description,
        contacts: this.allContacts.length > 0 ? this.allContacts : [],
        selectedContacts: done.contacts.length > 0 ? done.contacts : [],
        priority: done.priority,
        dueDate: done.dueDate // Füge dueDate hinzu
      }
    });
  
    dialogRef.afterClosed().subscribe((result: TaskDialogData & { selectedContacts: Contact[], priority: string, dueDate: Date | null }) => {
      if (result) {
        done.text = result.name;
        done.description = result.description;
        done.contacts = result.selectedContacts || [];
        done.priority = result.priority;
        done.dueDate = result.dueDate; // Aktualisiere das dueDate
  
        // Formatiere dueDate zu due_date für das Backend
        const formattedDueDate = done.dueDate ? new Date(done.dueDate).toISOString().split('T')[0] : null;
        const updatedTask = { ...done, due_date: formattedDueDate }; // dueDate zu due_date für das Backend
  
        this.taskService.updateTask(updatedTask).subscribe(() => {
          console.log('Updated task with new contacts and due date');
  
          // Finde die Position der Aufgabe und aktualisiere sie in der Liste
          const index = this.done.findIndex(t => t.id === done.id);
          if (index !== -1) {
            this.done[index] = { ...done, dueDate: result.dueDate }; // Mappe `due_date` zu `dueDate` für das Frontend
          }
  
          this.selectedTodo = done;
        });
      }
    });
  }
}

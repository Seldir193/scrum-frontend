import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContactService } from '../contact.service';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { TaskmanagerService } from '../taskmanager.service';
import { TaskService } from '../task.service';  // Import TaskService
import { InProgress, Todo, Contact, TaskDialogData } from '../task.model';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { TaskDialogComponent } from '../task-dialog/task-dialog.component';

@Component({
  selector: 'app-in-progress',
  standalone: true,
  imports: [CommonModule, FormsModule,DragDropModule],
  templateUrl: './in-progress.component.html',
  styleUrls: ['./in-progress.component.scss']
})
export class InProgressComponent implements OnInit {
  todos: Todo[] = [];
  allContacts: Contact[] = [];
  selectedContacts: Contact[] = [];
  newTodo: Todo = { id: 0, text: '', delayed: false, user: 0, contacts: [] };
  contacts: Contact[] = [];
  inProgress: InProgress[] = [];
  selectedTodo: Todo | null = null;

  constructor(
    private contactService: ContactService,
    private dialog: MatDialog,
    private router: Router,
    private taskmanagerService: TaskmanagerService,
    private taskService: TaskService  // Verwende den TaskService
  ) {}

  ngOnInit(): void {
    this.getInProgressTasks();
    this.loadContacts();
    this.getContacts();
  }

  private getContacts(): void {
    this.contactService.getContacts().subscribe(
      (data: Contact[]) => this.contacts = data,
      (error) => console.error('Failed to load contacts', error)
    );
  }

  getInProgressTasks(): void {
    this.taskService.getTasks('inprogress').subscribe(inProgressTasks => {
      this.inProgress = inProgressTasks;  // Nur InProgress Tasks werden geladen
    });
  }

  drop(event: CdkDragDrop<Todo[] | InProgress[]>) {
    this.taskmanagerService.handleDrop(event);
  }

  toggleDelayed(progress: InProgress): void {
    progress.delayed = !progress.delayed;

    // Verwende den TaskService für die Statusaktualisierung
    this.taskService.updateTask(progress).subscribe(
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
        contacts: this.contacts,
        selectedContacts: []
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
          contacts: result.selectedContacts || [],
          status: 'inprogress'
        };

        console.log('Adding new InProgressTask:', newTask);
        this.taskService.addTask(newTask).subscribe(
          addedTask => {
            console.log('Added InProgressTask:', addedTask);
            this.inProgress.push(addedTask);
          },
          error => {
            console.error('Fehler beim Hinzufügen der InProgressTask:', error);
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
    this.taskService.deleteTask(id).subscribe(
      () => {
        this.inProgress = this.inProgress.filter(progress => progress.id !== id);
      },
      (error) => {
        console.error('Fehler beim Löschen der InProgressTask:', error);
      }
    );
  }

  loadContacts(): void {
    this.contactService.getContacts().subscribe(contacts => {
      this.allContacts = contacts;
    });
  }

  addContactsInProgress(progress: InProgress): void {
    const dialogRef = this.dialog.open(TaskDialogComponent, {
      width: '400px',
      data: {
        name: progress.text,
        description: progress.description,
        contacts: this.allContacts.length > 0 ? this.allContacts : [],
        selectedContacts: progress.contacts.length > 0 ? progress.contacts : []
      }
    });

    dialogRef.afterClosed().subscribe((result: TaskDialogData & { selectedContacts: Contact[] }) => {
      if (result) {
        progress.text = result.name;
        progress.description = result.description;
        progress.contacts = result.selectedContacts || [];

        this.taskService.updateTask(progress).subscribe(() => {
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

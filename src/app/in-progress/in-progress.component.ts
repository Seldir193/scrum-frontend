import { Component, OnInit,Input,SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContactService } from '../contact.service';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { TaskmanagerService } from '../taskmanager.service';
import { TaskService } from '../task.service';  
import { InProgress, Todo, Contact, TaskDialogData } from '../task.model';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { TaskDialogComponent } from '../task-dialog/task-dialog.component';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ContactDialogComponent } from '../contact-dialog/contact-dialog.component';
import { ContactDetailsDialogComponent } from '../contact-details-dialog/contact-details-dialog.component';
import { TaskDetailsDialogComponent } from '../task-details-dialog/task-details-dialog.component';

@Component({
  selector: 'app-in-progress',
  standalone: true,
  imports: [CommonModule,MatButtonModule, FormsModule,DragDropModule,MatTooltipModule,ContactDialogComponent],
  templateUrl: './in-progress.component.html',
  styleUrls: ['./in-progress.component.scss']
})
export class InProgressComponent implements OnInit {
  @Input() inProgressTasks: InProgress[] = [];
  @Input() filteredInProgressTasks: InProgress[] = [];
  @Input() searchTerm: string = '';

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
    private taskService: TaskService  
  ) {}

  ngOnInit(): void {
    this.getInProgressTasks();
    this.loadContacts();
    this.getContacts();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['searchTerm']) {
      this.filterTasks();
    }
  }

  filterTasks(): void {
    this.filteredInProgressTasks = this.inProgressTasks.filter(task =>
      task.text.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  private getContacts(): void {
    this.contactService.getContacts().subscribe(
      (data: Contact[]) => this.contacts = data,
      (error) => console.error('Failed to load contacts', error)
    );
  }

  getHiddenContacts(contacts: any[]): string {
    return contacts.slice(5).map(contact => contact.name).join(', ');
  }

  openContactDialog(contact: any): void {
    this.dialog.open(ContactDetailsDialogComponent, {
      data: contact
    });
  }

  getInProgressTasks(): void {
    this.taskService.getTasks('inprogress').subscribe(inProgressTasks => {
      this.inProgressTasks = inProgressTasks.map(task => ({
        ...task,
        dueDate: task.due_date
      }));
      this.filteredInProgressTasks = [...this.inProgressTasks];
    }, error => {
      console.error('Failed to load in-progress tasks:', error);
    });
  }
  
  drop(event: CdkDragDrop<Todo[] | InProgress[]>) {
    this.taskmanagerService.handleDrop(event);
  }

  toggleDelayed(progress: InProgress): void {
    progress.delayed = !progress.delayed;

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
        selectedContacts: [],
        priority: '',
        dueDate: null,
        category: 'Technical Tasks' 
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
          status: 'inprogress',
          priority: result.priority ,
          dueDate: result.dueDate,
          category: result.category,
        };

        console.log('Adding new InProgressTask:', newTask);
        this.taskService.addTask(newTask).subscribe(
          addedTask => {
            console.log('Added InProgressTask:', addedTask);
            this.inProgress.push(addedTask);
            this.getInProgressTasks();
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

  deleteInProgress(id: number, event?: MouseEvent): void {
    if (event) {
      event.stopPropagation();
    }
    this.taskService.deleteTask(id).subscribe(() => {
    this.inProgressTasks = this.inProgressTasks.filter(task => task.id !== id);
    this.inProgress = this.inProgress.filter(task => task.id !== id); 
    this.filteredInProgressTasks = [...this.inProgressTasks]; 
    }, error => {
      console.error('Error deleting in-progress task:', error);
    });
  }
  
  loadContacts(): void {
    this.contactService.getContacts().subscribe(contacts => {
      this.allContacts = contacts;
    });
  }

  addContactsInProgress(progress: InProgress, event: MouseEvent): void {
    event.stopPropagation(); 
    const dialogRef = this.dialog.open(TaskDialogComponent, {
      width: '400px',
      data: {
        name: progress.text,
        description: progress.description,
        contacts: this.allContacts.length > 0 ? this.allContacts : [],
        selectedContacts: progress.contacts.length > 0 ? progress.contacts : [],
        priority: progress.priority,
        dueDate: progress.dueDate,
        category: progress.category 
      }
    });

    dialogRef.afterClosed().subscribe((result: TaskDialogData & { selectedContacts: Contact[],priority: string,dueDate: Date | null ,category:string }) => {
      if (result) {
        progress.text = result.name;
        progress.description = result.description;
        progress.contacts = result.selectedContacts || [];
        progress.priority = result.priority;
        progress.dueDate = result.dueDate;
        progress.category = result.category;
        
        const formattedDueDate = progress.dueDate ? new Date(progress.dueDate).toISOString().split('T')[0] : null;
        const updatedTask = { ...progress, due_date: formattedDueDate, status: 'inprogress' }; 
  
        this.taskService.updateTask(updatedTask).subscribe(() => {
          console.log('Updated task with new contacts');

          const index = this.inProgress.findIndex(t => t.id === progress.id);
          if (index !== -1) {
            this.inProgress[index] = { ...progress, dueDate: result.dueDate };
          }

          this.selectedTodo = progress;
        });
      }
    });
  }

  openTaskDetailsDialog(progress: InProgress): void {
    const dialogRef = this.dialog.open(TaskDetailsDialogComponent, {
      width: '500px',
      data: progress
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result?.deleted) {
        this.inProgressTasks = this.inProgressTasks.filter(t => t.id !== progress.id);
        this.filteredInProgressTasks = [...this.inProgressTasks];
      } else if (result?.updated) {
        this.getInProgressTasks();
      }
    });
  }
}

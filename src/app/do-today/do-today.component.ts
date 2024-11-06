import { Component, OnInit ,Input,SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContactService } from '../contact.service';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { TaskmanagerService } from '../taskmanager.service';
import { TaskService } from '../task.service';  
import { TodayTask, Todo, Contact, TaskDialogData } from '../task.model';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { TaskDialogComponent } from '../task-dialog/task-dialog.component';
import { MatButtonModule } from '@angular/material/button';
import { ContactDetailsDialogComponent } from '../contact-details-dialog/contact-details-dialog.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TaskDetailsDialogComponent } from '../task-details-dialog/task-details-dialog.component';

@Component({
  selector: 'app-do-today',
  standalone: true,
  imports: [CommonModule,MatButtonModule, FormsModule,DragDropModule,MatTooltipModule],
  templateUrl: './do-today.component.html',
  styleUrls: ['./do-today.component.scss']
})
export class DoTodayComponent implements OnInit {
  @Input() doTodayTasks: TodayTask[] = [];
  @Input() filteredDoTodayTasks: TodayTask[] = [];
  @Input() searchTerm: string = '';

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
    private taskService: TaskService  
  ) {}

  ngOnInit(): void {
    this.getTodayTasks();
    this.loadContacts();
    this.getContacts();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['searchTerm']) {
      this.filterTasks();
    }
  }
  
  filterTasks(): void {
    this.filteredDoTodayTasks = this.todayTasks.filter(task =>
      task.text.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
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
        dueDate: task.due_date 
      }));
      this.filteredDoTodayTasks = [...this.todayTasks];
      
    }, error => {
      console.error('Failed to load today tasks:', error);
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
        dueDate: null,
        category: 'Technical Tasks' 
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
          dueDate: result.dueDate,
          category: result.category,
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

  deleteDoTodayTask(id: number,event?: MouseEvent ): void {
    if (event) {
      event.stopPropagation();
    }
    this.taskService.deleteTask(id).subscribe(() => {
      this.todayTasks = this.todayTasks.filter(task => task.id !== id);
      this.filteredDoTodayTasks = [...this.todayTasks];
    }, error => {
      console.error('Fehler beim Löschen der TodayTask:', error);
    });
  }

  loadContacts(): void {
    this.contactService.getContacts().subscribe(contacts => {
      this.allContacts = contacts;
    });
  }

  addContactsToTask(task: TodayTask,event: MouseEvent): void {
    event.stopPropagation();
    const dialogRef = this.dialog.open(TaskDialogComponent, {
      width: '400px',
      data: {
        name: task.text,
        description: task.description,
        contacts: this.allContacts.length > 0 ? this.allContacts : [],
        selectedContacts: task.contacts.length > 0 ? task.contacts : [],
        priority: task.priority,
        dueDate: task.dueDate, 
        category: task.category 
      }
    });
  
    dialogRef.afterClosed().subscribe((result: TaskDialogData & { selectedContacts: Contact[], priority: string, dueDate: Date | null,category:string }) => {
      if (result) {
        task.text = result.name;
        task.description = result.description;
        task.contacts = result.selectedContacts || [];
        task.priority = result.priority;
        task.dueDate = result.dueDate; 
        task.category = result.category
  
        const formattedDueDate = task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : null;
        const updatedTask = { ...task, due_date: formattedDueDate }; 
  
        this.taskService.updateTask(updatedTask).subscribe(() => {
          console.log('Updated task with new contacts and due date');

         const index = this.todayTasks.findIndex(t => t.id === task.id);
         if (index !== -1) {
           this.todayTasks[index] = { ...task, dueDate: formattedDueDate }; 
         }
          this.selectedTodo = task;
        });
      }
    });
  }

  openTaskDetailsDialog(task: TodayTask): void {
    const dialogRef = this.dialog.open(TaskDetailsDialogComponent, {
      width: '500px',
      data: task
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result?.deleted) {
        this.todayTasks = this.todayTasks.filter(t => t.id !== task.id);
        this.filteredDoTodayTasks = [...this.todayTasks]; 
      } else if (result?.updated) {
        this.getTodayTasks();
      }
    });
  }
}

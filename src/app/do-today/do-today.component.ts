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
import { CdkDragDrop, moveItemInArray,transferArrayItem } from '@angular/cdk/drag-drop';
import { DragDropModule } from '@angular/cdk/drag-drop';


@Component({
  selector: 'app-do-today',
  standalone: true,
  imports: [CommonModule, FormsModule,TodoComponent,DragDropModule],
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
  selectedTodo: Todo | null = null; // Hinzufügen von 'selectedTodo'
  

  constructor(
    private todoService: TodoService,
    private contactService: ContactService ,
    private dialog: MatDialog,
    private todayTaskService: TodayTaskService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getTodayTasks();
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

  getTodayTasks(): void {
    this.todayTaskService.getTodayTasks().subscribe(tasks => {
      this.todayTasks = tasks; // Nur Aufgaben für Do Today laden
    });
  }


  onDrop(event: CdkDragDrop<Todo[] | TodayTask[]>) {
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

    const movedTask = event.container.data[event.currentIndex];
    let newStatus: string;
    let updateService: any;

    switch (event.container.id) {
      case 'todayContainer':
        newStatus = 'todaytasks';
        updateService = this.todayTaskService;
        break;
      case 'todoContainer':
        newStatus = 'todos';
        updateService = this.todoService;
        break;
      default:
        newStatus = '';
        console.warn('Unbekannter Container-ID:', event.container.id);
        break;
    }

    if (newStatus && updateService) {
      movedTask.status = newStatus;

      // Call the appropriate service based on the status
      updateService.updateTodayTaskStatus(movedTask).subscribe(
        () => console.log('Task updated successfully'),
        (error: any) => console.error('Error updating task', error)
      );
    } else {
      console.error('Kein gültiger Status oder Service gefunden.');
    }
  }


  toggleDelayed(task: TodayTask): void {
    task.delayed = !task.delayed;
    
    // Verwende den todayTaskService, um die Änderungen im Backend zu speichern
    this.todayTaskService.updateTodayTask(task).subscribe(
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
        contacts: this.contacts, // Alle verfügbaren Kontakte
        selectedContacts: [] // Initial keine ausgewählten Kontakte
      }
    });
  
    dialogRef.afterClosed().subscribe((result: TaskDialogData & { selectedContacts: Contact[] }) => {
      if (result) {
        const newTask: TodayTask = {
          id: 0,
          text: result.name,
          delayed: false,
          user: this.getUserId(),
          description: result.description,
          contacts: result.selectedContacts || [] // Übergeben der ausgewählten Kontakte
        };
  
        console.log('Adding new TodayTask:', newTask);
        this.todayTaskService.addTodayTask(newTask).subscribe(
          addedTask => {
            console.log('Added TodayTask:', addedTask);
            this.todayTasks.push(addedTask);
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
    this.todayTaskService.deleteTodayTask(id).subscribe(
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
      this.allContacts = contacts; // Kontakte zur Auswahl bereitstellen
    });
  }

  addContactsToTask(task: Todo): void {
    const dialogRef = this.dialog.open(TaskDialogComponent, {
      width: '400px',
      data: {
        name: task.text,
        description: task.description,
        contacts: this.allContacts, // Alle verfügbaren Kontakte
        selectedContacts: task.contacts // Bereits zugewiesene Kontakte
      }
    });
  
    dialogRef.afterClosed().subscribe((result: TaskDialogData & { selectedContacts: Contact[] }) => {
      if (result) {
        task.text = result.name;
        task.description = result.description;
        task.contacts = result.selectedContacts || [];
        
        this.todayTaskService.updateTodayTask(task).subscribe(() => {
          console.log('Updated task with new contacts');
  
          const index = this.todayTasks.findIndex(t => t.id === task.id);
          if (index !== -1) {
            this.todayTasks[index] = task;
          }
  
          this.selectedTodo = task;
        });
      }
    });
  }
}

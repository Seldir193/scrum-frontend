import { Injectable } from '@angular/core';
import { CdkDragDrop,moveItemInArray, transferArrayItem  } from '@angular/cdk/drag-drop';
import { TodoService } from './todo.service';
import { TodayTaskService } from './today-task.service';
import { InProgressService } from './in-progress.service';
import { DoneService } from './done.service';
import { Todo } from './todo.service';
import { TodayTask } from './today-task.service';
import { InProgress } from './in-progress.service';
import { Done } from './done.service';

@Injectable({
  providedIn: 'root'
})
export class TaskmanagerService {
  todayTasks: TodayTask[] = [];
  todoTasks: Todo[] = [];
  inProgressTasks: InProgress[] = [];
  doneTasks: Done[] = [];

  constructor(
    private todoService: TodoService,
    private todayTaskService: TodayTaskService,
    private inProgressService: InProgressService,
    private doneService: DoneService
  ) {}

  
  handleDrop(event: CdkDragDrop<Todo[] | TodayTask[] | InProgress[] | Done[]>) {
    //const movedTask = event.item.data;
    const movedTask = event.previousContainer.data[event.previousIndex];
    const newStatus = this.getStatusFromContainer(event.container.id);
    const updateService = this.getUpdateService(event.container.id);
    const deleteService = this.getDeleteService(event.previousContainer.id);

    console.log('Moved Task:', movedTask);
  console.log('New Status:', newStatus);
  console.log('Update Service:', updateService);
  console.log('Delete Service:', deleteService);
  
    if (!newStatus || !updateService || !deleteService) {
      console.warn('Ungültiger Container:', event.container.id, event.previousContainer.id);
      return;
    }
  
    // Entferne den Task aus der alten Liste

    console.log('Moved Task:', movedTask);
  console.log('New Status:', newStatus);


    if (event.previousContainer === event.container) {
      // Wenn der Task innerhalb der gleichen Liste verschoben wird
      moveItemInArray(event.previousContainer.data, event.previousIndex, event.currentIndex);
    } else {
      // Wenn der Task in eine andere Liste verschoben wird
      // Entferne den Task aus der vorherigen Liste
      event.previousContainer.data.splice(event.previousIndex, 1);
      // Füge den Task zur neuen Liste hinzu
      transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
    }

  
    // Füge den Task zur neuen Liste hinzu
    this.addTaskToNewList(newStatus, movedTask);
  
    // Setze den neuen Status für die Aufgabe
    movedTask.status = newStatus;
    
    // Debugging: Zeige Details der Aufgabe vor dem Hinzufügen an
  console.log('Task before adding to new list:', movedTask);
  
    if (!movedTask.id) {
      console.error('Task ID is missing:', movedTask);
      return;
    }
  
    // Lösche die Aufgabe aus dem alten Status und aktualisiere den neuen Status
    deleteService(movedTask.id).subscribe(
      () => {
        updateService(movedTask).subscribe(
          () => console.log('Task updated successfully'),
          (error: any) => console.error('Error updating task', error)
        );
      },
      (error: any) => console.error('Error deleting task', error)
    );
  }
  
  getStatusFromContainer(containerId: string): string | null {
    switch (containerId) {
      case 'todayContainer': return 'todaytasks';
      case 'todoContainer': return 'todos';
      case 'inProgressContainer': return 'inProgress';
      case 'doneContainer': return 'done';
      default: return null;
    }
  }
  
  getUpdateService(containerId: string): any | null {
    switch (containerId) {
      case 'todayContainer': return this.todayTaskService.updateTodayTaskStatus.bind(this.todayTaskService);
      case 'todoContainer': return this.todoService.updateTodoStatus.bind(this.todoService);
      case 'inProgressContainer': return this.inProgressService.updateInProgressStatus.bind(this.inProgressService);
      case 'doneContainer': return this.doneService.updateDoneStatus.bind(this.doneService);
      default: return null;
    }
  }
  
  getDeleteService(containerId: string): any | null {
    switch (containerId) {
      case 'todayContainer': return this.todayTaskService.deleteTodayTask.bind(this.todayTaskService);
      case 'todoContainer': return this.todoService.deleteTodo.bind(this.todoService);
      case 'inProgressContainer': return this.inProgressService.deleteInProgress.bind(this.inProgressService);
      case 'doneContainer': return this.doneService.deleteDone.bind(this.doneService);
      default: return null;
    }
  }

  addTaskToNewList(newStatus: string, movedTask: any) {
    switch (newStatus) {
      case 'todaytasks':
        this.todayTasks.push(movedTask);
        break;
      case 'todos':
        this.todoTasks.push(movedTask);
        break;
      case 'inProgress':
        this.inProgressTasks.push(movedTask);
        break;
      case 'done':
        this.doneTasks.push(movedTask);
        break;
      default:
        console.warn('Unbekannter Status:', newStatus);
    }
  }
}
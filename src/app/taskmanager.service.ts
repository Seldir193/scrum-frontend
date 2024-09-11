
import { Injectable } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { TaskService } from './task.service';  // Import TaskService
import { Todo, TodayTask, InProgress, Done } from './task.model';

@Injectable({
  providedIn: 'root'
})
export class TaskmanagerService {

  constructor(
    private taskService: TaskService  // Verwende den TaskService
  ) {}

  handleDrop(event: CdkDragDrop<Todo[] | TodayTask[] | InProgress[] | Done[]>) {
    const movedTask = event.previousContainer.data[event.previousIndex];
    const newStatus = this.getStatusFromContainer(event.container.id);
  
    if (!newStatus) {
      console.warn('Ungültiger Container:', event.container.id, event.previousContainer.id);
      return;
    }
  
    // Entferne den Task aus der alten Liste
    if (event.previousContainer === event.container) {
      // Task innerhalb der gleichen Liste verschieben
      moveItemInArray(event.previousContainer.data, event.previousIndex, event.currentIndex);
    } else {
      // Task in eine andere Liste verschieben
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }
  
    // Aktualisiere den Status des Tasks
    movedTask.status = newStatus;
  
    // Aktualisiere den Task im Backend (kein Löschen notwendig)
    this.taskService.updateTask(movedTask).subscribe(
      () => console.log('Task erfolgreich aktualisiert'),
      (error: any) => this.handleError('Fehler beim Aktualisieren des Tasks in der neuen Liste', error)
    );
  }
  
  getStatusFromContainer(containerId: string): 'todos' | 'todaytasks' | 'inprogress' | 'done' | null {
    switch (containerId) {
      case 'todayContainer': return 'todaytasks';
      case 'todoContainer': return 'todos';
      case 'inProgressContainer': return 'inprogress';
      case 'doneContainer': return 'done';
      default: return null;  // Falls nichts gefunden wird, gebe null zurück
    }
  }
  
  private handleError(message: string, error: any) {
    console.error(message, error);
  }
}




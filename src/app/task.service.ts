import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Todo, TodayTask, InProgress, Done } from './task.model';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private apiUrl = 'http://localhost:8000/api/tasks/'; // Einheitlicher Endpunkt für alle Tasks

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

 
 // Methode zum Holen aller Tasks basierend auf dem Status (z.B. 'todos', 'todaytasks', 'inprogress', 'done')
 getTasks(status: 'todos' | 'todaytasks' | 'inprogress' | 'done'): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}?status=${status}`, { headers: this.getAuthHeaders() });
}
  // Methode zum Hinzufügen eines neuen Tasks mit dem Status
  addTask(task: Todo | TodayTask | InProgress | Done): Observable<any> {
    return this.http.post<any>(this.apiUrl, task, { headers: this.getAuthHeaders() });
  }

  // Methode zum Aktualisieren eines Tasks, inklusive seines Status
  updateTask(task: Todo | TodayTask | InProgress | Done): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}${task.id}/`, task, { headers: this.getAuthHeaders() });
  }

  // Methode zum Löschen eines Tasks
  deleteTask(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}${id}/`, { headers: this.getAuthHeaders() });
  }

  logout(): Observable<void> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.post<void>('http://localhost:8000/logout/', {}, { headers: headers });
  }
}

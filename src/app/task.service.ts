import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Todo, TodayTask, InProgress, Done } from './task.model';
import { format } from 'date-fns';


@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private apiUrl = 'http://localhost:8000/api/tasks/'; // Einheitlicher Endpunkt für alle Tasks
  private summaryUrl = 'http://localhost:8000/api/task_summary/';
  private userInfoUrl = 'http://localhost:8000/api/user_info/';


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

addTask(task: Todo | TodayTask | InProgress | Done): Observable<any> {
  // Formatierung des dueDate sicherstellen
  const formattedDueDate = task.dueDate ? format(new Date(task.dueDate), 'yyyy-MM-dd') : null;
  const newTask = { ...task, due_date: formattedDueDate };

  return this.http.post<any>(this.apiUrl, newTask, { headers: this.getAuthHeaders() });
}

updateTask(task: Todo | TodayTask | InProgress | Done): Observable<void> {
  // Formatierung des dueDate sicherstellen
  const formattedDueDate = task.dueDate ? format(new Date(task.dueDate), 'yyyy-MM-dd') : null;
  const updatedTask = { ...task, due_date: formattedDueDate };

  return this.http.patch<void>(`${this.apiUrl}${task.id}/`, updatedTask, { headers: this.getAuthHeaders() });
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
    return this.http.post<void>('http://localhost:8000/api/logout/', {}, { headers: headers });
  }

  getTaskSummary(): Observable<any> {
    return this.http.get<any>(this.summaryUrl, { headers: this.getAuthHeaders() });  // Authentifizierter Request
  }

  getUserInfo(): Observable<any> {
    return this.http.get<any>(this.userInfoUrl, { headers: this.getAuthHeaders() });
  }
}

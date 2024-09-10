import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { Contact } from './contact.model';


import { Todo } from './todo.service';


export interface TodayTask  {
  id: number;
  text: string;
  delayed: boolean;
  user: number;
  description?: string;
  contacts: Contact[];
 
  status?: string;
}


@Injectable({
  providedIn: 'root'
})
export class TodayTaskService {
  private apiUrl = 'http://localhost:8000/api/todaytasks/';
  private contactsUrl = 'http://localhost:8000/api/contacts/';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  getTodayTasks(): Observable<TodayTask[]> {
    return this.http.get<TodayTask[]>(this.apiUrl, { headers: this.getAuthHeaders() })
      .pipe(
        catchError(error => {
          console.error('Fehler beim Abrufen der TodayTasks:', error);
          return of([]); // Rückgabe eines leeren Arrays im Fehlerfall
        })
      );
  }

  addTodayTask(task: TodayTask): Observable<TodayTask> {
    return this.http.post<TodayTask>(this.apiUrl, task, { headers: this.getAuthHeaders() });
  }

  deleteTodayTask(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}${id}/`, { headers: this.getAuthHeaders() });
  }

  updateTodayTask(task: TodayTask): Observable<void> {
    const updateData = { 
      text: task.text,
      delayed: task.delayed,
      description: task.description,
      user: task.user,
      contacts: task.contacts.map(contact => contact.id),
      status: task.status
    };
  


    return this.http.patch<void>(`${this.apiUrl}${task.id}/`,updateData , { headers: this.getAuthHeaders() })
      .pipe(
        catchError(error => {
          console.error('Fehler beim Aktualisieren der TodayTask:', error);
          return of(); // Fehlerbehandlung oder Rückgabe eines leeren Observables im Fehlerfall
        })
      );
  }

  getContacts(): Observable<Contact[]> {
    return this.http.get<Contact[]>(this.contactsUrl, { headers: this.getAuthHeaders() });
  }


  updateTodayTaskStatus(todayTask: TodayTask): Observable<void> {
    const updateData = { status: todayTask.status };
  
    return this.http.patch<void>(`${this.apiUrl}${todayTask.id}/`, updateData, { headers: this.getAuthHeaders() })
      .pipe(
        catchError(error => {
          console.error('Fehler beim Aktualisieren der TodayTask:', error);
          return of(); // Fehlerbehandlung oder Rückgabe eines leeren Observables im Fehlerfall
        })
      );
  }






}
  


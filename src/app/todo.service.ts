import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { Contact } from './contact.model';
export interface Todo  {
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
export class TodoService {
  private apiUrl = 'http://localhost:8000/api/todos/';
  private contactsUrl = 'http://localhost:8000/api/contacts/';
  newTodo: string = '';
  
  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  getTodos(): Observable<Todo[]> {
    return this.http.get<Todo[]>(this.apiUrl, { headers: this.getAuthHeaders() })
      .pipe(
        catchError(error => {
          console.error('Fehler beim Abrufen der Todos:', error);
          return of([]); // Rückgabe eines leeren Arrays im Fehlerfall
        })
      );
    }

 

    addTodo(todo: Todo): Observable<Todo> {
      return this.http.post<Todo>(this.apiUrl, todo, { headers: this.getAuthHeaders() });
    }

 

 
    updateTodo(todo: Todo): Observable<void> {
      return this.http.patch<void>(`${this.apiUrl}${todo.id}/`, todo, { headers: this.getAuthHeaders() });
    }
  

  logout(): Observable<void> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.post<void>('http://localhost:8000/logout/', {}, { headers: headers });
  }

  getContacts(): Observable<Contact[]> {
    return this.http.get<Contact[]>(this.contactsUrl, { headers: this.getAuthHeaders() });
  }


  deleteTodo(id: number): Observable<void> {
    const url = `${this.apiUrl}${id}/`;  // Prüfe, ob der Schrägstrich am Ende nötig ist
    return this.http.delete<void>(url, { headers: this.getAuthHeaders() })
   
      .pipe(
        catchError(error => {
          console.error('Error deleting task', error);
          return of();
        })
      );
  }


  

  updateTodoStatus(todo: Todo): Observable<void> {
    const updateData = { status: todo.status  };  // Nur das Status-Feld senden
    return this.http.patch<void>(`${this.apiUrl}${todo.id}/`, updateData, { headers: this.getAuthHeaders() })
      .pipe(
        catchError(error => {
          console.error('Fehler beim Aktualisieren des Todos:', error);
          return of();  // Fehlerbehandlung oder Rückgabe eines leeren Observables im Fehlerfall
        })
      );
  }



}







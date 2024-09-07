
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { Contact } from './contact.model';

export interface Done {
  id: number;
  text: string;
  delayed: boolean;
  user: number;
  description?: string;
  contacts: Contact[];
  
}

@Injectable({
  providedIn: 'root'
})
export class  DoneService {
  private apiUrl = 'http://localhost:8000/api/done/';
  private contactsUrl = 'http://localhost:8000/api/contacts/';


  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  getDone(): Observable<Done[]> {
    return this.http.get<Done[]>(this.apiUrl, { headers: this.getAuthHeaders() })
      .pipe(
        catchError(error => {
          console.error('Fehler beim Abrufen der TodayTasks:', error);
          return of([]); // Rückgabe eines leeren Arrays im Fehlerfall
        })
      );
  }

  addDone(done: Done): Observable<Done> {
    return this.http.post<Done>(this.apiUrl, done, { headers: this.getAuthHeaders() });
  }

  deleteDone(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}${id}/`, { headers: this.getAuthHeaders() });
  }

  updateDone(done: Done): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}${done.id}/`, done, { headers: this.getAuthHeaders() })
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
}

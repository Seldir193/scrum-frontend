
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { Contact } from './contact.model';

export interface InProgress {
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
export class InProgressService {
  private apiUrl = 'http://localhost:8000/api/inprogress/';
  private contactsUrl = 'http://localhost:8000/api/contacts/';


  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  getInProgress(): Observable<InProgress[]> {
    return this.http.get<InProgress[]>(this.apiUrl, { headers: this.getAuthHeaders() })
      .pipe(
        catchError(error => {
          console.error('Fehler beim Abrufen der TodayTasks:', error);
          return of([]); // Rückgabe eines leeren Arrays im Fehlerfall
        })
      );
  }

  addInProgress(progress: InProgress): Observable<InProgress> {
    return this.http.post<InProgress>(this.apiUrl, progress, { headers: this.getAuthHeaders() });
  }

  deleteInProgress(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}${id}/`, { headers: this.getAuthHeaders() });
  }

  updateInProgress(progress: InProgress): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}${progress.id}/`, progress, { headers: this.getAuthHeaders() })
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

  updateInProgressStatus(inProgress: InProgress): Observable<void> {
    const updateData = { status: inProgress.status };  // Nur das Status-Feld senden
    return this.http.patch<void>(`${this.apiUrl}${inProgress.id}/`, updateData, { headers: this.getAuthHeaders() })
      .pipe(
        catchError(error => {
          console.error('Fehler beim Aktualisieren des InProgress:', error);
          return of(); // Fehlerbehandlung oder Rückgabe eines leeren Observables im Fehlerfall
        })
      );
  }
}
  


import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable ,throwError,tap } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { Contact } from './task.model';



@Injectable({
  providedIn: 'root'
})
export class ContactService {
  
  private apiUrl = 'http://localhost:8000/api/contacts/';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  getContacts(): Observable<Contact[]> {
    return this.http.get<Contact[]>(this.apiUrl, { headers: this.getAuthHeaders() })
      .pipe(
        catchError(error => {
          console.error('Fehler beim Abrufen der Kontakte:', error);
          return of([]); // Rückgabe eines leeren Arrays im Fehlerfall
        })
      );
  }

  addContact(contact: Contact): Observable<Contact> {
    return this.http.post<Contact>(this.apiUrl, contact, { headers: this.getAuthHeaders() });
  }


  updateContact(contact: Contact): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}${contact.id}/`, contact, { headers: this.getAuthHeaders() });
  }

  deleteContact(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}${id}/`, { headers: this.getAuthHeaders() });
  }
}
 
  



import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

interface Todo {
  id: number;
  text: string;
  delayed: boolean;
}

@Component({
  selector: 'app-todo',
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule],
  templateUrl: './todo.component.html',
  styleUrls: ['./todo.component.scss']
})
export class TodoComponent implements OnInit {
  todos: Todo[] = [];
  newTodo: string = '';

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.checkAuthentication();

    // Überprüfen, ob der Benutzer beim Zurücknavigieren auf einer geschützten Seite ist
    window.onpopstate = () => {
      this.checkAuthentication();
    };
  }

  private checkAuthentication() {
    const token = this.getToken();
    if (!token || this.isTokenExpired(token)) {
      this.router.navigate(['/login']);
    } else {
      this.getTodos();
    }
  }

  private isTokenExpired(token: string): boolean {
    const payload = this.decodeToken(token);
    const expirationDate = new Date(payload.exp * 1000);
    return new Date() > expirationDate;
  }

  private decodeToken(token: string): any {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  }

  private getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  private getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  getTodos() {
    this.http.get<Todo[]>('http://localhost:8000/api/todos', { headers: this.getAuthHeaders() })
      .subscribe(data => this.todos = data);
  }


  addTodo() {
    const todo: Todo = { id: 0, text: this.newTodo, delayed: false };
    this.http.post<Todo>('http://localhost:8000/api/todos', todo, { headers: this.getAuthHeaders() })
      .subscribe(newTodo => {
        this.todos.push(newTodo);
        this.newTodo = '';
      });
  }

  updateTodo(todo: Todo) {
    this.http.patch(`http://localhost:8000/api/todos/${todo.id}`, todo, { headers: this.getAuthHeaders() })
      .subscribe();
  }

  deleteTodo(id: number) {
    this.http.delete(`http://localhost:8000/api/todos/${id}`, { headers: this.getAuthHeaders() })
      .subscribe(() => {
        this.todos = this.todos.filter(t => t.id !== id);
      });
  }

  toggleDelayed(todo: Todo) {
    todo.delayed = !todo.delayed;
    this.updateTodo(todo);
  }

  drop(event: CdkDragDrop<Todo[]>) {
    moveItemInArray(this.todos, event.previousIndex, event.currentIndex);
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }

  

  logout() {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.getToken()}`
    });
  
    console.log("Sending logout request with headers:", headers);
  
    this.http.post('http://localhost:8000/logout/', {}, { headers: headers })
      .subscribe(
        () => {
          console.log("Logout successful, removing tokens and redirecting to login.");
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          this.router.navigate(['/login']);
        },
        (error) => {
          console.error("Logout failed:", error);
        }
      );
  }

}
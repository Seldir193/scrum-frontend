import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

import { DragDropModule , moveItemInArray } from '@angular/cdk/drag-drop';


interface Todo {
  id: number;
  text: string;
  delayed: boolean;
}


@Component({
  selector: 'app-todo',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './todo.component.html',
  styleUrl: './todo.component.scss'
})
export class TodoComponent implements OnInit {
  todos: Todo[] = [];
  newTodo: string = '';
  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
      this.getTodos();
  }

  getTodos(){
    this.http.get<Todo[]>('https://localhost:4200/api/todos').subscribe(data => {
      this.todos = data;
    });
  }

  addTodo (){
    const todo: Todo = { id: 0, text: this.newTodo, delayed: false };
    this.http.post<Todo>('https://localhost:4200/api/todos', todo).subscribe(newTodo => {
      this.todos.push(newTodo);
      this.newTodo = '';
  });
  }

  updateTodo(todo: Todo) {
    this.http.patch(`https://localhost:4200/api/todos/${todo.id}`, todo).subscribe();
  }

  deleteTodo(id: number) {
    this.http.delete(`https://localhost:4200/api/todos/${id}`).subscribe(() => {
      this.todos = this.todos.filter(t => t.id !== id);
    });
  }

  toggleDelayed(todo: Todo) {
    todo.delayed = !todo.delayed;
    this.updateTodo(todo);
  }

  drop(event:  DragDropModule<Todo[]>) {
    moveItemInArray(this.todos,event.previousIndex, event.currentIndex);
  }


  navigateToLogin() {
    this.router.navigate(['/login']); // Navigiert zur Login-Seite
  }


}

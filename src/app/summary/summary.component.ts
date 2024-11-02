// summary.component.ts
import { Component, OnInit } from '@angular/core';
import { TaskService } from '../task.service';
import { HeaderComponent } from '../header/header.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';


@Component({
  selector: 'app-summary',
  standalone: true,
  imports: [HeaderComponent,CommonModule,FormsModule],
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.scss'],
  providers: [DatePipe]
})
export class SummaryComponent implements OnInit {
  lastTaskDate: string = '';
  totalTasks: number = 0;
  statusCounts: any = {};
  greetingMessage: string = '';

  constructor(private taskService: TaskService,private datePipe: DatePipe) {}

  ngOnInit(): void {
    this.taskService.getUserInfo().subscribe(data => {
      const username = data.username || 'Guest';
      this.setGreetingMessage(username);
    });

    this.taskService.getTaskSummary().subscribe(data => {
      this.lastTaskDate = this.datePipe.transform(data.last_task_date, 'MMMM dd, yyyy') || 'No tasks yet';
     // this.lastTaskDate = data.last_task_date;
      this.totalTasks = data.total_tasks;
      this.statusCounts = data.status_counts;
    });
  }

  setGreetingMessage(username: string): void {
    const hours = new Date().getHours();

    if (hours < 12) {
      this.greetingMessage = `Good morning, ${username}`;
    } else if (hours < 18) {
      this.greetingMessage = `Good afternoon, ${username}`;
    } else {
      this.greetingMessage = `Good evening, ${username}`;
    }
}
}

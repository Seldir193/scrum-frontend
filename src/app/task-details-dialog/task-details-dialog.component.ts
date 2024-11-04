import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule, MatDialog } from '@angular/material/dialog';
import { Todo } from '../task.model';
import { TaskService } from '../task.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon'; // Importieren
import { FormsModule } from '@angular/forms';
import { TaskDialogComponent } from '../task-dialog/task-dialog.component';

@Component({
  selector: 'app-task-details-dialog',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, FormsModule, MatDialogModule],
  templateUrl: './task-details-dialog.component.html',
  styleUrls: ['./task-details-dialog.component.scss']
})
export class TaskDetailsDialogComponent {
  isEditMode = false;

  constructor(
    public dialogRef: MatDialogRef<TaskDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public task: Todo,
    private taskService: TaskService,
    private dialog: MatDialog
  ) {}
  // Methode zum Speichern der Änderungen
  saveChanges() {
    this.taskService.updateTask(this.task).subscribe(() => {
      this.isEditMode = false;
      this.dialogRef.close(this.task);
    });
  }
  // Methode zum Abrufen der Kontaktnamen als String
  getContactNames(): string {
    return this.task.contacts ? this.task.contacts.map(contact => contact.name).join(', ') : '';
  }

  deleteTask(): void {
    this.taskService.deleteTask(this.task.id).subscribe(
      () => {
        console.log('Task deleted successfully');
        // Dialog schließen und eine Information über das Löschen zurückgeben
        this.dialogRef.close({ deleted: true });
      },
      error => {
        console.error('Failed to delete the task:', error);
      }
    );
  }
  
  // Methode zum Bearbeiten des Tasks
  editTask(): void {
    // Schließt den aktuellen Dialog, bevor der Bearbeitungs-Dialog geöffnet wird
    this.dialogRef.close();

    // Öffnet das Bearbeitungsdialogfeld
    const dialogRef = this.dialog.open(TaskDialogComponent, {
      width: '400px',
      data: {
        ...this.task // Bestehende Task-Daten an den Editier-Dialog übergeben
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Aktualisiere den Task mit den neuen Daten
        this.task.text = result.name;
        this.task.description = result.description;
        this.task.priority = result.priority;
        this.task.dueDate = result.dueDate;
        this.task.contacts = result.selectedContacts;

        const updatedTask = {
          ...this.task,
          due_date: this.task.dueDate ? new Date(this.task.dueDate).toISOString().split('T')[0] : null
        };

        this.taskService.updateTask(updatedTask).subscribe(() => {
          console.log('Task updated successfully');
        }, error => {
          console.error('Failed to update the task:', error);
        });
      }
    });
  }
}

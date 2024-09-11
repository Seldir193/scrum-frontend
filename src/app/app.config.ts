import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';
import { routes } from './app.routes';
import { AuthInterceptor } from './auth.interceptor';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { TaskDialogComponent } from './task-dialog/task-dialog.component'; 
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { ContactDialogComponent } from './contact-dialog/contact-dialog.component';
import { HeaderComponent } from './header/header.component';
import { ReactiveFormsModule } from '@angular/forms';
import { DoTodayComponent } from './do-today/do-today.component';
import { InProgressComponent } from './in-progress/in-progress.component';
import { DoneComponent } from './done/done.component';
import { TaskmanagerService } from './taskmanager.service';
import { TaskService } from './task.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }, provideAnimationsAsync(),
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatDialogModule,
    TaskDialogComponent,
    MatDatepickerModule,
    MatNativeDateModule,
    ContactDialogComponent,
    HeaderComponent,
    ReactiveFormsModule,
    DoTodayComponent,
    InProgressComponent,
    DoneComponent,
    TaskmanagerService,
    TaskService
  ]
};

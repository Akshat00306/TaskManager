import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth.service';
import { TaskService } from '../../../core/services/task.service';
import {
  TaskFilters,
  TaskItem,
  TaskPriority,
  TaskStatus,
  TaskUpsertRequest,
  UserDto
} from '../../../core/models/models';
import { TaskFormComponent } from '../task-form/task-form.component';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  templateUrl: './task-list.component.html',
  styleUrl: './task-list.component.scss'
})
export class TaskListComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly taskService = inject(TaskService);
  private readonly auth = inject(AuthService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  readonly loading = signal(true);
  readonly tasks = signal<TaskItem[]>([]);
  readonly users = signal<UserDto[]>([]);
  readonly isAdmin = this.auth.isAdmin;

  readonly priorities: TaskPriority[] = ['Low', 'Medium', 'High'];
  readonly statuses: TaskStatus[] = ['Todo', 'InProgress', 'Completed'];
  readonly sortOptions = [
    { value: 'newest', label: 'Newest' },
    { value: 'oldest', label: 'Oldest' },
    { value: 'due_date', label: 'Due date' },
    { value: 'priority', label: 'Priority' }
  ];

  readonly filters = this.fb.nonNullable.group({
    search: [''],
    status: ['' as TaskStatus | ''],
    priority: ['' as TaskPriority | ''],
    sortBy: ['newest'],
    showOverdue: [false]
  });

  ngOnInit(): void {
    this.loadTasks();

    if (this.isAdmin()) {
      this.auth.listUsers().subscribe({
        next: (users) => this.users.set(users)
      });
    }

    this.filters.valueChanges
      .pipe(debounceTime(250), distinctUntilChanged())
      .subscribe(() => this.loadTasks());
  }

  loadTasks(): void {
    this.loading.set(true);
    const raw = this.filters.getRawValue();
    const query: TaskFilters = {
      search: raw.search.trim() || undefined,
      status: raw.status || undefined,
      priority: raw.priority || undefined,
      sortBy: raw.sortBy,
      showOverdue: raw.showOverdue || undefined
    };

    this.taskService.getTasks(query).subscribe({
      next: (items) => {
        this.tasks.set(items);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.snackBar.open(err?.error?.message || 'Could not load tasks', 'Dismiss', {
          duration: 3000
        });
      }
    });
  }

  openCreate(): void {
    this.openForm();
  }

  openEdit(task: TaskItem): void {
    this.openForm(task);
  }

  deleteTask(task: TaskItem): void {
    if (!confirm(`Delete "${task.title}"?`)) return;

    this.taskService.deleteTask(task.id).subscribe({
      next: () => {
        this.snackBar.open('Task deleted', undefined, { duration: 2000 });
        this.loadTasks();
      },
      error: (err) =>
        this.snackBar.open(err?.error?.message || 'Delete failed', 'Dismiss', {
          duration: 3000
        })
    });
  }

  isOverdue(task: TaskItem): boolean {
    if (!task.dueDate || task.status === 'Completed') return false;
    return new Date(task.dueDate) < new Date(new Date().toDateString());
  }

  priorityClass(priority: TaskPriority): string {
    return `prio-${priority.toLowerCase()}`;
  }

  private openForm(task?: TaskItem): void {
    const ref = this.dialog.open(TaskFormComponent, {
      width: '520px',
      data: {
        task,
        users: this.users(),
        isAdmin: this.isAdmin()
      }
    });

    ref.afterClosed().subscribe((payload?: TaskUpsertRequest) => {
      if (!payload) return;

      const request$ = task
        ? this.taskService.updateTask(task.id, payload)
        : this.taskService.createTask(payload);

      request$.subscribe({
        next: () => {
          this.snackBar.open(task ? 'Task updated' : 'Task created', undefined, {
            duration: 2000
          });
          this.loadTasks();
        },
        error: (err) =>
          this.snackBar.open(err?.error?.message || 'Save failed', 'Dismiss', {
            duration: 3500
          })
      });
    });
  }
}

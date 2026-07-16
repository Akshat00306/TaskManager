import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import {
  TaskItem,
  TaskPriority,
  TaskStatus,
  TaskUpsertRequest,
  UserDto
} from '../../../core/models/models';

export interface TaskFormData {
  task?: TaskItem;
  users: UserDto[];
  isAdmin: boolean;
}

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './task-form.component.html',
  styleUrl: './task-form.component.scss'
})
export class TaskFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<TaskFormComponent, TaskUpsertRequest | undefined>);
  readonly data = inject<TaskFormData>(MAT_DIALOG_DATA);

  readonly priorities: TaskPriority[] = ['Low', 'Medium', 'High'];
  readonly statuses: TaskStatus[] = ['Todo', 'InProgress', 'Completed'];
  readonly isEdit = !!this.data.task;

  readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    description: [''],
    priority: ['Medium' as TaskPriority, Validators.required],
    status: ['Todo' as TaskStatus, Validators.required],
    dueDate: [null as Date | null],
    assignedUserId: [null as number | null]
  });

  ngOnInit(): void {
    const task = this.data.task;
    if (task) {
      this.form.patchValue({
        title: task.title,
        description: task.description ?? '',
        priority: task.priority,
        status: task.status,
        dueDate: task.dueDate ? new Date(task.dueDate) : null,
        assignedUserId: task.assignedUserId ?? null
      });
    }
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const payload: TaskUpsertRequest = {
      title: raw.title.trim(),
      description: raw.description?.trim() || null,
      priority: raw.priority,
      status: raw.status,
      dueDate: raw.dueDate ? raw.dueDate.toISOString() : null,
      assignedUserId: this.data.isAdmin ? raw.assignedUserId : null
    };

    this.dialogRef.close(payload);
  }

  cancel(): void {
    this.dialogRef.close();
  }
}

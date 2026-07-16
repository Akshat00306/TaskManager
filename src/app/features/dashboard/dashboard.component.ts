import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TaskService } from '../../core/services/task.service';
import { AuthService } from '../../core/services/auth.service';
import { DashboardSummary, TaskItem } from '../../core/models/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  private readonly tasks = inject(TaskService);
  private readonly auth = inject(AuthService);

  readonly loading = signal(true);
  readonly summary = signal<DashboardSummary | null>(null);
  readonly recent = signal<TaskItem[]>([]);
  readonly user = this.auth.user;

  ngOnInit(): void {
    this.tasks.getDashboard().subscribe({
      next: (data) => {
        this.summary.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });

    this.tasks.getTasks({ sortBy: 'newest' }).subscribe({
      next: (items) => this.recent.set(items.slice(0, 5))
    });
  }

  isOverdue(task: TaskItem): boolean {
    if (!task.dueDate || task.status === 'Completed') return false;
    return new Date(task.dueDate) < new Date(new Date().toDateString());
  }
}

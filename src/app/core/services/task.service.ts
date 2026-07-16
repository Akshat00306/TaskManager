import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  DashboardSummary,
  TaskFilters,
  TaskItem,
  TaskUpsertRequest
} from '../models/models';

@Injectable({ providedIn: 'root' })
export class TaskService {
  constructor(private readonly http: HttpClient) {}

  getDashboard(): Observable<DashboardSummary> {
    return this.http.get<DashboardSummary>(`${environment.apiUrl}/tasks/dashboard`);
  }

  getTasks(filters: TaskFilters = {}): Observable<TaskItem[]> {
    let params = new HttpParams();
    if (filters.search) params = params.set('search', filters.search);
    if (filters.status) params = params.set('status', filters.status);
    if (filters.priority) params = params.set('priority', filters.priority);
    if (filters.sortBy) params = params.set('sortBy', filters.sortBy);
    if (filters.showOverdue) params = params.set('showOverdue', 'true');

    return this.http.get<TaskItem[]>(`${environment.apiUrl}/tasks`, { params });
  }

  getTask(id: number): Observable<TaskItem> {
    return this.http.get<TaskItem>(`${environment.apiUrl}/tasks/${id}`);
  }

  createTask(payload: TaskUpsertRequest): Observable<TaskItem> {
    return this.http.post<TaskItem>(`${environment.apiUrl}/tasks`, payload);
  }

  updateTask(id: number, payload: TaskUpsertRequest): Observable<TaskItem> {
    return this.http.put<TaskItem>(`${environment.apiUrl}/tasks/${id}`, payload);
  }

  deleteTask(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/tasks/${id}`);
  }
}

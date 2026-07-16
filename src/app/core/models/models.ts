export type UserRole = 'Admin' | 'User';
export type TaskPriority = 'Low' | 'Medium' | 'High';
export type TaskStatus = 'Todo' | 'InProgress' | 'Completed';

export interface AuthResponse {
  id: number;
  username: string;
  role: UserRole;
  token: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  role?: UserRole;
}

export interface UserDto {
  id: number;
  username: string;
  role: UserRole;
}

export interface TaskItem {
  id: number;
  title: string;
  description?: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate?: string | null;
  createdDate: string;
  updatedDate: string;
  assignedUserId?: number | null;
  assignedUsername?: string | null;
}

export interface TaskUpsertRequest {
  title: string;
  description?: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate?: string | null;
  assignedUserId?: number | null;
}

export interface DashboardSummary {
  totalTasks: number;
  todoTasks: number;
  inProgressTasks: number;
  completedTasks: number;
  overdueTasks: number;
}

export interface TaskFilters {
  search?: string;
  status?: TaskStatus | '';
  priority?: TaskPriority | '';
  sortBy?: string;
  showOverdue?: boolean;
}

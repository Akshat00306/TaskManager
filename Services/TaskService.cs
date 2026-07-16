using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using NextTaskAPI.DTOs;
using NextTaskAPI.Models;
using NextTaskAPI.Repositories;
using TaskStatus = NextTaskAPI.Models.TaskStatus;

namespace NextTaskAPI.Services
{
    public class TaskService : ITaskService
    {
        private readonly ITaskRepository _taskRepository;
        private readonly IUserRepository _userRepository;

        public TaskService(ITaskRepository taskRepository, IUserRepository userRepository)
        {
            _taskRepository = taskRepository;
            _userRepository = userRepository;
        }

        public async Task<TaskResponse?> GetByIdAsync(int id, int currentUserId, string currentUserRole)
        {
            var task = await _taskRepository.GetByIdAsync(id);
            if (task == null) return null;

            // Authorization: User can only see their own tasks
            if (currentUserRole != UserRole.Admin.ToString() && task.AssignedUserId != currentUserId)
            {
                throw new UnauthorizedAccessException("You are not authorized to view this task.");
            }

            return MapToResponse(task);
        }

        public async Task<IEnumerable<TaskResponse>> GetTasksAsync(
            int currentUserId,
            string currentUserRole,
            string? search = null,
            TaskStatus? status = null,
            TaskPriority? priority = null,
            string? sortBy = null,
            bool? showOverdue = null)
        {
            // If Admin, query all tasks. Otherwise, only user's tasks.
            int? queryUserId = currentUserRole == UserRole.Admin.ToString() ? null : currentUserId;

            var tasks = await _taskRepository.GetTasksAsync(queryUserId, search, status, priority, sortBy, showOverdue);
            return tasks.Select(MapToResponse);
        }

        public async Task<TaskResponse> CreateAsync(TaskCreateRequest request, int currentUserId, string currentUserRole)
        {
            // Only admins can assign tasks to other users; everyone else gets assigned to themselves
            var assignedUserId = currentUserRole == UserRole.Admin.ToString()
                ? (request.AssignedUserId ?? currentUserId)
                : currentUserId;

            // Verify assigned user exists
            var assignedUser = await _userRepository.GetByIdAsync(assignedUserId);
            if (assignedUser == null)
            {
                throw new InvalidOperationException("Assigned user does not exist.");
            }

            var task = new TaskItem
            {
                Title = request.Title,
                Description = request.Description,
                Priority = request.Priority,
                Status = request.Status,
                DueDate = request.DueDate,
                AssignedUserId = assignedUserId
            };

            var createdTask = await _taskRepository.CreateAsync(task);
            createdTask.AssignedUser = assignedUser;

            return MapToResponse(createdTask);
        }

        public async Task<TaskResponse> UpdateAsync(int id, TaskUpdateRequest request, int currentUserId, string currentUserRole)
        {
            var task = await _taskRepository.GetByIdAsync(id);
            if (task == null)
            {
                throw new KeyNotFoundException("Task not found.");
            }

            // Authorization: User can only edit their own tasks
            if (currentUserRole != UserRole.Admin.ToString() && task.AssignedUserId != currentUserId)
            {
                throw new UnauthorizedAccessException("You are not authorized to edit this task.");
            }

            // Only admin can reassign tasks. If standard user updates, keep original assignment.
            var assignedUserId = currentUserRole == UserRole.Admin.ToString() 
                ? (request.AssignedUserId ?? task.AssignedUserId)
                : task.AssignedUserId;

            if (assignedUserId.HasValue && assignedUserId != task.AssignedUserId)
            {
                var assignedUser = await _userRepository.GetByIdAsync(assignedUserId.Value);
                if (assignedUser == null)
                {
                    throw new InvalidOperationException("Assigned user does not exist.");
                }
                task.AssignedUser = assignedUser;
            }

            task.Title = request.Title;
            task.Description = request.Description;
            task.Priority = request.Priority;
            task.Status = request.Status;
            task.DueDate = request.DueDate;
            task.AssignedUserId = assignedUserId;

            var updatedTask = await _taskRepository.UpdateAsync(task);
            return MapToResponse(updatedTask);
        }

        public async Task DeleteAsync(int id, int currentUserId, string currentUserRole)
        {
            var task = await _taskRepository.GetByIdAsync(id);
            if (task == null)
            {
                throw new KeyNotFoundException("Task not found.");
            }

            // Authorization: User can only delete their own tasks.
            if (currentUserRole != UserRole.Admin.ToString() && task.AssignedUserId != currentUserId)
            {
                throw new UnauthorizedAccessException("You are not authorized to delete this task.");
            }

            await _taskRepository.DeleteAsync(task);
        }

        public async Task<DashboardSummaryDto> GetDashboardSummaryAsync(int currentUserId, string currentUserRole)
        {
            int? queryUserId = currentUserRole == UserRole.Admin.ToString() ? null : currentUserId;
            return await _taskRepository.GetDashboardSummaryAsync(queryUserId);
        }

        private static TaskResponse MapToResponse(TaskItem task)
        {
            return new TaskResponse
            {
                Id = task.Id,
                Title = task.Title,
                Description = task.Description,
                Priority = task.Priority.ToString(),
                Status = task.Status.ToString(),
                DueDate = task.DueDate,
                CreatedDate = task.CreatedDate,
                UpdatedDate = task.UpdatedDate,
                AssignedUserId = task.AssignedUserId,
                AssignedUsername = task.AssignedUser?.Username
            };
        }
    }
}

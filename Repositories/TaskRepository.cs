using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using NextTaskAPI.Data;
using NextTaskAPI.DTOs;
using NextTaskAPI.Models;
using TaskStatus = NextTaskAPI.Models.TaskStatus;

namespace NextTaskAPI.Repositories
{
    public class TaskRepository : ITaskRepository
    {
        private readonly AppDbContext _context;

        public TaskRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<TaskItem?> GetByIdAsync(int id)
        {
            return await _context.Tasks
                .Include(t => t.AssignedUser)
                .FirstOrDefaultAsync(t => t.Id == id);
        }

        public async Task<IEnumerable<TaskItem>> GetTasksAsync(
            int? userId = null,
            string? search = null,
            TaskStatus? status = null,
            TaskPriority? priority = null,
            string? sortBy = null,
            bool? showOverdue = null)
        {
            var query = _context.Tasks
                .Include(t => t.AssignedUser)
                .AsQueryable();

            // Filter by user if not Admin (Admin sees everything, User sees only assigned tasks)
            if (userId.HasValue)
            {
                query = query.Where(t => t.AssignedUserId == userId.Value);
            }

            // Search by title or description
            if (!string.IsNullOrWhiteSpace(search))
            {
                var cleanSearch = search.Trim().ToLower();
                query = query.Where(t => t.Title.ToLower().Contains(cleanSearch) || 
                                         (t.Description != null && t.Description.ToLower().Contains(cleanSearch)));
            }

            // Filter by status
            if (status.HasValue)
            {
                query = query.Where(t => t.Status == status.Value);
            }

            // Filter by priority
            if (priority.HasValue)
            {
                query = query.Where(t => t.Priority == priority.Value);
            }

            // Filter by overdue (status != completed and due date < today)
            if (showOverdue.HasValue && showOverdue.Value)
            {
                var today = DateTime.UtcNow.Date;
                query = query.Where(t => t.Status != TaskStatus.Completed && t.DueDate.HasValue && t.DueDate.Value.Date < today);
            }

            // Sorting
            if (!string.IsNullOrWhiteSpace(sortBy))
            {
                switch (sortBy.ToLower())
                {
                    case "newest":
                        query = query.OrderByDescending(t => t.CreatedDate);
                        break;
                    case "oldest":
                        query = query.OrderBy(t => t.CreatedDate);
                        break;
                    case "due_date":
                        query = query.OrderBy(t => t.DueDate);
                        break;
                    case "priority":
                        query = query.OrderByDescending(t => t.Priority);
                        break;
                    default:
                        query = query.OrderByDescending(t => t.CreatedDate);
                        break;
                }
            }
            else
            {
                query = query.OrderByDescending(t => t.CreatedDate);
            }

            return await query.ToListAsync();
        }

        public async Task<TaskItem> CreateAsync(TaskItem task)
        {
            task.CreatedDate = DateTime.UtcNow;
            task.UpdatedDate = DateTime.UtcNow;
            await _context.Tasks.AddAsync(task);
            await _context.SaveChangesAsync();
            return task;
        }

        public async Task<TaskItem> UpdateAsync(TaskItem task)
        {
            task.UpdatedDate = DateTime.UtcNow;
            _context.Tasks.Update(task);
            await _context.SaveChangesAsync();
            return task;
        }

        public async Task DeleteAsync(TaskItem task)
        {
            _context.Tasks.Remove(task);
            await _context.SaveChangesAsync();
        }

        public async Task<DashboardSummaryDto> GetDashboardSummaryAsync(int? userId = null)
        {
            var query = _context.Tasks.AsQueryable();

            if (userId.HasValue)
            {
                query = query.Where(t => t.AssignedUserId == userId.Value);
            }

            var tasks = await query.ToListAsync();
            var today = DateTime.UtcNow.Date;

            return new DashboardSummaryDto
            {
                TotalTasks = tasks.Count,
                TodoTasks = tasks.Count(t => t.Status == TaskStatus.Todo),
                InProgressTasks = tasks.Count(t => t.Status == TaskStatus.InProgress),
                CompletedTasks = tasks.Count(t => t.Status == TaskStatus.Completed),
                OverdueTasks = tasks.Count(t => t.Status != TaskStatus.Completed && t.DueDate.HasValue && t.DueDate.Value.Date < today)
            };
        }
    }
}

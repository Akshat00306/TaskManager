using System.Collections.Generic;
using System.Threading.Tasks;
using NextTaskAPI.DTOs;
using NextTaskAPI.Models;
using TaskStatus = NextTaskAPI.Models.TaskStatus;

namespace NextTaskAPI.Repositories
{
    public interface ITaskRepository
    {
        Task<TaskItem?> GetByIdAsync(int id);
        Task<IEnumerable<TaskItem>> GetTasksAsync(
            int? userId = null,
            string? search = null,
            TaskStatus? status = null,
            TaskPriority? priority = null,
            string? sortBy = null,
            bool? showOverdue = null);
        Task<TaskItem> CreateAsync(TaskItem task);
        Task<TaskItem> UpdateAsync(TaskItem task);
        Task DeleteAsync(TaskItem task);
        Task<DashboardSummaryDto> GetDashboardSummaryAsync(int? userId = null);
    }
}

using System.Collections.Generic;
using System.Threading.Tasks;
using NextTaskAPI.DTOs;
using TaskStatus = NextTaskAPI.Models.TaskStatus;
using NextTaskAPI.Models;

namespace NextTaskAPI.Services
{
    public interface ITaskService
    {
        Task<TaskResponse?> GetByIdAsync(int id, int currentUserId, string currentUserRole);
        Task<IEnumerable<TaskResponse>> GetTasksAsync(
            int currentUserId,
            string currentUserRole,
            string? search = null,
            TaskStatus? status = null,
            TaskPriority? priority = null,
            string? sortBy = null,
            bool? showOverdue = null);
        Task<TaskResponse> CreateAsync(TaskCreateRequest request, int currentUserId, string currentUserRole);
        Task<TaskResponse> UpdateAsync(int id, TaskUpdateRequest request, int currentUserId, string currentUserRole);
        Task DeleteAsync(int id, int currentUserId, string currentUserRole);
        Task<DashboardSummaryDto> GetDashboardSummaryAsync(int currentUserId, string currentUserRole);
    }
}

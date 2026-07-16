using System.Collections.Generic;
using System.Threading.Tasks;
using NextTaskAPI.DTOs;

namespace NextTaskAPI.Services
{
    public interface IUserService
    {
        Task<AuthResponse> RegisterAsync(RegisterRequest request);
        Task<AuthResponse> LoginAsync(LoginRequest request);
        Task<UserDto?> GetUserByIdAsync(int id);
        Task<IEnumerable<UserDto>> ListAllUsersAsync();
    }
}

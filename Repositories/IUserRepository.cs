using System.Collections.Generic;
using System.Threading.Tasks;
using NextTaskAPI.Models;

namespace NextTaskAPI.Repositories
{
    public interface IUserRepository
    {
        Task<User?> GetByIdAsync(int id);
        Task<User?> GetByUsernameAsync(string username);
        Task<User> CreateAsync(User user);
        Task<IEnumerable<User>> ListAllUsersAsync();
    }
}

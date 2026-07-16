using NextTaskAPI.Models;

namespace NextTaskAPI.Services
{
    public interface ITokenService
    {
        string CreateToken(User user);
    }
}

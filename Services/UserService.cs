using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using NextTaskAPI.DTOs;
using NextTaskAPI.Models;
using NextTaskAPI.Repositories;

namespace NextTaskAPI.Services
{
    public class UserService : IUserService
    {
        private readonly IUserRepository _userRepository;
        private readonly ITokenService _tokenService;

        public UserService(IUserRepository userRepository, ITokenService tokenService)
        {
            _userRepository = userRepository;
            _tokenService = tokenService;
        }

        public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
        {
            var existingUser = await _userRepository.GetByUsernameAsync(request.Username);
            if (existingUser != null)
            {
                throw new InvalidOperationException("Username already exists.");
            }

            var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

            var user = new User
            {
                Username = request.Username,
                PasswordHash = passwordHash,
                Role = request.Role
            };

            var createdUser = await _userRepository.CreateAsync(user);
            var token = _tokenService.CreateToken(createdUser);

            return new AuthResponse
            {
                Id = createdUser.Id,
                Username = createdUser.Username,
                Role = createdUser.Role.ToString(),
                Token = token
            };
        }

        public async Task<AuthResponse> LoginAsync(LoginRequest request)
        {
            var user = await _userRepository.GetByUsernameAsync(request.Username);
            if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            {
                throw new UnauthorizedAccessException("Invalid username or password.");
            }

            var token = _tokenService.CreateToken(user);

            return new AuthResponse
            {
                Id = user.Id,
                Username = user.Username,
                Role = user.Role.ToString(),
                Token = token
            };
        }

        public async Task<UserDto?> GetUserByIdAsync(int id)
        {
            var user = await _userRepository.GetByIdAsync(id);
            if (user == null) return null;

            return new UserDto
            {
                Id = user.Id,
                Username = user.Username,
                Role = user.Role.ToString()
            };
        }

        public async Task<IEnumerable<UserDto>> ListAllUsersAsync()
        {
            var users = await _userRepository.ListAllUsersAsync();
            return users.Select(u => new UserDto
            {
                Id = u.Id,
                Username = u.Username,
                Role = u.Role.ToString()
            });
        }
    }
}

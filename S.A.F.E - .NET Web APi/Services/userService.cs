using infraStructure;
using Microsoft.AspNetCore.Identity;
using Models;

namespace Services
{
    public class userService
    {
        private readonly AppDBContext _context;
        private readonly PasswordHasher<User> _userHasher;
        private readonly PasswordHasher<webUser> _WuserHasher;
        public userService (AppDBContext context)
        {
            _context = context;
        }
        public async Task addUser(userDto dto )
        {
            var user = new User()
            {
                Name = dto.name,
                PhoneNum = dto.phoneNum
            };
            
            user.PassWord = _userHasher.HashPassword(user, dto.passWord);
            _context.Users.Add(user);
            await _context.SaveChangesAsync();
        }
        public async Task addWebUser(userWebDto dto)
        {
            var user = new webUser()
            {
                Name = dto.name,
                operationCenterId = dto.operationCenId
            };
            user.PassWord = _WuserHasher.HashPassword(user, dto.passWord);
            _context.WebUsers.Add(user);
            await _context.SaveChangesAsync();
        }
    }
    public class userDto
    {
        public string name {  get; set; }
        public int phoneNum { get; set; }
        public string passWord { get; set; }

    }
    public class userWebDto
    {
        
        public string name { get; set; }
        public string passWord { get; set; }
        public int operationCenId { get; set; }
        
    }
}

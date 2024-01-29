using Microsoft.AspNetCore.Mvc;
using System.Security.Cryptography;
using TaskBoardAPI.Models;

namespace TaskBoardAPI.AuthenticationServices
{
    public class TokenService
    {
        private readonly TaskDBContext _dBContext;

        public TokenService(TaskDBContext dBContext)
        {
            _dBContext = dBContext;
        }

        public IActionResult GenerateToken(int userId)
        {
            AuthToken authToken = new AuthToken
            {
                Token = GenerateTokenString(),
                GenerationTime = DateTime.Now,
                UserID = userId
            };

            _dBContext.Tokens.Add(authToken);
            _dBContext.SaveChanges();

            return new ObjectResult(new {Token = authToken});
        }


        private string GenerateTokenString()
        {
            int tokenLength = 64;
            RandomNumberGenerator random = RandomNumberGenerator.Create();
            string chars = "QWERTYUIOPASDFGHJKLZXCVBNMqwertyuiopasdfghjklzxcvbnm1234567890";
            return new string(Enumerable.Repeat(chars, tokenLength)
                .Select(s => s[RandomNumberGenerator.GetInt32(s.Length)]).ToArray()
                );
        }
    }
}

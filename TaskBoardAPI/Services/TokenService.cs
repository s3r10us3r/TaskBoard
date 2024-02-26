using System.Security.Cryptography;
using TaskBoardAPI.Models;

namespace TaskBoardAPI.AuthenticationServices
{
    public enum TokenStatus
    {
        NON_EXISTANT, EXPIRED, VALID
    }

    public class TokenService
    {
        private readonly TimeSpan TOKEN_EXPIRATION_TIME = new(6, 0, 0);
        private readonly TaskDBContext _dBContext;

        public TokenService(TaskDBContext dBContext)
        {
            _dBContext = dBContext;
        }

        public TokenResponse GenerateToken(int userID)
        {
            InvalidateTokensForUser(userID);

            AuthToken authToken = new AuthToken
            {
                Token = GenerateTokenString(),
                GenerationTime = DateTime.Now,
                UserID = userID,
                Valid = true
            };

            _dBContext.Tokens.Add(authToken);
            _dBContext.SaveChanges();

            TokenResponse tokenResponse = new TokenResponse
            {
                Token = authToken.Token
            };
            return tokenResponse;
        }
        
        public TokenStatus IsTokenValid(string tokenString)
        {
            AuthToken? token = _dBContext.Tokens.Find(tokenString);
            if (token != null)
            {
                if (DateTime.Now - token.GenerationTime >= TOKEN_EXPIRATION_TIME)
                {
                    token.Valid = false;
                    _dBContext.Tokens.Update(token);
                    _dBContext.SaveChanges();
                }

                if (token.Valid)
                {
                    return TokenStatus.VALID;
                }
                else
                {
                    return TokenStatus.EXPIRED;
                }
            }

            return TokenStatus.NON_EXISTANT;
        }

        public void InvalidateToken(string tokenString)
        {
            AuthToken? token = _dBContext.Tokens.Find(tokenString);
            if (token != null)
            {
                _dBContext.Update(token);
                _dBContext.SaveChanges();
            }
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

        private void InvalidateTokensForUser(int userID)
        {
            //We invalid all tokens that are currently active other than the new generated one   
            List<AuthToken> userTokens = _dBContext.Tokens
            .Where(e => e.UserID == userID && e.Valid)
            .ToList();


            foreach (AuthToken record in userTokens)
            {
                record.Valid = false;
            }

            _dBContext.SaveChanges();
        }
    }
}

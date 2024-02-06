using Microsoft.AspNetCore.Mvc;
using TaskBoardAPI.AuthenticationServices;
using TaskBoardAPI.Models;

namespace TaskBoardAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TokenController : ControllerBase
    {
        private readonly TaskDBContext _dbContext;
        private readonly TokenService tokenService;

        public TokenController(TaskDBContext dBContext, TokenService tokenService)
        {
            this._dbContext = dBContext;
            this.tokenService = tokenService;
        }

        [HttpGet]
        [Route("validate")]
        public IActionResult IsTokenValid([FromHeader] string token)
        {
            TokenStatus tokenStatus = tokenService.IsTokenValid(token);
            if(tokenStatus == TokenStatus.VALID)
            {
                return Ok("Token is valid!");
            }
            else
            {
                return Unauthorized("Token is invalid!");
            }
        }
    }
}

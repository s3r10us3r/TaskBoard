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
        public IActionResult IsTokenValid()
        {
            string? tokenString = Request.Headers["token"];
            if (tokenString == null)
            {
                return BadRequest();
            }

            TokenStatus tokenStatus = tokenService.IsTokenValid(tokenString);
            if(tokenStatus == TokenStatus.VALID)
            {
                return Ok();
            }
            else
            {
                return NotFound();
            }
        }
    }
}

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
            if (!ModelState.IsValid)
            {
                return BadRequest(new { Message = "Invalid data.", Errors = ModelState.Values.SelectMany(v => v.Errors) });
            }

            TokenStatus tokenStatus = tokenService.IsTokenValid(token);
            if(tokenStatus == TokenStatus.VALID)
            {
                return Ok(new { Message = "Token is valid!", isValid = true});
            }
            else
            {
                return Unauthorized(new {Message = "Token is invalid!", isValid = false});
            }
        }
    }
}

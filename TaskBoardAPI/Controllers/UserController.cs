using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Serilog;
using TaskBoardAPI.AuthenticationServices;
using TaskBoardAPI.Models;

namespace TaskBoardAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly TaskDBContext _dBContext;
        private readonly TokenService tokenService;

        public UserController(TaskDBContext context, TokenService tokenService)
        {
            string loggingOutputTemplate = "{Timestamp:yyyy-MM-dd HH:mm:ss.fff} [{Level:u3}] {Message:lj}{NewLine}{Exception}";

            Log.Logger = new LoggerConfiguration()
                .MinimumLevel.Debug()
                .WriteTo.Console()
                .WriteTo.File("logs/UserController.txt", rollingInterval: RollingInterval.Day, outputTemplate: loggingOutputTemplate)
                .CreateLogger();

            _dBContext = context;
            this.tokenService = tokenService;
        }

        [HttpPost]
        [Route("login")]
        public IActionResult Login([FromBody] LogInModel logInModel)
        {
            try
            {
                if (ModelState.IsValid)
                {
                    User? userFromDB = _dBContext.Users.FirstOrDefault(e => EF.Property<string>(e, "UserName") == logInModel.UserName);
                    if (userFromDB == null)
                    {
                        Log.Information("Invalid user name provided {login}", logInModel.UserName);
                        return Unauthorized(new
                        {
                            Message = "This username does not exist!"
                        });
                    }

                    if (!PasswordHasher.VerifyPassword(logInModel.UserPassword, userFromDB.UserPassword))
                    {
                        Log.Information("Invalid password provided for user {userID}", userFromDB.UserID);
                        return Unauthorized(new
                        {
                            Message = "Invalid password!"
                        });
                    }
                    TokenResponse tokenReponse = tokenService.GenerateToken(userFromDB.UserID);
                    return new ObjectResult(tokenReponse);
                }
                else
                {
                    Log.Information("Invalid data model in Login");
                    return BadRequest(new {Message = "Invalid data.", Errors = ModelState.Values.SelectMany(v => v.Errors) });
                }
            }
            catch (DbUpdateException ex)
            {
                Log.Error(ex, "DATABASE UPDATE EXCEPTION AT LOGIN");
                return StatusCode(500, new { Message = "An error occured during loggin in.", Error = ex.Message });
            }
        }

        [HttpPost]
        [Route("register")]
        public IActionResult RegisterUser([FromBody] LogInModel logInModel)
        {
            try
            {
                if (ModelState.IsValid)
                {
                    User user = new User
                    {
                        UserName = logInModel.UserName,
                        UserPassword = PasswordHasher.HashPassword(logInModel.UserPassword)
                    };
                    _dBContext.Users.Add(user);
                    _dBContext.SaveChanges();

                    return Ok(new { Message = "User registered succesfully." });
                }

                Log.Warning("Invalid modelState at RegisterUser");
                return BadRequest(new { Message = "Validation failed.", Errors = ModelState.Values.SelectMany(v => v.Errors) });
            }
            catch(DbUpdateException ex)
            {
                if (IsUniqueConstraintViolation(ex))
                {
                    Log.Error(ex, "DATABASE UPDATE EXCEPTION");
                    return Conflict(new { Message = "User with this login already exists!" });
                }
                return StatusCode(500, new { Message = "An error occured during registration.", Error = ex.Message });
            }
        }

        [HttpPost]
        [Route("logout")]
        public IActionResult LogOutUser([FromHeader] string token)
        {
            tokenService.InvalidateToken(token);

            return Ok(new { Message = "User logged out succesfully." });
        }

        [HttpGet]
        [Route("getUserName")]
        public IActionResult GetUserName([FromHeader] string token)
        {
            TokenStatus tokenStatus = tokenService.IsTokenValid(token);
            if (tokenStatus == TokenStatus.NON_EXISTANT)
            {
                return Unauthorized (new { Message = "This token does not exist!" });
            }
            if (tokenStatus == TokenStatus.EXPIRED)
            {
                return Unauthorized(new { Message = "This token has expired!" });
            }

            AuthToken? authToken = _dBContext.Tokens.Find(token);
            
            User? user = _dBContext.Users.Find(authToken.UserID);
            if (user != null)
            {
                return new ObjectResult(new { user.UserName });
            }
            else
            {
                return Unauthorized(new
                {
                    Message = "No user with this token has been found!"
                });
            }
        }
        

        private bool IsUniqueConstraintViolation(DbUpdateException ex)
        {
            return ex.InnerException is SqlException sqlException &&
                   (sqlException.Number == 2601 || sqlException.Number == 2627);
        }
    }
}
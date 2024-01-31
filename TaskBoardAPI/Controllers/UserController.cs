﻿using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
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
            _dBContext = context;
            this.tokenService = tokenService;
        }

        [HttpPost]
        [Route("login")]
        public IActionResult Login([FromBody] LogInModel logInModel)
        {
            if (!(HttpContext.Request.Headers.TryGetValue("Content-Type", out var contentType) && contentType == "application/json"))
            {
                return BadRequest(new { Message = "Content-Type header is reguired to be application/json" });
            }

            try
            {
                if (ModelState.IsValid)
                {
                    User? userFromDB = _dBContext.Users.FirstOrDefault(e => EF.Property<string>(e, "UserName") == logInModel.UserName);
                    if (userFromDB != null && PasswordHasher.VerifyPassword(logInModel.UserPassword, userFromDB.UserPassword))
                    {
                        return tokenService.GenerateToken(userFromDB.UserID);
                    }
                    else
                    {
                        return Unauthorized();
                    }
                }
                else
                {
                    return BadRequest(new {Message = "Invalid data.", Errors = ModelState.Values.SelectMany(v => v.Errors) });
                }
            }
            catch (DbUpdateException ex)
            {
                return StatusCode(500, new { Message = "An error occured during loggin in.", Error = ex.Message });
            }
        }

        [HttpPost]
        [Route("register")]
        public IActionResult RegisterUser([FromBody] LogInModel logInModel)
        {
            if (!(HttpContext.Request.Headers.TryGetValue("Content-Type", out var contentType) && contentType == "application/json"))
            {
                return BadRequest(new { Message = "Content-Type header is reguired to be application/json" });
            }

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

                return BadRequest(new { Message = "Validation failed.", Errors = ModelState.Values.SelectMany(v => v.Errors) });
            }
            catch(DbUpdateException ex)
            {
                if (IsUniqueConstraintViolation(ex))
                {
                    return Conflict(new { Message = "User with this login already exists!" });
                }
                return StatusCode(500, new { Message = "An error occured during registration.", Error = ex.Message });
            }
        }

        [HttpPost]
        [Route("logout")]
        public IActionResult LogOutUser([FromBody] LogOutModel logOutModel)
        {
            if (!(HttpContext.Request.Headers.TryGetValue("Content-Type", out var contentType) && contentType == "application/json"))
            {
                return BadRequest(new { Message = "Content-Type header is reguired to be application/json" });
            }

            if (logOutModel == null || string.IsNullOrWhiteSpace(logOutModel.TokenString))
            {
                return BadRequest(new { Message = "Invalid request. TokenString is required." });
            }

            tokenService.InvalidateToken(logOutModel.TokenString);

            return Ok(new { Message = "User logged out succesfully." });
        }

        [HttpGet]
        [Route("getUserName")]
        public IActionResult GetUserName(string tokenString)
        {
            TokenStatus tokenStatus = tokenService.IsTokenValid(tokenString);
            if (tokenStatus == TokenStatus.NON_EXISTANT)
            {
                return Unauthorized("This token does not exist!");
            }
            if (tokenStatus == TokenStatus.EXPIRED)
            {
                return Unauthorized("This token has expired!");
            }

            AuthToken? authToken = _dBContext.Tokens.Find(tokenString);
            
            User? user = _dBContext.Users.Find(authToken.UserID);
            if (user != null)
            {
                return new ObjectResult(new { user.UserName });
            }
            else
            {
                return Unauthorized("No user with this token has been found!");
            }
        }
        

        private bool IsUniqueConstraintViolation(DbUpdateException ex)
        {
            return ex.InnerException is SqlException sqlException &&
                   (sqlException.Number == 2601 || sqlException.Number == 2627);
        }
    }
}

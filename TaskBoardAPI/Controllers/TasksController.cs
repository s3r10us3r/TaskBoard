using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskBoardAPI.AuthenticationServices;
using TaskBoardAPI.Models;

namespace TaskBoardAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TasksController : ControllerBase
    {
        private readonly TaskDBContext _dbContext;
        private readonly TokenService tokenService;

        public TasksController(TaskDBContext dBContext, TokenService tokenService)
        {
            _dbContext = dBContext;
            this.tokenService = tokenService;
        }

        [HttpPost]
        [Route("addBoard")]
        public IActionResult AddBoard([FromBody] BoardModel boardModel)
        {
            string? authToken = Request.Headers["token"];

            if (authToken != null && (tokenService.IsTokenValid(authToken) == TokenStatus.VALID))
            {
                AuthToken token = _dbContext.Tokens.Find(authToken);
                int userId = token.UserID;

                if (!ModelState.IsValid)
                {
                    return BadRequest("Invalid request!");
                }

                Board board = new Board
                {
                    UserID = userId,
                    BoardName = boardModel.BoardName,
                    BackgroundColor = boardModel.BackgroundColor
                };

                _dbContext.Boards.Add(board);
                _dbContext.SaveChanges();

                return Accepted();
            }

            return Unauthorized();
        }

        [HttpDelete]
        [Route("deleteBoard")]
        public IActionResult DeleteBoard()
        {
            string? authToken = Request.Headers["token"];
            string? boardIDString = Request.Headers["boardID"];

            if (authToken != null && (tokenService.IsTokenValid(authToken) == TokenStatus.VALID))
            {
                AuthToken token = _dbContext.Tokens.Find(authToken);
                
                if (boardIDString == null)
                {
                    return BadRequest();
                }

                int boardID;
                try
                {
                    boardID = int.Parse(boardIDString);
                } catch (Exception)
                {
                    return BadRequest();
                }

                Board? boardToDelete = _dbContext.Boards.Find(boardID);
                if (boardToDelete == null || boardToDelete.UserID != token.UserID)
                {
                    return Unauthorized();
                }

                _dbContext.Boards.Remove(boardToDelete);
                _dbContext.SaveChanges();
                return Accepted();
            }
            else
            {
                return Unauthorized();
            }
        }

        [HttpGet]
        [Route("allBoards")]
        public IActionResult GetAllBoards()
        {
            string? authToken = Request.Headers["token"];

            if (authToken != null && (tokenService.IsTokenValid(authToken) == TokenStatus.VALID))
            {
                AuthToken token = _dbContext.Tokens.Find(authToken);
                int userId = token.UserID;
                List<Board> boards = [.. _dbContext.Boards.Where(board => EF.Property<int>(board, "UserID") == userId)];

                return new ObjectResult(boards);
            }
            else
            {
                return Unauthorized();
            }
        }
    }
}

using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskBoardAPI.AuthenticationServices;
using TaskBoardAPI.Models;
using Task = TaskBoardAPI.Models.Task;

namespace TaskBoardAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TasksController : ControllerBase
    {
        private readonly TaskDBContext _dbContext;
        private readonly TokenService tokenService;
        private readonly TaskService taskService;

        public TasksController(TaskDBContext dBContext, TokenService tokenService, TaskService taskService)
        {
            _dbContext = dBContext;
            this.tokenService = tokenService;
            this.taskService = taskService;
        }
        //creates a new board
        [HttpPost]
        [Route("addBoard")]
        public IActionResult AddBoard([FromBody] BoardModel boardModel, [FromHeader] string token)
        {
            AuthToken? authToken = _dbContext.Tokens.Find(token);
            if (authToken != null && (tokenService.IsTokenValid(token) == TokenStatus.VALID))
            {
                int userId = authToken.UserID;

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

                try
                {
                    _dbContext.Boards.Add(board);
                    _dbContext.SaveChanges();
                }
                catch(DbUpdateException e)
                {
                    Console.WriteLine(e);
                    return StatusCode(500, "Failed to access database!");
                }

                return new ObjectResult(board.BoardID);
            }

            return Unauthorized();
        }

        //this deletes a board connected to a user
        //TODO: make sure all of the board contents get deleted with it, this will require a special service (I think at least)
        [HttpDelete]
        [Route("deleteBoard")]
        public IActionResult DeleteBoard([FromHeader] string token, [FromQuery] int boardID)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest();
            }

            if (token != null && (tokenService.IsTokenValid(token) == TokenStatus.VALID))
            {
                AuthToken authToken = _dbContext.Tokens.Find(token);
               
                Board? boardToDelete = _dbContext.Boards.Find(boardID);
                if (boardToDelete == null || boardToDelete.UserID != authToken.UserID)
                {
                    return Unauthorized();
                }
                try
                {
                    _dbContext.Boards.Remove(boardToDelete);
                    _dbContext.SaveChanges();
                }
                catch(DbUpdateException e)
                {
                    Console.WriteLine(e);
                    return StatusCode(500, "Internal server error");
                }
                return Ok("Board deleted succesfully!");
            }
            else
            {
                return Unauthorized("You don't have permission to delete this board! (user might have been logged out)");
            }
        }

        [HttpGet]
        [Route("allBoards")]
        public IActionResult GetAllBoards([FromHeader] string token)
        {
            if (ModelState.IsValid && (tokenService.IsTokenValid(token) == TokenStatus.VALID))
            {
                //this here does not get null checked because the null check happens inside the if statement when validating token
                AuthToken authToken = _dbContext.Tokens.Find(token);
                int userId = authToken.UserID;
                List<Board> boards = [.. _dbContext.Boards.Where(board => EF.Property<int>(board, "UserID") == userId)];

                return new ObjectResult(boards);
            }
            else
            {
                return Unauthorized();
            }
        }

        [HttpPost]
        [Route("addColumn")]
        public IActionResult AddEmptyColumn([FromHeader] string token, [FromQuery] int boardID, [FromBody] BoardColumn column)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest();
            }

            TokenStatus status = tokenService.IsTokenValid(token);

            if (status == TokenStatus.NON_EXISTANT)
            {
                return Unauthorized("This token does not exist!");
            }
            if (status == TokenStatus.EXPIRED)
            {
                return Unauthorized("This token has expired!");
            }

            //since token status is valid it does exist in the database
            AuthToken authToken = _dbContext.Tokens.Find(token);

            int userID = authToken.UserID;

            Board? board = _dbContext.Boards.Find(boardID);

            if (board is null)
            {
                return BadRequest("Invalid board ID");
            }
            if (board.UserID != userID)
            {
                return Unauthorized("You don't have access to this board!");
            }

            try
            {
                _dbContext.BoardColumns.Add(column);
                _dbContext.SaveChanges();
            }
            catch (DbUpdateException e)
            {
                Console.WriteLine(e);
                return StatusCode(500, "Failed to update db");
            }

            return new ObjectResult(column.ColumnID);
        }

        [HttpPost]
        [Route("addTask")]
        public IActionResult AddTask([FromHeader] string token, [FromBody] Task task)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest();
            }

            int columnID = task.ColumnID;

            TokenStatus status = tokenService.IsTokenValid(token);

            if (status == TokenStatus.NON_EXISTANT)
            {
                return Unauthorized("This token does not exist!");
            }
            if (status == TokenStatus.EXPIRED)
            {
                return Unauthorized("This token has expired!");
            }

            //since token status is valid it does exist in the database
            AuthToken authToken = _dbContext.Tokens.Find(token);

            int userID = authToken.UserID;

            BoardColumn? boardColumn = _dbContext.BoardColumns.Find(columnID);

            if (boardColumn is null)
            {
                return BadRequest("Invalid boardColumn");
            }

            //If I have done everything correctly it is not possible for a column to be in the db without being binded to an existing board
            Board board = _dbContext.Boards.Find(boardColumn.BoardID);

            if (board.UserID != userID)
            {
                return Unauthorized("You don't have access to this board!");
            }

            try
            {
                _dbContext.Tasks.Add(task);
                _dbContext.SaveChanges();
            }
            catch (DbUpdateException e)
            {
                Console.WriteLine(e);
                return StatusCode(500, "Failed to update db!");
            }

            return new ObjectResult(task.TaskID);
        }

        [HttpPatch]
        public IActionResult EditTask([FromHeader] string token, [FromBody] Task updatedTask)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest();
            }

            TokenStatus status = tokenService.IsTokenValid(token);

            if (status == TokenStatus.NON_EXISTANT)
            {
                return Unauthorized("This token does not exist!");
            }
            if (status == TokenStatus.EXPIRED)
            {
                return Unauthorized("This token has expired!");
            }

            AuthToken authToken = _dbContext.Tokens.Find(token);

            int userID = authToken.UserID;

            Task? originalTask = _dbContext.Tasks.Find(updatedTask.TaskID);
            if (originalTask is null)
            {
                return BadRequest("There is no task with this ID");
            }

            int? taskOwner = taskService.FindTaskOwner(originalTask.TaskID);

            if (taskOwner is null)
            {
                return StatusCode(500, "Internal error!");
            }

            originalTask.TaskName = updatedTask.TaskName;
            originalTask.ColumnID = updatedTask.ColumnID;
            originalTask.TaskOrder = updatedTask.TaskOrder;
            originalTask.TaskColor = updatedTask.TaskColor;
            originalTask.TaskDescription = updatedTask.TaskDescription;

            _dbContext.SaveChanges();

            return Ok("Task updated succesfully!");
        }
    }
}

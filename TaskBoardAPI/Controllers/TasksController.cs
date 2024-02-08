using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Data.Common;
using TaskBoardAPI.AuthenticationServices;
using TaskBoardAPI.Models;
using Task = TaskBoardAPI.Models.Task;

using Serilog;

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
            string loggingOutputTemplate = "{Timestamp:yyyy-MM-dd HH:mm:ss.fff} [{Level:u3}] {Message:lj}{NewLine}{Exception}";

            Log.Logger = new LoggerConfiguration()
                .MinimumLevel.Debug()
                .WriteTo.Console()
                .WriteTo.File("logs/TaskController.txt", rollingInterval: RollingInterval.Day)
                .CreateLogger();
            Log.Information("TasksController started");
            _dbContext = dBContext;
            this.tokenService = tokenService;
            this.taskService = taskService;
        }
        //creates a new board
        [HttpPost]
        [Route("addBoard")]
        public IActionResult AddBoard([FromBody] BoardModel boardModel, [FromHeader] string token)
        {
            if (!ModelState.IsValid)
            {
                //TODO: add model state info
                Log.Information("Request with invalid model state!");
                return BadRequest();
            }
            TokenStatus status = tokenService.IsTokenValid(token);
            if (status == TokenStatus.NON_EXISTANT)
            {
                Log.Information("Access denied for invalid token in AddBoard: {token}", token);
                return Unauthorized("This token does not exist!");
            }
            if (status == TokenStatus.EXPIRED)
            {
                Log.Information("Access denied for expired token in AddBoard: {token}", token);
                return Unauthorized("This token has expired!");
            }

            AuthToken authToken = _dbContext.Tokens.Find(token);

            int userId = authToken.UserID;

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
                Log.Error(e, "DATABASE UPDATE ERROR IN ADDBOARD");
                return StatusCode(500, new {Message = "Failed to access database!", Error = e});
            }

            BoardModelID boardModelID = new BoardModelID
            {
                BoardID = board.BoardID,
                BoardName = board.BoardName,
                BackgroundColor = board.BackgroundColor
            };

            Log.Information("Board {boardID} added for user {userID}", board.BoardID, board.UserID);
            return new ObjectResult(boardModelID);
        }

        //this deletes a board connected to a user
        [HttpDelete]
        [Route("deleteBoard")]
        public IActionResult DeleteBoard([FromHeader] string token, [FromQuery] int boardID)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest();
            }
            TokenStatus status = tokenService.IsTokenValid(token);
            if (status == TokenStatus.NON_EXISTANT)
            {
                Log.Information("Access denied for invalid token in DeleteBoard: {token}", token);
                return Unauthorized("This token does not exist!");
            }
            if (status == TokenStatus.EXPIRED)
            {
                Log.Information("Access denied for expired token in DeleteBoard: {token}", token);
                return Unauthorized("This token has expired!");
            }

            AuthToken authToken = _dbContext.Tokens.Find(token);

            Board? boardToDelete = _dbContext.Boards.Find(boardID);
            if (boardToDelete == null)
            {
                Log.Information("Invalid boardID provided to DeleteBoard method");
                return BadRequest("Invalid board ID");
            }
            if (boardToDelete.UserID != authToken.UserID)
            {
                Log.Warning("Access denied to user: {UserID}    board owner: {ownerID}", authToken.UserID, boardToDelete.UserID);
                return Unauthorized("You don't have access to this board!");
            }
            List<BoardColumn> columnsToBeDeleted = _dbContext.BoardColumns.Where(column => EF.Property<int>(column, "BoardID") == boardToDelete.BoardID).ToList();

            foreach (BoardColumn column in columnsToBeDeleted)
            {
                //I think this might be bad practice, since it might lead to bizzare situations where tasks get deleted when other components are not 
                int rowsDeleted = _dbContext.Tasks.Where(task => EF.Property<int>(column, "ColumnID") == column.ColumnID).ExecuteDelete();
                _dbContext.Remove(column);
            }
            try
            {
                _dbContext.SaveChanges();
            }
            catch (DbException e)
            {
                Log.Error(e, "DATABASE UPDATE EXCEPTION IN DELETEBOARD");
                return StatusCode(500, "No access to the database!");
            }
            Log.Information("Deleted board {boardID} and its contents", boardID);
            return Ok("Board deleted succesfully!");
        }

        [HttpDelete]
        [Route("deleteColumn")]
        public IActionResult DeleteColumn([FromHeader] string token, [FromQuery] int columnID)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest();
            }

            TokenStatus status = tokenService.IsTokenValid(token);
            if (status == TokenStatus.NON_EXISTANT)
            {
                Log.Information("Access denied for invalid token in DeleteColumn: {token}", token);
                return Unauthorized("This token does not exist!");
            }
            if (status == TokenStatus.EXPIRED)
            {
                Log.Information("Access denied for expired token in DeleteBoard: {token}", token);
                return Unauthorized("This token has expired!");
            }

            //token has been null checked when obtaining its status
            AuthToken authToken = _dbContext.Tokens.Find(token);
            int userID = authToken.UserID;

            int? ownerID = taskService.FindColumnOwner(columnID);

            if (ownerID is null)
            {
                //this should never happen if everything else is done right
                Log.Warning("COLUMN WITH NO OWNER FOUND columndID {columnID}", columnID);
                return StatusCode(500, "The column does not exist!");
            }
            if (ownerID != userID)
            {
                Log.Information("Access to column denied for user {userID} column owner {ownerID}", userID, ownerID);
                return Unauthorized("You don't have access to this column!");
            }

            //this has been null checked in the FindColumnOwner method
            BoardColumn column = _dbContext.BoardColumns.Find(columnID);

            int tasksDeleted = _dbContext.BoardColumns.Where(task => EF.Property<int>(task, "ColumnID") == column.ColumnID).ExecuteDelete();
            _dbContext.BoardColumns.Remove(column);

            try
            {
                _dbContext.SaveChanges();
            }
            catch (DbUpdateException e)
            {
                Log.Error(e, "DATABASE UPDATE EXCEPTION IN DELETE COLUMN {error}");
                return StatusCode(500, new {Message = "Failed to access database!", Error = e});
            }

            Log.Information("Column {columnID} succesfully deleted!", columnID);
            return Ok("Column has been succesfully deleted!");
        }

        [HttpDelete]
        [Route("deleteTask")]
        public IActionResult DeleteTask([FromHeader] string token, [FromQuery] int taskID)
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

            //token has been null checked when obtaining its status
            AuthToken authToken = _dbContext.Tokens.Find(token);
            int userID = authToken.UserID;

            int? ownerID = taskService.FindTaskOwner(taskID);
            if (ownerID is null)
            {
                //this should never happen if everything else is done right
                Log.Warning("Task with no owner found task id: {taskID}", taskID);
                return StatusCode(500, "The task does not exist!");
            }
            if (ownerID != userID)
            {
                return Unauthorized("You don't have access to this task!");
            }
            Task task = _dbContext.Tasks.Find(taskID);

            _dbContext.Tasks.Remove(task);
            try
            {
                _dbContext.SaveChanges();
            }
            catch (DbUpdateException e)
            {
                Log.Error("DATABASE UPDATE EXCEPTION IN DELETETASK {error}", e);
                return StatusCode(500, "Internal exception!");
            }

            return Ok("Task deleted succesfully!");
        }

        [HttpGet]
        [Route("allBoards")]
        public IActionResult GetAllBoards([FromHeader] string token)
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

            int userId = authToken.UserID;
            List<Board> boards = [.. _dbContext.Boards.Where(board => EF.Property<int>(board, "UserID") == userId)];
            List<BoardModelID> boardModels = boards.Select(board => new BoardModelID(board)).ToList();
            return new ObjectResult(boardModels);
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
                Log.Error("DBUPDATE EXCEPTION IN ADDEMPTYCOLUMND {error}", e);
                return StatusCode(500, new { Message = "Failed to access database!", Error = e });
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

            int? ownerID = taskService.FindColumnOwner(boardColumn.ColumnID);

            if (ownerID is null)
            {
                return BadRequest("No column owner found");
            }   

            if (userID != ownerID)
            {
                return Unauthorized("You have no access to this column!");
            }

            try
            {
                _dbContext.Tasks.Add(task);
                _dbContext.SaveChanges();
            }
            catch (DbUpdateException e)
            {
                Log.Error("DBUPDATE EXCEPTION AT ADDTASK {error}", e);
                return StatusCode(500, new { Message = "Failed to access database!", Error = e });
            }

            return new ObjectResult(task.TaskID);
        }

        [HttpPatch]
        [Route("editTask")]
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
                Log.Warning("Task with no owner found task id: {taskID}", updatedTask.TaskID);
                return StatusCode(500, "Internal error!");
            }
            if (taskOwner != userID)
            {
                return Unauthorized();
            }

            try
            {
                originalTask.TaskName = updatedTask.TaskName;
                originalTask.ColumnID = updatedTask.ColumnID;
                originalTask.TaskOrder = updatedTask.TaskOrder;
                originalTask.TaskColor = updatedTask.TaskColor;
                originalTask.TaskDescription = updatedTask.TaskDescription;

                _dbContext.SaveChanges();
            }
            catch (DbUpdateException e)
            {
                Console.WriteLine(e);
                return StatusCode(500, new { Message = "Failed to access database!", Error = e });
            }

            return Ok("Task updated succesfully!");
        }

        [HttpPatch]
        [Route("editColumn")]
        public IActionResult EditColumn([FromHeader] string token, [FromBody] BoardColumn updatedColumn)
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

            int? ownerID = taskService.FindColumnOwner(updatedColumn.ColumnID);

            if (ownerID is null)
            {
                Log.Warning("column with no owner found task id: {taskID}", updatedColumn.ColumnID);
                return StatusCode(500, "The column does not exist!");
            }
            if (ownerID != userID)
            {
                return Unauthorized("You are not the owner of this column!");
            }

            //this has been null checked before in the FindColumnOwner method
            try
            {
                BoardColumn originalColumn = _dbContext.BoardColumns.Find(updatedColumn.ColumnID);
                originalColumn.ColumnName = updatedColumn.ColumnName;
                originalColumn.ColumnColor = updatedColumn.ColumnColor;
                originalColumn.ColumnOrder = updatedColumn.ColumnOrder;

                _dbContext.SaveChanges();
                return Ok("Column edited succesfully!");
            }
            catch (DbException e)
            {
                Log.Error("DBUPDATE EXCEPTION AT EDIT COLUMN {error}", e);
                return StatusCode(500, new { Message = "Failed to access database!", Error = e });
            }
        }

        [HttpPatch]
        [Route("editBoard")]
        public IActionResult EditBoard([FromHeader] string token, [FromBody] BoardModelID updatedBoard)
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

            Board? originalBoard = _dbContext.Boards.Find(updatedBoard.BoardID);
            if (originalBoard is null)
            {
                return BadRequest("board has not been found!");
            }

            int ownerID = originalBoard.UserID;
            if (ownerID != userID)
            {
                return Unauthorized("You are not the owner of this board!");
            }

            try
            {
                originalBoard.BoardName = updatedBoard.BoardName;
                originalBoard.BackgroundColor = updatedBoard.BackgroundColor;

                _dbContext.SaveChanges();
                return Ok("Board updated succesfully!");
            }
            catch (DbException e)
            {
                Log.Error("DBUPDATE EXCEPTION AT EDIT COLUMN {error}", e);
                return StatusCode(500, new { Message = "Failed to access database!", Error = e });
            }
        }

        [HttpGet]
        [Route("getBoardContents")]
        public IActionResult GetBoardContents([FromHeader] string token, [FromHeader] int boardID)
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

            Board? originalBoard = _dbContext.Boards.Find(boardID);
            if (originalBoard is null)
            {
                return BadRequest("Invalid board ID");
            }

            int ownerID = originalBoard.UserID;
            if (ownerID != userID)
            {
                return Unauthorized("You don't have access to this board!");
            }


            return new ObjectResult(new BoardAndContents(_dbContext, originalBoard));
        }
    }
}

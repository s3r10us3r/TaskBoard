﻿using Microsoft.AspNetCore.Mvc;
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
                .WriteTo.File("logs/TaskController.txt", rollingInterval: RollingInterval.Day, outputTemplate: loggingOutputTemplate)             
                .CreateLogger();
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
                Log.Information("Request with invalid model state!");
                return BadRequest(new { Message = "Invalid data.", Errors = ModelState.Values.SelectMany(v => v.Errors) });
            }
            TokenStatus status = tokenService.IsTokenValid(token);
            if (status == TokenStatus.NON_EXISTANT)
            {
                Log.Information("Access denied for invalid token in AddBoard: {token}", token);
                return Unauthorized(new { Message = "This token does not exist!" });
            }
            if (status == TokenStatus.EXPIRED)
            {
                Log.Information("Access denied for expired token in AddBoard: {token}", token);
                return Unauthorized(new { Message = "This token has expired!" });
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

        [HttpDelete]
        [Route("deleteBoard")]
        public IActionResult DeleteBoard([FromHeader] string token, [FromHeader] int boardID)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new { Message = "Invalid data.", Errors = ModelState.Values.SelectMany(v => v.Errors) });
            }
            TokenStatus status = tokenService.IsTokenValid(token);
            if (status == TokenStatus.NON_EXISTANT)
            {
                Log.Information("Access denied for invalid token in DeleteBoard: {token}", token);
                return Unauthorized(new { Message = "This token does not exist!" });
            }
            if (status == TokenStatus.EXPIRED)
            {
                Log.Information("Access denied for expired token in DeleteBoard: {token}", token);
                return Unauthorized(new { Message = "This token has expired!" });
            }

            AuthToken authToken = _dbContext.Tokens.Find(token);

            Board? boardToDelete = _dbContext.Boards.Find(boardID);
            if (boardToDelete == null)
            {
                Log.Information("Invalid boardID provided to DeleteBoard method {boardID}", boardID);
                return BadRequest(new { Message = "Invalid board ID" });
            }
            if (boardToDelete.UserID != authToken.UserID)
            {
                Log.Warning("Access denied to user: {UserID}    board owner: {ownerID}", authToken.UserID, boardToDelete.UserID);
                return Unauthorized(new { Message = "You don't have access to this board!" });
            }
            List<BoardColumn> columnsToBeDeleted = _dbContext.BoardColumns.Where(column => EF.Property<int>(column, "BoardID") == boardToDelete.BoardID).ToList();

            foreach (BoardColumn column in columnsToBeDeleted)
            {
                //I think this might be bad practice, since it might lead to bizzare situations where tasks get deleted when other components are not 
                int rowsDeleted = _dbContext.Tasks.Where(task => EF.Property<int>(task, "ColumnID") == column.ColumnID).ExecuteDelete();
                _dbContext.Remove(column);
            }
            _dbContext.Remove(boardToDelete);
            try
            {
                _dbContext.SaveChanges();
            }
            catch (DbException e)
            {
                Log.Error(e, "DATABASE UPDATE EXCEPTION IN DELETEBOARD");
                return StatusCode(500, new { Message = "No access to the database!" });
            }
            Log.Information("Deleted board {boardID} and its contents", boardID);
            return Ok(new { Message = "Board deleted succesfully!" });
        }

        [HttpDelete]
        [Route("deleteColumn")]
        public IActionResult DeleteColumn([FromHeader] string token, [FromHeader] int columnID)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new { Message = "Invalid data.", Errors = ModelState.Values.SelectMany(v => v.Errors) });
            }

            TokenStatus status = tokenService.IsTokenValid(token);
            if (status == TokenStatus.NON_EXISTANT)
            {
                Log.Information("Access denied for invalid token in DeleteColumn: {token}", token);
                return Unauthorized(new { Message = "This token does not exist!" });
            }
            if (status == TokenStatus.EXPIRED)
            {
                Log.Information("Access denied for expired token in DeleteBoard: {token}", token);
                return Unauthorized(new { Message = "This token has expired!" });
            }

            //token has been null checked when obtaining its status
            AuthToken authToken = _dbContext.Tokens.Find(token);
            int userID = authToken.UserID;

            int? ownerID = taskService.FindColumnOwner(columnID);

            if (ownerID is null)
            {
                //this should never happen if everything else is done right
                Log.Warning("COLUMN WITH NO OWNER FOUND columndID {columnID}", columnID);
                return StatusCode(500, new { Message = "The column does not exist!" });
            }
            if (ownerID != userID)
            {
                Log.Information("Access to column denied for user {userID} column owner {ownerID}", userID, ownerID);
                return Unauthorized(new { Message = "You don't have access to this column!" });
            }

            //this has been null checked in the FindColumnOwner method
            BoardColumn? column = _dbContext.BoardColumns.Find(columnID);

            if (column is null)
            {
                Log.Warning("COLUMN {columnID} HAS NOT BEEN FOUND", columnID);
                return BadRequest(new { Message = "this column does not exist!" });
            }
            int tasksDeleted = _dbContext.Tasks.Where(task => EF.Property<int>(task, "ColumnID") == column.ColumnID).ExecuteDelete();

            Log.Information("Deleted {n} tasks from column with id {columnID}", tasksDeleted, column.ColumnID);

            _dbContext.BoardColumns.Remove(column);

            try
            {
                _dbContext.SaveChanges();
            }
            catch (DbUpdateException e)
            {
                Log.Error(e, "DATABASE UPDATE EXCEPTION IN DELETE COLUMN!");
                return StatusCode(500, new {Message = "Failed to access database!"});
            }

            Log.Information("Column {columnID} succesfully deleted!", columnID);
            return Ok(new { Message = "Column has been succesfully deleted!" });
        }

        [HttpDelete]
        [Route("deleteTask")]
        public IActionResult DeleteTask([FromHeader] string token, [FromHeader] int taskID)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new { Message = "Invalid data.", Errors = ModelState.Values.SelectMany(v => v.Errors) });
            }

            TokenStatus status = tokenService.IsTokenValid(token);
            if (status == TokenStatus.NON_EXISTANT)
            {
                Log.Information("Access denied for invalid token in DeleteTolumn: {token}", token);
                return Unauthorized(new { Message = "This token does not exist!" });
            }
            if (status == TokenStatus.EXPIRED)
            {
                Log.Information("Access denied for expired token in DeleteTask: {token}", token);
                return Unauthorized(new { Message = "This token has expired!" });
            }

            //token has been null checked when obtaining its status
            AuthToken authToken = _dbContext.Tokens.Find(token);
            int userID = authToken.UserID;

            int? ownerID = taskService.FindTaskOwner(taskID);
            if (ownerID is null)
            {
                //this should never happen if everything else is done right
                Log.Warning("Task with no owner found task id: {taskID}", taskID);
                return StatusCode(500, new { Message = "The task does not exist!" });
            }
            if (ownerID != userID)
            {
                Log.Warning("Denied access to task {taskID} for user {userID} owner {ownerID}", taskID, userID, ownerID);
                return Unauthorized(new { Message = "You don't have access to this task!" });
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
                return StatusCode(500, new { Message = "Internal exception!" });
            }

            Log.Information("Deleted task {taskID}", taskID);
            return Ok(new { Message = "Task deleted succesfully!" });
        }

        [HttpGet]
        [Route("allBoards")]
        public IActionResult GetAllBoards([FromHeader] string token)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new { Message = "Invalid data.", Errors = ModelState.Values.SelectMany(v => v.Errors) });
            }
            TokenStatus status = tokenService.IsTokenValid(token);
            if (status == TokenStatus.NON_EXISTANT)
            {
                Log.Information("Access denied for invalid token in GetAllBoards: {token}", token);
                return Unauthorized(new { Message = "This token does not exist!" });
            }
            if (status == TokenStatus.EXPIRED)
            {
                Log.Information("Access denied for expired token in GetAllBoards: {token}", token);
                return Unauthorized(new { Message = "This token has expired!" });
            }

            AuthToken authToken = _dbContext.Tokens.Find(token);

            int userId = authToken.UserID;
            List<Board> boardsWithId = [.. _dbContext.Boards.Where(board => EF.Property<int>(board, "UserID") == userId)];
            List<BoardModelID> boards = boardsWithId.Select(board => new BoardModelID(board)).ToList();
            return new ObjectResult(new { boards });
        }

        [HttpPost]
        [Route("addColumn")]
        public IActionResult AddEmptyColumn([FromHeader] string token, [FromBody] BoardColumn column)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new { Message = "Invalid data.", Errors = ModelState.Values.SelectMany(v => v.Errors) });
            }

            TokenStatus status = tokenService.IsTokenValid(token);

            if (status == TokenStatus.NON_EXISTANT)
            {
                Log.Information("Access denied for invalid token in AddEmptyColumn: {token}", token);
                return Unauthorized(new { Message = "This token does not exist!" });
            }
            if (status == TokenStatus.EXPIRED)
            {
                Log.Information("Access denied for expired token in AddEmptyColumn: {token}", token);
                return Unauthorized(new { Message = "This token has expired!" });
            }

            //since token status is valid it does exist in the database
            AuthToken authToken = _dbContext.Tokens.Find(token);

            int userID = authToken.UserID;
            int boardID = column.BoardID;

            Board? board = _dbContext.Boards.Find(boardID);

            if (board is null)
            {
                Log.Information("Non existant boardID provided ({boardID})", boardID);
                return BadRequest(new { Message = "Invalid board ID" });
            }
            if (board.UserID != userID)
            {
                Log.Information("Access to board {boardID} by user {userID} denied", boardID, userID);
                return Unauthorized(new { Message = "You don't have access to this board!" });
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

            Log.Information("Column {columnID} added to board {boardID}", column.ColumnID, boardID);
            return new ObjectResult(column);
        }

        [HttpPost]
        [Route("addTask")]
        public IActionResult AddTask([FromHeader] string token, [FromBody] Task task)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new { Message = "Invalid data.", Errors = ModelState.Values.SelectMany(v => v.Errors) });
            }

            int columnID = task.ColumnID;

            TokenStatus status = tokenService.IsTokenValid(token);

            if (status == TokenStatus.NON_EXISTANT)
            {
                Log.Information("Access denied for invalid token in AddTask: {token}", token);
                return Unauthorized(new { Message = "This token does not exist!" });
            }
            if (status == TokenStatus.EXPIRED)
            {
                Log.Information("Access denied for expired token in AddTask: {token}", token);
                return Unauthorized(new { Message = "This token has expired!" });
            }

            //since token status is valid it does exist in the database
            AuthToken authToken = _dbContext.Tokens.Find(token);

            int userID = authToken.UserID;

            BoardColumn? boardColumn = _dbContext.BoardColumns.Find(columnID);

            int? ownerID = taskService.FindColumnOwner(boardColumn.ColumnID);

            if (ownerID is null)
            {
                Log.Warning("COLUMN WITH NO OWNER FOUND columnID: {columnID}", columnID);
                return BadRequest(new { Message = "No column owner found" });
            }   

            if (userID != ownerID)
            {
                Log.Information("Access to column {columnID} denied for user {userID}", columnID, userID);
                return Unauthorized(new { Message = "You have no access to this column!" });
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

            Log.Information("Task {taskID} added to column {columnID}", task.TaskID, columnID);
            return new ObjectResult(task);
        }

        [HttpPatch]
        [Route("editTask")]
        public IActionResult EditTask([FromHeader] string token, [FromBody] Task updatedTask)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new { Message = "Invalid data.", Errors = ModelState.Values.SelectMany(v => v.Errors) });
            }

            TokenStatus status = tokenService.IsTokenValid(token);

            if (status == TokenStatus.NON_EXISTANT)
            {
                Log.Information("Access denied for invalid token in EditTask: {token}", token);
                return Unauthorized(new { Message = "This token does not exist!" });
            }
            if (status == TokenStatus.EXPIRED)
            {
                Log.Information("Access denied for expired token in EditTask: {token}", token);
                return Unauthorized(new { Message = "This token has expired!" });
            }

            AuthToken authToken = _dbContext.Tokens.Find(token);

            int userID = authToken.UserID;

            Task? originalTask = _dbContext.Tasks.Find(updatedTask.TaskID);
            if (originalTask is null)
            {
                Log.Information("User {userID} tried to edit non existing task {taskID}", userID, updatedTask.TaskID);
                return BadRequest(new { Message = "There is no task with this ID" });
            }

            int? taskOwner = taskService.FindTaskOwner(originalTask.TaskID);

            if (taskOwner is null)
            {
                Log.Warning("Task with no owner found task id: {taskID}", updatedTask.TaskID);
                return StatusCode(500, new { Message = "Internal error!" });
            }
            if (taskOwner != userID)
            {
                Log.Information("Denied access to task {taskID} for {userID} task owner {ownerID}", updatedTask.TaskID, userID, taskOwner);
                return Unauthorized(new { Message = "You don't have access to this task!" });
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
                Log.Error(e, "DATABASE UPDATE EXCEPTION IN EDITTASK");
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
                return BadRequest(new { Message = "Invalid data.", Errors = ModelState.Values.SelectMany(v => v.Errors) });
            }

            TokenStatus status = tokenService.IsTokenValid(token);
            if (status == TokenStatus.NON_EXISTANT)
            {
                Log.Information("Access denied for invalid token in EditColumn: {token}", token);
                return Unauthorized(new { Message = "This token does not exist!" });
            }
            if (status == TokenStatus.EXPIRED)
            {
                Log.Information("Access denied for expired token in EditColumn: {token}", token);
                return Unauthorized(new { Message = "This token has expired!" });
            }

            AuthToken authToken = _dbContext.Tokens.Find(token);
            int userID = authToken.UserID;

            int? ownerID = taskService.FindColumnOwner(updatedColumn.ColumnID);

            if (ownerID is null)
            {
                Log.Warning("column with no owner found task id: {taskID}", updatedColumn.ColumnID);
                return StatusCode(500, new { Message = "The column does not exist!" });
            }
            if (ownerID != userID)
            {
                Log.Information("Access denied to {columnID} for {userID} ownerID: {ownerID}");
                return Unauthorized(new { Message = "You are not the owner of this column!" });
            }

            //this has been null checked before in the FindColumnOwner method
            try
            {
                BoardColumn originalColumn = _dbContext.BoardColumns.Find(updatedColumn.ColumnID);

                string prevName = originalColumn.ColumnName;
                string prevColor = originalColumn.ColumnColor;
                int prevOrder = originalColumn.ColumnOrder;

                originalColumn.ColumnName = updatedColumn.ColumnName;
                originalColumn.ColumnColor = updatedColumn.ColumnColor;
                originalColumn.ColumnOrder = updatedColumn.ColumnOrder;

                _dbContext.SaveChanges();
                Log.Information("ColumnID {columnID} had its properties changed to: name: {columnName} color: {columnColor} order: {columnOrder} from: {oldColumnName} color: {oldColumnColor} order: {oldColumnOrder}", originalColumn.ColumnID, originalColumn.ColumnName, originalColumn.ColumnColor, originalColumn.ColumnOrder, prevName, prevColor, prevOrder);
                return Ok(new { Message = "Column edited succesfully!" });
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
                return BadRequest(new { Message = "Invalid data.", Errors = ModelState.Values.SelectMany(v => v.Errors) });
            }
            TokenStatus status = tokenService.IsTokenValid(token);
            if (status == TokenStatus.NON_EXISTANT)
            {
                Log.Information("Access denied for invalid token in EditBoard: {token}", token);
                return Unauthorized(new { Message = "This token does not exist!" });
            }
            if (status == TokenStatus.EXPIRED)
            {
                Log.Information("Access denied for invalid token in DeleteColumn: {token}", token);
                return Unauthorized(new { Message = "This token has expired!" });
            }

            AuthToken authToken = _dbContext.Tokens.Find(token);
            int userID = authToken.UserID;

            Board? originalBoard = _dbContext.Boards.Find(updatedBoard.BoardID);
            if (originalBoard is null)
            {
                Log.Information("User tried to access non existing board {boardID}", updatedBoard.BoardID);
                return BadRequest(new { Message = "board has not been found!" });
            }

            int ownerID = originalBoard.UserID;
            if (ownerID != userID)
            {
                Log.Warning("Access denied to board {boardID} for user {userID} ownerID {ownerID}", updatedBoard.BoardID, userID, ownerID);
                return Unauthorized(new { Message = "You are not the owner of this board!" });
            }

            try
            {
                originalBoard.BoardName = updatedBoard.BoardName;
                originalBoard.BackgroundColor = updatedBoard.BackgroundColor;

                _dbContext.SaveChanges();
                return Ok(new { Message = "Board updated succesfully!" });
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
                return BadRequest(new { Message = "Invalid data.", Errors = ModelState.Values.SelectMany(v => v.Errors) });
            }
            TokenStatus status = tokenService.IsTokenValid(token);
            if (status == TokenStatus.NON_EXISTANT)
            {
                Log.Information("Access denied for invalid token in GetBoardContents: {token}", token);
                return Unauthorized(new { Message = "This token does not exist!" });
            }
            if (status == TokenStatus.EXPIRED)
            {
                Log.Information("Access denied for expired token in GetBoardContents: {token}", token);
                return Unauthorized(new { Message = "This token has expired!" });
            }

            AuthToken authToken = _dbContext.Tokens.Find(token);
            int userID = authToken.UserID;

            Board? originalBoard = _dbContext.Boards.Find(boardID);
            if (originalBoard is null)
            {
                return BadRequest(new { Message = "Invalid board ID" });
            }

            int ownerID = originalBoard.UserID;
            if (ownerID != userID)
            {
                Log.Warning("Access denied to board {boardID} for user {userID} ownerID {ownerID}");
                return Unauthorized(new { Message = "You don't have access to this board!" });
            }


            return new ObjectResult(new BoardAndContents(_dbContext, originalBoard));
        }
    }
}

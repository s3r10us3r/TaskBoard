using TaskBoardAPI.Models;
using Task = TaskBoardAPI.Models.Task;

namespace TaskBoardAPI.AuthenticationServices
{
    public class TaskService
    {
        private TaskDBContext _dbContext;
        
        public TaskService(TaskDBContext dBContext)
        {
            _dbContext = dBContext;
        }

        public int? FindColumnOwner(int columnID)
        {
            BoardColumn? boardColumn = _dbContext.BoardColumns.Find(columnID);

            if (boardColumn is null)
            {
                throw new ArgumentException("The column provided does not exist!");
            }

            Board? board = _dbContext.Boards.Find(boardColumn.BoardID);

            if (board is null)
            {
                return null;
            }

            int userID = board.UserID;

            return userID;
        }

        public int? FindTaskOwner(int taskID)
        {
            Task? task = _dbContext.Tasks.Find(taskID);

            if (task is null)
            {
                throw new ArgumentException("The task provided does not exist!");
            }

            return FindColumnOwner(task.ColumnID);
        }
    }
}

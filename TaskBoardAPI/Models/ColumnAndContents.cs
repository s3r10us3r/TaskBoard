using Microsoft.EntityFrameworkCore;

namespace TaskBoardAPI.Models
{
    public class ColumnAndContents
    {
        public BoardColumn BoardColumn { get;}
        public List<Task> Tasks { get; }

        public ColumnAndContents(TaskDBContext _dbContext, BoardColumn boardColumn)
        {
            BoardColumn = boardColumn;
            Tasks = [.. _dbContext.Tasks.Where(task => EF.Property<int>(task, "ColumnID") == BoardColumn.ColumnID)];
        }
    }
}

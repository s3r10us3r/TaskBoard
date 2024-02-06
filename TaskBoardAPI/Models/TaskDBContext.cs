using Microsoft.EntityFrameworkCore;

namespace TaskBoardAPI.Models
{
    public class TaskDBContext : DbContext
    {
        public TaskDBContext(DbContextOptions<TaskDBContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<AuthToken> Tokens { get; set; }
        public DbSet<Board> Boards { get; set; }
        public DbSet<BoardColumn> BoardColumns { get; set; }
        public DbSet<Task> Tasks { get; set; }
    }
}

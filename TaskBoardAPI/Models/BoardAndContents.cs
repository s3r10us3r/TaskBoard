﻿using Microsoft.EntityFrameworkCore;

namespace TaskBoardAPI.Models
{
    public class BoardAndContents
    {
        public BoardModelID Board { get; }
        public List<ColumnAndContents> Columns { get; }

        public BoardAndContents(TaskDBContext _dbContext, Board board)
        {
            Board = new BoardModelID(board);

            List<BoardColumn> columns = [.. _dbContext.BoardColumns.Where(column => EF.Property<int>(column, "BoardID") == Board.BoardID)];

            Columns = [.. (from column in columns select new ColumnAndContents(_dbContext, column))];
        }
    }
}

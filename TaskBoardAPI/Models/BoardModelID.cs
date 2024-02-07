using System.ComponentModel.DataAnnotations;

namespace TaskBoardAPI.Models
{
    public class BoardModelID
    {
        public BoardModelID(Board board)
        {
            BoardID = board.BoardID;
            BoardName = board.BoardName;
            BackgroundColor = board.BackgroundColor;
        }

        public BoardModelID() { }

        [Required]
        public int BoardID { get; set; }
        [Required]
        public string BoardName { get; set; }
        [Required]
        public string BackgroundColor { get; set; }
    }
}

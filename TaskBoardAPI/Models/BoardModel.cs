using System.ComponentModel.DataAnnotations;

namespace TaskBoardAPI.Models
{
    public class BoardModel
    {
        [Required]
        [StringLength(50)]
        public string BoardName { get; set; }

        [Required]
        [StringLength(7, MinimumLength = 7)]
        public string BackgroundColor { get; set; }
    }
}

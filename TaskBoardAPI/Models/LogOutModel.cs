using System.ComponentModel.DataAnnotations;

namespace TaskBoardAPI.Models
{
    public class LogOutModel
    {
        [Required]
        public string TokenString { get; set; }
    }
}

using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;

namespace TaskBoardAPI.Models
{
    public class User
    {
        public int UserID { get; set; }
        [Required]
        [StringLength(50, MinimumLength = 8)]
        public string UserName { get; set; }
        [Required]
        [StringLength(50, MinimumLength = 8)]
        public string UserPassword { get; set; }
    }
}

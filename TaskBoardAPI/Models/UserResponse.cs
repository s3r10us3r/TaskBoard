using System.ComponentModel.DataAnnotations;

namespace TaskBoardAPI.Models
{
    public class UserResponse
    {
        [Required]
        public string UserName { get; set; }
    }
}

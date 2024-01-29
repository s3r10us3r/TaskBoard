using System.ComponentModel.DataAnnotations;

namespace TaskBoardAPI.Models
{
    public class AuthToken
    {
        [Key]
        [StringLength(64, MinimumLength = 64)]
        public string Token { get; set; }

        [Required]
        public DateTime GenerationTime { get; set; }

        [Required]
        public int UserID { get; set; }
    }
}

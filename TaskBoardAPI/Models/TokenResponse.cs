using System.ComponentModel.DataAnnotations;

namespace TaskBoardAPI.Models
{
    public class TokenResponse
    {
        [Required]
        public string Token {get; set;}
    }
}

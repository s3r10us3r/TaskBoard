using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TaskBoardAPI.Models
{
    public class BoardColumn
    {
        [Key]
        public int ColumnID { get; set; }
        [ForeignKey("BoardID")]
        [Required]
        public int BoardID { get; set; }
        [Required]
        [StringLength(50)]
        public string ColumnName { get; set; }
        [Required]
        [StringLength(7, MinimumLength = 7)]
        public string ColumnColor { get; set; }
        [Required]
        public int ColumnOrder { get; set; }
    }
}

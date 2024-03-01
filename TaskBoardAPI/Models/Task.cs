using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TaskBoardAPI.Models
{
    public class Task
    {
        [Key]
        public int TaskID { get; set; }
        [Required]
        [ForeignKey("ColumnID")]
        public int ColumnID { get; set; }
        [Required]
        [StringLength(50)]
        public string TaskName { get; set; }
        [StringLength(1000)]
        public string TaskDescription { get; set; }
        [Required]
        [StringLength(7)]
        public string TaskColor { get; set; }
        [Required]
        public int TaskOrder { get; set; }
    }
}

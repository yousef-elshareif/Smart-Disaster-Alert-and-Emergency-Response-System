using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace Models
{
    public class webUser
    {
        [Key]
       public int Id { get; set; }
        public string Name { get; set; }
        public string PassWord { get; set; }
        public bool isAdmin { get; set; }
        [ForeignKey("operationCenter")]
        public int operationCenterId { get; set; }
        public operationCenter operationCenter { get; set; }
    }
}

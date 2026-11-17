using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Models
{
    public class operationCenter
    {
        [Key]
        public int id {  get; set; }
        public string name { get; set; }

        public ICollection<webUser> webUsers { get; set; }
    }
}

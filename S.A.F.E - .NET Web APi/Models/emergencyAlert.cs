using System;
using System.Collections.Generic;
using System.Text;

namespace Models
{
    public class emergencyAlert
    {
        public int alterId {  get; set; }
        public string alterType { get; set; }
        public string title { get; set; }
        public string description { get; set; }
        public string alterStatus { get; set; }
       
        //foreign Key
        public int createdBy { get; set; }
        public DateTime createdAt { get; set; }
        public DateTime startTime { get; set; }
        public DateTime EndTime { get; set; }
        public decimal latitude { get; set; }
        public decimal longitude { get; set; }
    }
}
    
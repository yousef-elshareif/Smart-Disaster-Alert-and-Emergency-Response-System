using System.ComponentModel.DataAnnotations;

namespace Models;

public class User
{
    [Key]
    public int Id { get; set; }
    public string Name { get; set; }
    public int PhoneNum { get; set; }
    public string PassWord { get; set; }

}

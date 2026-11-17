using Microsoft.EntityFrameworkCore;
using Models;

namespace infraStructure;

public class AppDBContext : DbContext
{
    public AppDBContext(DbContextOptions<AppDBContext> options ) : base( options )
    {
        
    }
    public DbSet<User> Users { get; set; }
    public DbSet<webUser> WebUsers { get; set; }
    public DbSet<operationCenter> OperationCenter { get; set; }
}

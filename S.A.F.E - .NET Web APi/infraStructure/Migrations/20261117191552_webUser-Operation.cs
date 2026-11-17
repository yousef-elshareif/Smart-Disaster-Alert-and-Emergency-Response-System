using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace infraStructure.Migrations
{
    /// <inheritdoc />
    public partial class webUserOperation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "OperationCenter",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    name = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OperationCenter", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "WebUsers",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PassWord = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    isAdmin = table.Column<bool>(type: "bit", nullable: false),
                    operationCenterId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WebUsers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WebUsers_OperationCenter_operationCenterId",
                        column: x => x.operationCenterId,
                        principalTable: "OperationCenter",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_WebUsers_operationCenterId",
                table: "WebUsers",
                column: "operationCenterId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "WebUsers");

            migrationBuilder.DropTable(
                name: "OperationCenter");
        }
    }
}

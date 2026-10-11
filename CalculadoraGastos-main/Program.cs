using CalculadoraGastos.Data;
using CalculadoraGastos.Services;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySql(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        ServerVersion.AutoDetect(
            builder.Configuration.GetConnectionString("DefaultConnection")
        )
    ));

builder.Services.AddScoped<Gerenciador>();

var app = builder.Build();

await using (var scope = app.Services.CreateAsyncScope())
{
    var database = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await database.Database.OpenConnectionAsync();

    var connection = database.Database.GetDbConnection();
    await using var command = connection.CreateCommand();
    command.CommandText = """
        SELECT COUNT(*)
        FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'despesas'
          AND COLUMN_NAME = 'data'
        """;

    var hasDateColumn = Convert.ToInt32(await command.ExecuteScalarAsync()) > 0;
    if (!hasDateColumn)
    {
        await database.Database.ExecuteSqlRawAsync(
            "ALTER TABLE despesas ADD COLUMN data DATE NULL");
    }
}

app.UseDefaultFiles();
app.UseStaticFiles();

app.MapControllers();

app.MapFallbackToFile("index.html");

app.Run();
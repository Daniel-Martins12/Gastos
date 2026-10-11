using CalculadoraGastos.Models;
using Microsoft.EntityFrameworkCore;

namespace CalculadoraGastos.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public DbSet<Despesa> Despesas { get; set; }

    public string ObterStringConexao()
    {
        return Database.GetConnectionString() ?? "Conex�o n�o encontrada";
    }
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Despesa>(entity =>
        {
            entity.ToTable("despesas");

            entity.HasKey(d => d.Id);

            entity.Property(d => d.Id)
                .HasColumnName("id")
                .ValueGeneratedOnAdd();

            entity.Property(d => d.Descricao)
                .HasColumnName("descricao")
                .HasMaxLength(150)
                .IsRequired();

            entity.Property(d => d.Valor)
                .HasColumnName("valor")
                .HasPrecision(10, 2)
                .IsRequired();

            entity.Property(d => d.Tipo)
                .HasColumnName("tipo")
                .IsRequired();

            entity.Property(d => d.Categoria)
                .HasColumnName("categoria")
                .HasMaxLength(50)
                .IsRequired();

            entity.Property(d => d.Data)
                .HasColumnName("data")
                .HasColumnType("date");
        });
    }
}

using CalculadoraGastos.Data;
using CalculadoraGastos.Models;
using Microsoft.EntityFrameworkCore;

namespace CalculadoraGastos.Services;

public class Gerenciador
{
    private readonly AppDbContext _context;

    public Gerenciador(AppDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(Despesa despesa)
    {
        _context.Despesas.Add(despesa);

        await _context.SaveChangesAsync();

       
    }

    public async Task<List<Despesa>> ObterTodasAsync()
    {
        return await _context.Despesas
            .OrderBy(d => d.Id)
            .ToListAsync();
    }

    public async Task<bool> RemoverAsync(int id)
    {
        var despesa = await _context.Despesas
            .FirstOrDefaultAsync(d => d.Id == id);

        if (despesa == null)
        {
            return false;
        }

        _context.Despesas.Remove(despesa);

        await _context.SaveChangesAsync();

        return true;
    }

    public async Task<bool> AtualizarDataAsync(int id, DateOnly data)
    {
        var despesa = await _context.Despesas
            .FirstOrDefaultAsync(d => d.Id == id);

        if (despesa == null)
        {
            return false;
        }

        despesa.Data = data;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<decimal> EntradasAsync()
    {
        return await _context.Despesas
            .Where(d => d.Tipo == Tipotrans.Entrou)
            .SumAsync(d => d.Valor);
    }

    public async Task<decimal> SaidasAsync()
    {
        return await _context.Despesas
            .Where(d => d.Tipo == Tipotrans.Saiu)
            .SumAsync(d => d.Valor);
    }

    public async Task<decimal> ObterSaldoAsync()
    {
        var entradas = await EntradasAsync();
        var saidas = await SaidasAsync();

        return entradas - saidas;
    }

    public async Task<Dictionary<string, decimal>> GastosPorCategoriaAsync()
    {
        return await _context.Despesas
            .Where(d => d.Tipo == Tipotrans.Saiu)
            .GroupBy(d => d.Categoria)
            .ToDictionaryAsync(
                g => g.Key,
                g => g.Sum(d => d.Valor)
            );
    }

    public async Task<string> DiagnosticarAsync()
    {
        var saldo = await ObterSaldoAsync();

        if (saldo < 0)
        {
            return "Saldo negativo. Veja esse artigo de como manter sua vida financeira mais organizada";
        }

        if (saldo == 0)
        {
            return "Saldo zerado. Veja aqui dicas de como economizar um pouco mais no final do mês";
        }

        return $"Você economizou R${saldo:N2} esse mês. Veja aqui dicas de como investir seu dinheiro";
    }

    public async Task LimparAsync()
    {
        _context.Despesas.RemoveRange(_context.Despesas);

        await _context.SaveChangesAsync();
    }
}
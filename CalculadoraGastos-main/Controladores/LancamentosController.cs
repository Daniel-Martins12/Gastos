using CalculadoraGastos.Data;
using CalculadoraGastos.Models;
using CalculadoraGastos.Services;
using Microsoft.AspNetCore.Mvc;

namespace CalculadoraGastos.Controllers;

public sealed record AtualizarDataLancamentoRequest(DateOnly Data);

[ApiController]
[Route("api/lancamentos")]
public class LancamentosController : ControllerBase
{
    private readonly Gerenciador _gerenciador;

    public LancamentosController(Gerenciador gerenciador)
    {
        _gerenciador = gerenciador;
    }

    // GET: /api/lancamentos
    [HttpGet]
    public async Task<ActionResult<List<Despesa>>> ObterLancamentos()
    {
        var lancamentos = await _gerenciador.ObterTodasAsync();

        return Ok(lancamentos);
    }

    // POST: /api/lancamentos
    [HttpPost]
    public async Task<ActionResult<Despesa>> Adicionar(
        [FromBody] Despesa despesa)
    {
        if (string.IsNullOrWhiteSpace(despesa.Descricao))
        {
            return BadRequest("A descrição é obrigatória.");
        }

        if (despesa.Valor <= 0)
        {
            return BadRequest("O valor deve ser maior que zero.");
        }

        if (string.IsNullOrWhiteSpace(despesa.Categoria))
        {
            return BadRequest("A categoria é obrigatória.");
        }

        if (despesa.Data is null)
        {
            return BadRequest("A data do lançamento é obrigatória.");
        }

        // O MySQL gera o ID automaticamente
        await _gerenciador.AddAsync(despesa);

        return Ok(despesa);
    }

    [HttpPut("{id:int}/data")]
    public async Task<IActionResult> AtualizarData(
        int id,
        [FromBody] AtualizarDataLancamentoRequest request)
    {
        if (request.Data == default)
        {
            return BadRequest("A data do lançamento é inválida.");
        }

        var atualizado = await _gerenciador.AtualizarDataAsync(id, request.Data);
        if (!atualizado)
        {
            return NotFound("Lançamento não encontrado.");
        }

        return NoContent();
    }

    // DELETE: /api/lancamentos/1
    [HttpDelete("{id}")]
    public async Task<IActionResult> Remover(int id)
    {
        var removido = await _gerenciador.RemoverAsync(id);

        if (!removido)
        {
            return NotFound("Lançamento não encontrado.");
        }

        return NoContent();
    }

    // GET: /api/lancamentos/resumo
    [HttpGet("resumo")]
    public async Task<IActionResult> Resumo()
    {
        var entradas = await _gerenciador.EntradasAsync();
        var saidas = await _gerenciador.SaidasAsync();

        var saldo = entradas - saidas;

        return Ok(new
        {
            income = entradas,
            expense = saidas,
            balance = saldo
        });
    }

    // GET: /api/lancamentos/categorias
    [HttpGet("categorias")]
    public async Task<IActionResult> Categorias()
    {
        var categorias = await _gerenciador.GastosPorCategoriaAsync();

        return Ok(categorias);
    }

    // GET: /api/lancamentos/diagnostico
    [HttpGet("diagnostico")]
    public async Task<IActionResult> Diagnostico()
    {
        var mensagem = await _gerenciador.DiagnosticarAsync();

        return Ok(new
        {
            message = mensagem
        });
    }

    // DELETE: /api/lancamentos
    [HttpDelete]
    public async Task<IActionResult> Limpar()
    {
        await _gerenciador.LimparAsync();

        return NoContent();
    }

}
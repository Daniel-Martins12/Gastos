using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CalculadoraGastos.Models
{


    public enum Tipotrans
    {
        Entrou = 0,
        Saiu = 1
    }

    public class Despesa
    {
        public int Id { get; set; }

        public string Descricao { get; set; } = string.Empty;

        public decimal Valor { get; set; }

        public Tipotrans Tipo { get; set; }

        public string Categoria { get; set; } = string.Empty;

        public DateOnly? Data { get; set; }

        public Despesa()
        {
        }

        public Despesa(
            int id,
            string descricao,
            decimal valor,
            Tipotrans tipo,
            string categoria,
            DateOnly? data = null)
        {
            Id = id;
            Descricao = descricao;
            Valor = valor;
            Tipo = tipo;
            Categoria = categoria;
            Data = data;
        }
    }
}

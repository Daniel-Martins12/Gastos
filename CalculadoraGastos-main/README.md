# Calculadora de Gastos

## Resumo do projeto

A Calculadora de Gastos é uma aplicação web em ASP.NET Core para controlar lançamentos financeiros pessoais. O objetivo principal é facilitar o registro de entradas e saídas, acompanhar o histórico de movimentações e visualizar um resumo mensal para entender melhor o comportamento do orçamento.

A aplicação foi desenvolvida para uso local, com armazenamento em MySQL/MariaDB e foco em organização financeira simples e prática. Ela permite registrar movimentações com data, valor e descrição, além de consultar análises por mês para acompanhar o saldo e identificar padrões de consumo.

## Funcionalidades

- Registro de despesas e outros lançamentos financeiros;
- Controle de data, valor e descrição do movimento;
- Visualização do histórico de registros;
- Resumo mensal para análise do comportamento financeiro;
- Ajuste automático da estrutura da tabela quando a coluna `data` ainda não existe.

## Tecnologias

- ASP.NET Core
- C#
- MySQL/MariaDB
- Razor Pages / MVC (estrutura do projeto)

## Banco de dados local

O projeto usa a instância local do MySQL/MariaDB do XAMPP. Execute o script `codigo_banco.sql` para criar o banco `controle` e a tabela `despesas`.

A senha da conexão fica no .NET User Secrets do usuário do Windows e não é gravada neste repositório. O perfil de execução `CalculadoraGastos` define o ambiente `Development`, necessário para carregar esse segredo.

## Como executar

Na pasta do projeto, rode:

```powershell
dotnet run --project .\CalculadoraGastos.csproj
```

Abra a URL local informada pelo `dotnet run` no navegador. A página inicial apresenta o projeto; use **Meu controle** para registrar lançamentos com data e **Análises** para consultar uma leitura educativa por mês.

Ao iniciar, a aplicação adiciona a coluna `data` à tabela `despesas` caso ela ainda não exista. Lançamentos anteriores permanecem sem uma data presumida e não são incluídos nos totais mensais até que uma data seja informada no próprio lançamento, na tela de controle.

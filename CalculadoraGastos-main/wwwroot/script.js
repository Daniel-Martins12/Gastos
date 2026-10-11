const API_URL = '/api/lancamentos';

const money = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL'
});

function localDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function isCurrentMonth(entry) {
  if (!entry.data) {
    return false;
  }

  const now = new Date();
  const monthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-`;
  return String(entry.data).startsWith(monthPrefix);
}

function formatEntryDate(value) {
  if (!value) {
    return 'Data não informada';
  }

  const [year, month, day] = String(value).split('-').map(Number);
  if (!year || !month || !day) {
    return 'Data inválida';
  }

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(new Date(year, month - 1, day));
}

const icons = {
  Moradia: '⌂',
  Alimentação: '◒',
  Lazer: '✦',
  Transporte: '⌁',
  Saúde: '+',
  Educação: '▤',
  Renda: '↗',
  Outros: '•',
  Trabalho: '↗',
  investimento: '↗'
};

let entries = [];

function renderCurrentDate() {
  const now = new Date();

  document.querySelector('#current-date').textContent =
    new Intl.DateTimeFormat('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long'
    }).format(now).toLocaleUpperCase('pt-BR');

  const period = new Intl.DateTimeFormat('pt-BR', {
    month: 'long',
    year: 'numeric'
  }).format(now);

  document.querySelector('#current-period').textContent =
    period.charAt(0).toLocaleUpperCase('pt-BR') + period.slice(1);
}


// ======================================================
// UTILIDADES
// ======================================================

function escapeHtml(value) {
  return String(value).replace(
    /[&<>'"]/g,
    character => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#039;',
      '"': '&quot;'
    })[character]
  );
}


function showToast(message) {
  const toast = document.querySelector('#toast');

  toast.textContent = message;
  toast.classList.add('show');

  window.setTimeout(() => {
    toast.classList.remove('show');
  }, 2200);
}


function getTotals() {
  return entries.filter(isCurrentMonth).reduce(
    (totals, entry) => {

      if (Number(entry.tipo) === 0) {
        totals.income += Number(entry.valor);
      } else {
        totals.expense += Number(entry.valor);
      }

      return totals;

    },
    {
      income: 0,
      expense: 0
    }
  );
}


// ======================================================
// API
// ======================================================

async function carregarLancamentos() {

  try {

    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error('Não foi possível carregar os lançamentos.');
    }

    entries = await response.json();

    renderAll();

  } catch (error) {

    console.error(error);

    showToast('Erro ao carregar os lançamentos.');

  }
}


async function adicionarLancamento(lancamento) {

  try {

    const response = await fetch(API_URL, {

      method: 'POST',

      headers: {
        'Content-Type': 'application/json'
      },

      body: JSON.stringify(lancamento)

    });

    if (!response.ok) {

      const errorMessage = await response.text();

      throw new Error(
        errorMessage || 'Erro ao adicionar lançamento.'
      );

    }

    const novoLancamento = await response.json();

    entries.push(novoLancamento);

    renderAll();

    showToast('Lançamento adicionado.');
    return true;

  } catch (error) {

    console.error(error);

    showToast(
      error.message || 'Erro ao adicionar lançamento.'
    );
    return false;

  }
}


async function removerLancamento(id) {

  try {

    const response = await fetch(
      `${API_URL}/${id}`,
      {
        method: 'DELETE'
      }
    );

    if (!response.ok) {

      const errorMessage = await response.text();

      throw new Error(
        errorMessage || 'Erro ao remover lançamento.'
      );

    }

    entries = entries.filter(
      entry => Number(entry.id) !== Number(id)
    );

    renderAll();

    showToast('Lançamento removido.');

  } catch (error) {

    console.error(error);

    showToast(
      error.message || 'Erro ao remover lançamento.'
    );

  }
}

async function atualizarDataLancamento(id, data) {
  try {
    const response = await fetch(`${API_URL}/${id}/data`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ data })
    });

    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error(errorMessage || 'Não foi possível atualizar a data.');
    }

    const entry = entries.find(item => Number(item.id) === id);
    if (!entry) {
      throw new Error('O lançamento atualizado não foi encontrado na lista.');
    }

    entry.data = data;
    renderAll();
    showToast('Data do lançamento atualizada.');
  } catch (error) {
    console.error(error);
    showToast(error.message || 'Erro ao atualizar a data.');
  }
}


async function restaurarCenario() {

  try {

    const response = await fetch(
      API_URL,
      {
        method: 'DELETE'
      }
    );

    if (!response.ok) {
      throw new Error(
        'Não foi possível limpar os lançamentos.'
      );
    }

    // Não colocamos IDs aqui.
    // O MySQL vai gerar automaticamente.
    const initialEntries = [

      {
        descricao: 'Salário',
        valor: 3000,
        tipo: 0,
        categoria: 'Renda',
        data: localDateString()
      },

      {
        descricao: 'Renda extra',
        valor: 200,
        tipo: 0,
        categoria: 'Renda',
        data: localDateString()
      },

      {
        descricao: 'Contas',
        valor: 1000,
        tipo: 1,
        categoria: 'Moradia',
        data: localDateString()
      },

      {
        descricao: 'Mercado',
        valor: 600,
        tipo: 1,
        categoria: 'Alimentação',
        data: localDateString()
      },

      {
        descricao: 'Lazer',
        valor: 550,
        tipo: 1,
        categoria: 'Lazer',
        data: localDateString()
      }

    ];


    for (const entry of initialEntries) {

      await fetch(API_URL, {

        method: 'POST',

        headers: {
          'Content-Type': 'application/json'
        },

        body: JSON.stringify(entry)

      });

    }

    await carregarLancamentos();

    showToast('Cenário de teste restaurado.');

  } catch (error) {

    console.error(error);

    showToast(
      'Erro ao restaurar cenário de teste.'
    );

  }
}


// ======================================================
// RESUMO
// ======================================================

function renderSummary() {

  const totals = getTotals();

  const balance =
    totals.income - totals.expense;


  document.querySelector(
    '#balance-value'
  ).textContent = money.format(balance);


  document.querySelector(
    '#income-value'
  ).textContent = money.format(totals.income);


  document.querySelector(
    '#expense-value'
  ).textContent = money.format(totals.expense);


  const message =
    balance > 0
      ? 'Você está no caminho certo.'
      : balance < 0
        ? 'Atenção ao orçamento deste mês.'
        : 'Seu orçamento está no limite.';


  document.querySelector(
    '#balance-message'
  ).textContent = message;


  const trend =
    totals.income > 0
      ? `${Math.round(
        (balance / totals.income) * 100
      )}% livre`
      : '—';


  document.querySelector(
    '#balance-trend'
  ).textContent = trend;


  document.querySelector(
    '.card-kicker'
  ).textContent =
    balance >= 0
      ? '● EM DIA'
      : '● ATENÇÃO';

  const period = new Intl.DateTimeFormat('pt-BR', {
    month: 'long',
    year: 'numeric'
  }).format(new Date());
  const formattedPeriod =
    period.charAt(0).toLocaleUpperCase('pt-BR') + period.slice(1);
  const undatedEntries = entries.filter(entry => !entry.data).length;

  document.querySelector('#period-data-note').textContent =
    undatedEntries
      ? `${formattedPeriod} · ${undatedEntries} lançamento(s) sem data não entram nos totais do mês.`
      : `Resumo de ${formattedPeriod}.`;

}


// ======================================================
// CRIAR HTML DE UM LANÇAMENTO
// ======================================================

function criarLancamentoHtml(entry) {

  const isIncome =
    Number(entry.tipo) === 0;

  return `
    <article class="transaction">

      <span class="transaction-icon ${isIncome ? 'income' : 'expense'}">
        ${icons[entry.categoria] || '•'}
      </span>

      <div>

        <div class="transaction-name">
          ${escapeHtml(entry.descricao)}
        </div>

        <div class="transaction-meta">
          ${escapeHtml(entry.categoria)} · ${escapeHtml(formatEntryDate(entry.data))}
        </div>
        ${entry.data ? '' : `
          <form class="transaction-date-form" data-date-form="${entry.id}">
            <input
              name="date"
              type="date"
              required
              aria-label="Data de ${escapeHtml(entry.descricao)}"
            >
            <button type="submit">Definir data</button>
          </form>
        `}

      </div>

      <strong class="transaction-amount ${isIncome ? 'income' : 'expense'}">
        ${isIncome ? '+' : '-'}
        ${money.format(entry.valor)}
      </strong>

      <button
        class="delete-entry"
        data-delete="${entry.id}"
        type="button"
        aria-label="Excluir ${escapeHtml(entry.descricao)}"
      >
        <span aria-hidden="true">×</span>
        <span>Excluir</span>
      </button>

    </article>
  `;
}


// ======================================================
// ENTRADAS E GASTOS
// ======================================================

function renderTransactions() {

  const entryList =
    document.querySelector('#entry-list');

  const expenseList =
    document.querySelector('#expense-list');

  const emptyEntryState =
    document.querySelector('#empty-entry-state');

  const emptyExpenseState =
    document.querySelector('#empty-expense-state');

  const sortByDate = (first, second) =>
    String(second.data || '').localeCompare(String(first.data || '')) ||
    Number(second.id) - Number(first.id);

  const entriesOnly =
    entries
      .filter(entry => Number(entry.tipo) === 0)
      .slice()
      .sort(sortByDate);

  const expensesOnly =
    entries
      .filter(entry => Number(entry.tipo) === 1)
      .slice()
      .sort(sortByDate);


  // -------------------------
  // ENTRADAS
  // -------------------------

  entryList.innerHTML =
    entriesOnly
      .map(criarLancamentoHtml)
      .join('');


  entryList.hidden =
    entriesOnly.length === 0;


  emptyEntryState.hidden =
    entriesOnly.length > 0;


  // -------------------------
  // GASTOS
  // -------------------------

  expenseList.innerHTML =
    expensesOnly
      .map(criarLancamentoHtml)
      .join('');


  expenseList.hidden =
    expensesOnly.length === 0;


  emptyExpenseState.hidden =
    expensesOnly.length > 0;


  // -------------------------
  // TOTAIS DAS COLUNAS
  // -------------------------

  const incomeTotal =
    entriesOnly.reduce(
      (total, entry) =>
        total + Number(entry.valor),
      0
    );


  const expenseTotal =
    expensesOnly.reduce(
      (total, entry) =>
        total + Number(entry.valor),
      0
    );


  document.querySelector(
    '#entries-total'
  ).textContent =
    money.format(incomeTotal);


  document.querySelector(
    '#expenses-total'
  ).textContent =
    money.format(expenseTotal);

}


// ======================================================
// CATEGORIAS
// ======================================================

function renderCategories() {
  const monthExpenses = entries.filter(
    entry => Number(entry.tipo) === 1 && isCurrentMonth(entry)
  );
  const categories =
    monthExpenses.reduce(
        (result, entry) => {

          const category =
            entry.categoria;


          result[category] =
            (result[category] || 0)
            + Number(entry.valor);


          return result;

        },
        {}
      );


  const sorted =
    Object.entries(categories)
      .sort(
        (a, b) => b[1] - a[1]
      );


  const max =
    sorted[0]?.[1] || 1;


  document.querySelector(
    '#category-chart'
  ).innerHTML = sorted.length

    ? sorted
      .slice(0, 4)
      .map(
        ([category, value]) => `

          <div class="category-row">

            <span>
              ${escapeHtml(category)}
            </span>

            <div class="bar-track">

              <div
                class="bar-fill"
                style="width: ${(value / max) * 100}%"
              ></div>

            </div>

            <strong>
              ${money.format(value)}
            </strong>

          </div>

        `
      )
      .join('')

    : `
      <div class="empty-state">
        <span>◔</span>
        <p>
          Suas despesas aparecerão aqui.
        </p>
      </div>
    `;


  document.querySelector(
    '#category-total'
  ).textContent =
    money.format(
      monthExpenses.reduce((total, entry) => total + Number(entry.valor), 0)
    );

  document.querySelector('.category-panel .period-label').textContent =
    new Intl.DateTimeFormat('pt-BR', {
      month: 'long',
      year: 'numeric'
    }).format(new Date());

}


// ======================================================
// DIAGNÓSTICO
// ======================================================

function renderDiagnosis() {

  const {
    income,
    expense
  } = getTotals();


  const balance =
    income - expense;


  const title =
    document.querySelector(
      '#diagnosis-title'
    );


  const copy =
    document.querySelector(
      '#diagnosis-copy'
    );


  if (balance < 0) {

    title.textContent =
      'Seu orçamento precisa de espaço.';

    copy.textContent =
      'As saídas superaram as entradas. ' +
      'Reveja as despesas variáveis e crie ' +
      'um plano simples para reorganizar suas dívidas.';

  }

  else if (balance === 0) {

    title.textContent =
      'Seu orçamento chegou ao limite.';

    copy.textContent =
      'Entradas e saídas estão equilibradas. ' +
      'Pequenos ajustes nas despesas do dia a dia ' +
      'podem abrir espaço para uma reserva.';

  }

  else if (income > 0) {

    title.textContent =
      'Você está construindo uma boa margem.';

    copy.textContent =
      `Depois das despesas, ${money.format(balance)} ficaram livres. ` +
      'Este é um bom momento para começar uma reserva ' +
      'ou conhecer opções de investimento.';

  }

  else {

    title.textContent =
      'Vamos entender seu momento.';

    copy.textContent =
      'Registre seus movimentos para receber ' +
      'uma leitura simples e prática da sua saúde financeira.';

  }

}


// ======================================================
// RENDERIZAÇÃO
// ======================================================

function renderAll() {

  renderSummary();

  renderTransactions();

  renderCategories();

  renderDiagnosis();

}


// ======================================================
// FORMULÁRIO
// ======================================================

document
  .querySelector('#entry-form')
  .addEventListener(
    'submit',
    async event => {

      event.preventDefault();


      const form =
        event.currentTarget;


      const data =
        new FormData(form);


      const lancamento = {

        descricao:
          data.get('description')
            .trim(),

        data:
          String(data.get('date')),

        valor:
          Number(
            data.get('value')
          ),

        tipo:
          Number(
            data.get('type')
          ),

        categoria:
          data.get('category')

      };


      if (
        !lancamento.descricao ||
        !lancamento.data ||
        lancamento.valor <= 0
      ) {

        showToast(
          'Preencha os dados corretamente.'
        );

        return;

      }


      const adicionado = await adicionarLancamento(
        lancamento
      );

      if (adicionado) {
        form.reset();
        form.querySelector('[name="date"]').value = localDateString();
      }

    }
  );


// ======================================================
// EXCLUSÃO
// ======================================================

// Como agora existem duas listas,
// usamos o container principal.
document
  .querySelector('#lancamentos')
  .addEventListener(
    'click',
    event => {

      const button =
        event.target.closest(
          '[data-delete]'
        );


      if (!button) {
        return;
      }


      const id =
        Number(
          button.dataset.delete
        );


      const entry = entries.find(item => Number(item.id) === id);
      const description = entry?.descricao || 'este lançamento';

      if (window.confirm(`Deseja excluir "${description}"?`)) {
        removerLancamento(id);
      }

    }
  );

document
  .querySelector('#lancamentos')
  .addEventListener('submit', event => {
    const form = event.target.closest('[data-date-form]');
    if (!form) {
      return;
    }

    event.preventDefault();
    const date = form.querySelector('[name="date"]').value;
    if (!date) {
      return;
    }

    atualizarDataLancamento(Number(form.dataset.dateForm), date);
  });


// ======================================================
// SCROLL PARA FORMULÁRIO
// ======================================================

document
  .querySelectorAll('[data-scroll-form]')
  .forEach(button => {

    button.addEventListener(
      'click',
      () => {

        document
          .querySelector(
            '#novo-lancamento'
          )
          .scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });

      }
    );

  });


// ======================================================
// RESTAURAR DADOS
// ======================================================

document
  .querySelector('#reset-data')
  .addEventListener(
    'click',
    restaurarCenario
  );


// ======================================================
// INICIALIZAÇÃO
// ======================================================

renderCurrentDate();
document.querySelector('#entry-form [name="date"]').value = localDateString();
carregarLancamentos();
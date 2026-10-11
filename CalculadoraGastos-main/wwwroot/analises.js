const ANALYSIS_API_URL = '/api/lancamentos';

const analysisMoney = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL'
});

const analysisElements = {
  period: document.querySelector('#analysis-period'),
  periodLabel: document.querySelector('#analysis-period-label'),
  income: document.querySelector('#analysis-income'),
  incomeCount: document.querySelector('#analysis-entry-count'),
  expense: document.querySelector('#analysis-expense'),
  expenseCount: document.querySelector('#analysis-expense-count'),
  balance: document.querySelector('#analysis-balance'),
  status: document.querySelector('#analysis-status'),
  statusLabel: document.querySelector('#analysis-status-label'),
  statusTitle: document.querySelector('#analysis-status-title'),
  statusCopy: document.querySelector('#analysis-status-copy'),
  tipsIntro: document.querySelector('#analysis-tips-intro'),
  tipsList: document.querySelector('#analysis-tips-list'),
  categories: document.querySelector('#analysis-categories'),
  categoryNote: document.querySelector('#analysis-category-note'),
  undatedNote: document.querySelector('#analysis-undated-note'),
  error: document.querySelector('#analysis-error'),
  errorMessage: document.querySelector('#analysis-error-message'),
  retry: document.querySelector('#analysis-retry')
};

function localDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function monthString(date = new Date()) {
  return localDateString(date).slice(0, 7);
}

async function fetchEntries() {
  const response = await fetch(ANALYSIS_API_URL);

  if (!response.ok) {
    const details = await response.text();
    throw new Error(details || `A solicitação falhou (HTTP ${response.status}).`);
  }

  const entries = await response.json();
  if (!Array.isArray(entries)) {
    throw new Error('A API retornou lançamentos em um formato inesperado.');
  }
  return entries;
}

function formatMoney(value) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    throw new Error('A API retornou um valor financeiro inválido.');
  }
  return analysisMoney.format(numericValue);
}

function formatMonth(value) {
  const [year, month] = value.split('-').map(Number);
  if (!year || !month || month > 12) {
    throw new Error('Selecione um mês válido.');
  }
  const name = new Intl.DateTimeFormat('pt-BR', {
    month: 'long',
    year: 'numeric'
  }).format(new Date(year, month - 1, 1));
  return name.charAt(0).toLocaleUpperCase('pt-BR') + name.slice(1);
}

function makeTip(title, text) {
  const item = document.createElement('article');
  item.className = 'analysis-tip';

  const marker = document.createElement('span');
  marker.className = 'analysis-tip-marker';
  marker.setAttribute('aria-hidden', 'true');
  marker.textContent = '→';

  const content = document.createElement('div');
  const heading = document.createElement('h3');
  heading.textContent = title;
  const description = document.createElement('p');
  description.textContent = text;

  content.append(heading, description);
  item.append(marker, content);
  return item;
}

function renderTips(balance, hasPeriodEntries) {
  analysisElements.tipsList.replaceChildren();

  if (!hasPeriodEntries) {
    analysisElements.status.dataset.tone = 'neutral';
    analysisElements.statusLabel.textContent = 'SEM MOVIMENTAÇÕES NO PERÍODO';
    analysisElements.statusTitle.textContent = 'Não há lançamentos com data neste mês.';
    analysisElements.statusCopy.textContent =
      'Escolha outro mês ou registre as movimentações com as datas correspondentes para acompanhar o período.';
    analysisElements.tipsIntro.textContent =
      'Sem movimentações datadas no mês selecionado, não é possível classificar o resultado. Você pode:';
    analysisElements.tipsList.append(
      makeTip('Revise o mês selecionado', 'Selecione outro mês no campo de período para consultar dados já registrados.'),
      makeTip('Registre com a data correta', 'Inclua lançamentos do mês para que totais, categorias e orientações reflitam esse período.')
    );
    return;
  }

  if (balance < 0) {
    analysisElements.status.dataset.tone = 'caution';
    analysisElements.statusLabel.textContent = 'ATENÇÃO AO PERÍODO';
    analysisElements.statusTitle.textContent = 'As saídas superam as entradas neste mês.';
    analysisElements.statusCopy.textContent =
      'Esse resultado merece uma revisão cuidadosa, mas não informa sozinho sua situação financeira atual.';
    analysisElements.tipsIntro.textContent =
      'Antes de pensar em investir, concentre-se em entender o orçamento e as obrigações financeiras:';
    analysisElements.tipsList.append(
      makeTip('Revise seus lançamentos', 'Confira valores, categorias e datas e procure despesas que possam ser planejadas ou renegociadas.'),
      makeTip('Priorize compromissos e dívidas', 'Liste vencimentos, juros e valores em aberto. Se precisar, busque orientação gratuita de órgãos de defesa do consumidor.'),
      makeTip('Acompanhe os próximos meses', 'Compare períodos completos e registre as movimentações com as datas correspondentes para identificar mudanças.')
    );
    return;
  }

  if (balance === 0) {
    analysisElements.status.dataset.tone = 'balanced';
    analysisElements.statusLabel.textContent = 'CENÁRIO EQUILIBRADO';
    analysisElements.statusTitle.textContent = 'Entradas e saídas ficaram iguais neste mês.';
    analysisElements.statusCopy.textContent =
      'O resultado do período está equilibrado; isso não confirma que há dinheiro disponível neste momento.';
    analysisElements.tipsIntro.textContent =
      'O próximo passo pode ser entender melhor o fluxo e, quando possível, construir uma margem:';
    analysisElements.tipsList.append(
      makeTip('Observe as categorias', 'Revise como as saídas se distribuíram no mês e confirme se os lançamentos estão completos.'),
      makeTip('Planeje uma margem gradual', 'Se couber no seu orçamento, defina um objetivo pequeno e realista para separar parte das próximas entradas.'),
      makeTip('Compare períodos equivalentes', 'Acompanhe os próximos meses para perceber mudanças sem confundir um mês isolado com uma tendência.')
    );
    return;
  }

  analysisElements.status.dataset.tone = 'positive';
  analysisElements.statusLabel.textContent = 'RESULTADO POSITIVO NO PERÍODO';
  analysisElements.statusTitle.textContent = 'As entradas superam as saídas neste mês.';
  analysisElements.statusCopy.textContent =
    'É um resultado positivo no período, mas não comprova que essa diferença esteja disponível hoje.';
  analysisElements.tipsIntro.textContent =
    'Use esse dado como ponto de partida para planejar, não como indicação automática de investimento:';
  analysisElements.tipsList.append(
    makeTip('Confirme sua situação atual', 'Considere contas a pagar, dívidas e despesas futuras antes de decidir o que fazer com qualquer valor.'),
    makeTip('Defina objetivos e prazos', 'Organizar prioridades e horizonte de tempo ajuda a avaliar quais opções educativas fazem sentido estudar.'),
    makeTip('Conheça liquidez e riscos', 'Antes de qualquer decisão, aprenda como funcionam prazo de resgate, riscos, custos e proteção de cada alternativa.')
  );
}

function renderCategories(entries) {
  const categories = entries
    .filter(entry => Number(entry.tipo) === 1)
    .reduce((totals, entry) => {
      const category = String(entry.categoria || 'Outros');
      totals[category] = (totals[category] || 0) + Number(entry.valor);
      return totals;
    }, {});

  const sorted = Object.entries(categories)
    .filter(([, value]) => Number.isFinite(value) && value >= 0)
    .sort((first, second) => second[1] - first[1]);

  analysisElements.categories.replaceChildren();

  if (sorted.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'analysis-muted';
    empty.textContent = 'Não há saídas registradas neste período.';
    analysisElements.categories.append(empty);
    analysisElements.categoryNote.textContent = '';
    return;
  }

  const maximum = Math.max(...sorted.map(([, value]) => value));
  for (const [name, value] of sorted) {
    const row = document.createElement('div');
    row.className = 'analysis-category-row';

    const label = document.createElement('div');
    label.className = 'analysis-category-label';
    const title = document.createElement('span');
    title.textContent = name;
    const amount = document.createElement('strong');
    amount.textContent = formatMoney(value);
    label.append(title, amount);

    const track = document.createElement('div');
    track.className = 'analysis-category-track';
    track.setAttribute('role', 'img');
    track.setAttribute('aria-label', `${name}: ${formatMoney(value)}`);
    const bar = document.createElement('span');
    bar.style.width = `${maximum > 0 ? Math.max((value / maximum) * 100, 2) : 0}%`;
    track.append(bar);

    row.append(label, track);
    analysisElements.categories.append(row);
  }

  const [largestName, largestValue] = sorted[0];
  analysisElements.categoryNote.textContent =
    `Maior total de saídas do mês: ${largestName} (${formatMoney(largestValue)}). Isso é apenas uma observação, não uma recomendação de corte.`;
}

function showError(error) {
  console.error('Falha ao carregar a análise educativa:', error);
  analysisElements.errorMessage.textContent =
    error instanceof Error ? error.message : 'Ocorreu um erro inesperado.';
  analysisElements.error.hidden = false;
  analysisElements.statusLabel.textContent = 'NÃO FOI POSSÍVEL ATUALIZAR';
  analysisElements.statusTitle.textContent = 'Seus dados não foram carregados.';
  analysisElements.statusCopy.textContent =
    'Verifique se a aplicação está em execução e tente novamente.';
}

async function loadAnalysis() {
  analysisElements.error.hidden = true;
  analysisElements.statusLabel.textContent = 'SUA LEITURA';
  analysisElements.statusTitle.textContent = 'Carregando suas movimentações...';
  analysisElements.statusCopy.textContent = 'Estamos organizando os lançamentos do período.';

  try {
    const selectedMonth = analysisElements.period.value;
    const monthLabel = formatMonth(selectedMonth);
    const allEntries = await fetchEntries();
    const datedEntries = allEntries.filter(entry => entry.data);
    const periodEntries = datedEntries.filter(
      entry => String(entry.data).startsWith(`${selectedMonth}-`)
    );
    const incomeEntries = periodEntries.filter(entry => Number(entry.tipo) === 0);
    const expenseEntries = periodEntries.filter(entry => Number(entry.tipo) === 1);
    const income = incomeEntries.reduce((total, entry) => total + Number(entry.valor), 0);
    const expense = expenseEntries.reduce((total, entry) => total + Number(entry.valor), 0);

    if (![income, expense].every(Number.isFinite)) {
      throw new Error('A API retornou um valor financeiro inválido.');
    }

    analysisElements.periodLabel.textContent = monthLabel.toLocaleUpperCase('pt-BR');
    analysisElements.income.textContent = formatMoney(income);
    analysisElements.incomeCount.textContent =
      `${incomeEntries.length} lançamento(s) no período`;
    analysisElements.expense.textContent = formatMoney(expense);
    analysisElements.expenseCount.textContent =
      `${expenseEntries.length} lançamento(s) no período`;
    analysisElements.balance.textContent = formatMoney(income - expense);
    analysisElements.balance.classList.toggle('positive', income > expense);
    analysisElements.balance.classList.toggle('negative', income < expense);

    const undatedCount = allEntries.filter(entry => !entry.data).length;
    analysisElements.undatedNote.textContent = undatedCount
      ? `${undatedCount} lançamento(s) antigo(s) não têm data e não entram na análise mensal. Eles continuam visíveis no controle.`
      : '';

    renderTips(income - expense, periodEntries.length > 0);
    renderCategories(expenseEntries);
  } catch (error) {
    showError(error);
  }
}

analysisElements.period.value = monthString();
analysisElements.period.addEventListener('change', loadAnalysis);
analysisElements.retry.addEventListener('click', loadAnalysis);
loadAnalysis();

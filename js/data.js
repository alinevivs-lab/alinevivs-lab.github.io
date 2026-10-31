/* Dados ilustrativos do Panorama do dia (31/10/2026). */

const INDICES = [
  { id: "ibov", market: "Brasil · B3", name: "Ibovespa", value: 146318, dec: 0, day: 0.84, ytd: 9.4, y12: 24.07, seed: 7 },
  { id: "spx", market: "EUA · NYSE", name: "S&P 500", value: 6812.55, dec: 2, day: -0.21, ytd: 28.9, y12: 45.5, seed: 21 },
  { id: "ndx", market: "EUA · Nasdaq", name: "Nasdaq Composite", value: 23541.10, dec: 2, day: -0.47, ytd: -22.9, y12: -20.9, seed: 33 },
];

const FX = [
  { pair: "USD/BRL", name: "Dólar americano", value: 5.3842, day: -0.36, m30: -1.8, seed: 3 },
  { pair: "EUR/BRL", name: "Euro", value: 6.2471, day: 0.12, m30: 0.9, seed: 5 },
  { pair: "GBP/BRL", name: "Libra esterlina", value: 7.1206, day: -0.08, m30: -0.6, seed: 8 },
  { pair: "CNY/BRL", name: "Yuan chinês", value: 0.7561, day: -0.29, m30: 1.4, seed: 11 },
  { pair: "JPY/BRL", name: "Iene japonês", value: 0.0353, day: 0.41, m30: -2.1, seed: 13 },
  { pair: "EUR/USD", name: "Euro em dólar", value: 1.1603, day: 0.47, m30: 1.1, seed: 17 },
];

const FUNDS = [
  { name: "Batuca Ações FIC FIA", cls: "Ações", bench: "Ibovespa", m: 1.42, ytd: 19.6, y12: 22.4, y24: 31.8, pl: "R$ 2,4 bi", seed: 41 },
  { name: "Batuca Institucional FIC FIA", cls: "Ações", bench: "Ibovespa", m: 1.18, ytd: 17.3, y12: 20.1, y24: 28.5, pl: "R$ 1,1 bi", seed: 43 },
  { name: "Batuca Equity Hedge FIC FIM", cls: "Multimercado", bench: "CDI", m: 1.06, ytd: 13.8, y12: 16.2, y24: 29.4, pl: "R$ 612 mi", seed: 47 },
  { name: "Batuca Long Biased FIC FIM", cls: "Multimercado", bench: "Ibovespa", m: -0.34, ytd: 11.2, y12: 13.5, y24: 22.9, pl: "R$ 438 mi", seed: 53 },
  { name: "Batuca Infra Income FIC FI-Infra", cls: "Infraestrutura", bench: "IMA-B", m: 0.92, ytd: 10.4, y12: 12.7, y24: 24.1, pl: "R$ 905 mi", seed: 59 },
];

/* Retorno de 12 meses de cada benchmark, usado no gráfico comparativo. */
const BENCH_12M = { "Ibovespa": 17.9, "CDI": 14.1, "IMA-B": 9.6 };

const RATES = [
  { country: "Brasil", bank: "Banco Central do Brasil · Selic", rate: 14.50, cpi: 4.82, last: "Manteve" },
  { country: "Estados Unidos", bank: "Federal Reserve · Fed Funds (teto)", rate: 4.00, cpi: 2.90, last: "−0,25" },
  { country: "China", bank: "Banco Popular da China · LPR 1 ano", rate: 3.00, cpi: 0.20, last: "Manteve" },
  { country: "Zona do Euro", bank: "BCE · Depósito", rate: 2.00, cpi: 2.10, last: "Manteve" },
  { country: "Reino Unido", bank: "Bank of England · Bank Rate", rate: 3.75, cpi: 3.60, last: "−0,25" },
  { country: "Suíça", bank: "SNB · Taxa básica", rate: 0.00, cpi: 0.30, last: "Manteve" },
  { country: "Suécia", bank: "Riksbank · Policy rate", rate: 1.75, cpi: 1.00, last: "Manteve" },
];

const NEWS_CATS = ["Todas", "Brasil", "Mercados", "Mundo", "Política monetária"];

const NEWS = [
  {
    time: "08:05", cat: "Política monetária",
    title: "Copom mantém Selic e reforça vigilância sobre inflação de serviços",
    summary: "Comunicado indica que o comitê seguirá dependente de dados e destaca expectativas ainda acima da meta.",
    body: "A decisão foi unânime. O colegiado avaliou que o hiato do produto segue positivo e que a desinflação de bens não compensa a resiliência dos serviços. A curva de juros reagiu com leve alta nos vértices intermediários.",
  },
  {
    time: "09:40", cat: "Mercados",
    title: "Ibovespa abre em alta com avanço de commodities e fluxo estrangeiro",
    summary: "Petróleo e minério sustentam os ganhos; investidores acompanham a temporada de resultados do terceiro trimestre.",
    body: "Vale e Petrobras respondem por boa parte da alta na abertura. O saldo de capital externo na B3 acumula entrada pela quarta sessão consecutiva, segundo dados preliminares.",
  },
  {
    time: "10:15", cat: "Mundo",
    title: "Banco Popular da China mantém taxas de referência",
    summary: "LPR de um e cinco anos ficam estáveis enquanto Pequim avalia novos estímulos fiscais ao consumo.",
    body: "A manutenção era esperada pelo consenso. Analistas apontam que o espaço para cortes adicionais depende da estabilidade do yuan e da recuperação do mercado imobiliário.",
  },
  {
    time: "11:02", cat: "Mundo",
    title: "BCE sinaliza pausa prolongada após dados de atividade na Zona do Euro",
    summary: "Dirigentes avaliam que a inflação está próxima da meta e que o nível atual dos juros é adequado.",
    body: "Os índices de gerentes de compras vieram próximos de 50 pontos, sugerindo estabilidade da atividade. O mercado reduziu as apostas em novos cortes até meados do próximo ano.",
  },
  {
    time: "12:30", cat: "Mercados",
    title: "Nasdaq recua com realização de lucros em tecnologia",
    summary: "Papéis de semicondutores lideram as perdas após forte alta acumulada no mês.",
    body: "O movimento é visto como técnico. Resultados das grandes empresas de tecnologia, previstos para a próxima semana, devem orientar a direção do índice.",
  },
  {
    time: "13:45", cat: "Brasil",
    title: "Arrecadação federal cresce acima da inflação em setembro",
    summary: "Receitas com IR e contribuições sociais explicam a maior parte do avanço em relação ao ano anterior.",
    body: "No acumulado do ano, a arrecadação mostra crescimento real. O resultado reforça a leitura de cumprimento da meta fiscal, embora as despesas obrigatórias sigam pressionadas.",
  },
];

/* Traduções dos rótulos fixos (PT | EN). */
const I18N = {
  en: {
    "nav.newsletter": "Newsletter",
    "hero.title": "Market overview",
    "hero.lead": "Indices, funds, FX, rates and the news that move markets.",
    "sec.indices": "Indices", "sec.cambio": "FX", "sec.fundos": "Fund performance",
    "sec.juros": "Interest rates", "sec.noticias": "Today's news",
    "desc.indices": "Brazilian and US equities. Select an index to see its performance over the period.",
    "desc.cambio": "Main currencies against the real, with daily and 30-day change.",
    "desc.fundos": "Returns net of fees, up to the last business day. Select a fund to compare it with its benchmark.",
    "desc.juros": "Each central bank's policy rate, 12-month inflation and the resulting real rate.",
    "desc.noticias": "October 31. Picked by our research team and updated throughout the day.",
    "desc.newsletter": "Market close and our management team's view, straight to your inbox.",
    "th.fundo": "Fund", "th.classe": "Class", "th.mes": "Month", "th.ano": "YTD",
    "th.12m": "12 months", "th.24m": "24 months", "th.pl": "AUM",
    "th.pais": "Country", "th.taxa": "Rate", "th.inflacao": "12m inflation",
    "th.real": "Real rate", "th.decisao": "Last decision",
    "kpi.fundo": "Fund, 12 months", "kpi.ibov": "Benchmark, 12 months", "lg.fundo": "Fund",
    "nl.freq": "Frequency", "nl.diaria": "Daily", "nl.semanal": "Weekly", "nl.assinar": "Subscribe",
    "ft.mercados": "Markets", "ft.fundos": "Funds", "ft.gestoras": "Managers", "ft.contato": "Contact",
    "disclaimer": "The information on this site is for informational purposes only and does not constitute an offer to buy or sell fund shares or any securities. Past performance is no guarantee of future results. Returns shown are gross of taxes. Investment funds are not guaranteed by the administrator, the manager, any insurance mechanism or the Credit Guarantee Fund (FGC). Read the fund's regulation and fact sheet before investing. Market, fund and news data shown on this page are illustrative.",
  },
};

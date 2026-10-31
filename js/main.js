/* Batuca · Panorama do dia: renderização das seções e interações. */
(function () {
  "use strict";

  const TODAY = new Date(2026, 9, 31);
  const MINUS = "−";
  const MONTHS = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
  const $ = (s, r = document) => r.querySelector(s);
  const el = (tag, cls, html) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  };

  // ---------- Formatação pt-BR ----------
  const num = (v, dec = 2) =>
    Math.abs(v).toLocaleString("pt-BR", { minimumFractionDigits: dec, maximumFractionDigits: dec });
  const signed = (v, dec = 2, suffix = "%") =>
    (v > 0 ? "+" : v < 0 ? MINUS : "") + num(v, dec) + suffix;
  const tone = (v) => (v > 0 ? "pos" : v < 0 ? "neg" : "flat");
  const value = (v, dec) => (v < 0 ? MINUS : "") + num(v, dec);
  const monthLabel = (d) => MONTHS[d.getMonth()] + "/" + String(d.getFullYear()).slice(2);
  const dayLabel = (d) => String(d.getDate()).padStart(2, "0") + "/" + MONTHS[d.getMonth()];

  // ---------- Séries ilustrativas ----------
  function rng(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /** Passeio aleatório que começa em `start` e termina exatamente em `end`. */
  function walk(n, start, end, seed, vol = 0.06) {
    const r = rng(seed);
    const w = [0];
    for (let i = 1; i < n; i++) w.push(w[i - 1] + (r() - 0.5));
    const span = Math.max(...w) - Math.min(...w) || 1;
    const amp = Math.max(Math.abs(start), Math.abs(end)) * vol;
    return w.map((x, i) => {
      const t = i / (n - 1);
      const bridge = x - w[0] - (w[n - 1] - w[0]) * t;
      return start + (end - start) * t + (bridge / span) * amp;
    });
  }

  const dateAt = (i, n, days) => new Date(TODAY.getTime() - (n - 1 - i) * (days / (n - 1)) * 864e5);

  // ---------- Gráfico de linhas em SVG ----------
  const NS = "http://www.w3.org/2000/svg";
  function svgEl(tag, attrs) {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }

  /**
   * opts: series [{data, color, width}], dates [Date], xLabel(d), yFmt(v),
   *       tipFmt(i) -> string, gridColor, ticks (rótulos no eixo x)
   */
  function lineChart(host, opts) {
    host.innerHTML = "";
    const W = host.clientWidth, H = host.clientHeight;
    const pad = { t: 10, r: 58, b: 26, l: 0 };
    const all = opts.series.flatMap((s) => s.data);
    let lo = Math.min(...all), hi = Math.max(...all);
    const m = (hi - lo) * 0.08 || 1;
    lo -= m; hi += m;
    const n = opts.series[0].data.length;
    const x = (i) => pad.l + (i / (n - 1)) * (W - pad.l - pad.r);
    const y = (v) => pad.t + (1 - (v - lo) / (hi - lo)) * (H - pad.t - pad.b);

    const svg = svgEl("svg", { viewBox: `0 0 ${W} ${H}`, role: "img", "aria-label": opts.label || "Gráfico" });

    // três linhas de grade com rótulo à direita
    for (let k = 1; k <= 3; k++) {
      const v = lo + ((hi - lo) * k) / 4;
      svg.appendChild(svgEl("line", { x1: pad.l, x2: W - pad.r + 6, y1: y(v), y2: y(v), stroke: opts.gridColor, "stroke-width": 1 }));
      const t = svgEl("text", { x: W, y: y(v) + 3, "text-anchor": "end" });
      t.textContent = opts.yFmt(v);
      svg.appendChild(t);
    }

    // rótulos do eixo x
    const ticks = opts.ticks || 3;
    for (let k = 0; k < ticks; k++) {
      const i = Math.round((k / (ticks - 1)) * (n - 1));
      const anchor = k === 0 ? "start" : k === ticks - 1 ? "end" : "middle";
      const t = svgEl("text", { x: k === ticks - 1 ? W - pad.r : x(i), y: H - 6, "text-anchor": anchor });
      t.textContent = opts.xLabel(opts.dates[i]);
      svg.appendChild(t);
    }

    opts.series.forEach((s) => {
      const d = s.data.map((v, i) => (i ? "L" : "M") + x(i).toFixed(1) + " " + y(v).toFixed(1)).join("");
      svg.appendChild(svgEl("path", { d, fill: "none", stroke: s.color, "stroke-width": s.width || 1.5, "stroke-linejoin": "round" }));
    });

    // interação: linha vertical + dica
    const guide = svgEl("line", { y1: pad.t, y2: H - pad.b, stroke: opts.series[0].color, "stroke-width": 1, opacity: 0 });
    const dots = opts.series.map((s) => {
      const c = svgEl("circle", { r: 3, fill: s.color, opacity: 0 });
      svg.appendChild(c);
      return c;
    });
    svg.appendChild(guide);
    const tip = el("div", "chart__tip");
    host.append(svg, tip);

    function move(ev) {
      const box = svg.getBoundingClientRect();
      const px = (ev.touches ? ev.touches[0].clientX : ev.clientX) - box.left;
      const i = Math.max(0, Math.min(n - 1, Math.round(((px - pad.l) / (W - pad.l - pad.r)) * (n - 1))));
      guide.setAttribute("x1", x(i)); guide.setAttribute("x2", x(i)); guide.setAttribute("opacity", 0.5);
      dots.forEach((c, k) => {
        c.setAttribute("cx", x(i)); c.setAttribute("cy", y(opts.series[k].data[i])); c.setAttribute("opacity", 1);
      });
      tip.innerHTML = opts.tipFmt(i);
      tip.style.display = "block";
      tip.style.left = Math.min(Math.max(x(i), 70), W - 70) + "px";
      tip.style.top = Math.min(...opts.series.map((s) => y(s.data[i]))) - 10 + "px";
    }
    function leave() {
      guide.setAttribute("opacity", 0);
      dots.forEach((c) => c.setAttribute("opacity", 0));
      tip.style.display = "none";
    }
    svg.addEventListener("mousemove", move);
    svg.addEventListener("touchmove", move, { passive: true });
    svg.addEventListener("mouseleave", leave);
    svg.addEventListener("touchend", leave);
  }

  function sparkline(data, color) {
    const W = 200, H = 40;
    const lo = Math.min(...data), hi = Math.max(...data);
    const d = data.map((v, i) =>
      (i ? "L" : "M") + ((i / (data.length - 1)) * W).toFixed(1) + " " + (3 + (1 - (v - lo) / (hi - lo || 1)) * (H - 6)).toFixed(1)
    ).join("");
    return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true"><path d="${d}" fill="none" stroke="${color}" stroke-width="1.2" vector-effect="non-scaling-stroke"/></svg>`;
  }

  // ---------- Destaque ----------
  function renderHeroArt() {
    const svg = $("#heroArt");
    const r = rng(99);
    let x = -20;
    while (x < 1220) {
      const w = 70 + r() * 110, h = 200 + r() * 360, top = 600 - h;
      const g = svgEl("g", { stroke: "#768E9B", "stroke-width": 1, fill: "none" });
      g.appendChild(svgEl("rect", { x, y: top, width: w, height: h + 2 }));
      const rows = Math.floor(h / (18 + r() * 10));
      for (let k = 1; k < rows; k++) {
        const yy = top + (h / rows) * k;
        g.appendChild(svgEl("line", { x1: x, x2: x + w, y1: yy, y2: yy, opacity: 0.45 }));
      }
      const cols = 2 + Math.floor(r() * 4);
      for (let k = 1; k < cols; k++) {
        const xx = x + (w / cols) * k;
        g.appendChild(svgEl("line", { x1: xx, x2: xx, y1: top, y2: 600, opacity: 0.3 }));
      }
      svg.appendChild(g);
      x += w + 8 + r() * 30;
    }
    const d = TODAY.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    $("#heroDate").textContent = d.charAt(0).toUpperCase() + d.slice(1);
  }

  function renderTicker() {
    const items = [
      ...INDICES.map((i) => [i.name, value(i.value, i.dec), i.day]),
      ...FX.slice(0, 4).map((f) => [f.pair, value(f.value, 4), f.day]),
      ["Selic", num(RATES[0].rate) + "%", 0],
    ];
    const html = items.map(([n, v, d]) =>
      `<span class="ticker__item"><span class="n">${n}</span><span>${v}</span>${d ? `<span class="${tone(d)}">${signed(d)}</span>` : ""}</span>`
    ).join("");
    $("#ticker").innerHTML = html + html; // duplicado para o loop contínuo
  }

  // ---------- Índices ----------
  const idxState = { id: "ibov", range: "12M" };
  const idxSeries = {};
  INDICES.forEach((i) => {
    const start = i.value / (1 + i.y12 / 100);
    idxSeries[i.id] = walk(252, start, i.value, i.seed, 0.16);
  });

  function renderIdxCards() {
    const box = $("#idxCards");
    box.innerHTML = "";
    INDICES.forEach((i) => {
      const b = el("button", "idx-card" + (i.id === idxState.id ? " is-on" : ""));
      b.type = "button";
      b.setAttribute("role", "tab");
      b.setAttribute("aria-selected", i.id === idxState.id);
      b.innerHTML = `
        <div class="idx-card__mk">${i.market}</div>
        <div class="idx-card__n">${i.name}</div>
        <div class="idx-card__v">${value(i.value, i.dec)}</div>
        <div class="idx-card__row">
          <div><span>Dia</span><b class="${tone(i.day)}">${signed(i.day)}</b></div>
          <div><span>Ano</span><b class="${tone(i.ytd)}">${signed(i.ytd, 1)}</b></div>
          <div><span>12m</span><b class="${tone(i.y12)}">${signed(i.y12, 1)}</b></div>
        </div>`;
      b.querySelectorAll("b").forEach((x) => (x.style.fontWeight = 400));
      b.addEventListener("click", () => { idxState.id = i.id; renderIdx(); });
      box.appendChild(b);
    });
  }

  function renderIdx() {
    renderIdxCards();
    const idx = INDICES.find((i) => i.id === idxState.id);
    const full = idxSeries[idx.id];
    const len = { "1M": 22, "6M": 126, "12M": 252 }[idxState.range];
    const days = { "1M": 30, "6M": 182, "12M": 365 }[idxState.range];
    const data = full.slice(-len);
    const dates = data.map((_, i) => dateAt(i, len, days));
    const chg = (data[len - 1] / data[0] - 1) * 100;
    $("#idxName").textContent = idx.name;
    $("#idxVar").innerHTML = `Variação em ${idxState.range}: <span class="${tone(chg)}">${signed(chg)}</span>`;
    document.querySelectorAll("#idxRange button").forEach((b) => b.classList.toggle("is-on", b.dataset.r === idxState.range));
    lineChart($("#idxChart"), {
      label: `${idx.name}, ${idxState.range}`,
      series: [{ data, color: "#F9F4F4", width: 1.5 }],
      dates,
      ticks: 3,
      gridColor: "rgba(249,244,244,.22)",
      xLabel: idxState.range === "1M" ? dayLabel : monthLabel,
      yFmt: (v) => value(v, 0),
      tipFmt: (i) => `${dayLabel(dates[i])} · ${value(data[i], idx.dec)}`,
    });
  }

  // ---------- Câmbio ----------
  function renderFx() {
    $("#fxGrid").innerHTML = FX.map((f) => {
      const data = walk(30, f.value / (1 + f.m30 / 100), f.value, f.seed, 0.025);
      return `
        <article class="fx">
          <div class="fx__pair">${f.pair}</div>
          <div class="fx__name">${f.name}</div>
          <div class="fx__v">${value(f.value, 4)}</div>
          <div class="fx__d"><b class="${tone(f.day)}" style="font-weight:400">${signed(f.day)}</b> <span>no dia</span> · <span>30 dias</span> <b class="${tone(f.m30)}" style="font-weight:400">${signed(f.m30, 1)}</b></div>
          ${sparkline(data, "#9AAAB4")}
        </article>`;
    }).join("");
  }

  // ---------- Fundos ----------
  let fundSel = 0;
  function renderFunds() {
    const rows = $("#fundRows");
    rows.innerHTML = "";
    FUNDS.forEach((f, k) => {
      const tr = el("tr", k === fundSel ? "is-on" : "");
      tr.tabIndex = 0;
      tr.innerHTML = `
        <td>${f.name}</td>
        <td class="cls">${f.cls}</td>
        <td class="num ${tone(f.m)}">${signed(f.m)}</td>
        <td class="num">${signed(f.ytd)}</td>
        <td class="num">${signed(f.y12)}</td>
        <td class="num">${signed(f.y24)}</td>
        <td class="num">${f.pl}</td>`;
      const pick = () => { fundSel = k; renderFunds(); };
      tr.addEventListener("click", pick);
      tr.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(); } });
      rows.appendChild(tr);
    });
    renderFundChart();
  }

  function renderFundChart() {
    const f = FUNDS[fundSel];
    const b12 = BENCH_12M[f.bench];
    const fund = walk(13, 0, f.y12, f.seed, 0.35);
    const bench = walk(13, 0, b12, f.seed + 100, 0.35);
    const dates = fund.map((_, i) => new Date(TODAY.getFullYear(), TODAY.getMonth() - 12 + i, 1));
    $("#fundName").textContent = f.name;
    $("#fundMeta").textContent = `${f.cls} · benchmark ${f.bench}`;
    $("#fundK1").textContent = signed(f.y12, 1);
    $("#fundK2").textContent = signed(b12, 1);
    const kpiL = document.querySelectorAll(".kpi__l")[1];
    if (currentLang === "pt") kpiL.textContent = `${f.bench}, 12 meses`;
    document.querySelector(".lg--steel").nextSibling.textContent = f.bench;
    lineChart($("#fundChart"), {
      label: `${f.name} contra ${f.bench}`,
      series: [
        { data: fund, color: "#101B2A", width: 1.8 },
        { data: bench, color: "#768E9B", width: 1.4 },
      ],
      dates,
      ticks: 5,
      gridColor: "#D9D5D6",
      xLabel: monthLabel,
      yFmt: (v) => signed(v, 1),
      tipFmt: (i) => `${monthLabel(dates[i])} · Fundo ${signed(fund[i], 1)} · ${f.bench} ${signed(bench[i], 1)}`,
    });
  }

  // ---------- Juros ----------
  function renderRates() {
    const max = Math.max(...RATES.map((r) => r.rate));
    $("#rateRows").innerHTML = RATES.map((r) => {
      const real = ((1 + r.rate / 100) / (1 + r.cpi / 100) - 1) * 100;
      const last = r.last.startsWith(MINUS) ? `<span class="pos">${r.last}</span>` : `<span class="muted">${r.last}</span>`;
      return `
        <tr>
          <td class="rate-c"><strong>${r.country}</strong><span>${r.bank}</span></td>
          <td><div class="rate-v"><b>${num(r.rate)}%</b><span class="rate-bar"><i style="width:${(r.rate / max) * 100}%"></i></span></div></td>
          <td class="num">${num(r.cpi)}%</td>
          <td class="num"><span class="${tone(real)}">${signed(real)}</span></td>
          <td class="num">${last}</td>
        </tr>`;
    }).join("");
  }

  // ---------- Notícias ----------
  let newsCat = "Todas";
  function renderNews() {
    $("#newsTabs").innerHTML = NEWS_CATS.map((c) =>
      `<button type="button" role="tab" aria-selected="${c === newsCat}" class="${c === newsCat ? "is-on" : ""}" data-c="${c}">${c}</button>`
    ).join("");
    const list = NEWS.filter((n) => newsCat === "Todas" || n.cat === newsCat);
    $("#newsGrid").innerHTML = list.length
      ? list.map((n) => `
        <article class="news">
          <div class="news__meta">${n.time} · ${n.cat}</div>
          <h3 class="news__t">${n.title}</h3>
          <p class="news__s">${n.summary}</p>
          <p class="news__body">${n.body}</p>
          <button type="button" class="news__more" aria-expanded="false">Ver mais</button>
        </article>`).join("")
      : `<p class="empty">Nenhuma notícia nesta categoria até agora.</p>`;
  }

  $("#newsTabs").addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (b) { newsCat = b.dataset.c; renderNews(); }
  });
  $("#newsGrid").addEventListener("click", (e) => {
    const b = e.target.closest(".news__more");
    if (!b) return;
    const card = b.closest(".news");
    const open = card.classList.toggle("is-open");
    b.textContent = open ? "Ver menos" : "Ver mais";
    b.setAttribute("aria-expanded", open);
  });

  // ---------- Newsletter ----------
  let freq = "diaria";
  $("#nlFreq").addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    freq = b.dataset.v;
    document.querySelectorAll("#nlFreq button").forEach((x) => x.classList.toggle("is-on", x === b));
  });
  $("#nlForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const input = e.target.email;
    const msg = $("#nlMsg");
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(input.value.trim());
    input.classList.toggle("is-err", !ok);
    msg.className = "nl__msg " + (ok ? "is-ok" : "is-err");
    if (!ok) {
      msg.textContent = currentLang === "en" ? "Please enter a valid e-mail." : "Informe um e-mail válido.";
      input.focus();
      return;
    }
    const f = freq === "diaria" ? "diária" : "semanal";
    msg.textContent = currentLang === "en"
      ? "Subscription confirmed. Check your inbox."
      : `Inscrição confirmada na edição ${f}. Confira sua caixa de entrada.`;
    input.value = "";
  });

  // ---------- Menu ----------
  const burger = $(".burger"), menu = $("#menu");
  function setMenu(open) {
    burger.setAttribute("aria-expanded", open);
    burger.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
    menu.hidden = !open;
  }
  burger.addEventListener("click", () => setMenu(menu.hidden));
  menu.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });

  // ---------- Idioma ----------
  let currentLang = "pt";
  const ptText = new Map();
  function setLang(lang) {
    currentLang = lang;
    document.documentElement.lang = lang === "en" ? "en" : "pt-BR";
    document.querySelectorAll("[data-i18n]").forEach((n) => {
      if (!ptText.has(n)) ptText.set(n, n.textContent);
      const key = n.dataset.i18n;
      n.textContent = lang === "en" && I18N.en[key] ? I18N.en[key] : ptText.get(n);
    });
    document.querySelectorAll(".lang__btn").forEach((b) => b.classList.toggle("is-on", b.dataset.lang === lang));
    const d = TODAY.toLocaleDateString(lang === "en" ? "en-US" : "pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    $("#heroDate").textContent = d.charAt(0).toUpperCase() + d.slice(1);
    renderFundChart();
  }
  document.querySelectorAll(".lang__btn").forEach((b) => b.addEventListener("click", () => setLang(b.dataset.lang)));

  // ---------- Inicialização ----------
  document.querySelectorAll("#idxRange button").forEach((b) =>
    b.addEventListener("click", () => { idxState.range = b.dataset.r; renderIdx(); })
  );

  renderHeroArt();
  renderTicker();
  renderIdx();
  renderFx();
  renderFunds();
  renderRates();
  renderNews();

  let rt;
  window.addEventListener("resize", () => {
    clearTimeout(rt);
    rt = setTimeout(() => { renderIdx(); renderFundChart(); }, 150);
  });
})();

/* ============================================================
   Dati biglietti + generatore di esiti (satirico).
   I dati su prezzi/premi/probabilità sono ispirati ai decreti ADM
   e alle pagine informative reali. L'app NON corrisponde premi.
   ============================================================ */

export function eur(n) {
  if (n == null || Number.isNaN(n)) return "—";
  return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " €";
}

export function int(n) {
  return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export function pad2(n) {
  return String(n).padStart(2, "0");
}

export const HELPLINE = "800 55 88 22";
export const HELP_URL = "https://usciredalgioco.iss.it/";

export const DISCLAIMER =
  "App satirica e parodistica. Non affiliata a Gratta e Vinci, Lottomatica o ADM. " +
  "Nessun premio reale viene corrisposto: qui si perde davvero solo tempo.";

export const FACTS = [
  "Per ogni euro speso in Gratta e Vinci, il ritorno medio in vincite è tra 60 e 80 centesimi. Il resto non torna.",
  "Il premio massimo de Il Miliardario Maxi (5.000.000 €) ha probabilità 1 su 9.360.000 biglietti.",
  "Un biglietto de Il Miliardario Maxi è vincente premi superiori al costo 1 volta ogni 7,45. Gli altri 6,45 sono soldi bruciati.",
  "La probabilità media di vincita dell'intera gamma è 1 su 3,60, ma la maggior parte delle \"vincite\" vale meno del biglietto stesso.",
  "Non esistono trucchi: la distribuzione dei biglietti vincenti è casuale e non prevedibile.",
];

export const TICKETS = [
  {
    id: "classico",
    brand: "GRATTA E VINCI",
    variant: "Classico",
    price: 2,
    maxPrize: 100000,
    maxOdds: 9600000,
    rtp: "60–75%",
    theme: "silver",
    accent: "#ff3d5e",
    accent2: "#ffd24a",
    mechanic: "Trova i tuoi numeri tra i numeri vincenti.",
    winningPrizes: [100000, 1000, 50, 10, 2],
    yoursCount: 6,
    smallPrize: 10,
    winRate: "1 biglietto ogni 9,67 è vincente premi superiori al costo",
    tagline: "Il ticket che \"prima o poi\" ti dice che hai vinto 2 €.",
    realName: "gamma da 2 € (es. Nuovo 10X)",
    invented: false,
  },
  {
    id: "miliardario",
    brand: "IL MILIARDARIO",
    variant: "Maxi",
    price: 20,
    maxPrize: 5000000,
    maxOdds: 9360000,
    rtp: "60–75%",
    theme: "gold",
    accent: "#f5b301",
    accent2: "#ffe08a",
    mechanic: "Trova i tuoi numeri tra i numeri vincenti.",
    winningPrizes: [5000000, 100000, 1000, 100, 40, 20],
    yoursCount: 8,
    smallPrize: 40,
    winRate: "1 biglietto ogni 7,45 è vincente premi superiori al costo",
    tagline: "5 milioni promessi, 20 € per sognarli.",
    realName: "Il Miliardario Maxi (20 €)",
    invented: false,
  },
  {
    id: "vela",
    brand: "GRATTA E VELA",
    variant: "Mare",
    price: 5,
    maxPrize: 500000,
    maxOdds: 7680000,
    rtp: "60–75%",
    theme: "blue",
    accent: "#38bdf8",
    accent2: "#a5f3fc",
    mechanic: "Trova 3 simboli uguali e vinci il premio.",
    smallPrize: 20,
    winRate: "1 biglietto ogni ~7,8 è vincente premi superiori al costo",
    tagline: "Il mare non paga mai. Il banco sì.",
    realName: "biglietto inventato (non esiste)",
    invented: true,
    symbols: [
      { e: "⚓", name: "Ancora", prize: 500000 },
      { e: "⛵", name: "Vela", prize: 100000 },
      { e: "🧭", name: "Bussola", prize: 10000 },
      { e: "🐬", name: "Delfino", prize: 1000 },
      { e: "🐟", name: "Pesce", prize: 500 },
      { e: "⭐", name: "Stella", prize: 200 },
      { e: "🌊", name: "Onda", prize: 100 },
      { e: "🐚", name: "Conchiglia", prize: 50 },
      { e: "🦀", name: "Granchio", prize: 20 },
      { e: "🐠", name: "Pesce rosso", prize: 5 },
    ],
  },
];

export function getTicket(id) {
  return TICKETS.find((t) => t.id === id) || TICKETS[0];
}

/* ---------- helpers interni ---------- */
function rndInt(a, b) {
  return a + Math.floor(Math.random() * (b - a + 1));
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
  return arr;
}

function uniqNumbers(count, exclude) {
  const set = new Set(exclude);
  const out = [];
  let guard = 0;
  while (out.length < count && guard++ < 600) {
    const v = rndInt(1, 90);
    if (set.has(v)) continue;
    set.add(v);
    out.push(v);
  }
  return out;
}

function reverseNum(n) {
  const s = pad2(n);
  const r = s.split("").reverse().join("");
  return parseInt(r, 10);
}

/* ---------- esiti numerici (Classico / Miliardario) ---------- */
function numbersOutcome(t, forceMirage) {
  const wp = t.winningPrizes;
  const wnums = uniqNumbers(wp.length, []);
  const winning = wp.map((prize, i) => ({ num: wnums[i], prize }));
  const top = winning[0];
  const refund = winning[winning.length - 1];
  const smallIdx = wp.indexOf(t.smallPrize);
  const small = smallIdx >= 0 ? winning[smallIdx] : refund;

  const yours = uniqNumbers(t.yoursCount, wnums);

  let kind = "nothing";
  let amount = 0;
  let matched = null;
  let tease = null;

  const roll = Math.random();
  if (forceMirage) {
    yours[0] = top.num;
    kind = "mirage";
    amount = 0;
    matched = top.num;
  } else if (roll < 0.3) {
    yours[0] = refund.num;
    kind = "refund";
    amount = t.price;
    matched = refund.num;
  } else if (roll < 0.4) {
    yours[0] = small.num;
    kind = "small";
    amount = small.prize;
    matched = small.num;
  } else {
    const rev = reverseNum(top.num);
    if (rev !== top.num && !wnums.includes(rev)) {
      if (!yours.includes(rev)) yours[0] = rev;
      tease = { rev, top: top.num };
    }
  }

  shuffle(yours);
  const matches = yours.filter((n) => wnums.includes(n));
  const matchedPrize = matched != null
    ? winning.find((w) => w.num === matched)?.prize ?? null
    : null;

  return {
    kind,
    amount,
    matched,
    matchedPrize,
    tease,
    winning,
    yours,
    matches,
    headline: headlineFor(t, kind, amount, matchedPrize),
    detail: detailFor(t, kind, amount, matchedPrize, tease, top),
  };
}

/* ---------- esiti a simboli (Gratta e Vela) ---------- */
function velaOutcome(t, forceMirage) {
  const S = t.symbols;
  const top = S[0];
  const refundSym = S.find((s) => s.prize === t.price) || S[S.length - 1];
  const smallSym = S.find((s) => s.prize === t.smallPrize) || S[S.length - 2];
  const pool = S.map((s) => s.e);

  function bag(count, exclude) {
    const counts = new Map();
    const out = [];
    let guard = 0;
    while (out.length < count && guard++ < 900) {
      const cand = pool.filter(
        (e) => e !== exclude && (counts.get(e) || 0) < 2
      );
      if (!cand.length) break;
      const e = pick(cand);
      counts.set(e, (counts.get(e) || 0) + 1);
      out.push(e);
    }
    return out;
  }

  let cells;
  let kind = "nothing";
  let amount = 0;
  let matchSym = null;

  const roll = Math.random();
  if (forceMirage) {
    cells = [top.e, top.e, top.e, ...bag(6, top.e)];
    kind = "mirage";
    matchSym = top.e;
  } else if (roll < 0.28) {
    cells = [refundSym.e, refundSym.e, refundSym.e, ...bag(6, refundSym.e)];
    kind = "refund";
    amount = t.price;
    matchSym = refundSym.e;
  } else if (roll < 0.34) {
    cells = [smallSym.e, smallSym.e, smallSym.e, ...bag(6, smallSym.e)];
    kind = "small";
    amount = t.smallPrize;
    matchSym = smallSym.e;
  } else if (roll < 0.58) {
    cells = [top.e, top.e, ...bag(7, top.e)];
    kind = "near";
    matchSym = top.e;
  } else {
    cells = bag(9, null);
  }

  shuffle(cells);
  const matchIndexes = matchSym
    ? cells.map((e, i) => (e === matchSym ? i : -1)).filter((i) => i >= 0)
    : [];

  const matchedPrize = matchSym
    ? S.find((s) => s.e === matchSym)?.prize ?? null
    : null;

  return {
    kind,
    amount,
    matchedPrize,
    cells,
    matchIndexes,
    matchedSymbol: matchSym,
    headline: headlineFor(t, kind, amount, matchedPrize, matchSym),
    detail: detailFor(t, kind, amount, matchedPrize, null, top, matchSym),
  };
}

/* ---------- testi ---------- */
function headlineFor(t, kind, amount, matchedPrize, symbol) {
  const p = eur(t.price);
  switch (kind) {
    case "mirage":
      return `HAI "VINTO" ${eur(t.maxPrize)}`;
    case "small":
      return `HAI VINTO ${eur(amount)}`;
    case "refund":
      return `HAI "VINTO" ${p}`;
    case "near":
      return symbol
        ? `QUASI: 2 ${symbol} su 3`
        : `QUASI VINCITA`;
    default:
      return "NON HAI VINTO";
  }
}

function detailFor(t, kind, amount, matchedPrize, tease, top, symbol) {
  const p = eur(t.price);
  switch (kind) {
    case "mirage":
      return `Biglietto di parodia: il premio non esiste e non verrà corrisposto. Ma se anche fosse reale, il premio massimo da ${eur(
        t.maxPrize
      )} ha probabilità 1 su ${int(t.maxOdds)} biglietti. Per averne uno "sicuro" dovresti comprarne ${int(
        t.maxOdds
      )}, spendendo ${eur(t.maxOdds * t.price)}: il banco incassa molto più di quanto promette.`;
    case "small":
      return `Vincita piccola, quanto basta per farti pensare che "sta girando bene". Ne hai speso ${p} e ne incassi ${eur(
        amount
      )}. Sul singolo biglietto sei sopra di ${eur(
        amount - t.price
      )}; sul portafoglio, no. Il banco decide quando farti vincere.`;
    case "refund":
      return `Esattamente quanto hai speso. Il banco ti ridà i tuoi soldi e ti fa credere di aver vinto: è così che ti tiene al gioco. Netto reale: 0 €. Tempo perso: non recuperabile.`;
    case "near":
      if (symbol) {
        return `Ti sei fermato a un simbolo dal premio da ${eur(
          matchedPrize ?? top.prize
        )}. Il "quasi" non è sfortuna: è progettato per tenerti a grattare. La probabilità del premio da ${eur(
          top.prize
        )} è 1 su ${int(t.maxOdds)}: tu sei uno dei ${int(
          t.maxOdds - 1
        )} che non ci arrivano.`;
      }
      return `Ti sei fermato a un simbolo dal premio. Il "quasi" non è sfortuna: è progettato per tenerti a grattare.`;
    default: {
      let d = `Hai perso ${p} in tre secondi. Moltiplica per una serata: è così che si finanzia il settore. Per ogni euro speso, in media ne tornano 60–80 centesimi.`;
      if (tease) {
        d += ` Il ${pad2(tease.rev)} non è il ${pad2(
          tease.top
        )}: nel Gratta e Vinci il "quasi" non esiste, esiste solo il banco.`;
      }
      if (symbol) d += ` Nessun tris: hai perso ${p}.`;
      return d;
    }
  }
}

/* ---------- API pubblica ---------- */
export function generateOutcome(ticket, { forceMirage = false } = {}) {
  if (ticket.id === "vela") return velaOutcome(ticket, forceMirage);
  return numbersOutcome(ticket, forceMirage);
}

export function outcomeTone(kind) {
  if (kind === "mirage" || kind === "small") return "win";
  if (kind === "refund") return "neutral";
  if (kind === "near") return "tease";
  return "loss";
}

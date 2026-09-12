/* ============================================================
   Stato condiviso (runes in modulo .svelte.js).
   Il "bilancio reale" persiste in localStorage: il danno ti segue.
   ============================================================ */

const KEY = "gev-satira-v1";

function load() {
  const base = { spent: 0, won: 0, count: 0, mirageSeen: false, startedAt: Date.now() };
  if (typeof localStorage === "undefined") return base;
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "{}");
    return {
      spent: Number(raw.spent) || 0,
      won: Number(raw.won) || 0,
      count: Number(raw.count) || 0,
      mirageSeen: !!raw.mirageSeen,
      startedAt: Number(raw.startedAt) || Date.now(),
    };
  } catch {
    return base;
  }
}

export const ledger = $state(load());

export function persist() {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(ledger));
  } catch {
    /* storage pieno o negato */
  }
}

export function registerPlay(price, amount) {
  ledger.spent += price;
  ledger.won += amount;
  ledger.count += 1;
  persist();
}

export function markMirage() {
  ledger.mirageSeen = true;
  persist();
}

export function resetLedger() {
  ledger.spent = 0;
  ledger.won = 0;
  ledger.count = 0;
  ledger.mirageSeen = false;
  ledger.startedAt = Date.now();
  persist();
}

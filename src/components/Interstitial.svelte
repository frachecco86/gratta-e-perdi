<script>
  import { FACTS, HELPLINE, eur } from "../lib/tickets.js";
  import { ledger } from "../lib/store.svelte.js";

  let { oncontinue, onstop } = $props();

  const fact = FACTS[Math.floor(Math.random() * FACTS.length)];
  const net = $derived(ledger.won - ledger.spent);
</script>

<section class="stop">
  <span class="stop__kicker">Checkpoint anti-ludopatia</span>
  <h2 class="stop__title">Fermati<br />un attimo.</h2>

  <div class="stop__fact">
    <span class="stop__fact-k">Lo sapevi?</span>
    <p>{fact}</p>
  </div>

  <div class="stop__balance">
    <div>
      <span>Hai speso</span>
      <b>{eur(ledger.spent)}</b>
    </div>
    <div>
      <span>Hai "vinto"</span>
      <b>{eur(ledger.won)}</b>
    </div>
    <div>
      <span>Netto</span>
      <b class="is-neg">{eur(net)}</b>
    </div>
  </div>

  <p class="stop__help">
    Se il gioco non è più un gioco, chiama il Telefono Verde Nazionale
    <b>{HELPLINE}</b> — gratuito e anonimo.
  </p>

  <div class="stop__actions">
    <button class="btn btn--gold btn--block" onclick={oncontinue}
      >Continua a grattare</button
    >
    <button class="btn btn--ghost btn--block" onclick={onstop}
      >Smetto qui, davvero</button
    >
  </div>
</section>

<style>
  .stop {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 26px 2px 0;
    animation: fade-in 0.35s ease both;
  }

  .stop__kicker {
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--gold);
  }

  .stop__title {
    font-size: clamp(38px, 13vw, 58px);
    font-weight: 900;
    letter-spacing: -0.04em;
    line-height: 0.92;
  }

  .stop__fact {
    padding: 15px 15px 14px;
    border-radius: 16px;
    border: 1px solid rgba(245, 179, 1, 0.3);
    background: linear-gradient(180deg, rgba(245, 179, 1, 0.1), rgba(245, 179, 1, 0.02));
  }

  .stop__fact-k {
    font-size: 9.5px;
    font-weight: 900;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--gold);
  }

  .stop__fact p {
    margin-top: 6px;
    font-size: 14px;
    line-height: 1.5;
    color: var(--txt);
  }

  .stop__balance {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
  }

  .stop__balance > div {
    display: flex;
    flex-direction: column;
    gap: 3px;
    padding: 11px 10px;
    border-radius: 12px;
    border: 1px solid var(--line);
    background: var(--panel);
  }

  .stop__balance span {
    font-size: 9px;
    font-weight: 800;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--muted-2);
  }

  .stop__balance b {
    font-size: 17px;
    font-weight: 900;
    font-variant-numeric: tabular-nums;
  }

  .stop__balance b.is-neg {
    color: var(--danger-2);
  }

  .stop__help {
    font-size: 12px;
    line-height: 1.5;
    color: var(--muted);
  }

  .stop__help b {
    color: var(--txt);
  }

  .stop__actions {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 2px;
  }
</style>

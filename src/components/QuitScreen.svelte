<script>
  import { ledger, resetLedger } from "../lib/store.svelte.js";
  import { eur, DISCLAIMER, HELPLINE, HELP_URL } from "../lib/tickets.js";

  let { onrestart } = $props();

  let now = $state(Date.now());
  $effect(() => {
    const id = setInterval(() => (now = Date.now()), 1000);
    return () => clearInterval(id);
  });

  const net = $derived(ledger.won - ledger.spent);
  const seconds = $derived(
    Math.max(0, Math.floor((now - ledger.startedAt) / 1000))
  );
  const timeText = $derived(
    seconds < 60
      ? `${seconds} secondi`
      : `${Math.floor(seconds / 60)} min ${String(seconds % 60).padStart(2, "0")} s`
  );

  function restart() {
    resetLedger();
    onrestart?.();
  }
</script>

<section class="quit">
  <span class="quit__kicker">Hai smesso</span>
  <h2 class="quit__title">Bravo.<br />Davvero.</h2>

  <p class="quit__lead">
    In <b>{timeText}</b> hai speso <b>{eur(ledger.spent)}</b> in {ledger.count}
    biglietti. Il banco ha incassato circa <b
      >{eur(Math.max(0, ledger.spent - ledger.won))}</b
    >
    e ti ha restituito {eur(ledger.won)}.
  </p>

  <div class="quit__net" class:is-neg={net < 0}>
    <span>Bilancio finale</span>
    <b>{net > 0 ? "+" : ""}{eur(net)}</b>
  </div>

  <div class="help">
    <span class="help__k">Se il gioco non è più un gioco</span>
    <p class="help__p">
      Telefono Verde Nazionale per il gioco d'azzardo — gratuito, anonimo, attivo
      tutti i giorni.
    </p>
    <a class="help__num" href="tel:800558822">{HELPLINE}</a>
    <a class="help__link" href={HELP_URL} target="_blank" rel="noopener"
      >usciredalgioco.iss.it →</a
    >
  </div>

  <p class="quit__disc">{DISCLAIMER}</p>

  <button class="btn btn--ghost btn--block" onclick={restart}
    >Azzera il contatore e ricomincia</button
  >
</section>

<style>
  .quit {
    display: flex;
    flex-direction: column;
    gap: 14px;
    padding: 26px 2px 0;
    animation: fade-in 0.4s ease both;
  }

  .quit__kicker {
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--green);
  }

  .quit__title {
    font-size: clamp(40px, 14vw, 62px);
    font-weight: 900;
    letter-spacing: -0.045em;
    line-height: 0.9;
  }

  .quit__lead {
    font-size: 14px;
    line-height: 1.55;
    color: var(--muted);
  }

  .quit__lead b {
    color: var(--txt);
    font-variant-numeric: tabular-nums;
  }

  .quit__net {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 16px;
    border-radius: 16px;
    border: 1px solid var(--line-2);
    background: var(--panel);
  }

  .quit__net.is-neg {
    border-color: rgba(244, 63, 94, 0.45);
    background: rgba(244, 63, 94, 0.1);
  }

  .quit__net span {
    font-size: 10.5px;
    font-weight: 900;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--muted);
  }

  .quit__net b {
    font-size: 26px;
    font-weight: 900;
    font-variant-numeric: tabular-nums;
  }

  .quit__net.is-neg b {
    color: var(--danger-2);
  }

  .help {
    padding: 16px;
    border-radius: 16px;
    border: 1px solid rgba(52, 211, 153, 0.3);
    background: linear-gradient(180deg, rgba(52, 211, 153, 0.1), rgba(52, 211, 153, 0.02));
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .help__k {
    font-size: 9.5px;
    font-weight: 900;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--green);
  }

  .help__p {
    font-size: 12.5px;
    line-height: 1.5;
    color: var(--muted);
  }

  .help__num {
    margin-top: 4px;
    font-size: 30px;
    font-weight: 900;
    letter-spacing: -0.01em;
    color: var(--txt);
    text-decoration: none;
    font-variant-numeric: tabular-nums;
  }

  .help__link {
    font-size: 12.5px;
    font-weight: 700;
    color: var(--green);
    text-decoration: none;
  }

  .quit__disc {
    font-size: 10.5px;
    line-height: 1.5;
    color: var(--muted-2);
  }
</style>

<script>
  import { ledger } from "../lib/store.svelte.js";
  import { eur } from "../lib/tickets.js";

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
      ? `${seconds}s`
      : `${Math.floor(seconds / 60)}m ${String(seconds % 60).padStart(2, "0")}s`
  );
</script>

<div class="ledger">
  <div class="ledger__head">
    <span class="ledger__title">Bilancio reale</span>
    <span class="ledger__time">⏱ {timeText}</span>
  </div>

  <div class="ledger__stats">
    <div class="ledger__i">
      <b>{eur(ledger.spent)}</b><span>speso</span>
    </div>
    <div class="ledger__i">
      <b>{eur(ledger.won)}</b><span>"vinto"</span>
    </div>
    <div class="ledger__i">
      <b>{ledger.count}</b><span>biglietti</span>
    </div>
  </div>

  <div class="ledger__net" class:is-neg={net < 0} class:is-zero={net === 0}>
    <span class="ledger__net-k">netto</span>
    <span class="ledger__net-v">{net > 0 ? "+" : ""}{eur(net)}</span>
  </div>

  {#if ledger.count > 0}
    <p class="ledger__note">
      {#if net < 0}
        In {timeText} hai lasciato al banco {eur(Math.abs(net))}. È così che si
        finanzia il settore.
      {:else}
        Sei in pari. Il banco sta ancora aspettando che tu continui.
      {/if}
    </p>
  {/if}
</div>

<style>
  .ledger {
    padding: 14px 14px 12px;
    border-radius: 18px;
    border: 1px solid var(--line);
    background: linear-gradient(180deg, var(--panel-2), var(--panel));
    box-shadow: var(--shadow);
  }

  .ledger__head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    margin-bottom: 10px;
  }

  .ledger__title {
    font-size: 10.5px;
    font-weight: 900;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--muted);
  }

  .ledger__time {
    font-size: 11px;
    font-weight: 700;
    color: var(--muted-2);
    font-variant-numeric: tabular-nums;
  }

  .ledger__stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 7px;
  }

  .ledger__i {
    display: flex;
    flex-direction: column;
    gap: 1px;
    padding: 8px 9px;
    border-radius: 11px;
    border: 1px solid var(--line);
    background: rgba(255, 255, 255, 0.03);
  }

  .ledger__i b {
    font-size: 15px;
    font-weight: 900;
    font-variant-numeric: tabular-nums;
    color: var(--txt);
  }

  .ledger__i span {
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.09em;
    text-transform: uppercase;
    color: var(--muted-2);
  }

  .ledger__net {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 8px;
    padding: 9px 12px;
    border-radius: 12px;
    border: 1px solid var(--line-2);
    background: rgba(255, 255, 255, 0.04);
  }

  .ledger__net-k {
    font-size: 10.5px;
    font-weight: 900;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--muted);
  }

  .ledger__net-v {
    font-size: 20px;
    font-weight: 900;
    font-variant-numeric: tabular-nums;
    letter-spacing: -0.01em;
  }

  .ledger__net.is-neg {
    border-color: rgba(244, 63, 94, 0.45);
    background: rgba(244, 63, 94, 0.1);
  }

  .ledger__net.is-neg .ledger__net-v {
    color: var(--danger-2);
  }

  .ledger__net.is-zero .ledger__net-v {
    color: var(--muted);
  }

  .ledger__note {
    margin-top: 8px;
    font-size: 11.5px;
    line-height: 1.45;
    color: var(--muted-2);
  }
</style>

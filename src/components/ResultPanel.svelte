<script>
  import { eur, int, outcomeTone } from "../lib/tickets.js";

  let { ticket, outcome, onnext, onstop } = $props();

  const tone = $derived(outcomeTone(outcome.kind));
  const isWin = $derived(tone === "win");

  let shown = $state(0);

  $effect(() => {
    const target =
      outcome.kind === "mirage" ? ticket.maxPrize : outcome.amount || 0;
    shown = 0;
    let raf = 0;
    const start = performance.now();
    const dur = 820;
    const tick = (t) => {
      const p = Math.min(1, (t - start) / dur);
      shown = target * (1 - Math.pow(1 - p, 3));
      if (p < 1) raf = requestAnimationFrame(tick);
      else shown = target;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  });

  const tagText = $derived(
    outcome.kind === "mirage"
      ? "Parodia · premio non valido"
      : tone === "win"
        ? "Vincita (piccola)"
        : tone === "neutral"
          ? "Pareggio"
          : tone === "tease"
            ? "Quasi vincita"
            : "Perdita"
  );
</script>

<div class="result result--{tone}">
  {#if outcome.kind === "mirage"}
    <div class="result__stamp">NON VALIDO · NESSUN PREMIO REALE</div>
  {/if}

  <span class="result__tag">{tagText}</span>
  <h2 class="result__headline">{outcome.headline}</h2>

  <div class="result__amount">
    <span class="result__amount-v" class:is-win={isWin}>{eur(shown)}</span>
    {#if outcome.kind === "near" && outcome.matchedPrize}
      <span class="result__amount-ghost"
        >a un simbolo da {eur(outcome.matchedPrize)}</span
      >
    {/if}
  </div>

  <p class="result__detail">{outcome.detail}</p>

  <div class="odds">
    <div class="odds__i">
      <b>{eur(ticket.price)}</b><span>prezzo</span>
    </div>
    <div class="odds__i">
      <b>{eur(ticket.maxPrize)}</b><span>premio max</span>
    </div>
    <div class="odds__i">
      <b>1 su {int(ticket.maxOdds)}</b><span>prob. premio max</span>
    </div>
    <div class="odds__i">
      <b>{ticket.rtp}</b><span>ritorno medio</span>
    </div>
  </div>

  <p class="result__rate">⚑ {ticket.winRate}</p>

  <div class="result__actions">
    <button class="btn btn--gold btn--block" onclick={onnext}
      >Ne gratti un altro?</button
    >
    <button class="btn btn--ghost btn--block" onclick={onstop}
      >Basta, mi fermo</button
    >
  </div>
</div>

<style>
  .result {
    position: relative;
    margin-top: 14px;
    padding: 18px 16px 16px;
    border-radius: 18px;
    border: 1px solid var(--line);
    background: linear-gradient(180deg, var(--panel-2), var(--panel));
    animation: rise 0.45s ease both;
    overflow: hidden;
  }

  .result::before {
    content: "";
    position: absolute;
    inset: 0 0 auto 0;
    height: 3px;
    background: var(--muted-2);
  }

  .result--win::before {
    background: linear-gradient(90deg, #f5b301, #ffe08a);
  }

  .result--neutral::before {
    background: linear-gradient(90deg, #a1a1aa, #d4d4d8);
  }

  .result--tease::before {
    background: linear-gradient(90deg, #38bdf8, #a5f3fc);
  }

  .result--loss::before {
    background: linear-gradient(90deg, #f43f5e, #fb7185);
  }

  .result__stamp {
    position: absolute;
    top: 20px;
    right: -6px;
    padding: 5px 10px;
    border: 2px solid var(--danger);
    border-radius: 6px;
    color: var(--danger-2);
    font-size: 10px;
    font-weight: 900;
    letter-spacing: 0.12em;
    transform: rotate(-18deg);
    animation: stamp-in 0.5s 0.5s ease both;
    background: rgba(244, 63, 94, 0.08);
  }

  .result__tag {
    display: inline-block;
    font-size: 10.5px;
    font-weight: 800;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--muted);
  }

  .result__headline {
    margin-top: 4px;
    font-size: clamp(20px, 6vw, 26px);
    font-weight: 900;
    letter-spacing: -0.01em;
    line-height: 1.1;
  }

  .result__amount {
    display: flex;
    align-items: baseline;
    gap: 10px;
    flex-wrap: wrap;
    margin: 10px 0 12px;
  }

  .result__amount-v {
    font-size: clamp(30px, 10vw, 44px);
    font-weight: 900;
    letter-spacing: -0.02em;
    font-variant-numeric: tabular-nums;
    color: var(--muted);
  }

  .result__amount-v.is-win {
    color: var(--gold);
    text-shadow: 0 0 26px rgba(245, 179, 1, 0.4);
  }

  .result__amount-ghost {
    font-size: 12px;
    font-weight: 700;
    color: var(--blue);
  }

  .result__detail {
    font-size: 13.5px;
    line-height: 1.55;
    color: var(--muted);
  }

  .odds {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 7px;
    margin: 14px 0 10px;
  }

  .odds__i {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 9px 10px;
    border-radius: 11px;
    border: 1px solid var(--line);
    background: rgba(255, 255, 255, 0.03);
  }

  .odds__i b {
    font-size: 13.5px;
    font-weight: 800;
    color: var(--txt);
    font-variant-numeric: tabular-nums;
  }

  .odds__i span {
    font-size: 9.5px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--muted-2);
  }

  .result__rate {
    font-size: 11.5px;
    color: var(--muted-2);
    margin-bottom: 14px;
  }

  .result__actions {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
</style>

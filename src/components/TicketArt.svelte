<script>
  import { eur, pad2 } from "../lib/tickets.js";

  let { ticket, outcome } = $props();

  const isNumbers = $derived(ticket.id !== "vela");
</script>

{#if isNumbers}
  <div class="art art--nums" data-theme={ticket.theme}>
    <div class="label">
      <span class="label__k">I TUOI NUMERI</span>
      <span class="label__v">{ticket.mechanic}</span>
    </div>

    <div class="ynums" style="--cols:{ticket.yoursCount > 6 ? 4 : 3}">
      {#each outcome.yours as n (n)}
        <div class="ynum" class:is-match={outcome.matches.includes(n)}>
          {pad2(n)}
        </div>
      {/each}
    </div>

    <div class="label">
      <span class="label__k">NUMERI VINCENTI</span>
    </div>

    <div class="wnums">
      {#each outcome.winning as w (w.num)}
        <div class="wnum" class:is-top={w.prize === ticket.maxPrize}>
          <span class="wnum__n">{pad2(w.num)}</span>
          <span class="wnum__p">{eur(w.prize)}</span>
        </div>
      {/each}
    </div>

    {#if ticket.maxPrize >= 1000000}
      <div class="stamp">1 SU {eur(ticket.maxOdds).replace(" €", "")} PER IL PREMIO MAX</div>
    {/if}
  </div>
{:else}
  <div class="art art--vela" data-theme={ticket.theme}>
    <div class="label">
      <span class="label__k">TROVA 3 SIMBOLI UGUALI</span>
      <span class="label__v">Vinci il premio del simbolo</span>
    </div>

    <div class="syms">
      {#each outcome.cells as c, i (i)}
        <div class="sym" class:is-match={outcome.matchIndexes.includes(i)}>
          <span class="sym__e">{c}</span>
        </div>
      {/each}
    </div>

    <div class="legend">
      {#each ticket.symbols.slice(0, 6) as s (s.e)}
        <span class="legend__i"><b>{s.e}</b>{eur(s.prize)}</span>
      {/each}
    </div>

    <div class="wave" aria-hidden="true"></div>
  </div>
{/if}

<style>
  .art {
    position: relative;
    padding: 18px 16px 20px;
    min-height: 330px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    background:
      radial-gradient(120% 90% at 50% 0%, rgba(255, 255, 255, 0.07), transparent 60%),
      linear-gradient(180deg, #16161e, #0c0c11);
    color: #f2f2f5;
  }

  .art[data-theme="gold"] {
    background:
      radial-gradient(110% 90% at 50% 0%, rgba(245, 179, 1, 0.16), transparent 62%),
      linear-gradient(180deg, #1a1508, #0b0a06);
  }

  .art[data-theme="blue"] {
    background:
      radial-gradient(110% 90% at 50% 0%, rgba(56, 189, 248, 0.18), transparent 62%),
      linear-gradient(180deg, #071722, #050b10);
  }

  .label {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 8px;
  }

  .label__k {
    font-size: 10px;
    font-weight: 900;
    letter-spacing: 0.16em;
    color: var(--muted);
    text-transform: uppercase;
  }

  .label__v {
    font-size: 10.5px;
    color: var(--muted-2);
    text-align: right;
  }

  .ynums {
    display: grid;
    grid-template-columns: repeat(var(--cols, 3), 1fr);
    gap: 7px;
  }

  .ynum {
    aspect-ratio: 1.35 / 1;
    display: grid;
    place-items: center;
    border-radius: 10px;
    border: 1px solid rgba(255, 255, 255, 0.12);
    background: linear-gradient(180deg, #23232d, #17171f);
    font-size: 21px;
    font-weight: 900;
    font-variant-numeric: tabular-nums;
    letter-spacing: 0.02em;
    color: #e9e9ee;
    transition: all 0.4s ease;
  }

  .ynum.is-match {
    border-color: var(--gold);
    background: linear-gradient(180deg, #fff2c2, #f5b301);
    color: #2a1c00;
    box-shadow: 0 0 0 2px rgba(245, 179, 1, 0.25),
      0 8px 22px -8px rgba(245, 179, 1, 0.9);
    animation: pop 0.45s ease both;
  }

  .wnums {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 7px;
  }

  .wnum {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 6px;
    padding: 7px 9px;
    border-radius: 10px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: #101017;
  }

  .wnum__n {
    font-size: 16px;
    font-weight: 900;
    font-variant-numeric: tabular-nums;
    color: #fff;
  }

  .wnum__p {
    font-size: 11px;
    font-weight: 800;
    color: var(--muted);
    white-space: nowrap;
  }

  .wnum.is-top {
    border-color: rgba(245, 179, 1, 0.55);
    background: linear-gradient(180deg, rgba(245, 179, 1, 0.16), rgba(245, 179, 1, 0.04));
  }

  .wnum.is-top .wnum__p {
    color: var(--gold-2);
  }

  .stamp {
    margin-top: auto;
    align-self: flex-start;
    padding: 4px 9px;
    border: 1px dashed rgba(245, 179, 1, 0.5);
    border-radius: 7px;
    font-size: 9.5px;
    font-weight: 800;
    letter-spacing: 0.1em;
    color: var(--gold-2);
    opacity: 0.85;
  }

  /* ---- vela ---- */
  .syms {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
    margin-top: 2px;
  }

  .sym {
    aspect-ratio: 1 / 1;
    display: grid;
    place-items: center;
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.12);
    background: linear-gradient(180deg, #16232e, #0d151c);
    transition: all 0.4s ease;
  }

  .sym__e {
    font-size: 30px;
    line-height: 1;
    filter: saturate(1.05);
  }

  .sym.is-match {
    border-color: var(--blue);
    background: linear-gradient(180deg, #d9f4ff, #62c8f0);
    box-shadow: 0 0 0 2px rgba(56, 189, 248, 0.3),
      0 10px 24px -10px rgba(56, 189, 248, 0.9);
    animation: pop 0.45s ease both;
  }

  .sym.is-match .sym__e {
    filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.3));
  }

  .legend {
    display: flex;
    flex-wrap: wrap;
    gap: 6px 10px;
    margin-top: 2px;
  }

  .legend__i {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: 10.5px;
    font-weight: 700;
    color: var(--muted);
    font-variant-numeric: tabular-nums;
  }

  .legend__i b {
    font-size: 14px;
    font-weight: 400;
  }

  .wave {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 26px;
    background: linear-gradient(180deg, transparent, rgba(56, 189, 248, 0.14));
    pointer-events: none;
  }
</style>

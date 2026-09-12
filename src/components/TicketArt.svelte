<script>
  import { eur, pad2 } from "../lib/tickets.js";

  let { ticket, outcome } = $props();

  const isNumbers = $derived(ticket.id !== "vela");
</script>

{#if isNumbers}
  <div class="art art--nums" data-theme={ticket.theme}>
    <div class="band">
      <span class="band__k">I TUOI NUMERI</span>
      <span class="band__v">{ticket.mechanic}</span>
    </div>

    <div class="ynums" style="--cols:{ticket.yoursCount > 6 ? 4 : 3}">
      {#each outcome.yours as n (n)}
        <div class="ynum" class:is-match={outcome.matches.includes(n)}>
          {pad2(n)}
        </div>
      {/each}
    </div>

    <div class="band">
      <span class="band__k">NUMERI VINCENTI</span>
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
      <div class="stamp">
        1 BIGLIETTO SU {eur(ticket.maxOdds).replace(" €", "")} VINCE IL PREMIO MAX
      </div>
    {/if}

    <div class="brandline">{ticket.brand} · {ticket.variant}</div>
  </div>
{:else}
  <div class="art art--vela" data-theme={ticket.theme}>
    <div class="band">
      <span class="band__k">TROVA 3 SIMBOLI UGUALI</span>
      <span class="band__v">Vinci il premio del simbolo</span>
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

    <div class="brandline">{ticket.brand} · {ticket.variant}</div>
  </div>
{/if}

<style>
  .art {
    --paper: #fffdf6;
    --ink: #141414;
    --cell: #ffffff;
    --line: #171717;
    --accent: #d92b3f;
    --sub: #6b6b6b;
    --match-a: #ffe9a8;
    --match-b: #f0b21f;
    --match-ink: #2a1c00;
    --band-bg: #d92b3f;
    --band-ink: #ffffff;

    position: relative;
    padding: 16px 14px 14px;
    min-height: 330px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    color: var(--ink);
    background-color: var(--paper);
    background-image: radial-gradient(
        rgba(0, 0, 0, 0.045) 1px,
        transparent 1px
      );
    background-size: 9px 9px;
  }

  .art[data-theme="gold"] {
    --paper: #0d1524;
    --ink: #f7e7bb;
    --cell: #0f1a2e;
    --line: #c9a13a;
    --accent: #f5c542;
    --sub: #c9b98a;
    --match-a: #ffe9a8;
    --match-b: #f0b21f;
    --match-ink: #2a1c00;
    --band-bg: #f5c542;
    --band-ink: #241a00;
    background-image: radial-gradient(
      rgba(255, 255, 255, 0.05) 1px,
      transparent 1px
    );
  }

  .art[data-theme="blue"] {
    --paper: #eaf8fd;
    --ink: #0b3b52;
    --cell: #ffffff;
    --line: #0b3b52;
    --accent: #0e7490;
    --sub: #4a7c8f;
    --match-a: #cdeffb;
    --match-b: #4db8dd;
    --match-ink: #04283a;
    --band-bg: #0e7490;
    --band-ink: #ffffff;
    background-image: radial-gradient(
      rgba(11, 59, 82, 0.06) 1px,
      transparent 1px
    );
  }

  .band {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  .band__k {
    display: inline-block;
    padding: 3px 9px;
    border-radius: 4px;
    background: var(--band-bg);
    color: var(--band-ink);
    font-size: 9.5px;
    font-weight: 900;
    letter-spacing: 0.14em;
  }

  .band__v {
    font-size: 10px;
    color: var(--sub);
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
    border-radius: 7px;
    border: 1.6px solid var(--line);
    background: var(--cell);
    color: var(--ink);
    font-size: 21px;
    font-weight: 900;
    font-variant-numeric: tabular-nums;
    letter-spacing: 0.02em;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.25);
    transition: all 0.4s ease;
  }

  .ynum.is-match {
    border-color: var(--accent);
    background: linear-gradient(180deg, var(--match-a), var(--match-b));
    color: var(--match-ink);
    box-shadow: 0 0 0 2px rgba(245, 179, 1, 0.35),
      0 8px 20px -8px rgba(245, 179, 1, 0.9);
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
    padding: 6px 9px;
    border-radius: 7px;
    border: 1.4px solid color-mix(in srgb, var(--line) 55%, transparent);
    background: color-mix(in srgb, var(--cell) 75%, transparent);
  }

  .wnum__n {
    font-size: 17px;
    font-weight: 900;
    font-variant-numeric: tabular-nums;
    color: var(--ink);
  }

  .wnum__p {
    font-size: 11px;
    font-weight: 900;
    color: var(--accent);
    white-space: nowrap;
  }

  .wnum.is-top {
    border-color: var(--accent);
    background: color-mix(in srgb, var(--accent) 16%, var(--cell));
  }

  .stamp {
    margin-top: auto;
    align-self: flex-start;
    padding: 4px 9px;
    border: 1.5px dashed var(--accent);
    border-radius: 6px;
    font-size: 9px;
    font-weight: 900;
    letter-spacing: 0.08em;
    color: var(--accent);
  }

  .brandline {
    margin-top: 2px;
    padding-top: 8px;
    border-top: 1px dashed color-mix(in srgb, var(--line) 45%, transparent);
    font-size: 9px;
    font-weight: 800;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--sub);
    text-align: center;
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
    border-radius: 9px;
    border: 1.6px solid var(--line);
    background: var(--cell);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.3);
    transition: all 0.4s ease;
  }

  .sym__e {
    font-size: 30px;
    line-height: 1;
  }

  .sym.is-match {
    border-color: var(--accent);
    background: linear-gradient(180deg, var(--match-a), var(--match-b));
    box-shadow: 0 0 0 2px rgba(56, 189, 248, 0.35),
      0 10px 22px -10px rgba(56, 189, 248, 0.9);
    animation: pop 0.45s ease both;
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
    font-weight: 800;
    color: var(--sub);
    font-variant-numeric: tabular-nums;
  }

  .legend__i b {
    font-size: 14px;
    font-weight: 400;
  }
</style>

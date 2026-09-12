<script>
  import { eur } from "../lib/tickets.js";

  let { ticket, compact = false } = $props();

  const isNumbers = $derived(ticket.id !== "vela");
</script>

<div class="cover" data-theme={ticket.theme} class:cover--compact={compact}>
  <div class="cover__coins" aria-hidden="true"></div>
  <div class="cover__hat" aria-hidden="true"></div>
  <div class="cover__shine" aria-hidden="true"></div>

  <div class="head">
    <span class="head__brand">{ticket.brand}</span>
    <span class="head__variant">{ticket.variant}</span>
  </div>

  {#if isNumbers}
    <div class="rule">SE TROVI I SIMBOLI VINCI</div>

    <div class="picks">
      <span class="pick"><b>★</b>100€</span>
      <span class="pick"><b>⛊</b>200€</span>
      <span class="pick"><b>€</b>500€</span>
      <span class="pick pick--all">TUTTI<br />I PREMI</span>
    </div>

    <div class="lbl">NUMERI VINCENTI</div>
    <div class="coins">
      {#each Array(5) as _, i (i)}<span class="coin">€</span>{/each}
    </div>

    <div class="lbl">I TUOI NUMERI</div>
    <div class="notes">
      {#each Array(15) as _, i (i)}
        <span class="note" style="--r:{(i % 3) - 1}deg">€50</span>
      {/each}
    </div>
  {:else}
    <div class="rule">TROVA 3 SIMBOLI UGUALI</div>

    <div class="syms">
      {#each ["⚓", "⛵", "🧭", "🐬", "⭐", "🐚"] as s (s)}
        <span class="sym">{s}</span>
      {/each}
    </div>
  {/if}

  <div class="max">PREMIO MASSIMO {eur(ticket.maxPrize).toUpperCase()}</div>

  <div class="brand2">
    <span class="brand2__gev">Gratta</span>
    <span class="brand2__e">&amp;</span>
    <span class="brand2__vinci">Vinci</span>
  </div>

  <span class="tag">€{ticket.price}</span>
</div>

<style>
  .cover {
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    gap: 5px;
    padding: 9px 9px 8px;
    border-radius: 10px;
    background: linear-gradient(180deg, #ffd24a, #f0a900);
    border: 2px solid #3a2a00;
    box-shadow: 0 10px 22px -12px rgba(0, 0, 0, 0.9);
    color: #2a1c00;
    font-family: var(--sans);
  }

  .cover[data-theme="silver"] {
    background: linear-gradient(180deg, #e9ebef, #b9bdc4);
  }

  .cover[data-theme="blue"] {
    background: linear-gradient(180deg, #d7f3fd, #7fc9e4);
  }

  /* texture monete di sfondo */
  .cover__coins {
    position: absolute;
    inset: 0;
    opacity: 0.5;
    background-image: radial-gradient(
        circle at 50% 50%,
        rgba(255, 255, 255, 0.55) 18%,
        rgba(245, 179, 1, 0.85) 19%,
        rgba(180, 120, 0, 0.9) 30%,
        transparent 31%
      );
    background-size: 26px 26px;
    background-position: 0 0, 13px 13px;
    pointer-events: none;
  }

  .cover[data-theme="blue"] .cover__coins {
    opacity: 0.22;
  }

  .cover__hat {
    position: absolute;
    top: -10px;
    right: -12px;
    width: 46px;
    height: 30px;
    background: #1c1c22;
    transform: rotate(22deg);
    border-radius: 4px 4px 0 0;
    box-shadow: 0 4px 0 #0d0d10;
    opacity: 0.9;
  }

  .cover__shine {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      115deg,
      transparent 30%,
      rgba(255, 255, 255, 0.35) 45%,
      transparent 60%
    );
    pointer-events: none;
  }

  .cover--compact {
    gap: 3px;
    padding: 6px 5px 5px;
    border-width: 1.5px;
  }

  .cover--compact .head__brand {
    font-size: 9.5px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 100%;
  }

  .cover--compact .head__variant {
    font-size: 5.5px;
  }

  .cover--compact .rule {
    font-size: 5px;
    padding: 1px 4px;
    letter-spacing: 0.04em;
  }

  .cover--compact .picks {
    display: none;
  }

  .cover--compact .lbl {
    font-size: 4.5px;
    white-space: nowrap;
    padding: 1px 3px;
    letter-spacing: 0.05em;
  }

  .cover--compact .coin {
    font-size: 6px;
  }

  .cover--compact .note {
    height: 7px;
    font-size: 4px;
  }

  .cover--compact .sym {
    font-size: 11px;
    border-width: 1px;
  }

  .cover--compact .max {
    font-size: 4.5px;
    padding: 1px 3px;
    letter-spacing: 0;
  }

  .cover--compact .brand2__gev,
  .cover--compact .brand2__vinci {
    font-size: 6px;
  }

  .cover--compact .tag {
    font-size: 7px;
    padding: 1px 4px;
    right: 5px;
    bottom: 5px;
  }

  .cover--compact .cover__hat {
    width: 34px;
    height: 20px;
    top: -7px;
    right: -9px;
  }

  .head {
    position: relative;
    z-index: 2;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .head__brand {
    font-size: 15px;
    font-weight: 900;
    letter-spacing: -0.01em;
    line-height: 0.98;
    color: #1f7a3a;
    -webkit-text-stroke: 1.2px #0d3d1c;
    paint-order: stroke fill;
    text-shadow: 0 1.5px 0 rgba(0, 0, 0, 0.35);
  }

  .cover[data-theme="silver"] .head__brand {
    color: #e0283f;
    -webkit-text-stroke: 1.2px #6b0d1c;
  }

  .cover[data-theme="blue"] .head__brand {
    color: #0e7490;
    -webkit-text-stroke: 1.2px #04303d;
  }

  .head__variant {
    font-size: 7px;
    font-weight: 900;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: #4a3200;
    opacity: 0.8;
  }

  .cover[data-theme="blue"] .head__variant {
    color: #063a4a;
  }

  .rule {
    position: relative;
    z-index: 2;
    align-self: center;
    padding: 2px 7px;
    border-radius: 3px;
    background: #c8192f;
    color: #ffe08a;
    font-size: 6.5px;
    font-weight: 900;
    letter-spacing: 0.1em;
    white-space: nowrap;
  }

  .picks {
    position: relative;
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 3px;
  }

  .pick {
    display: inline-flex;
    align-items: center;
    gap: 1px;
    padding: 2px 3px;
    border-radius: 8px;
    background: linear-gradient(180deg, #ffcf4d, #e39400);
    border: 1px solid rgba(80, 50, 0, 0.5);
    font-size: 6.5px;
    font-weight: 900;
    color: #3a2400;
    line-height: 1;
  }

  .pick b {
    font-size: 8px;
  }

  .pick--all {
    border-radius: 3px;
    background: linear-gradient(180deg, #ffd98a, #e0a018);
    font-size: 5.5px;
    line-height: 1.05;
    text-align: center;
  }

  .lbl {
    position: relative;
    z-index: 2;
    align-self: center;
    padding: 1px 6px;
    border-radius: 3px;
    background: #c8192f;
    color: #fff;
    font-size: 6px;
    font-weight: 900;
    letter-spacing: 0.12em;
  }

  .coins {
    position: relative;
    z-index: 2;
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 3px;
  }

  .coin {
    aspect-ratio: 1;
    display: grid;
    place-items: center;
    border-radius: 50%;
    background: radial-gradient(circle at 34% 30%, #fff4c0, #f5b301 55%, #a86a00);
    border: 1px solid #7a4f00;
    font-size: 9px;
    font-weight: 900;
    color: #6b4600;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.35);
  }

  .notes {
    position: relative;
    z-index: 2;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 2px 3px;
  }

  .note {
    position: relative;
    height: 9px;
    border-radius: 2px;
    background: linear-gradient(180deg, #ff9b3d, #e5611a);
    border: 1px solid #8a3200;
    transform: rotate(var(--r, 0deg));
    display: grid;
    place-items: center;
    font-size: 5px;
    font-weight: 900;
    color: #fff3d6;
    box-shadow: 0 1px 0 rgba(0, 0, 0, 0.25);
  }

  .syms {
    position: relative;
    z-index: 2;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 3px;
  }

  .sym {
    aspect-ratio: 1;
    display: grid;
    place-items: center;
    border-radius: 5px;
    background: #fff;
    border: 1.4px solid #0b3b52;
    font-size: 15px;
    line-height: 1;
  }

  .max {
    position: relative;
    z-index: 2;
    margin-top: auto;
    padding: 2px 5px;
    border-radius: 3px;
    background: #c8192f;
    color: #fff;
    font-size: 6.5px;
    font-weight: 900;
    letter-spacing: 0.03em;
    text-align: center;
    white-space: nowrap;
  }

  .brand2 {
    position: relative;
    z-index: 2;
    display: inline-flex;
    align-items: center;
    gap: 2px;
    align-self: flex-start;
    font-weight: 900;
    line-height: 1;
  }

  .brand2__gev {
    font-size: 8px;
    color: #1f7a3a;
    -webkit-text-stroke: 0.8px #0d3d1c;
    paint-order: stroke fill;
  }

  .brand2__e {
    font-size: 7px;
    color: #f5b301;
    -webkit-text-stroke: 0.8px #7a4f00;
    paint-order: stroke fill;
  }

  .brand2__vinci {
    font-size: 8px;
    color: #1f7a3a;
    -webkit-text-stroke: 0.8px #0d3d1c;
    paint-order: stroke fill;
  }

  .cover[data-theme="silver"] .brand2__gev,
  .cover[data-theme="silver"] .brand2__vinci {
    color: #e0283f;
    -webkit-text-stroke-color: #6b0d1c;
  }

  .cover[data-theme="blue"] .brand2__gev,
  .cover[data-theme="blue"] .brand2__vinci {
    color: #0e7490;
    -webkit-text-stroke-color: #04303d;
  }

  .tag {
    position: absolute;
    right: 7px;
    bottom: 7px;
    z-index: 3;
    padding: 2px 6px;
    border-radius: 8px;
    background: #fff;
    border: 1.5px solid #2a1c00;
    font-size: 9px;
    font-weight: 900;
    color: #1a1200;
    font-variant-numeric: tabular-nums;
  }
</style>

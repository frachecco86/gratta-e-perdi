<script>
  import { TICKETS, eur, int, DISCLAIMER } from "../lib/tickets.js";
  import Ledger from "./Ledger.svelte";
  import TicketCover from "./TicketCover.svelte";

  let { onticket } = $props();
</script>

<section class="shelf">
  <div class="hero">
    <span class="hero__kicker">Parodia satirica · nessun premio reale</span>
    <h1 class="hero__title">Gratta <em>&</em> Perdi</h1>
    <p class="hero__sub">
      Gratti, "vinci" 2 €, e intanto hai perso. Le probabilità sono quelle
      vere. Il banco vince sempre.
    </p>
  </div>

  <Ledger />

  <div class="shelf__label">Scegli il biglietto</div>

  <div class="grid">
    {#each TICKETS as t (t.id)}
      <button class="tcard" data-theme={t.theme} onclick={() => onticket(t)}>
        <span class="tcard__art">
          <TicketCover ticket={t} compact />
        </span>
        <span class="tcard__body">
          <div class="tcard__top">
            <span class="tcard__brand">{t.brand}</span>
            <span class="tcard__price">€{t.price}</span>
          </div>
          <span class="tcard__variant">{t.variant}{#if t.invented}<span class="tcard__flag">inventato</span>{/if}</span>
          <div class="tcard__prize">
            <span class="tcard__prize-k">premio max</span>
            <span class="tcard__prize-v">{eur(t.maxPrize)}</span>
          </div>
          <p class="tcard__tag">{t.tagline}</p>
          <div class="tcard__meta">
            <span>1 su {int(t.maxOdds)}</span>
            <span class="tcard__cta">Gratta →</span>
          </div>
        </span>
      </button>
    {/each}
  </div>

  <p class="disc">{DISCLAIMER}</p>
</section>

<style>
  .shelf {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding-top: 8px;
    animation: fade-in 0.4s ease both;
  }

  .hero {
    padding: 6px 2px 0;
  }

  .hero__kicker {
    display: inline-block;
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--danger-2);
  }

  .hero__title {
    margin: 6px 0 6px;
    font-size: clamp(34px, 12vw, 52px);
    font-weight: 900;
    letter-spacing: -0.035em;
    line-height: 0.95;
  }

  .hero__title em {
    font-style: normal;
    color: var(--gold);
  }

  .hero__sub {
    font-size: 13.5px;
    line-height: 1.5;
    color: var(--muted);
    max-width: 42ch;
  }

  .shelf__label {
    font-size: 10.5px;
    font-weight: 900;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--muted-2);
    margin-bottom: -6px;
  }

  .grid {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .tcard {
    position: relative;
    overflow: hidden;
    display: flex;
    align-items: stretch;
    gap: 12px;
    text-align: left;
    padding: 10px;
    border-radius: 18px;
    border: 1px solid var(--line);
    background: linear-gradient(150deg, #1c1c26, #121219);
    box-shadow: var(--shadow);
    transition: transform 0.16s ease, border-color 0.2s ease;
  }

  .tcard:active {
    transform: scale(0.985);
  }

  .tcard__art {
    flex: 0 0 84px;
    width: 84px;
    display: block;
  }

  .tcard__art :global(.cover) {
    height: 100%;
    min-height: 132px;
  }

  .tcard__body {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
  }

  .tcard[data-theme="gold"] {
    background: linear-gradient(150deg, #241c08, #14100a);
    border-color: rgba(245, 179, 1, 0.32);
  }

  .tcard[data-theme="blue"] {
    background: linear-gradient(150deg, #08202e, #071017);
    border-color: rgba(56, 189, 248, 0.32);
  }

  .tcard__sheen {
    display: none;
  }

  .tcard__top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
  }

  .tcard__brand {
    font-size: 17px;
    font-weight: 900;
    letter-spacing: 0.02em;
  }

  .tcard__price {
    display: inline-grid;
    place-items: center;
    min-width: 44px;
    padding: 5px 9px;
    border-radius: 999px;
    background: linear-gradient(180deg, #ffd24a, #f0a900);
    color: #241a00;
    font-size: 15px;
    font-weight: 900;
  }

  .tcard__variant {
    display: inline-block;
    margin-top: 2px;
    font-size: 10.5px;
    font-weight: 800;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--muted);
  }

  .tcard__prize {
    display: flex;
    flex-direction: column;
    margin: 12px 0 8px;
  }

  .tcard__prize-k {
    font-size: 9.5px;
    font-weight: 800;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--muted-2);
  }

  .tcard__prize-v {
    font-size: 26px;
    font-weight: 900;
    letter-spacing: -0.02em;
    font-variant-numeric: tabular-nums;
  }

  .tcard[data-theme="gold"] .tcard__prize-v {
    color: var(--gold);
  }

  .tcard[data-theme="blue"] .tcard__prize-v {
    color: var(--blue);
  }

  .tcard__tag {
    font-size: 12px;
    color: var(--muted);
    line-height: 1.4;
    margin-bottom: 12px;
  }

  .tcard__meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 10px;
    border-top: 1px solid var(--line);
    font-size: 11px;
    font-weight: 700;
    color: var(--muted-2);
    font-variant-numeric: tabular-nums;
  }

  .tcard__cta {
    color: var(--txt);
    font-weight: 800;
  }

  .tcard__flag {
    display: inline-block;
    margin-left: 6px;
    padding: 1px 5px;
    border: 1px dashed rgba(56, 189, 248, 0.6);
    border-radius: 5px;
    font-size: 7.5px;
    font-weight: 800;
    letter-spacing: 0.06em;
    color: var(--blue);
    vertical-align: middle;
  }

  .disc {
    font-size: 10.5px;
    line-height: 1.5;
    color: var(--muted-2);
    padding: 2px 2px 0;
  }
</style>

<script>
  import ScratchSurface from "./ScratchSurface.svelte";
  import TicketArt from "./TicketArt.svelte";
  import ResultPanel from "./ResultPanel.svelte";
  import Confetti from "./Confetti.svelte";
  import { untrack } from "svelte";
  import { eur, generateOutcome } from "../lib/tickets.js";
  import * as audio from "../lib/audio.js";

  let { ticket, forceMirage = false, onreveal, onnext, onstop } = $props();

  // esito congelato alla nascita del biglietto (una sola volta)
  const outcome = untrack(() => generateOutcome(ticket, { forceMirage }));
  let revealed = $state(false);

  const isNumbers = $derived(ticket.id !== "vela");

  // zone del tagliando da coprire con la grafica (monete / banconote)
  const targets = $derived(
    isNumbers
      ? [
          { selector: ".wnum", key: "winning" },
          { selector: ".ynum", key: "yours" },
        ]
      : [{ selector: ".sym", key: "symbols" }]
  );

  function handleComplete() {
    if (revealed) return;
    revealed = true;
    audio.stopScratch();
    audio.reveal();
    setTimeout(() => audio.play(outcome.kind), 280);
    onreveal?.(outcome);
  }
</script>

<div class="play">
  <div class="ticket" data-theme={ticket.theme}>
    <div class="ticket__top">
      <div class="ticket__brand">
        <span class="ticket__brand-main">{ticket.brand}</span>
        <span class="ticket__brand-sub">{ticket.variant}</span>
      </div>
      <div class="ticket__price">€{ticket.price}</div>
    </div>

    <div class="ticket__prize">
      <span class="ticket__prize-k">vincita massima</span>
      <span class="ticket__prize-v">{eur(ticket.maxPrize)}</span>
    </div>

    <div class="ticket__play">
      <ScratchSurface
        theme={ticket.theme}
        label="GRATTA QUI"
        {targets}
        oncomplete={handleComplete}
      >
        <TicketArt {ticket} {outcome} />
      </ScratchSurface>
    </div>

    <div class="ticket__foot">
      <span>{ticket.mechanic}</span>
      <span class="ticket__real">⚑ {ticket.realName}</span>
    </div>
  </div>

  {#if revealed}
    <ResultPanel {ticket} {outcome} {onnext} {onstop} />
  {/if}
</div>

<Confetti
  show={revealed && (outcome.kind === "mirage" || outcome.kind === "small")}
/>

<style>
  .play {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding-top: 10px;
  }

  .ticket {
    border-radius: 20px;
    overflow: hidden;
    border: 1px solid var(--line-2);
    background: #0e0e14;
    box-shadow: var(--shadow);
    animation: rise 0.4s ease both;
  }

  .ticket[data-theme="gold"] {
    border-color: rgba(245, 179, 1, 0.4);
  }

  .ticket[data-theme="blue"] {
    border-color: rgba(56, 189, 248, 0.4);
  }

  .ticket__top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    padding: 15px 16px 8px;
  }

  .ticket__brand {
    display: flex;
    flex-direction: column;
  }

  .ticket__brand-main {
    font-size: 21px;
    font-weight: 900;
    letter-spacing: 0.01em;
    line-height: 1;
  }

  .ticket[data-theme="gold"] .ticket__brand-main {
    color: var(--gold);
  }

  .ticket[data-theme="blue"] .ticket__brand-main {
    color: var(--blue);
  }

  .ticket__brand-sub {
    margin-top: 3px;
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--muted-2);
  }

  .ticket__price {
    display: grid;
    place-items: center;
    min-width: 52px;
    padding: 8px 12px;
    border-radius: 999px;
    background: linear-gradient(180deg, #ffd24a, #f0a900);
    color: #241a00;
    font-size: 18px;
    font-weight: 900;
    box-shadow: 0 8px 20px -10px rgba(245, 179, 1, 0.9);
  }

  .ticket__prize {
    display: flex;
    align-items: baseline;
    gap: 8px;
    padding: 0 16px 12px;
  }

  .ticket__prize-k {
    font-size: 9.5px;
    font-weight: 800;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--muted-2);
  }

  .ticket__prize-v {
    font-size: 20px;
    font-weight: 900;
    letter-spacing: -0.02em;
    font-variant-numeric: tabular-nums;
    color: var(--txt);
  }

  .ticket__play {
    position: relative;
    padding: 0 10px;
  }

  .ticket__foot {
    display: flex;
    flex-direction: column;
    gap: 3px;
    padding: 12px 16px 14px;
    font-size: 10.5px;
    color: var(--muted-2);
  }

  .ticket__real {
    color: var(--muted-2);
    opacity: 0.8;
  }
</style>

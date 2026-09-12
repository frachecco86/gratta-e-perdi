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

  let finished = false;

  function handleComplete() {
    if (finished) return;
    finished = true;
    revealed = true;
    audio.stopScratch();
    audio.reveal();
    setTimeout(() => audio.play(outcome.kind), 280);
    onreveal?.(outcome);
  }

  // il bottone "Rivela tutto" completa senza passare dalla canvas
  $effect(() => {
    if (revealed && !finished) handleComplete();
  });
</script>

<div class="play">
  <div class="ticket" data-theme={ticket.theme}>
    <div class="ticket__play">
      <ScratchSurface
        theme={ticket.theme}
        {targets}
        bind:revealed
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

  {#if !revealed}
    <button
      class="btn btn--gold btn--block reveal"
      onclick={() => (revealed = true)}>Rivela tutto</button
    >
  {/if}

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
    gap: 8px;
    padding-top: 10px;
  }

  .reveal {
    animation: fade-in 0.25s ease both;
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




  .ticket[data-theme="gold"] .ticket__brand-main {
    color: var(--gold);
  }

  .ticket[data-theme="blue"] .ticket__brand-main {
    color: var(--blue);
  }






  .ticket__play {
    position: relative;
    padding: 10px 10px 0;
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

<script>
  import { DISCLAIMER, HELPLINE, HELP_URL } from "./lib/tickets.js";
  import {
    ledger,
    registerPlay,
    markMirage,
  } from "./lib/store.svelte.js";
  import { setMuted, click, unlockAudio } from "./lib/audio.js";
  import Shelf from "./components/Shelf.svelte";
  import TicketPlay from "./components/TicketPlay.svelte";
  import Interstitial from "./components/Interstitial.svelte";
  import QuitScreen from "./components/QuitScreen.svelte";

  let screen = $state("shelf");
  let current = $state(null);
  let forceMirage = $state(false);
  let muted = $state(false);

  function startTicket(t) {
    unlockAudio();
    click();
    current = t;
    forceMirage = !ledger.mirageSeen && ledger.count === 4;
    screen = "play";
  }

  function handleReveal(outcome) {
    if (!current) return;
    registerPlay(current.price, outcome.amount);
    if (outcome.kind === "mirage") markMirage();
  }

  function handleNext() {
    click();
    if (ledger.count > 0 && ledger.count % 3 === 0) screen = "interstitial";
    else screen = "shelf";
  }

  function goQuit() {
    click();
    screen = "quit";
  }

  function handleRestart() {
    click();
    current = null;
    screen = "shelf";
  }

  function back() {
    click();
    screen = "shelf";
  }

  function toShelf() {
    click();
    screen = "shelf";
  }

  function toggleSound() {
    muted = !muted;
    setMuted(muted);
    if (!muted) {
      unlockAudio();
      click();
    }
  }
</script>

<div class="shell">
  <header class="topbar">
    <button
      class="topbar__ico"
      class:topbar__ico--hidden={screen !== "play"}
      onclick={back}
      aria-label="Torna ai biglietti">←</button
    >
    <span class="topbar__brand">Gratta <em>&</em> Perdi</span>
    <button
      class="topbar__ico"
      onclick={toggleSound}
      aria-label={muted ? "Attiva i suoni" : "Disattiva i suoni"}
      >{muted ? "🔇" : "🔊"}</button
    >
  </header>

  <main class="main">
    {#if screen === "shelf"}
      <Shelf onticket={startTicket} />
    {:else if screen === "play" && current}
      <TicketPlay
        ticket={current}
        {forceMirage}
        onreveal={handleReveal}
        onnext={handleNext}
        onstop={goQuit}
      />
    {:else if screen === "interstitial"}
      <Interstitial oncontinue={toShelf} onstop={goQuit} />
    {:else if screen === "quit"}
      <QuitScreen onrestart={handleRestart} />
    {/if}
  </main>

  <footer class="foot">
    <p class="foot__help">
      Se il gioco non è più un gioco:
      <a href={HELP_URL} target="_blank" rel="noopener">usciredalgioco.iss.it</a>
      · Telefono Verde <b>{HELPLINE}</b>
    </p>
    <p class="foot__disc">{DISCLAIMER}</p>
  </footer>
</div>

<style>
  .topbar {
    position: sticky;
    top: 0;
    z-index: 40;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    padding: 12px 0 10px;
    margin: 0 -16px;
    padding-left: 16px;
    padding-right: 16px;
    background: linear-gradient(180deg, rgba(8, 8, 11, 0.96), rgba(8, 8, 11, 0.72) 70%, transparent);
    backdrop-filter: blur(8px);
  }

  .topbar__brand {
    font-size: 15px;
    font-weight: 900;
    letter-spacing: -0.01em;
  }

  .topbar__brand em {
    font-style: normal;
    color: var(--gold);
  }

  .topbar__ico {
    width: 40px;
    height: 40px;
    display: grid;
    place-items: center;
    border-radius: 12px;
    border: 1px solid var(--line);
    background: rgba(255, 255, 255, 0.04);
    font-size: 17px;
    transition: transform 0.14s ease, opacity 0.2s ease;
  }

  .topbar__ico:active {
    transform: scale(0.94);
  }

  .topbar__ico--hidden {
    opacity: 0;
    pointer-events: none;
  }

  .main {
    flex: 1;
  }

  .foot {
    margin-top: 26px;
    padding-top: 16px;
    border-top: 1px solid var(--line);
    display: flex;
    flex-direction: column;
    gap: 7px;
  }

  .foot__help {
    font-size: 11.5px;
    line-height: 1.5;
    color: var(--muted);
  }

  .foot__help a {
    color: var(--green);
    font-weight: 700;
    text-decoration: none;
  }

  .foot__help b {
    color: var(--txt);
    font-variant-numeric: tabular-nums;
  }

  .foot__disc {
    font-size: 10px;
    line-height: 1.5;
    color: var(--muted-2);
  }
</style>

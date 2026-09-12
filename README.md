# Gratta & Perdi

Web app satirica e **mobile-first** contro la ludopatia: un finto _Gratta e Vinci_
con superficie grattabile (Canvas + pointer/touch), suoni sintetizzati via
Web Audio e un "bilancio reale" che mostra quanto si sta perdendo davvero.

> ⚠️ **Parodia.** App non affiliata a Gratta e Vinci, Lottomatica o ADM.
> Nessun premio reale viene corrisposto. I biglietti sono ricostruzioni ironiche
> a scopo di critica sociale.

## Cosa fa

- **3 biglietti** ispirati ai più iconici:
  - `Gratta e Vinci — Classico` (2 €) — meccanica "i tuoi numeri"
  - `Il Miliardario Maxi` (20 €) — meccanica "i tuoi numeri", premio max 5.000.000 €
  - `Gratta e Vela` (5 €) — biglietto **inventato**, meccanica "trova 3 simboli"
- **Superficie grattabile** su `<canvas>`: brush con destino-out, texture foil
  procedurale, effetto moneta che segue il dito, suono di grattata e "clink".
- **Auto-reveal** al 55% grattato + bottone "Rivela tutto" (accessibilità).
- **Suoni sintetizzati** (Web Audio, zero asset): moneta, grattata, whoosh,
  jingle di esito (vincita, quasi-vincita, perdita, fanfara).
- **Esiti satirici**: rimborsi mascherati da vincite, quasi-vincite progettate,
  coupon inutili e — al 5° biglietto — un **miraggio da 5.000.000 €** che si
  rivela non valido.
- **Bilancio reale** persistente (`localStorage`): speso, "vinto", netto, tempo.
- **Checkpoint anti-ludopatia** ogni 3 biglietti e schermata finale con il
  Telefono Verde Nazionale **800 55 88 22** e il link a `usciredalgioco.iss.it`.

## Dati reali usati (fonti pubbliche)

- Ritorno medio al giocatore: tra **60 e 80 centesimi per euro** speso (RTP max 75%).
- Premio massimo de _Il Miliardario Maxi_ (5.000.000 €): **1 su 9.360.000** biglietti.
- Un biglietto de _Il Miliardario Maxi_ è vincente premi superiori al costo
  **1 volta ogni 7,45**.
- Probabilità media di vincita dell'intera gamma: **1 su 3,60**.

## Stack

- [Svelte 5](https://svelte.dev) (runes) + [Vite](https://vite.dev)
- Canvas 2D, Pointer Events, Web Audio API
- Nessuna dipendenza a runtime oltre a Svelte

## Sviluppo

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # output in dist/
npm run preview
```

## Deploy

Configurato per Netlify (`netlify.toml`): build `npm run build`, publish `dist`.

## Aiuto

Se il gioco non è più un gioco:

- **Telefono Verde Nazionale per il gioco d'azzardo: 800 55 88 22**
  (gratuito, anonimo — Istituto Superiore di Sanità)
- <https://usciredalgioco.iss.it/>

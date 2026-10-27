# HunarSetu Voice Commons — hunarfix

## Implementation approach

HunarSetu preserves the existing warm neighborhood-commons experience while adding a real, reviewable voice-to-response flow. The browser records a bounded audio clip with explicit permission and sends it to the Node server. The server validates the request, calls the managed Speech transcription endpoint, and passes the authoritative transcript to a strict structured-extraction request. The response is displayed as a suggestion only; nothing is posted automatically and audio/transcript data is not persisted in this iteration.

Everyday help remains non-monetary: one hour equals one time credit. The optional ₹499 workshop is a separate sandbox checkout lane. The existing published site remains unchanged; the new project is `hunarfix` and auto-publish is disabled until explicit approval.

## Design

- **Design movement:** warm editorial neighborhood commons.
- **Core principles:** local and human; truthful about uncertainty; accessible by voice; clear separation between time credits and paid workshops.
- **Color philosophy:** paper cream keeps the interface welcoming, dark ink keeps reading grounded, sage signals community trust, and HunarSetu orange marks action and voice.
- **Layout paradigm:** split hero, local discovery strip, deep-sage voice panel, and compact response card that stacks cleanly on mobile.
- **Signature elements:** three-bar Hunar mark; orbit/connection-line neighborhood illustration; restrained microphone waveform/status rings.
- **Interaction philosophy:** explicit tap-to-record, clear live state, keyboard labels, reduced-motion support, and no celebratory success styling for an unconfirmed response.
- **Typography:** Manrope for UI/headlines, DM Mono for labels/data, and an editorial serif italic accent.
- **Brand essence:** a trusted voice-first neighborhood exchange for people sharing useful skills through time, not money. Warm, capable, respectful.
- **Brand voice:** “Say it like you’d say it to a neighbor.” “Your recording is sent for transcription; it is not saved.”
- **Wordmark:** three rising bars paired with the `hunarsetu` wordmark.
- **Signature color:** `#ea6c37`.

## Project structure

- `public/index.html`, `public/styles.css`, `public/script.js`: site shell and voice interaction.
- `public/assets/logo.svg`: Hunar mark.
- `public/manus-routes.json`: `/` and `/orders` page routes.
- `src/voice/transcribe.mjs`, `src/voice/extract.mjs`: managed Speech and LLM adapters.
- `server.mjs`: Node HTTP server, static serving, health, voice endpoint, checkout placeholder, and order history surface.
- `products.mjs`: workshop catalog and server-owned price.
- `scripts/build.mjs`: content-hashed static asset build.
- `tests/`: focused request and extraction tests.
- `Dockerfile`, `package.json`, `pnpm-workspace.yaml`, `app.config.ts`: reproducible Node 22 deployment.

## Build and delivery

Use Node 22 and pnpm 11. Keep public static assets in `public/`; build output goes to `dist/`. The container serves the same built assets and listens on `PORT` or 3000. Configure `/api/*` to the server and static pages/assets to the static host. Validate the route manifest, health endpoint, voice request states, strict extraction validation, no-persistence behavior, and sandbox checkout/webhook boundaries before checkpointing. Publish only after the user explicitly requests it.

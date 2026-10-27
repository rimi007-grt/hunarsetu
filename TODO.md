# HunarSetu / hunarfix TODO

## Outcome 1 — Preserve the HunarSetu experience

- [ ] Migrate the warm editorial homepage, local offers/needs showcase, time-credit explanation, SHG/Skill Passport trust content, community metrics, ₹499 workshop catalog, logo, and responsive layout.
- [ ] Keep ordinary community help strictly non-monetary: one hour equals one time credit.
- [ ] Keep the existing published URL unchanged.

## Outcome 2 — Implement truthful voice capture

- [ ] Use `getUserMedia` and `MediaRecorder` with explicit permission.
- [ ] Support ready → recording → uploading/transcribing → extracting → result states.
- [ ] Stop all microphone tracks after capture.
- [ ] Handle unsupported format, empty recording, upload-size, network, provider, permission, and retry states.
- [ ] Keep browser speech recognition only as a provisional preview; it must never substitute for the server result.

## Outcome 3 — Implement managed transcription and extraction

- [ ] Send the user-started audio blob to the server with conservative size/duration limits.
- [ ] Call managed Speech transcription using `whisper-1` and a language/domain hint.
- [ ] Pass the authoritative transcript to a strict-schema managed LLM extraction call.
- [ ] Validate transcript, intent, category, availability, locality, and clarification fields at runtime.
- [ ] Use Sector 62 / Noida coordinates only as a bounded approximation; never invent unknown coordinates.
- [ ] Return a retryable provider error or validated fallback result; never fabricate transcript or confidence.
- [ ] Do not persist audio, transcript, or listing data.
- [ ] Disclose that recording is sent to managed speech/AI services and is not saved.

## Outcome 4 — Keep paid workshops separate and safe

- [ ] Use platform-managed Stripe sandbox only; do not copy old/live keys.
- [ ] Keep product/price server-owned and community exchanges outside Stripe.
- [ ] Preserve Checkout Session creation, raw-body webhook verification, durable order/event records, redirect-as-non-proof behavior, and `/orders` history keyed by a hashed unguessable browser token.
- [ ] Tell testers to use `4242 4242 4242 4242` only in sandbox.

## Outcome 5 — Make the project deployable

- [ ] Keep editable assets in `public/`; fingerprint CSS/JS into `dist/`.
- [ ] Serve a valid `manus-routes.json` for `/` and `/orders`; exclude APIs.
- [ ] Use additive/idempotent database initialization.
- [ ] Keep keys server-side, do not log raw audio/transcripts, and return generic public errors.
- [ ] Configure build, deploy health path, and `/api/*` server routing.

## Outcome 6 — Validate and publish

- [ ] Run focused Node checks for voice validation, extraction/clarification, errors, route manifest, build hashes, health, and sandbox checkout/webhook behavior.
- [ ] Review mobile/accessibility/reduced-motion behavior.
- [ ] Save the intended checkpoint and publish only after explicit instruction.

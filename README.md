# HunarSetu Voice Commons

A voice-first neighborhood exchange where useful skills are shared through time, not money.

## Demo

- Live project: https://hunarfix-x54pdjj9.manus.space
- GitHub repository: https://github.com/rimi007-grt/hunarsetu-voice-commons

## What it does

HunarSetu helps local communities discover and exchange skills, services, and practical support. Members can explore neighborhood offers and needs, learn how time credits work, and use a voice-first flow to turn a spoken request into a reviewable suggestion.

The voice flow is intentionally human-reviewed: it never publishes a listing automatically. Audio is sent to the managed speech and AI services for the response and is not retained as an audio asset.

## Highlights

- Voice capture with explicit microphone permission and clear recording states
- Server-side transcription and structured extraction of intent, category, availability, and locality
- Honest clarification when required information is missing
- Local offers and needs showcase with time-credit exchange guidance
- SHG and Skill Passport trust concepts for community participation
- Optional workshop checkout through a server-owned Stripe sandbox flow
- Accessible tap-to-record interaction, keyboard labels, reduced-motion support, and responsive editorial UI

## Technology

- Node.js 22 and pnpm 11
- Vanilla HTML, CSS, and JavaScript frontend
- Node server with managed Speech, LLM, database, and Stripe integrations
- Content-hashed production assets in `dist/`
- Docker-based production runtime

## Run locally

```bash
corepack enable
corepack prepare pnpm@11.0.0 --activate
pnpm install --frozen-lockfile
pnpm run build
pnpm start
```

The application listens on port `3000` by default. Run the test suite with:

```bash
pnpm test
```

## Project structure

- `public/` — editable frontend assets
- `src/voice/` — transcription and extraction adapters
- `scripts/` — production build tooling
- `tests/` — voice extraction tests
- `server.mjs` — Node server and API routes
- `products.mjs` — server-owned workshop catalog
- `dist/` — generated, fingerprinted production output

## Project status

HunarSetu Voice Commons was created for Hacktober Hack Days. The current release focuses on safe voice-to-response suggestions, local discovery, and a test-mode workshop checkout. Voice suggestions do not create persistent listings in this iteration.

## License

No license has been selected yet. Add a license before distributing or reusing the code outside the project team.

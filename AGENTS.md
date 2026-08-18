# AGENTS.md

## Project

RelayDesk is a production-style support operations demo built with Expo SDK 57, React Native,
Expo Router, TypeScript, and AsyncStorage. It runs on Android, iOS, and the web.

## Working rules

- Read the Expo SDK 57 documentation before changing platform APIs.
- Keep domain logic in `src/features/tickets/logic.ts` pure and covered by tests.
- Keep persistence behind `src/features/tickets/storage.ts`.
- Preserve Android, iOS, and responsive web behavior.
- Do not add remote services, analytics, or customer-data transmission to this local-first demo.
- Do not present local reply suggestions as a hosted AI service.
- Use the existing theme tokens and accessible React Native controls.
- Avoid dependencies unless they remove meaningful platform complexity.

## Required checks

Run `npm run check` before publishing. This covers lint, TypeScript, unit tests, and a static web
export.

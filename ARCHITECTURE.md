# Architecture

## Goals

RelayDesk is intentionally small enough to audit while demonstrating patterns that scale to a real
support product. Its core priorities are deterministic behavior, platform portability, clear data
ownership, and a fast operator workflow.

## Boundaries

### Routing and composition

`src/app` contains only Expo Router entry points. `SupportDeskScreen` owns responsive composition and
view-level state such as the active tab, query, and mobile detail visibility.

### Ticket domain

`src/features/tickets/model.ts` defines the domain contract. `logic.ts` contains the reducer,
selectors, SLA calculation, metrics, and reply-draft rules. These functions do not import React or
native APIs, so they are fast to test and portable to another client.

### Persistence

`storage.ts` is the only module that knows about AsyncStorage. `useSupportDesk` hydrates once, keeps
the reducer authoritative, and persists only after hydration to avoid overwriting an existing local
workspace with seed data.

### Presentation

Feature components receive data and commands through typed props. The screen switches between a
split desktop layout and focused mobile list/detail navigation at 780 px. Both layouts use the same
ticket state and business rules.

## Data flow

```text
AsyncStorage -> useSupportDesk -> reducer -> selectors -> screen -> feature components
                     ^                                      |
                     +-------------- commands --------------+
```

## Production extension points

A real deployment could replace the storage adapter with a typed API repository and server-backed
event stream. Authentication, role-based permissions, remote AI generation, retries, telemetry, and
conflict resolution are deliberately outside this local portfolio demo rather than simulated.

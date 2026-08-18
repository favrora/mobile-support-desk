# Contributing

## Setup

1. Install Node.js 20 or newer.
2. Run `npm ci`.
3. Start a target with `npm run android`, `npm run ios`, or `npm run web`.

## Change discipline

- Keep ticket business rules pure and add focused tests for behavior changes.
- Preserve mobile, tablet, and desktop layouts.
- Keep local persistence backward compatible with existing stored ticket data.
- Do not add analytics or remote data transmission without documenting the privacy impact.
- Keep UI copy concise and controls accessible.

## Before a pull request

Run `npm run check` and manually verify search, filters, ticket selection, status changes, reply
drafting, reply sending, and the Insights view.

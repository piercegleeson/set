# Daily Set

A daily puzzle game based on the card game [SET!](https://en.wikipedia.org/wiki/Set_(card_game)). Everyone gets the same deal each day — find all the sets and compare your time with friends.

Play it at [set.piercegleeson.com](https://set.piercegleeson.com)

## How it works

- Each day a new deck is dealt from 81 unique cards using a seeded PRNG
- Cards have four properties: color, shape, shading, and number
- A valid set is three cards where each property is either all the same or all different across the three cards
- The board starts with 12 cards; extra cards are dealt when no valid set exists

## Stack

- React + TypeScript
- Vite
- CSS Modules
- GitHub Pages

## Development

```bash
npm install
npm run dev
```

## Deployment

Pushes to `master` automatically build and deploy to GitHub Pages via a GitHub Actions workflow.

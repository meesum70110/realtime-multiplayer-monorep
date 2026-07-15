# Rock Paper Scissors Anything

Type **anything** as your move — a volcano, a tax audit, an angry goose — and an AI judge
decides who wins the clash. It's Rock Paper Scissors with the "three options" rule thrown
out: every round is a fresh, absurd matchup, settled by a (very serious) verdict.

Play best-of-3 against a bot opponent in an animated battle arena — synthesized sound and
music, a live clash feed, match chat, profiles, and a countdown that turns the screen red
when you're running out of time.

## How to play

1. Hit **Find Match** from the arena lobby.
2. When the round starts, **type your throw** — any word you want.
3. Beat the clock and **lock it in** before time runs out.
4. Both throws collide; a verdict rules the winner with an appropriately dramatic headline.
5. First to **2 round wins** takes the match. Rematch or head back to the lobby.

## Project structure

A pnpm workspace monorepo.

| Package | Role |
| --- | --- |
| **`packages/game-core`** | The framework-agnostic game engine — phase state machine, throw resolution, synthesized Web Audio sound/music, clash geometry, and the view-model. No React runtime dependency. |
| **`apps/game`** | The playable arena — React 19 + Vite + TypeScript. Consumes `@rpsa/game-core`. |
| **`apps/api`** | A NestJS scaffold reserved for future online multiplayer. Exposes `GET /health` today. |

## Getting started

```bash
pnpm install

pnpm dev            # play the game at http://localhost:5173
pnpm dev:api        # optional: NestJS api at http://localhost:4000/health

pnpm typecheck      # type-check every package
pnpm test           # run all tests
pnpm build          # build the game for production
```

## Tech

- **React 19 + Vite + TypeScript** (strict) for the client
- **pnpm workspaces** for the monorepo (no Turbo/Nx)
- **Web Audio API** — all sound and music are synthesized in the engine; there are no audio files
- **NestJS** for the api scaffold

The opponent is fully client-side, so the game runs with no backend.

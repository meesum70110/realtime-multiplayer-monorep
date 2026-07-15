# Rock Paper Scissors Anything

A byte-faithful 1:1 React port of the *Rock Paper Scissors Anything* battle-arena game:
type ANY word as your throw (volcano, tax audit, angry goose), an AI judge decides the
clash. Fully client-side — the opponent is a bot.

## Monorepo

pnpm workspaces. No Turbo/Nx.

| Package | Role |
|---|---|
| `packages/game-core` | Framework-agnostic game engine — state machine, throw resolution, synthesized WebAudio, clash geometry, and the `buildView` view-model. Zero React runtime dependency. |
| `apps/game` | React 19 + Vite + TypeScript SPA. Consumes `@rpsa/game-core`, renders the arena. |
| `apps/api` | Minimal NestJS scaffold — reserved for future online multiplayer (`GET /health` only today). |

## Getting started

```bash
pnpm install
pnpm dev            # runs the game at http://localhost:5173
pnpm dev:api        # optional: NestJS api at http://localhost:4000/health
pnpm typecheck      # all packages
pnpm test           # all packages
pnpm build          # build the game
```

See `docs/` for the design spec and implementation plan, and `design-source/` for the original design.

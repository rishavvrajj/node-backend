# node-backend

A hands-on reference for Node.js built-in modules, written in TypeScript. Each module gets its own folder with annotated examples you can run directly.

## Modules

| # | Module | What it covers |
|---|--------|----------------|
| 01 | `process` | env vars, CLI args, exit codes, lifecycle events, error handling, `nextTick` |
| 02 | `crypto` | UUID, random bytes, SHA hashing, HMAC signing, scrypt password hashing |
| 03 | `os` | platform, CPU, memory, network interfaces, uptime, user info, EOL |
| 04 | `path` | `join`, `resolve`, `parse`, `format`, `normalize`, `relative`, `isAbsolute` |

## Getting started

```bash
npm install
```

Run any module with `tsx`:

```bash
npx tsx src/01-process-object/index.ts
npx tsx src/02-crypto-module/index.ts
npx tsx src/03-os-module/index.ts
npx tsx src/04-path-module/index.ts
```

Pass flags where supported:

```bash
# process module — trigger a non-zero exit
npx tsx src/01-process-object/index.ts start --fail
```

## Stack

- **Runtime** — Node.js (ESM)
- **Language** — TypeScript
- **Executor** — [tsx](https://github.com/privatenumber/tsx) (no separate compile step needed)

## Scripts

| Command | What it does |
|---------|--------------|
| `npm run dev` | Watch mode via tsx |
| `npm run build` | Compile to `dist/` with tsc |
| `npm start` | Run compiled output |
| `npm run typecheck` | Type-check without emitting |

# Node.js Backend: From Scratch to Production

A progressive, book-like reference for Node.js backend development. Each module covers one focused topic with a runnable example and a README that explains the what, why, and how.

---

## Course Overview

The course is organized into logical parts inside the `src/` directory. Each module has an `index.ts` you can run and a `README.md` you can read standalone.

---

## Part 1: Node.js Core Modules

| Module | Folder | Topic | Description |
|--------|--------|-------|-------------|
| 01 | `src/01-process-object` | The `process` Object | Environment variables, CLI args, exit codes, signals, lifecycle events |
| 02 | `src/02-crypto-module` | The `crypto` Module | UUIDs, random tokens, hashing, HMAC signing, password hashing |

---

## How to Run the Examples

**Prerequisites:** Node.js installed.

**1. Install dependencies**
```bash
npm install
```

**2. Run a module directly (no build step needed)**
```bash
npx tsx src/01-process-object/index.ts
npx tsx src/02-crypto-module/index.ts
```

**3. Pass arguments where supported**
```bash
npx tsx src/01-process-object/index.ts start --fail
NODE_ENV=production PORT=8080 npx tsx src/01-process-object/index.ts
```

> **Windows (PowerShell)?**
> ```powershell
> $env:NODE_ENV="production"; npx tsx src/01-process-object/index.ts
> ```

---

## Project Setup (`tsconfig.json`)

```json
{
  "strict": true,
  "target": "es2022",
  "module": "NodeNext"
}
```

Strict mode is on. Types are explicit where they matter.

---

## Suggested Practice Projects

Once you've worked through the modules, try building:

- **Config loader** — read a `.env` file, validate required keys are present, and exit with a descriptive error if any are missing. Uses `process.env` and `process.exit`.
- **Webhook server** — receive a POST request, verify the HMAC signature from the `X-Signature` header, and reject tampered payloads. Uses `createHmac` and `timingSafeEqual`.
- **Auth service** — register a user (hash password with `scrypt`), log them in (verify password), and issue a signed session token. Combines `randomBytes`, `scrypt`, and `createHmac`.

---

## About

Learn Node.js backend development through focused, practical modules — one concept at a time.

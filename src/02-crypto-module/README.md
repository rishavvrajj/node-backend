# Module 02: The `crypto` Module

## What the Topic Is

The built-in `crypto` module gives you cryptographic primitives: random value generation, hashing, message authentication, and password hashing. No installation needed — it ships with Node.js.

## Why It Matters

Security-sensitive values like tokens, API keys, and passwords need more than `Math.random()` or a plain hash. The `crypto` module provides the right tools for each job, and knowing which one to reach for (and which to avoid) prevents common security mistakes.

## Complete Code Example

```ts
import * as crypto from 'node:crypto';

// Cryptographically random UUID v4 — for request IDs, record IDs, idempotency keys
const requestId = crypto.randomUUID();

// Cryptographically strong random bytes — for tokens, API keys, salts
// Math.random() is predictable; randomBytes() uses the OS entropy pool
const sessionToken      = crypto.randomBytes(16).toString('hex');       // 32 chars, 128-bit
const apiKey            = crypto.randomBytes(32).toString('hex');       // 64 chars, 256-bit
const passwordResetLink = crypto.randomBytes(32).toString('base64url'); // shorter, URL-safe

// One-way hashing — same input always gives the same output, cannot be reversed
// Use for: checksums, cache keys, content fingerprinting
// ⚠ Do NOT use for passwords — fast hashes are easy to brute-force
const sha256 = crypto.createHash('sha256').update('Hello, Node.js!').digest('hex');
const sha512 = crypto.createHash('sha512').update('Hello, Node.js!').digest('hex');

// HMAC — like a hash, but requires a secret key
// Proves the message wasn't tampered with AND came from someone who holds the key
// Use for: signing JWTs, verifying webhook payloads, API request signing
const secret    = process.env.HMAC_SECRET ?? 'dev-secret';
const payload   = 'userId=42&action=transfer';
const signature = crypto.createHmac('sha256', secret).update(payload).digest('hex');

// Always verify HMACs with timingSafeEqual — not ===
// Regular string comparison leaks timing info attackers can exploit
function verifyHmac(payload: string, receivedSig: string, key: string): boolean {
  const expected    = crypto.createHmac('sha256', key).update(payload).digest('hex');
  const expectedBuf = Buffer.from(expected, 'hex');
  const receivedBuf = Buffer.from(receivedSig, 'hex');
  if (expectedBuf.length !== receivedBuf.length) return false;
  return crypto.timingSafeEqual(expectedBuf, receivedBuf);
}

// Password hashing with scrypt — memory-hard, intentionally slow
// Alternatives: bcrypt, argon2 (argon2id is the current gold standard)
async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString('hex');
  const key  = await new Promise<Buffer>((resolve, reject) =>
    crypto.scrypt(password, salt, 64, (err, key) => err ? reject(err) : resolve(key))
  );
  return `${salt}:${key.toString('hex')}`; // store both — you need the salt to verify
}

async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [salt, hash] = stored.split(':') as [string, string];
  const key = await new Promise<Buffer>((resolve, reject) =>
    crypto.scrypt(password, salt, 64, (err, key) => err ? reject(err) : resolve(key))
  );
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), key);
}
```

## How the Code Works

- **`randomUUID()`** — generates a UUID v4 using the OS entropy pool. Statistically impossible to collide; no configuration needed.
- **`randomBytes(n)`** — returns `n` random bytes. Encode as `hex` for tokens, `base64url` when the value goes in a URL. The byte count determines entropy: 16 bytes = 128 bits, 32 bytes = 256 bits.
- **`createHash()`** — one-way transformation. Chaining `.update(data).digest('hex')` gives the final hex string. You can call `.update()` multiple times to hash data in chunks.
- **`createHmac()`** — same chain as `createHash`, but takes a secret as the second argument. Without the secret, you can't produce a valid signature — even if you know the algorithm and the message.
- **`timingSafeEqual()`** — compares two Buffers in constant time. A regular `===` comparison exits early on the first mismatch, leaking how many bytes matched — enough for an attacker to forge a signature byte by byte.
- **`scrypt()`** — derives a key from a password and a random salt. The salt ensures two users with the same password get different hashes. Storing `salt:hash` together is the standard pattern.

## Expected Output

```
a3bb189e-8bf9-3888-9912-ace4e6543002
{ sessionToken: '...', apiKey: '...', passwordResetLink: '...' }
{ sha256: '...', sha512: '...' }
{ payload: 'userId=42&action=transfer', signature: '...' }
valid?    true
tampered? false
stored:   <salt>:<hash>
correct?  true
wrong?    false
```

## Common Mistakes

- Using `Math.random()` for tokens or secrets — it's predictable; always use `randomBytes()`.
- Hashing passwords with `createHash()` — fast hashes are trivially brute-forced; use `scrypt`, `bcrypt`, or `argon2`.
- Comparing HMACs with `===` instead of `timingSafeEqual()` — opens a timing side-channel attack.
- Not storing the salt with the hash — you need it to verify the password later.
- Hardcoding secrets — always load them from `process.env`.

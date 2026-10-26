import * as crypto from 'node:crypto';

// ── randomUUID ────────────────────────────────────────────────────────────────
// Generates a cryptographically random UUID v4.
// Use for: request IDs, record IDs, idempotency keys.

const requestId = crypto.randomUUID();
console.log(requestId); // 'a3bb189e-8bf9-3888-9912-ace4e6543002'

// ── randomBytes ───────────────────────────────────────────────────────────────
// Generates cryptographically strong random bytes.
// Safer than Math.random() — uses the OS entropy pool, not a predictable seed.

const sessionToken      = crypto.randomBytes(16).toString('hex');       // 32 chars, 128-bit
const apiKey            = crypto.randomBytes(32).toString('hex');       // 64 chars, 256-bit
const passwordResetLink = crypto.randomBytes(32).toString('base64url'); // shorter, URL-safe

console.log({ sessionToken, apiKey, passwordResetLink });

// ── createHash ────────────────────────────────────────────────────────────────
// One-way: same input → same output, cannot be reversed.
// Use for: file checksums, cache keys, content fingerprinting.
// ⚠ Do NOT use for passwords — hashes are fast, so easy to brute-force.

const sha256 = crypto.createHash('sha256').update('Hello, Node.js!').digest('hex');
const sha512 = crypto.createHash('sha512').update('Hello, Node.js!').digest('hex');

console.log({ sha256, sha512 });

// ── createHmac ────────────────────────────────────────────────────────────────
// Like a hash, but requires a secret key.
// Proves the message came from someone who holds the key (authenticity + integrity).
// Use for: signing JWTs, verifying webhook payloads, API request signing.

const secret  = process.env.HMAC_SECRET ?? 'dev-secret'; // load from env in production
const payload = 'userId=42&action=transfer';

const signature = crypto.createHmac('sha256', secret).update(payload).digest('hex');
console.log({ payload, signature });

// Verifying — always use timingSafeEqual, never ===
// Regular string comparison leaks timing info that attackers can exploit.
function verifyHmac(payload: string, receivedSig: string, key: string): boolean {
  const expected    = crypto.createHmac('sha256', key).update(payload).digest('hex');
  const expectedBuf = Buffer.from(expected, 'hex');
  const receivedBuf = Buffer.from(receivedSig, 'hex');
  if (expectedBuf.length !== receivedBuf.length) return false;
  return crypto.timingSafeEqual(expectedBuf, receivedBuf);
}

console.log('valid?  ', verifyHmac(payload, signature, secret));           // true
console.log('tampered?', verifyHmac('userId=1&action=transfer', signature, secret)); // false

// ── scrypt (password hashing) ─────────────────────────────────────────────────
// Memory-hard and intentionally slow — makes brute-force attacks expensive.
// Always hash passwords with a slow KDF, never with a plain hash.
// Alternatives: bcrypt, argon2 (argon2id is the current gold standard).

async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString('hex'); // unique per password, stored alongside hash
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

const stored = await hashPassword('correct-horse-battery-staple');
console.log('stored:  ', stored);
console.log('correct? ', await verifyPassword('correct-horse-battery-staple', stored)); // true
console.log('wrong?   ', await verifyPassword('hunter2', stored));                       // false
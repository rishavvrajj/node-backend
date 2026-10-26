# Module 06: Callbacks, Promises & Async/Await

## What the Topic Is

Three patterns for handling asynchronous operations in Node.js — callbacks (the original convention), Promises (the modern standard), and async/await (syntactic sugar over Promises that reads like synchronous code).

## Why It Matters

Node.js is single-threaded and non-blocking. Any operation that takes time (DB query, HTTP request, file read) is async — you need one of these patterns to work with the result. Understanding all three matters because older libraries still use callbacks, most modern code uses Promises, and async/await is what you'll write day to day.

## Complete Code Example

```ts
type User = {
  id:   number;
  name: string;
  role: 'User' | 'Admin';
};

const users: User[] = [
  { id: 1, name: 'Alice', role: 'Admin' },
  { id: 2, name: 'Bob',   role: 'User'  },
];

// ── Callback ──────────────────────────────────────────────────────────────────
// Convention: last argument is (err, result) — always check err first
function findUserWithCallback(
  userId:   number,
  callback: (err: Error | null, user?: User) => void,
): void {
  setTimeout(() => {
    const user = users.find(u => u.id === userId);
    if (!user) { callback(new Error(`User ${userId} not found`)); return; }
    callback(null, user);
  }, 500);
}

findUserWithCallback(1, (err, user) => {
  if (err) { console.error('Callback error:', err.message); return; }
  console.log('Callback result:', user);
});

// ── Promise ───────────────────────────────────────────────────────────────────
// resolve on success, reject on failure — enables .then()/.catch() chaining
function fetchUserWithPromise(userId: number): Promise<User> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const user = users.find(u => u.id === userId);
      if (!user) { reject(new Error(`User ${userId} not found`)); return; }
      resolve(user);
    }, 500);
  });
}

fetchUserWithPromise(2)
  .then(user => console.log('Promise result:', user))
  .catch((err: Error) => console.error('Promise error:', err.message));

// Promise chaining — each .then() receives the return value of the previous one
fetchUserWithPromise(1)
  .then(user => { console.log('Chain step 1:', user.name); return user.role; })
  .then(role => console.log('Chain step 2 — role:', role))
  .catch((err: Error) => console.error('Chain error:', err.message));

// ── async / await ─────────────────────────────────────────────────────────────
// await unwraps a resolved Promise — errors surface as thrown exceptions
async function findUserWithAsyncAwait(userId: number): Promise<void> {
  try {
    const user = await fetchUserWithPromise(userId);
    console.log('Async/await result:', user);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Async/await error:', message);
  }
}

await findUserWithAsyncAwait(1);
await findUserWithAsyncAwait(99); // triggers the catch branch

// ── Promise.all ───────────────────────────────────────────────────────────────
// All promises run concurrently — fails fast if any one rejects
const [user1, user2] = await Promise.all([
  fetchUserWithPromise(1),
  fetchUserWithPromise(2),
]);
console.log('Promise.all:', user1, user2);

// ── Promise.allSettled ────────────────────────────────────────────────────────
// Never rejects — each result has { status, value } or { status, reason }
const results = await Promise.allSettled([
  fetchUserWithPromise(1),
  fetchUserWithPromise(99),
]);
for (const result of results) {
  if (result.status === 'fulfilled') console.log('fulfilled:', result.value);
  else                               console.log('rejected: ', result.reason.message);
}
```

## How the Code Works

- **Callback** — the oldest pattern. The function does its async work and calls your function when done, passing `(err, result)`. You must check `err` before using `result`. Deep nesting of callbacks leads to "callback hell" — one of the main reasons Promises were introduced.
- **Promise** — an object representing a future value. `resolve(value)` fulfills it; `reject(error)` rejects it. `.then()` chains success handlers; `.catch()` handles errors anywhere in the chain. Each `.then()` returns a new Promise, enabling clean sequential steps.
- **async/await** — `async` marks a function as returning a Promise. `await` pauses execution until the Promise settles and unwraps the value. Errors from rejected Promises are thrown as exceptions, so `try/catch` works naturally.
- **`Promise.all()`** — takes an array of Promises and resolves with an array of their values once all succeed. If any one rejects, the whole call rejects immediately. Best for independent concurrent work where you need every result.
- **`Promise.allSettled()`** — like `Promise.all` but never rejects. Every result comes back as `{ status: 'fulfilled', value }` or `{ status: 'rejected', reason }`. Use when you want to process all outcomes regardless of failures.

## Expected Output

```
Callback result: { id: 1, name: 'Alice', role: 'Admin' }
Callback error:  User 99 not found
Promise result:  { id: 2, name: 'Bob', role: 'User' }
Promise error:   User 99 not found
Chain step 1:    Alice
Chain step 2 — role: Admin
Async/await result: { id: 1, name: 'Alice', role: 'Admin' }
Async/await error:  User 99 not found
Promise.all: { id: 1, ... } { id: 2, ... }
fulfilled: { id: 1, name: 'Alice', role: 'Admin' }
rejected:  User 99 not found
```

## Common Mistakes

- Not checking `err` first in a callback — if you use `result` when `err` is set, you'll get unexpected behaviour or a crash.
- Forgetting to `return` after calling `callback(err)` — without the `return`, execution continues and `callback(null, user)` fires too, calling the callback twice.
- Missing `.catch()` on a Promise chain — an unhandled rejection crashes the process in modern Node.js.
- Using `await` outside an `async` function — only valid at the top level of an ES module (which this project is, since `"type": "module"` is set) or inside an `async` function.
- `Promise.all` vs `Promise.allSettled` — use `all` when any failure should abort the whole operation, `allSettled` when you want to process every result regardless.
- Running independent async calls sequentially with `await` instead of `Promise.all` — `await a(); await b()` takes the sum of both durations; `Promise.all([a(), b()])` runs them concurrently.

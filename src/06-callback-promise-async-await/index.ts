// ── Types ─────────────────────────────────────────────────────────────────────

type User = {
  id:   number;
  name: string;
  role: 'User' | 'Admin';
};

const users: User[] = [
  { id: 1, name: 'Alice', role: 'Admin' },
  { id: 2, name: 'Bob',   role: 'User'  },
];

// ── Callback pattern ──────────────────────────────────────────────────────────
// The original Node.js convention: last argument is (err, result).
// Error comes first — always check it before using the result.

function findUserWithCallback(
  userId:   number,
  callback: (err: Error | null, user?: User) => void,
): void {
  setTimeout(() => {
    const user = users.find(u => u.id === userId);
    if (!user) {
      callback(new Error(`User ${userId} not found`));
      return;
    }
    callback(null, user);
  }, 500);
}

findUserWithCallback(1, (err, user) => {
  if (err) { console.error('Callback error:', err.message); return; }
  console.log('Callback result:', user);
});

findUserWithCallback(99, (err, user) => {
  if (err) { console.error('Callback error:', err.message); return; } // User 99 not found
  console.log('Callback result:', user);
});

// ── Promise pattern ───────────────────────────────────────────────────────────
// Wraps async work in a Promise — resolve on success, reject on failure.
// Enables .then()/.catch() chaining and eliminates deeply nested callbacks.

function fetchUserWithPromise(userId: number): Promise<User> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const user = users.find(u => u.id === userId);
      if (!user) {
        reject(new Error(`User ${userId} not found`));
        return;
      }
      resolve(user);
    }, 500);
  });
}

fetchUserWithPromise(2)
  .then(user  => console.log('Promise result:', user))
  .catch((err: Error) => console.error('Promise error:', err.message));

fetchUserWithPromise(99)
  .then(user  => console.log('Promise result:', user))
  .catch((err: Error) => console.error('Promise error:', err.message)); // User 99 not found

// ── Promise chaining ──────────────────────────────────────────────────────────
// .then() returns a new Promise, so calls can be chained.
// Each .then() receives the return value of the previous one.

fetchUserWithPromise(1)
  .then(user => {
    console.log('Chain step 1 — found user:', user.name);
    return user.role; // pass the role to the next .then()
  })
  .then(role => console.log('Chain step 2 — role:', role))
  .catch((err: Error) => console.error('Chain error:', err.message));

// ── async / await ─────────────────────────────────────────────────────────────
// Syntactic sugar over Promises — reads like synchronous code.
// await unwraps the resolved value; errors surface as thrown exceptions.
// Always wrap in try/catch (or handle at the call site with .catch()).

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
// Runs multiple promises concurrently and waits for ALL to resolve.
// Fails fast — if any one rejects, the whole thing rejects immediately.

const [user1, user2] = await Promise.all([
  fetchUserWithPromise(1),
  fetchUserWithPromise(2),
]);
console.log('Promise.all result:', user1, user2);

// ── Promise.allSettled ────────────────────────────────────────────────────────
// Like Promise.all but never rejects — each result has { status, value/reason }.
// Use when you want every outcome regardless of failures.

const results = await Promise.allSettled([
  fetchUserWithPromise(1),
  fetchUserWithPromise(99), // will reject
]);

for (const result of results) {
  if (result.status === 'fulfilled') {
    console.log('allSettled fulfilled:', result.value);
  } else {
    console.log('allSettled rejected: ', result.reason.message);
  }
}
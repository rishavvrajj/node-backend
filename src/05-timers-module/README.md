# Module 05: Timers

## What the Topic Is

Timers let you schedule code to run after a delay or on a repeating interval. Node.js provides the familiar browser APIs (`setTimeout`, `setInterval`, `setImmediate`) plus a `node:timers/promises` module that wraps them as promises for cleaner async/await usage.

## Why It Matters

Almost every backend app uses timers — polling, retries, debouncing, rate limiting, or just deferring work to the next event-loop iteration. Understanding how timers interact with the event loop helps you avoid subtle bugs like callbacks firing after a resource is closed, or intervals running forever because you forgot to clear them.

## Complete Code Example

```ts
import { setTimeout as sleep, setInterval as interval } from 'node:timers/promises';

// setTimeout — fires once after a delay, non-blocking
console.log('1. sync: before setTimeout');
setTimeout(() => console.log('3. setTimeout fired after 1s'), 1000);
console.log('2. sync: after setTimeout — runs before the timer');

// clearTimeout — cancels a pending timer before it fires
const cancelledTimer = setTimeout(() => console.log('never prints'), 2000);
clearTimeout(cancelledTimer);

// setInterval — fires repeatedly on a fixed interval
let count = 0;
const intervalId = setInterval(() => {
  count++;
  console.log(`5. setInterval tick ${count}`);
  if (count === 3) {
    clearInterval(intervalId);
    console.log('6. clearInterval stopped after 3 ticks');
  }
}, 500);

// setImmediate — runs after current event-loop iteration, before any timers
setImmediate(() => console.log('8. setImmediate — after sync, before timers'));
console.log('7. sync: setImmediate is queued but hasn\'t run yet');

// timers/promises — promise-based wrappers for async/await
async function promiseTimers(): Promise<void> {
  await sleep(1000);
  console.log('10. sleep resolved after 1s');

  // setInterval as an async iterable — stop it with AbortController
  const controller = new AbortController();
  let ticks = 0;

  for await (const _ of interval(400, undefined, { signal: controller.signal })) {
    ticks++;
    console.log(`12. async interval tick ${ticks}`);
    if (ticks === 3) controller.abort();
  }
}

promiseTimers().catch((err: unknown) => {
  if (err instanceof Error && err.name === 'AbortError') return;
  console.error('Timer error:', err);
});
```

## How the Code Works

- **`setTimeout(fn, ms)`** — queues `fn` to run after at least `ms` milliseconds. "At least" because Node runs it only when the call stack is empty — heavy synchronous work delays timers.
- **`clearTimeout(id)`** — cancels a timer before it fires. Always store the id when you might need to cancel.
- **`setInterval(fn, ms)`** — calls `fn` every `ms` milliseconds until stopped. Always call `clearInterval()` when done — a forgotten interval keeps the process alive.
- **`setImmediate(fn)`** — runs `fn` after the current event-loop phase but before any `setTimeout`/`setInterval` callbacks. Useful for yielding to I/O without adding an artificial delay.
- **`sleep(ms)` (`timers/promises`)**  — promise that resolves after `ms` milliseconds. Replaces callback-style `setTimeout` in async functions.
- **`interval(ms)` (`timers/promises`)** — async iterable that yields on each tick. Pair with `AbortController` to stop it — aborting throws an `AbortError`, which you should catch and ignore.

## Expected Output

```
1. sync: before setTimeout
2. sync: after setTimeout — runs before the timer
4. clearTimeout cancelled the 2s timer
7. sync: setImmediate is queued but hasn't run yet
8. setImmediate — after sync, before timers
3. setTimeout fired after 1s
5. setInterval tick 1
5. setInterval tick 2
5. setInterval tick 3
6. clearInterval stopped after 3 ticks
9. awaiting sleep(1000)...
10. sleep resolved after 1s
11. starting async interval (3 ticks)...
12. async interval tick 1
12. async interval tick 2
12. async interval tick 3
```

## Common Mistakes

- Forgetting `clearInterval()` — the interval holds a reference that keeps the Node process alive even after your work is done.
- Expecting exact timing — `setTimeout(fn, 0)` does not run immediately; it waits for the call stack to clear and competes with other async work.
- Using `setTimeout` in async functions when `sleep` is cleaner — `await sleep(ms)` from `node:timers/promises` removes the need for wrapping callbacks in promises manually.
- Not handling `AbortError` when stopping an async interval — aborting the signal causes the `for await` loop to throw, so always catch and ignore it explicitly.
- Confusing `setImmediate` and `process.nextTick` — `nextTick` runs before any I/O or timers (even before `setImmediate`). Use `nextTick` for truly immediate deferral, `setImmediate` when you want to yield to pending I/O first.

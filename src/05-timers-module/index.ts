import { setTimeout as sleep, setInterval as interval } from 'node:timers/promises';

// ── setTimeout ────────────────────────────────────────────────────────────────
// Schedules a callback once, after a delay (in ms).
// Non-blocking — Node continues executing the next line immediately.

console.log('1. sync: before setTimeout');

setTimeout(() => {
  console.log('3. setTimeout fired after 1s');
}, 1000);

console.log('2. sync: after setTimeout — runs before the timer');

// ── clearTimeout ──────────────────────────────────────────────────────────────
// Cancels a pending setTimeout. The callback will never run.

const cancelledTimer = setTimeout(() => {
  console.log('this will never print');
}, 2000);

clearTimeout(cancelledTimer);
console.log('4. clearTimeout cancelled the 2s timer');

// ── setInterval ───────────────────────────────────────────────────────────────
// Runs a callback repeatedly on a fixed interval.
// Always store the id so you can stop it — an interval runs forever otherwise.

let count = 0;

const intervalId = setInterval(() => {
  count++;
  console.log(`5. setInterval tick ${count}`);

  if (count === 3) {
    clearInterval(intervalId);
    console.log('6. clearInterval stopped the timer after 3 ticks');
  }
}, 500);

// ── setImmediate ──────────────────────────────────────────────────────────────
// Runs after the current event-loop iteration, before any timers.
// Useful when you want a callback deferred but not delayed by a timeout value.

setImmediate(() => console.log('8. setImmediate — runs after sync, before timers'));
console.log('7. sync: setImmediate is queued but hasn\'t run yet');

// ── timers/promises ───────────────────────────────────────────────────────────
// Promise-based wrappers — cleaner async/await syntax, no callback needed.
// setTimeout → sleep, setInterval → async iterable, setImmediate → immediate

async function promiseTimers(): Promise<void> {
  console.log('9. awaiting sleep(1000)...');
  await sleep(1000);
  console.log('10. sleep resolved after 1s');

  // setInterval as an async iterable — iterate with for await
  // AbortController lets you stop it cleanly from outside the loop
  const controller = new AbortController();
  let ticks = 0;

  console.log('11. starting async interval (3 ticks)...');

  for await (const _ of interval(400, undefined, { signal: controller.signal })) {
    ticks++;
    console.log(`12. async interval tick ${ticks}`);
    if (ticks === 3) controller.abort();
  }
}

promiseTimers().catch((err: unknown) => {
  // AbortError is expected when we stop the interval — ignore it
  if (err instanceof Error && err.name === 'AbortError') return;
  console.error('Timer error:', err);
});

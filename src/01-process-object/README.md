# Module 01: The `process` Object

## What the Topic Is

The `process` object is a global in Node.js that gives you information about — and control over — the currently running process. No import needed, but importing explicitly makes it clear where it comes from.

## Why It Matters

Almost every real Node.js app needs it. Reading config from environment variables, parsing CLI flags, handling graceful shutdown, and catching unhandled errors all go through `process`.

## Complete Code Example

```ts
import process from 'node:process';

// Environment variables — use ?? to provide defaults
const nodeEnv = process.env.NODE_ENV ?? 'development';
const port    = Number(process.env.PORT ?? 3000);

// argv[0] = node executable, argv[1] = script path, argv[2+] = your args
const args    = process.argv.slice(2);
const command = args[0] ?? 'start';

// Exit codes: 0 = success, non-zero = failure
if (args.includes('--fail')) {
  console.error('Exiting with failure');
  process.exit(1);
}

// Lifecycle events
process.on('exit',   (code) => console.log(`Exited with code ${code}`));
process.on('SIGTERM', ()    => { console.log('SIGTERM received'); process.exit(0); });
process.on('SIGINT',  ()    => { console.log('SIGINT received');  process.exit(0); });

// Unhandled errors
process.on('uncaughtException',  (err)    => { console.error('Uncaught:', err);    process.exit(1); });
process.on('unhandledRejection', (reason) => { console.error('Unhandled:', reason); });

// Useful read-only properties
console.log(process.pid);       // Process ID
console.log(process.cwd());     // Current working directory
console.log(process.platform);  // 'win32' | 'linux' | 'darwin'
console.log(process.arch);      // 'x64' | 'arm64' | ...
console.log(process.version);   // Node.js version e.g. 'v22.0.0'
console.log(process.uptime());  // Seconds the process has been running

const mem = process.memoryUsage();
console.log(`Heap used: ${(mem.heapUsed / 1024 / 1024).toFixed(2)} MB`);

// process.nextTick runs after current operation, before promises and timers
process.nextTick(() => console.log('2 - nextTick'));
Promise.resolve().then(() => console.log('3 - promise'));
setTimeout(() => console.log('4 - setTimeout'), 0);
console.log('1 - sync');
```

## How the Code Works

- **`process.env`** — an object of all environment variables. The `??` operator falls back to a default when a variable isn't set.
- **`process.argv`** — array of CLI arguments. Slice from index 2 to get only the ones you passed.
- **`process.exit(code)`** — immediately stops the process. `0` means success; anything else signals failure to the shell or CI.
- **`exit` event** — synchronous cleanup only. The event loop is already shutting down, so async operations won't complete.
- **`SIGTERM` / `SIGINT`** — OS signals. `SIGTERM` is sent by Docker/Kubernetes on stop; `SIGINT` is Ctrl+C. Handle them to close DB connections and finish in-flight work before exiting.
- **`uncaughtException` / `unhandledRejection`** — last-resort error handlers. Log the error, then exit — don't try to resume normal operation.
- **Read-only properties** — `pid`, `cwd()`, `platform`, `arch`, `version`, `uptime()`, `memoryUsage()` are handy for logging and diagnostics.
- **`process.nextTick`** — queues a callback to run before promises and timers. Execution order: sync → nextTick → promises → timers.

## Expected Output

```
{ nodeEnv: 'development', port: 3000 }
{ args: [], command: 'start' }
<pid>
<cwd>
win32
x64
v22.x.x
0.xx
Heap used: x.xx MB
1 - sync
2 - nextTick
3 - promise
Process exited with code 0
4 - setTimeout
```

## Common Mistakes

- Doing async work (DB close, HTTP flush) inside the `exit` event — it won't run. Use `SIGTERM` for that.
- Using `Math.random()` for tokens — use `crypto.randomBytes()` instead (see module 02).
- Not handling `unhandledRejection` — silent promise failures are hard to debug in production.
- Forgetting `process.argv.slice(2)` — argv[0] and argv[1] are Node and the script, not your args.

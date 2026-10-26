import process from 'node:process';

// ── Environment Variables ─────────────────────────────────────────────────────
// process.env holds all environment variables. Use ?? to provide defaults.

const nodeEnv = process.env.NODE_ENV ?? 'development';
const port    = Number(process.env.PORT ?? 3000);

console.log({ nodeEnv, port });

// ── Command Line Arguments ────────────────────────────────────────────────────
// argv[0] = node executable, argv[1] = script path, argv[2+] = your args
// Run: npx tsx index.ts start --fail

const args    = process.argv.slice(2);       // ['start', '--fail']
const command = args[0] ?? 'start';

console.log({ args, command });

// ── Exit Codes ────────────────────────────────────────────────────────────────
// 0 = success, non-zero = failure. CI/CD reads this to pass or fail a step.

const shouldFail = args.includes('--fail');

if (shouldFail) {
  console.error('Exiting with failure');
  process.exit(1);
}

// ── Lifecycle Events ──────────────────────────────────────────────────────────
// 'exit'    → sync cleanup only (runs right before process ends)
// 'SIGTERM' → graceful shutdown request (Docker stop, Kubernetes, kill)
// 'SIGINT'  → Ctrl+C

process.on('exit', (code) => console.log(`Process exited with code ${code}`));

process.on('SIGTERM', () => { console.log('SIGTERM received'); process.exit(0); });
process.on('SIGINT',  () => { console.log('SIGINT received');  process.exit(0); });

// ── Error Handling ────────────────────────────────────────────────────────────
process.on('uncaughtException',   (err)    => { console.error('Uncaught:', err);   process.exit(1); });
process.on('unhandledRejection',  (reason) => { console.error('Unhandled:', reason); });

// ── Useful Properties ─────────────────────────────────────────────────────────

console.log(process.pid);        // Process ID
console.log(process.cwd());      // Current working directory
console.log(process.platform);   // 'win32' | 'linux' | 'darwin'
console.log(process.arch);       // 'x64' | 'arm64' | ...
console.log(process.version);    // Node.js version e.g. 'v22.0.0'
console.log(process.uptime());   // Seconds the process has been running

const mem = process.memoryUsage();
console.log(`Heap used: ${(mem.heapUsed / 1024 / 1024).toFixed(2)} MB`);

// ── process.nextTick ──────────────────────────────────────────────────────────
// Runs callback after current operation, before timers and promises.

process.nextTick(() => console.log('2 - nextTick'));
Promise.resolve().then(() => console.log('3 - promise'));
setTimeout(() => console.log('4 - setTimeout'), 0);
console.log('1 - sync');

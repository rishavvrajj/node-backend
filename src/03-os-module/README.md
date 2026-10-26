# Module 03: The `os` Module

## What the Topic Is

The built-in `os` module exposes information about the operating system the Node.js process is running on — platform, CPU, memory, network, directories, and more.

## Why It Matters

Backend apps often need to adapt to their environment: picking the right temp directory, logging system specs on startup, calculating available memory before spawning workers, or writing files with the correct line endings. The `os` module gives you all of that without any dependencies.

## Complete Code Example

```ts
import * as os from 'node:os';

// Platform & architecture
console.log(os.platform());   // 'win32' | 'linux' | 'darwin'
console.log(os.arch());       // 'x64' | 'arm64' | 'ia32'
console.log(os.type());       // 'Windows_NT' | 'Linux' | 'Darwin'
console.log(os.release());    // OS version string e.g. '10.0.26200'

// Common directories
console.log(os.homedir());    // 'C:\Users\risha'
console.log(os.tmpdir());     // 'C:\Users\risha\AppData\Local\Temp'

// CPU — one entry per logical core
const cpus = os.cpus();
console.log(cpus.length);       // number of logical cores
console.log(cpus[0]?.model);    // 'Intel(R) Core(TM) i7-9750H CPU @ 2.60GHz'
console.log(cpus[0]?.speed);    // clock speed in MHz
console.log(cpus[0]?.times);    // { user, nice, sys, idle, irq } in ms

// Memory
const totalGB = (os.totalmem() / 1024 ** 3).toFixed(2);
const freeGB  = (os.freemem()  / 1024 ** 3).toFixed(2);
const usedGB  = ((os.totalmem() - os.freemem()) / 1024 ** 3).toFixed(2);
console.log(`Total: ${totalGB} GB | Free: ${freeGB} GB | Used: ${usedGB} GB`);

// Network interfaces — all adapters and their IP addresses
const nets = os.networkInterfaces();
for (const [name, addrs] of Object.entries(nets)) {
  const ipv4 = addrs?.find(a => a.family === 'IPv4' && !a.internal);
  if (ipv4) console.log(`${name}: ${ipv4.address}`); // e.g. 'Ethernet: 192.168.1.5'
}

// System uptime
const uptimeHours = (os.uptime() / 3600).toFixed(1);
console.log(`System uptime: ${uptimeHours} hours`);

// Current user
const user = os.userInfo();
console.log(user.username);  // 'risha'
console.log(user.homedir);   // same as os.homedir()
console.log(user.shell);     // '/bin/bash' on Unix, null on Windows

// Line endings — use when writing files that must match OS conventions
console.log(JSON.stringify(os.EOL)); // '\r\n' on Windows, '\n' on Linux/macOS
```

## How the Code Works

- **`platform()` / `arch()` / `type()`** — identify the OS and CPU. Useful for conditional logic (e.g. different paths on Windows vs Unix) or logging system info on startup.
- **`homedir()` / `tmpdir()`** — portable way to get standard directories. Safer than hardcoding `C:\Users\...` or `/tmp`.
- **`cpus()`** — returns an array, one element per logical core. `length` tells you how many workers to spawn. `times` shows CPU time breakdown — the basis for CPU usage calculations.
- **`totalmem()` / `freemem()`** — values are in bytes. Divide by `1024 ** 3` to get GB. Useful for health checks or deciding whether to load a large dataset into memory.
- **`networkInterfaces()`** — returns every adapter (Ethernet, Wi-Fi, loopback). Filter by `family === 'IPv4'` and `!internal` to get the machine's actual LAN IP.
- **`uptime()`** — seconds since the OS booted, not since the Node process started (use `process.uptime()` for that).
- **`userInfo()`** — the OS-level user running the process. `shell` is `null` on Windows.
- **`os.EOL`** — `'\r\n'` on Windows, `'\n'` everywhere else. Always use this instead of a hardcoded newline when writing files.

## Expected Output

```
win32
x64
Windows_NT
10.0.26200
C:\Users\risha
C:\Users\risha\AppData\Local\Temp
12
Intel(R) Core(TM) i7-9750H CPU @ 2.60GHz
2592
{ user: 0, nice: 0, sys: 0, idle: 0, irq: 0 }
Total: 15.76 GB | Free: 6.42 GB | Used: 9.34 GB
Wi-Fi: 192.168.1.5
System uptime: 3.2 hours
risha
C:\Users\risha
null
"\r\n"
```

## Common Mistakes

- Hardcoding `/tmp` or `C:\Users\name` — use `os.tmpdir()` and `os.homedir()` instead.
- Using `os.uptime()` to measure how long your app has been running — that's the system uptime. Use `process.uptime()` for the process.
- Dividing memory by `1024 * 3` instead of `1024 ** 3` — that gives MB, not GB.
- Assuming `os.EOL` is always `'\n'` — it's `'\r\n'` on Windows, which matters for text files opened in strict mode.

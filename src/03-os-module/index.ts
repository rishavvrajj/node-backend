import * as os from 'node:os';

// ── Platform & Architecture ───────────────────────────────────────────────────
console.log(os.platform());   // 'win32' | 'linux' | 'darwin'
console.log(os.arch());       // 'x64' | 'arm64' | 'ia32'
console.log(os.type());       // 'Windows_NT' | 'Linux' | 'Darwin'
console.log(os.release());    // OS version string e.g. '10.0.26200'

// ── Directories ───────────────────────────────────────────────────────────────
console.log(os.homedir());    // 'C:\Users\risha'  — user's home directory
console.log(os.tmpdir());     // 'C:\Users\risha\AppData\Local\Temp' — temp files

// ── CPU ───────────────────────────────────────────────────────────────────────
// os.cpus() returns an array — one entry per logical core
const cpus = os.cpus();

console.log(cpus.length);           // number of logical cores
console.log(cpus[0]?.model);        // e.g. 'Intel(R) Core(TM) i7-9750H CPU @ 2.60GHz'
console.log(cpus[0]?.speed);        // clock speed in MHz
console.log(cpus[0]?.times);        // { user, nice, sys, idle, irq } — time spent in each mode (ms)

// ── Memory ────────────────────────────────────────────────────────────────────
const totalGB = (os.totalmem() / 1024 ** 3).toFixed(2);
const freeGB = (os.freemem() / 1024 ** 3).toFixed(2);
const usedGB = ((os.totalmem() - os.freemem()) / 1024 ** 3).toFixed(2);

console.log(`Total: ${totalGB} GB | Free: ${freeGB} GB | Used: ${usedGB} GB`);

// ── Network Interfaces ────────────────────────────────────────────────────────
// os.networkInterfaces() returns all network adapters and their addresses
const nets = os.networkInterfaces();

for (const [name, addrs] of Object.entries(nets)) {
  const ipv4 = addrs?.find(a => a.family === 'IPv4' && !a.internal);
  if (ipv4) console.log(`${name}: ${ipv4.address}`); // e.g. 'Ethernet: 192.168.1.5'
}

// ── Uptime ────────────────────────────────────────────────────────────────────
const uptimeHours = (os.uptime() / 3600).toFixed(1);
console.log(`System uptime: ${uptimeHours} hours`); // how long since the OS booted

// ── User Info ─────────────────────────────────────────────────────────────────
const user = os.userInfo();
console.log(user.username);   // 'risha'
console.log(user.homedir);    // same as os.homedir()
console.log(user.shell);      // '/bin/bash' on Unix, null on Windows

// ── EOL ───────────────────────────────────────────────────────────────────────
// os.EOL is the line ending for the current platform
// Use it when writing files that need to match OS conventions
console.log(JSON.stringify(os.EOL)); // '\r\n' on Windows, '\n' on Linux/macOS
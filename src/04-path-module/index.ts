import * as path from 'node:path';

// ── Separator ─────────────────────────────────────────────────────────────────
console.log(path.sep);       // '\' on Windows, '/' on Linux/macOS
console.log(path.delimiter); // ';' on Windows, ':' on Linux/macOS (used in PATH env var)

// ── path.join ─────────────────────────────────────────────────────────────────
// Joins segments with the OS separator and normalises double slashes, '..' etc.
// Use for local file paths — never for URLs.

const projectRoot = process.cwd(); // folder from which the Node.js process was started

const userId = '42';
const originalName = 'profile.photo.png';
const uploadPath = path.join(projectRoot, 'uploads', userId, originalName);

console.log(uploadPath);
// e.g. 'C:\Users\risha\learning\node-backend\uploads\42\profile.photo.png'

// ── path.resolve ──────────────────────────────────────────────────────────────
// Like join, but always returns an absolute path.
// Resolves from right to left, stopping once it hits an absolute segment.

console.log(path.resolve('uploads', userId));            // absolute path from cwd
console.log(path.resolve('/var/data', '..', 'logs'));    // '/var/logs'  — '..' is resolved

// ── Dissecting a path ─────────────────────────────────────────────────────────
// basename  — filename (with extension by default)
// extname   — extension including the leading dot
// dirname   — containing directory

const filename = path.basename(uploadPath);             // 'profile.photo.png'
const ext = path.extname(uploadPath);              // '.png'
const stem = path.basename(uploadPath, ext);        // 'profile.photo' (name without ext)
const dir = path.dirname(uploadPath);              // '...uploads\42'

console.log({ filename, ext, stem, dir });

// ── path.parse & path.format ──────────────────────────────────────────────────
// parse  — breaks a path string into its parts
// format — reassembles a parsed object back into a string (inverse of parse)

const parsed = path.parse(uploadPath);
console.log(parsed);
// { root: 'C:\', dir: '...uploads\42', base: 'profile.photo.png',
//   ext: '.png', name: 'profile.photo' }

const reformatted = path.format({ ...parsed, base: 'avatar.webp' });
console.log(reformatted); // same path but with a different filename

// ── path.normalize ────────────────────────────────────────────────────────────
// Cleans up redundant separators and resolves '.' / '..' without hitting the fs.

console.log(path.normalize('uploads//42/../42/profile.photo.png'));
// 'uploads\42\profile.photo.png'  (on Windows)

// ── path.relative ─────────────────────────────────────────────────────────────
// Returns the relative path from `from` to `to`.
// Useful for computing import paths or constructing URLs from absolute paths.

const from = path.join(projectRoot, 'src');
const to = path.join(projectRoot, 'uploads', userId);

console.log(path.relative(from, to)); // '..\uploads\42'  (on Windows)

// ── path.isAbsolute ───────────────────────────────────────────────────────────
console.log(path.isAbsolute('/etc/passwd'));   // true
console.log(path.isAbsolute('uploads/42'));    // false
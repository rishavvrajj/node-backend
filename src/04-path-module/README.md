# Module 04: The `path` Module

## What the Topic Is

The built-in `path` module provides utilities for working with file and directory paths. It handles OS differences automatically — so the same code works on Windows (backslashes) and Unix (forward slashes).

## Why It Matters

Hardcoding path separators or concatenating strings with `/` breaks on Windows. `path` gives you a portable, predictable way to build, dissect, and normalise file paths — something every backend app that reads or writes files needs.

## Complete Code Example

```ts
import * as path from 'node:path';

const projectRoot = process.cwd();
const userId      = '42';
const uploadPath  = path.join(projectRoot, 'uploads', userId, 'profile.photo.png');

// path.join — joins segments with the OS separator, normalises the result
// Use for local file paths, never for URLs
console.log(uploadPath);
// 'C:\Users\risha\learning\node-backend\uploads\42\profile.photo.png'

// path.resolve — like join, but always returns an absolute path
// Resolves right to left, stops at the first absolute segment
console.log(path.resolve('uploads', userId));             // absolute path from cwd
console.log(path.resolve('/var/data', '..', 'logs'));     // '/var/logs'

// Dissecting a path
const filename = path.basename(uploadPath);               // 'profile.photo.png'
const ext      = path.extname(uploadPath);                // '.png'
const stem     = path.basename(uploadPath, ext);          // 'profile.photo'
const dir      = path.dirname(uploadPath);                // '...uploads\42'
console.log({ filename, ext, stem, dir });

// path.parse — breaks a path into its parts
// path.format — inverse of parse, reassembles parts into a string
const parsed      = path.parse(uploadPath);
// { root: 'C:\', dir: '...uploads\42', base: 'profile.photo.png', ext: '.png', name: 'profile.photo' }
const reformatted = path.format({ ...parsed, base: 'avatar.webp' });
console.log(parsed);
console.log(reformatted);

// path.normalize — cleans up redundant separators and resolves . / .. without hitting the fs
console.log(path.normalize('uploads//42/../42/profile.photo.png'));
// 'uploads\42\profile.photo.png'

// path.relative — relative path from one location to another
const from = path.join(projectRoot, 'src');
const to   = path.join(projectRoot, 'uploads', userId);
console.log(path.relative(from, to)); // '..\uploads\42'

// path.isAbsolute — true if the path starts from the root
console.log(path.isAbsolute('/etc/passwd'));  // true
console.log(path.isAbsolute('uploads/42'));   // false

// Separators
console.log(path.sep);       // '\' on Windows, '/' on Unix
console.log(path.delimiter); // ';' on Windows, ':' on Unix (used in PATH env var)
```

## How the Code Works

- **`path.join()`** — concatenates segments with the correct OS separator and normalises the result (removes double slashes, resolves `.`). Never use string concatenation with `/` directly.
- **`path.resolve()`** — builds an absolute path. If a segment is itself absolute, everything to its left is discarded. Falls back to `cwd` when all segments are relative.
- **`path.basename()`** — returns the last part of a path. Pass the extension as a second argument to strip it and get just the filename stem.
- **`path.extname()`** — returns the extension including the dot (`.png`). Returns an empty string if there is none.
- **`path.dirname()`** — returns everything except the last segment. Useful when you need the folder a file lives in.
- **`path.parse()`** — splits a path string into `{ root, dir, base, name, ext }`. Pair with `path.format()` to swap one part (e.g. rename a file while keeping the directory).
- **`path.normalize()`** — resolves `.` and `..` and collapses duplicate separators without touching the filesystem. Useful for sanitising user-supplied paths.
- **`path.relative()`** — computes the shortest relative path between two absolute paths. Handy for generating import paths or relative URLs.
- **`path.isAbsolute()`** — quick check before deciding whether to `join` or `resolve`.
- **`path.sep` / `path.delimiter`** — constants for the OS separator and the PATH env var delimiter. Use them instead of hardcoded characters.

## Expected Output

```
C:\Users\risha\learning\node-backend\uploads\42\profile.photo.png
C:\Users\risha\learning\node-backend\uploads\42
/var/logs
{ filename: 'profile.photo.png', ext: '.png', stem: 'profile.photo', dir: '...uploads\42' }
{ root: 'C:\', dir: '...uploads\42', base: 'profile.photo.png', ext: '.png', name: 'profile.photo' }
C:\Users\risha\learning\node-backend\uploads\42\avatar.webp
uploads\42\profile.photo.png
..\uploads\42
true
false
\
;
```

## Common Mistakes

- Joining paths with string concatenation (`'uploads/' + userId`) — breaks on Windows. Always use `path.join()`.
- Using `path.join()` for URLs — it will use `\` on Windows and break the URL. Use the `URL` constructor instead.
- Confusing `join` and `resolve` — `join` is relative-aware; `resolve` always produces an absolute path.
- Not stripping the extension with `path.basename(file, ext)` when you need just the name — `path.parse()` gives you `name` directly if you need multiple parts at once.
- Using `path.normalize()` as a security measure against path traversal — it resolves `..` but doesn't prevent escaping a base directory. Combine with `path.resolve()` and check that the result starts with your base path.

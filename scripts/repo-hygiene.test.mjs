import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const hygieneScript = fileURLToPath(new URL("./repo-hygiene.mjs", import.meta.url));
const fakeGitHubToken = ["github", "pat", "abcdefghijklmnopqrstuvwxyz123456"].join("_");

function repository(files, stageOverrides = {}) {
  const directory = mkdtempSync(join(tmpdir(), "portfolio-hygiene-"));
  execFileSync("git", ["init", "--quiet"], { cwd: directory });
  writeFileSync(join(directory, ".gitignore"), "");

  for (const [path, content] of Object.entries(files)) {
    const target = join(directory, path);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, content);
  }

  execFileSync("git", ["add", "."], { cwd: directory });

  for (const [path, content] of Object.entries(stageOverrides)) {
    writeFileSync(join(directory, path), content);
  }

  return directory;
}

function runHygiene(directory) {
  return spawnSync(process.execPath, [hygieneScript], {
    cwd: directory,
    encoding: "utf8",
  });
}

test("scans staged content instead of a clean worktree copy", (t) => {
  const directory = repository(
    { "leak.txt": `${fakeGitHubToken}\n` },
    { "leak.txt": "safe worktree content\n" },
  );
  t.after(() => rmSync(directory, { recursive: true, force: true }));

  const result = runHygiene(directory);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /credential signatures/);
});

test("rejects literal npm credentials in extensionless config", (t) => {
  const directory = repository({ ".npmrc": "//localhost:4873/:_authToken=literal-token\n" });
  t.after(() => rmSync(directory, { recursive: true, force: true }));

  const result = runHygiene(directory);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /credential signatures/);
});

test("allows environment-backed npm credentials", (t) => {
  const directory = repository({ ".npmrc": "//[::1]:4873/:_authToken=${NPM_TOKEN}\n" });
  t.after(() => rmSync(directory, { recursive: true, force: true }));

  const result = runHygiene(directory);
  assert.equal(result.status, 0, result.stderr);
});

test("scans allowed env examples for credential content", (t) => {
  const directory = repository({ ".env.example": `TOKEN=${fakeGitHubToken}\n` });
  t.after(() => rmSync(directory, { recursive: true, force: true }));

  const result = runHygiene(directory);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /credential signatures/);
});

test("scans UTF-16 env examples", (t) => {
  const content = Buffer.from(`\uFEFFTOKEN=${fakeGitHubToken}\n`, "utf16le");
  const directory = repository({ ".env.example": content });
  t.after(() => rmSync(directory, { recursive: true, force: true }));

  const result = runHygiene(directory);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /credential signatures/);
});

test("does not accept documentation-only image references", (t) => {
  const directory = repository({
    "README.md": "See /images/orphan.png\n",
    "public/images/orphan.png": Buffer.from([1, 2, 3]),
  });
  t.after(() => rmSync(directory, { recursive: true, force: true }));

  const result = runHygiene(directory);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /no runtime or contract reference/);
});

test("rejects unstaged ignore rules that mask staged content", (t) => {
  const directory = repository(
    { "internal.txt": "staged content\n" },
    { ".gitignore": "internal.txt\n" },
  );
  t.after(() => rmSync(directory, { recursive: true, force: true }));

  const result = runHygiene(directory);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /unstaged changes/);
});

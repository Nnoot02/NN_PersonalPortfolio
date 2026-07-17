import { execFileSync, spawnSync } from "node:child_process";

const failures = [];
const MAX_PUBLIC_IMAGE_BYTES = 500 * 1024;

function gitFiles(args) {
  return execFileSync("git", [...args, "-z"], { encoding: "utf8" })
    .split("\0")
    .filter(Boolean);
}

function indexBlob(path) {
  return execFileSync("git", ["show", `:${path}`]);
}

function indexBlobSize(path) {
  return Number(execFileSync("git", ["cat-file", "-s", `:${path}`], { encoding: "utf8" }));
}

function isText(buffer) {
  return !buffer.subarray(0, 8_000).includes(0);
}

function fail(message, paths) {
  if (paths.length) failures.push(`${message}:\n  - ${paths.join("\n  - ")}`);
}

const tracked = gitFiles(["ls-files"]);
const ignoreFiles = tracked.filter((path) => /(^|\/)\.gitignore$/.test(path));
const changedIgnoreFiles = spawnSync("git", ["diff", "--quiet", "--", ...ignoreFiles]).status === 1;

fail("Tracked .gitignore files have unstaged changes", changedIgnoreFiles ? ignoreFiles : []);
fail(
  "Untracked .gitignore files can mask staged content",
  gitFiles(["ls-files", "--others", "--exclude-standard"]).filter((path) => /(^|\/)\.gitignore$/.test(path)),
);

fail(
  "Tracked files are ignored by .gitignore",
  gitFiles(["ls-files", "--cached", "--ignored", "--exclude-per-directory=.gitignore"]),
);

fail(
  "Internal working paths are publicly tracked",
  tracked.filter((path) => path.startsWith("docs/superpowers/")),
);

const sensitiveFilePatterns = [
  /(^|\/)\.env($|\.)/i,
  /(^|\/)\.dev\.vars($|\.)/i,
  /(^|\/)client_secret_[^/]*\.json$/i,
  /(^|\/)id_(rsa|dsa|ecdsa|ed25519)$/i,
  /\.(key|pem|p12|pfx)$/i,
];
const credentialConfigPattern = /(^|\/)(?:\.npmrc|\.yarnrc|\.pypirc|\.netrc)$/i;

fail(
  "Potential secret-bearing files are publicly tracked",
  tracked.filter(
    (path) => !/(^|\/)\.env\.example$/i.test(path) && sensitiveFilePatterns.some((pattern) => pattern.test(path)),
  ),
);

function decodeText(path, content) {
  if (content[0] === 0xff && content[1] === 0xfe) return content.subarray(2).toString("utf16le");
  if (content[0] === 0xfe && content[1] === 0xff) {
    const swapped = Buffer.from(content.subarray(2));
    swapped.swap16();
    return swapped.toString("utf16le");
  }
  if (isText(content)) return content.toString("utf8");
  if (credentialConfigPattern.test(path) || sensitiveFilePatterns.some((pattern) => pattern.test(path))) {
    return content.toString("utf16le");
  }
  return null;
}

const trackedText = tracked
  .map((path) => [path, decodeText(path, indexBlob(path))])
  .filter(([, content]) => content !== null);
const secretSignatures = [
  /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/,
  /\bAKIA[0-9A-Z]{16}\b/,
  /\b(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{20,}\b/,
  /\bgithub_pat_[A-Za-z0-9_]{20,}\b/,
  /\bsk-(?:proj-)?[A-Za-z0-9_-]{20,}\b/,
  /\bxox[baprs]-[A-Za-z0-9-]{10,}\b/,
  /\bAIza[0-9A-Za-z_-]{30,}\b/,
  /\b(?:sk|pk)_live_[0-9A-Za-z]{16,}\b/,
];

function containsCredential(content) {
  if (secretSignatures.some((pattern) => pattern.test(content))) return true;

  return content.split(/\r?\n/).some((line) => {
    const match = line.match(/^\s*(?:\/\/.*:)?(?:_auth|_authToken|_password)\s*=\s*(.+?)\s*$/i);
    if (!match) return false;

    const value = match[1];
    return value.length > 0 && !/^\$\{[A-Za-z_][A-Za-z0-9_]*\}$/.test(value);
  });
}

fail(
  "Tracked text contains credential signatures",
  trackedText
    .filter(([, content]) => containsCredential(content))
    .map(([path]) => path),
);

const referenceText = trackedText
  .filter(
    ([path]) =>
      path.startsWith("app/") ||
      path.startsWith("components/") ||
      path.startsWith("lib/") ||
      path === "next.config.ts" ||
      path === "scripts/portfolio-contract.mjs",
  )
  .map(([, content]) => content)
  .join("\n");
const imageReferences = new Set(referenceText.match(/\/images\/[A-Za-z0-9._/-]+/g) ?? []);
const publicImages = tracked.filter((path) => path.startsWith("public/images/"));

fail(
  "Public images have no runtime or contract reference",
  publicImages.filter((path) => !imageReferences.has(path.slice("public".length))),
);

const publicImageSizes = publicImages.map((path) => [path, indexBlobSize(path)]);

fail(
  `Public images exceed ${MAX_PUBLIC_IMAGE_BYTES} bytes`,
  publicImageSizes
    .filter(([, size]) => size > MAX_PUBLIC_IMAGE_BYTES)
    .map(([path, size]) => `${path} (${size} bytes)`),
);

if (failures.length) {
  console.error(`Repository hygiene failures:\n\n${failures.join("\n\n")}`);
  process.exit(1);
}

console.log(`Repository hygiene passed (${tracked.length} tracked files).`);

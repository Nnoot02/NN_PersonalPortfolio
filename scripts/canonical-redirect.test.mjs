import assert from "node:assert/strict";
import test from "node:test";
import worker, { canonicalRedirectLocation, withHtmlEtag } from "../worker/index.mjs";

test("every non-canonical entry point redirects to the canonical URL", () => {
  assert.equal(canonicalRedirectLocation("http://nnoott.com/"), "https://nnoott.com/");
  assert.equal(canonicalRedirectLocation("https://www.nnoott.com/"), "https://nnoott.com/");
  assert.equal(canonicalRedirectLocation("http://www.nnoott.com/"), "https://nnoott.com/");
});

test("path and query survive, and a trailing slash collapses to a single hop", () => {
  assert.equal(
    canonicalRedirectLocation("http://www.nnoott.com/projects/?from=nav"),
    "https://nnoott.com/projects?from=nav",
  );
  assert.equal(canonicalRedirectLocation("http://nnoott.com/sitemap.xml"), "https://nnoott.com/sitemap.xml");
  assert.equal(canonicalRedirectLocation("https://www.nnoott.com/projects"), "https://nnoott.com/projects");
});

test("the canonical URL and hosts we do not own pass through", () => {
  for (const url of [
    "https://nnoott.com/",
    "https://nnoott.com/projects",
    "http://localhost:8787/",
    "https://noot-portfolio.example.workers.dev/",
    "https://example.com/",
  ]) {
    assert.equal(canonicalRedirectLocation(url), null, url);
  }
});

test("fetch answers a non-canonical request with 308 and the canonical Location", async () => {
  const env = { ASSETS: { fetch: async () => new Response("asset") } };
  const response = await worker.fetch(new Request("http://www.nnoott.com/projects"), env);
  assert.equal(response.status, 308);
  assert.equal(response.headers.get("location"), "https://nnoott.com/projects");
  assert.equal(response.headers.get("cache-control"), "max-age=600");
});

test("fetch hands every other request to the assets binding", async () => {
  const seen = [];
  const env = {
    ASSETS: {
      fetch: async (request) => {
        const pathname = new URL(request.url).pathname;
        seen.push(pathname);
        return new Response(`asset:${pathname}`);
      },
    },
  };
  const response = await worker.fetch(new Request("https://nnoott.com/projects"), env);
  assert.equal(await response.text(), "asset:/projects");
  assert.deepEqual(seen, ["/projects"]);
});

// 2026-10-21 audit TECH-6. HTML left the asset layer without an ETag, so a
// repeat navigation re-downloaded the document despite must-revalidate.
const htmlResponse = () => new Response("<!doctype html><title>x</title>", {
  status: 200,
  headers: { "Content-Type": "text/html", "Cache-Control": "public, max-age=0, must-revalidate" },
});

test("an HTML response gains a strong ETag", async () => {
  const response = await withHtmlEtag(new Request("https://nnoott.com/"), htmlResponse());
  const etag = response.headers.get("etag");
  assert.match(etag ?? "", /^"[0-9a-f]{16}"$/);
  assert.equal(await response.text(), "<!doctype html><title>x</title>");
});

test("a repeat request with that ETag is answered 304 and keeps the tag", async () => {
  const first = await withHtmlEtag(new Request("https://nnoott.com/"), htmlResponse());
  const etag = first.headers.get("etag");
  const second = await withHtmlEtag(
    new Request("https://nnoott.com/", { headers: { "If-None-Match": etag } }),
    htmlResponse(),
  );
  assert.equal(second.status, 304);
  assert.equal(second.headers.get("etag"), etag);
  assert.equal(await second.text(), "");
});

test("a stale ETag still gets the document", async () => {
  const response = await withHtmlEtag(
    new Request("https://nnoott.com/", { headers: { "If-None-Match": '"0000000000000000"' } }),
    htmlResponse(),
  );
  assert.equal(response.status, 200);
  assert.equal(await response.text(), "<!doctype html><title>x</title>");
});

test("non-HTML responses and existing ETags pass through untouched", async () => {
  const css = new Response("body{}", { headers: { "Content-Type": "text/css" } });
  assert.equal(await withHtmlEtag(new Request("https://nnoott.com/a.css"), css), css);

  const tagged = new Response("<!doctype html>", { headers: { "Content-Type": "text/html", ETag: '"platform"' } });
  const response = await withHtmlEtag(new Request("https://nnoott.com/"), tagged);
  assert.equal(response.headers.get("etag"), '"platform"');
});

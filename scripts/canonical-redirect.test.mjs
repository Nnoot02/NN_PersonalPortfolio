import assert from "node:assert/strict";
import test from "node:test";
import worker, { canonicalRedirectLocation } from "../worker/index.mjs";

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

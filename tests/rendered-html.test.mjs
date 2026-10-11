import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the YKPS Forum prototype", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /YKPS Forum/);
  assert.match(html, />Ideas</);
  assert.match(html, />Archive</);
  assert.match(html, />Media</);
  assert.match(html, />Clubs</);
  assert.match(html, /Campus community/i);
  assert.doesNotMatch(html, /Your site is taking shape|Building your site/);
});

test("keeps collaboration and privacy safeguards in the repository", async () => {
  const [readme, contributing, codeowners, gitignore, packageJson] =
    await Promise.all([
      readFile(new URL("../README.md", import.meta.url), "utf8"),
      readFile(new URL("../CONTRIBUTING.md", import.meta.url), "utf8"),
      readFile(new URL("../.github/CODEOWNERS", import.meta.url), "utf8"),
      readFile(new URL("../.gitignore", import.meta.url), "utf8"),
      readFile(new URL("../package.json", import.meta.url), "utf8"),
    ]);

  assert.match(readme, /fictional/i);
  assert.match(readme, /Never commit `.env` files/i);
  assert.match(contributing, /Pull Request/);
  assert.match(contributing, /Do not push directly to `main`/);
  assert.match(codeowners, /^\* @FMSTR$/m);
  assert.match(gitignore, /^\.env\*$/m);
  assert.match(gitignore, /^\*\.zip$/m);
  assert.match(packageJson, /"name": "ykps-forum"/);
});

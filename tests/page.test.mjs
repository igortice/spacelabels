import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const html = await readFile(new URL("../index.html", import.meta.url), "utf8");

test("public page keeps the approved product narrative and real screens", async () => {
  assert.match(html, /Dê nome às Mesas do seu Mac\./);
  assert.match(html, /Fica onde você já olha\./);
  assert.match(html, /Nomeie cada Mesa do seu jeito\./);
  assert.match(html, /Baixe\.<br>Mova\.<br>Abra\./);

  const expectedImages = [
    "spacelabels.webp",
    "desktop-context.webp",
    "hud.webp",
    "menu.webp",
    "history.webp",
    "rename.webp",
    "preferences.webp",
  ];

  for (const image of expectedImages) {
    assert.match(html, new RegExp(`assets/${image}`));
    await access(new URL(`../assets/${image}`, import.meta.url));
  }
});

test("release-facing links remain fail-closed and dynamically populated", () => {
  assert.match(html, /<body data-release-state="loading">/);
  assert.equal((html.match(/data-download-link/g) ?? []).length, 3);
  assert.equal((html.match(/aria-disabled="true"/g) ?? []).length, 4);
  assert.doesNotMatch(
    html,
    /href="https:\/\/github\.com\/igortice\/spacelabels\/releases\/download\//,
  );
  assert.match(html, /data-release-version/);
  assert.match(html, /data-release-checksum/);
  assert.match(html, /assets\/site\.js/);
});

test("page includes responsive and accessible browser metadata", () => {
  assert.match(html, /lang="pt-BR"/);
  assert.match(html, /name="viewport"/);
  assert.match(html, /name="description"/);
  assert.match(html, /property="og:image"/);
  assert.match(html, /<nav class="site-nav" aria-label=/);
  assert.match(html, /<noscript>/);
});

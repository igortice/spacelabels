import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const englishPageUrl = new URL("../index.html", import.meta.url);
const portuguesePageUrl = new URL("../pt-BR/index.html", import.meta.url);
const englishHtml = await readFile(englishPageUrl, "utf8");
const portugueseHtml = await readFile(portuguesePageUrl, "utf8");

const expectedImages = [
  "spacelabels.webp",
  "desktop-context.webp",
  "hud.webp",
  "menu.webp",
  "history.webp",
  "rename.webp",
  "preferences.webp",
];

test("root document is the complete English page", async () => {
  assert.match(englishHtml, /<html lang="en">/);
  assert.match(englishHtml, /Name every Space on your Mac\./);
  assert.match(englishHtml, /It stays where you already look\./);
  assert.match(englishHtml, /Name every Space your way\./);
  assert.match(englishHtml, /Download\.<br>Move\.<br>Open\./);
  assert.doesNotMatch(englishHtml, /Dê nome às Mesas do seu Mac\./);

  for (const image of expectedImages) {
    assert.match(englishHtml, new RegExp(`assets/${image}`));
    await access(new URL(`../assets/${image}`, import.meta.url));
  }
});

test("pt-BR document preserves the complete approved Portuguese page", async () => {
  assert.match(portugueseHtml, /<html lang="pt-BR">/);
  assert.match(portugueseHtml, /Dê nome às Mesas do seu Mac\./);
  assert.match(portugueseHtml, /Fica onde você já olha\./);
  assert.match(portugueseHtml, /Nomeie cada Mesa do seu jeito\./);
  assert.match(portugueseHtml, /Baixe\.<br>Mova\.<br>Abra\./);
  assert.doesNotMatch(portugueseHtml, /Name every Space on your Mac\./);

  for (const image of expectedImages) {
    assert.match(portugueseHtml, new RegExp(`\\.\\./assets/${image}`));
  }
});

test("both routes expose reciprocal language selectors and metadata", async () => {
  assert.match(englishHtml, /rel="canonical" href="https:\/\/igortice\.github\.io\/spacelabels\/"/);
  assert.match(englishHtml, /hreflang="pt-BR" href="https:\/\/igortice\.github\.io\/spacelabels\/pt-BR\/"/);
  assert.match(englishHtml, /class="language-option is-current"[^>]*aria-current="page"[^>]*>EN</);
  assert.match(englishHtml, /class="language-option" href="pt-BR\/"[^>]*>PT</);

  assert.match(portugueseHtml, /rel="canonical" href="https:\/\/igortice\.github\.io\/spacelabels\/pt-BR\/"/);
  assert.match(portugueseHtml, /hreflang="en" href="https:\/\/igortice\.github\.io\/spacelabels\/"/);
  assert.match(portugueseHtml, /class="language-option" href="\.\.\/"[^>]*>EN</);
  assert.match(portugueseHtml, /class="language-option is-current"[^>]*aria-current="page"[^>]*>PT</);

  for (const html of [englishHtml, portugueseHtml]) {
    assert.match(html, /name="viewport"/);
    assert.match(html, /name="description"/);
    assert.match(html, /property="og:image"/);
    assert.match(html, /hreflang="x-default"/);
    assert.match(html, /<nav class="site-nav" aria-label=/);
    assert.match(html, /<noscript>/);
  }
});

test("both routes share the same versioned design-system stylesheet", () => {
  const englishStylesheet = englishHtml.match(
    /href="assets\/styles\.css\?v=([^"]+)"/,
  );

  assert.ok(englishStylesheet, "the English route must cache-bust styles.css");
  assert.match(
    portugueseHtml,
    new RegExp(
      `href="\\.\\./assets/styles\\.css\\?v=${englishStylesheet[1]}"`,
    ),
  );
});

test("release-facing links remain fail-closed on both routes", async () => {
  for (const html of [englishHtml, portugueseHtml]) {
    assert.match(html, /<body data-release-state="loading">/);
    assert.equal((html.match(/data-download-link/g) ?? []).length, 3);
    assert.equal((html.match(/aria-disabled="true"/g) ?? []).length, 4);
    assert.doesNotMatch(
      html,
      /href="https:\/\/github\.com\/igortice\/spacelabels\/releases\/download\//,
    );
    assert.match(html, /data-release-version/);
    assert.match(html, /data-release-checksum/);
  }
});

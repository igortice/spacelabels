import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const englishPageUrl = new URL("../index.html", import.meta.url);
const portuguesePageUrl = new URL("../pt-BR/index.html", import.meta.url);
const stylesheetUrl = new URL("../assets/styles.css", import.meta.url);
const englishHtml = await readFile(englishPageUrl, "utf8");
const portugueseHtml = await readFile(portuguesePageUrl, "utf8");
const stylesheet = await readFile(stylesheetUrl, "utf8");

const expectedImages = [
  "spacelabels.webp",
  "hud.webp",
  "menu.webp",
  "space-management.webp",
  "history.webp",
  "rename.webp",
  "preferences.webp",
];

test("root document is the complete English page", async () => {
  assert.match(englishHtml, /<html lang="en">/);
  assert.match(englishHtml, /Name every Space on your Mac\./);
  assert.match(englishHtml, /Name every Space your way\./);
  assert.match(englishHtml, /monitor context/);
  assert.match(englishHtml, /optional Space name/);
  assert.match(englishHtml, /Manage your Spaces/);
  assert.match(englishHtml, /configurable global shortcuts/);
  assert.match(
    englishHtml,
    /Starting with SpaceLabels 1\.4\.0, public releases use a branded\s+DMG\./,
  );
  assert.match(englishHtml, /Downloads remain locked to the latest verified public\s+version\./);
  assert.doesNotMatch(englishHtml, /release candidate is prepared/);
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
  assert.match(portugueseHtml, /Nomeie cada Mesa do seu jeito\./);
  assert.match(portugueseHtml, /monitor/);
  assert.match(portugueseHtml, /nome opcional/);
  assert.match(portugueseHtml, /Gerencie suas Mesas/);
  assert.match(portugueseHtml, /atalhos globais configuráveis/);
  assert.match(
    portugueseHtml,
    /A partir do SpaceLabels 1\.4\.0, as Releases públicas usam um DMG\s+com\s+identidade visual\./,
  );
  assert.match(
    portugueseHtml,
    /Os downloads permanecem vinculados à\s+versão pública mais recente já verificada\./,
  );
  assert.doesNotMatch(portugueseHtml, /candidato da Release 1\.4\.0 está preparado/);
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

test("changed landing assets carry the current cache key", () => {
  for (const html of [englishHtml, portugueseHtml]) {
    assert.match(html, /styles\.css\?v=20260802-1/);
    for (const image of ["menu", "space-management", "preferences"]) {
      assert.match(html, new RegExp(`${image}\\.webp\\?v=20260801-1`));
    }
  }
});

test("native window captures share a rounded framed treatment", () => {
  for (const html of [englishHtml, portugueseHtml]) {
    assert.equal(
      (html.match(/native-window-media/g) ?? []).length,
      3,
      "Manage Desktops, Rename, and Preferences should share the native window frame",
    );
  }

  const frameRule = stylesheet.match(
    /\.feature-media\.native-window-media img,\s*\.rename-media\.native-window-media img,\s*\.preferences-media\.native-window-media img\s*\{([\s\S]*?)\n\}/,
  );

  assert.ok(frameRule, "the three native window captures need one shared frame rule");
  assert.match(frameRule[1], /border: 1px solid/);
  assert.match(frameRule[1], /border-radius: var\(--radius\);/);
  assert.match(frameRule[1], /box-shadow: var\(--capture-shadow\);/);
  assert.match(frameRule[1], /filter: none;/);

  assert.match(
    stylesheet,
    /\.feature-media\.native-window-media img\s*\{[\s\S]*?width: min\(100%, 470px\);[\s\S]*?height: auto;[\s\S]*?max-height: none;/,
    "Manage Desktops should frame the actual square capture instead of a letterboxed image box",
  );
  assert.match(
    stylesheet,
    /\.preferences-media\.native-window-media img\s*\{[\s\S]*?width: min\(100%, 312px\);[\s\S]*?height: auto;[\s\S]*?max-height: none;/,
    "Preferences should frame its tall capture instead of a letterboxed image box",
  );
});

test("both routes use the public GitHub Issues as the feedback channel", () => {
  const issuesUrl = "https://github.com/igortice/spacelabels/issues";

  assert.match(
    englishHtml,
    new RegExp(
      `<a href="${issuesUrl}">Report an issue</a>`,
    ),
  );
  assert.match(
    portugueseHtml,
    new RegExp(
      `<a href="${issuesUrl}">Relatar um problema</a>`,
    ),
  );

  for (const html of [englishHtml, portugueseHtml]) {
    assert.doesNotMatch(html, /href="(?:\.\.\/)?support\/?"/);
    assert.doesNotMatch(html, />Support<|>Suporte</);
  }
});

test("feature captures expose the approved 1.4.0 surfaces with descriptive alt text", () => {
  assert.doesNotMatch(englishHtml, /desktop-context\.webp/);
  assert.doesNotMatch(portugueseHtml, /desktop-context\.webp/);

  assert.match(
    englishHtml,
    /alt="The real SpaceLabels menu showing Desktop 3, Built-in Retina Display, a visible app, and Manage Desktops action"/,
  );
  assert.match(
    englishHtml,
    /alt="The real SpaceLabels Manage Desktops window grouped by monitor with editable Space names"/,
  );
  assert.match(
    englishHtml,
    /alt="The real SpaceLabels Preferences with the menu bar name option and configurable global shortcuts"/,
  );

  assert.match(
    portugueseHtml,
    /alt="Menu real do SpaceLabels mostrando Desktop 3, o monitor Built-in Retina Display, um aplicativo visível e a ação Gerenciar Mesas"/,
  );
  assert.match(
    portugueseHtml,
    /alt="Janela real do SpaceLabels Gerenciar Mesas agrupada por monitor com nomes editáveis"/,
  );
  assert.match(
    portugueseHtml,
    /alt="Preferências reais do SpaceLabels com a opção de nome na barra e atalhos globais configuráveis"/,
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

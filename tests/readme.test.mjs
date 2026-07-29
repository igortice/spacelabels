import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const readme = await readFile(new URL("../README.md", import.meta.url), "utf8");
const englishHtml = await readFile(
  new URL("../index.html", import.meta.url),
  "utf8",
);
const portugueseHtml = await readFile(
  new URL("../pt-BR/index.html", import.meta.url),
  "utf8",
);

const publicRepositoryUrl = "https://github.com/igortice/spacelabels";
const issuesUrl = `${publicRepositoryUrl}/issues`;
const latestReleaseUrl = `${publicRepositoryUrl}/releases/latest`;
const websiteUrl = "https://igortice.github.io/spacelabels/";
const portugueseWebsiteUrl = `${websiteUrl}pt-BR/`;

test("README is the GitHub entry point for the public product", () => {
  assert.match(readme, /^# SpaceLabels/m);
  assert.match(readme, /Name every Space on your Mac\./);
  assert.match(readme, /macOS 15/);
  assert.match(readme, /menu bar/);
  assert.match(readme, /HUD/);
  assert.match(readme, /App History/);
  assert.match(readme, /Rename/);
  assert.match(readme, new RegExp(websiteUrl.replaceAll("/", "\\/")));
  assert.match(
    readme,
    new RegExp(portugueseWebsiteUrl.replaceAll("/", "\\/")),
  );
  assert.match(readme, new RegExp(latestReleaseUrl.replaceAll("/", "\\/")));
  assert.match(readme, new RegExp(issuesUrl.replaceAll("/", "\\/")));
});

test("README documents the verified installation and release path", () => {
  for (const phrase of [
    "Download the DMG",
    "Move SpaceLabels to Applications",
    "Open it from Finder",
    "Gatekeeper",
    "SHA-256",
    "v1.3.0",
    "5d68bcf6d08165eba79a8fd8323585b62e0a8ecee1c567aaa5722020e44fc844",
  ]) {
    assert.match(readme, new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }

  assert.match(readme, /free/);
  assert.match(readme, /local/);
  assert.match(readme, /no account, cloud, or telemetry/);
  assert.match(readme, /Issues.*bugs and suggestions/s);
  assert.match(readme, /no dedicated support desk\s+or SLA/);
  assert.doesNotMatch(readme, /\]\(support\/?\)/);
});

test("README uses the same public evidence images as the site", async () => {
  const images = [
    ["spacelabels.webp", "SpaceLabels icon"],
    ["desktop-context.webp", "macOS desktop"],
    ["hud.webp", "SpaceLabels HUD"],
    ["menu.webp", "SpaceLabels menu"],
    ["history.webp", "app history"],
    ["rename.webp", "rename"],
    ["preferences.webp", "preferences"],
  ];

  for (const [filename, altText] of images) {
    assert.match(readme, new RegExp(`!\\[[^\\]]*${altText}[^\\]]*\\]\\(assets/${filename}\\)`));
    await access(new URL(`../assets/${filename}`, import.meta.url));
  }
});

test("both site routes link back to the public repository", () => {
  for (const html of [englishHtml, portugueseHtml]) {
    assert.match(
      html,
      new RegExp(`<a href="${publicRepositoryUrl}">GitHub</a>`),
    );
    assert.match(html, new RegExp(issuesUrl.replaceAll("/", "\\/")));
  }
});

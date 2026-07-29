import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
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
const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

test("README is the GitHub entry point for the public product", () => {
  assert.match(readme, /^# SpaceLabels/m);
  assert.match(readme, /Name every Space on your Mac\./);
  assert.match(readme, /macOS 15/);
  assert.match(readme, /menu bar/);
  assert.match(readme, /HUD/);
  assert.match(readme, /App History/);
  assert.match(readme, /Rename/);
  assert.match(readme, /## Requirements/);
  assert.match(readme, /## First use/);
  assert.match(readme, /## Download and install/);
  for (const url of [
    websiteUrl,
    portugueseWebsiteUrl,
    latestReleaseUrl,
    issuesUrl,
  ]) {
    assert.match(readme, new RegExp(`href="${escapeRegExp(url)}"`));
  }
});

test("README documents the verified installation and release path", () => {
  for (const phrase of [
    "Download the latest DMG",
    "Open SpaceLabels from Finder",
    "Gatekeeper",
    "SHA-256",
    "v1.3.0",
    "5d68bcf6d08165eba79a8fd8323585b62e0a8ecee1c567aaa5722020e44fc844",
  ]) {
    assert.match(readme, new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }

  assert.match(readme, /Move \*\*SpaceLabels\*\* to \*\*Applications\*\*/);

  assert.match(readme, /free/);
  assert.match(readme, /local/);
  assert.match(readme, /no account, cloud, or telemetry/);
  assert.match(readme, /Issues.*reproducible bug.*suggest an improvement/s);
  assert.match(readme, /no dedicated support desk\s+or SLA/);
  assert.doesNotMatch(readme, /\]\(support\/?\)/);
});

test("README describes the real screens without embedding images", () => {
  assert.doesNotMatch(readme, /!\[[^\]]*\]\([^)]*\)/);
  assert.doesNotMatch(readme, /!\[[^\]]*\]\[[^\]]*\]/);
  assert.doesNotMatch(readme, /<img\b/i);

  for (const phrase of [
    "menu bar",
    "SpaceLabels HUD",
    "App History",
    "Rename Space",
    "Preferences",
  ]) {
    assert.match(readme, new RegExp(phrase, "i"));
  }

  assert.match(readme, /optional visual guide/);
  assert.match(readme, /Nothing on that site is\s+required/);
});

test("README stays user-facing instead of asking users to run the site", () => {
  assert.doesNotMatch(readme, /Run the public site locally/);
  assert.doesNotMatch(readme, /python3 -m http\.server/);
  assert.doesNotMatch(readme, /localhost:\d+/);
});

test("both site routes link back to the public repository", () => {
  for (const html of [englishHtml, portugueseHtml]) {
    assert.match(
      html,
      new RegExp(
        `<a href="${escapeRegExp(publicRepositoryUrl)}">GitHub</a>`,
      ),
    );
    assert.match(html, new RegExp(escapeRegExp(issuesUrl)));
  }
});

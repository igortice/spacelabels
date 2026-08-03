import assert from "node:assert/strict";
import test from "node:test";

import {
  loadPublicRelease,
  ReleaseValidationError,
  normalizePublicRelease,
} from "../assets/release.js";

const validRelease = {
  tag_name: "v1.4.1",
  name: "SpaceLabels 1.4.1",
  draft: false,
  prerelease: false,
  published_at: "2026-08-03T21:29:16Z",
  body: [
    "## What's Changed",
    "* Refreshed the SpaceLabels app and menu bar icons.",
    "* Improved the About experience in English and Brazilian Portuguese.",
    "* Added stronger visual asset validation for consistent builds.",
  ].join("\n"),
  assets: [
    {
      name: "SpaceLabels-1.4.1.dmg",
      browser_download_url:
        "https://github.com/igortice/spacelabels/releases/download/v1.4.1/SpaceLabels-1.4.1.dmg",
      size: 5_064_594,
      digest:
        "sha256:fa46824e020c590f1d7f5808f42cae9077376fc546d40ef08e5cf63291c606d0",
    },
    {
      name: "SpaceLabels-1.4.1.dmg.sha256",
      browser_download_url:
        "https://github.com/igortice/spacelabels/releases/download/v1.4.1/SpaceLabels-1.4.1.dmg.sha256",
      size: 88,
      digest:
        "sha256:ca8c8b60ed41872ac789df053a4dae10658c3f0a68d0761789ba52f90208857b",
    },
  ],
};

test("normaliza a Release pública validada para apresentação", () => {
  const release = normalizePublicRelease(validRelease);

  assert.deepEqual(release, {
    version: "1.4.1",
    tag: "v1.4.1",
    publishedAt: "2026-08-03T21:29:16Z",
    dmgName: "SpaceLabels-1.4.1.dmg",
    dmgUrl:
      "https://github.com/igortice/spacelabels/releases/download/v1.4.1/SpaceLabels-1.4.1.dmg",
    dmgSize: 5_064_594,
    checksum:
      "fa46824e020c590f1d7f5808f42cae9077376fc546d40ef08e5cf63291c606d0",
    checksumUrl:
      "https://github.com/igortice/spacelabels/releases/download/v1.4.1/SpaceLabels-1.4.1.dmg.sha256",
    notes: [
      "Refreshed the SpaceLabels app and menu bar icons.",
      "Improved the About experience in English and Brazilian Portuguese.",
      "Added stronger visual asset validation for consistent builds.",
    ],
  });
});

test("recusa Release não publicada ou de pré-lançamento", () => {
  for (const release of [
    { ...validRelease, draft: true },
    { ...validRelease, prerelease: true },
    { ...validRelease, published_at: null },
  ]) {
    assert.throws(
      () => normalizePublicRelease(release),
      ReleaseValidationError,
    );
  }
});

test("recusa artefatos ausentes, divergentes ou fora do GitHub público", () => {
  const cases = [
    { ...validRelease, assets: validRelease.assets.slice(0, 1) },
    {
      ...validRelease,
      assets: validRelease.assets.map((asset, index) =>
        index === 0 ? { ...asset, digest: null } : asset
      ),
    },
    {
      ...validRelease,
      assets: validRelease.assets.map((asset, index) =>
        index === 1 ? { ...asset, digest: null } : asset
      ),
    },
    {
      ...validRelease,
      assets: validRelease.assets.map((asset, index) =>
        index === 1 ? { ...asset, size: 0 } : asset
      ),
    },
    {
      ...validRelease,
      assets: validRelease.assets.map((asset, index) =>
        index === 0
          ? {
              ...asset,
              browser_download_url:
                "https://example.com/SpaceLabels-1.4.1.dmg",
            }
          : asset
      ),
    },
    {
      ...validRelease,
      assets: validRelease.assets.map((asset, index) =>
        index === 0
          ? { ...asset, name: "SpaceLabels-1.3.0.dmg" }
          : asset
      ),
    },
  ];

  for (const release of cases) {
    assert.throws(
      () => normalizePublicRelease(release),
      ReleaseValidationError,
    );
  }
});

test("usa o manifesto local validado quando a API pública está indisponível", async () => {
  const requested = [];
  const fetchRelease = async (url) => {
    requested.push(url);
    if (url === "https://api.github.com/latest") {
      return { ok: false, status: 403 };
    }
    return {
      ok: true,
      json: async () => validRelease,
    };
  };

  const release = await loadPublicRelease({
    fetchRelease,
    endpoints: [
      "https://api.github.com/latest",
      "assets/release-fallback.json",
    ],
  });

  assert.equal(release.version, "1.4.1");
  assert.deepEqual(requested, [
    "https://api.github.com/latest",
    "assets/release-fallback.json",
  ]);
});

test("falha fechado quando API e manifesto local não são válidos", async () => {
  const fetchRelease = async () => ({
    ok: true,
    json: async () => ({ ...validRelease, draft: true }),
  });

  await assert.rejects(
    loadPublicRelease({
      fetchRelease,
      endpoints: ["api", "fallback"],
    }),
    ReleaseValidationError,
  );
});

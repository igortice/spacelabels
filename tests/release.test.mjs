import assert from "node:assert/strict";
import test from "node:test";

import {
  loadPublicRelease,
  ReleaseValidationError,
  normalizePublicRelease,
} from "../assets/release.js";

const validRelease = {
  tag_name: "v1.3.0",
  name: "SpaceLabels 1.3.0",
  draft: false,
  prerelease: false,
  published_at: "2026-07-28T19:02:07Z",
  body: [
    "## What's Changed",
    "* Adicionar Histórico de apps da Mesa atual",
    "* Reabrir aplicativos do Histórico",
  ].join("\n"),
  assets: [
    {
      name: "SpaceLabels-1.3.0.dmg",
      browser_download_url:
        "https://github.com/igortice/spacelabels/releases/download/v1.3.0/SpaceLabels-1.3.0.dmg",
      size: 2_714_033,
      digest:
        "sha256:5d68bcf6d08165eba79a8fd8323585b62e0a8ecee1c567aaa5722020e44fc844",
    },
    {
      name: "SpaceLabels-1.3.0.dmg.sha256",
      browser_download_url:
        "https://github.com/igortice/spacelabels/releases/download/v1.3.0/SpaceLabels-1.3.0.dmg.sha256",
      size: 88,
      digest:
        "sha256:3d3be864b68c533b2375966418516bd3ba5ce04793783f718c7776648c49daf1",
    },
  ],
};

test("normaliza a Release pública validada para apresentação", () => {
  const release = normalizePublicRelease(validRelease);

  assert.deepEqual(release, {
    version: "1.3.0",
    tag: "v1.3.0",
    publishedAt: "2026-07-28T19:02:07Z",
    dmgName: "SpaceLabels-1.3.0.dmg",
    dmgUrl:
      "https://github.com/igortice/spacelabels/releases/download/v1.3.0/SpaceLabels-1.3.0.dmg",
    dmgSize: 2_714_033,
    checksum:
      "5d68bcf6d08165eba79a8fd8323585b62e0a8ecee1c567aaa5722020e44fc844",
    checksumUrl:
      "https://github.com/igortice/spacelabels/releases/download/v1.3.0/SpaceLabels-1.3.0.dmg.sha256",
    notes: [
      "Adicionar Histórico de apps da Mesa atual",
      "Reabrir aplicativos do Histórico",
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
                "https://example.com/SpaceLabels-1.3.0.dmg",
            }
          : asset
      ),
    },
    {
      ...validRelease,
      assets: validRelease.assets.map((asset, index) =>
        index === 0
          ? { ...asset, name: "SpaceLabels-1.2.0.dmg" }
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

  assert.equal(release.version, "1.3.0");
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

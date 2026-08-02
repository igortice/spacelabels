import assert from "node:assert/strict";
import test from "node:test";

import {
  formatReleaseSize,
  getReleasePresentation,
} from "../assets/localization.js";

const release = {
  version: "1.4.0",
  dmgSize: 5_190_181,
  notes: ["release: prepare SpaceLabels 1.4.0"],
};

test("apresenta o tamanho, ações e nota pública real da Release 1.4.0", () => {
  const english = getReleasePresentation(release, "en");
  const portuguese = getReleasePresentation(release, "pt-BR");

  assert.equal(formatReleaseSize(release.dmgSize, "en"), "5.2 MB");
  assert.equal(formatReleaseSize(release.dmgSize, "pt-BR"), "5,2 MB");
  assert.equal(english.compactDownloadLabel, "Download v1.4.0 ↓");
  assert.equal(english.fullDownloadLabel, "Download SpaceLabels 1.4.0 ↓");
  assert.equal(
    english.artifactLabel,
    "SpaceLabels 1.4.0 for macOS 15 or later",
  );
  assert.equal(english.notesLanguage, "en");
  assert.deepEqual(english.notes, [
    "release: prepare SpaceLabels 1.4.0",
  ]);

  assert.equal(portuguese.compactDownloadLabel, "Baixar v1.4.0 ↓");
  assert.equal(portuguese.notesLanguage, "en");
  assert.deepEqual(portuguese.notes, release.notes);
});

test("mantém notas futuras no idioma de origem sem inventar tradução", () => {
  const future = getReleasePresentation({
    version: "1.5.0",
    dmgSize: 3_000_000,
    notes: ["Nova funcionalidade ainda sem tradução."],
  }, "en");

  assert.deepEqual(future.notes, [
    "Nova funcionalidade ainda sem tradução.",
  ]);
  assert.equal(future.notesLanguage, "pt-BR");
});

test("usa mensagens vazias localizadas quando a Release não contém notas", () => {
  const emptyEnglish = getReleasePresentation({
    version: "1.5.0",
    dmgSize: 3_000_000,
    notes: [],
  }, "en");
  const emptyPortuguese = getReleasePresentation({
    version: "1.5.0",
    dmgSize: 3_000_000,
    notes: [],
  }, "pt-BR");

  assert.deepEqual(emptyEnglish.notes, [
    "See the public Release for the changes in this version.",
  ]);
  assert.equal(emptyEnglish.notesLanguage, "en");
  assert.deepEqual(emptyPortuguese.notes, [
    "Consulte a Release pública para ver as mudanças desta versão.",
  ]);
  assert.equal(emptyPortuguese.notesLanguage, "pt-BR");
});

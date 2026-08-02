const PORTUGUESE = "pt-BR";

const COPY = {
  en: {
    compactDownloadLabel: (version) => `Download v${version} ↓`,
    fullDownloadLabel: (version) => `Download SpaceLabels ${version} ↓`,
    artifactLabel: (version) =>
      `SpaceLabels ${version} for macOS 15 or later`,
    emptyNotes: "See the public Release for the changes in this version.",
  },
  [PORTUGUESE]: {
    compactDownloadLabel: (version) => `Baixar v${version} ↓`,
    fullDownloadLabel: (version) => `Baixar SpaceLabels ${version} ↓`,
    artifactLabel: (version) =>
      `SpaceLabels ${version} para macOS 15 ou superior`,
    emptyNotes:
      "Consulte a Release pública para ver as mudanças desta versão.",
  },
};

const RELEASE_NOTE_TRANSLATIONS = {
  "1.4.0": new Map([
    [
      "release: prepare SpaceLabels 1.4.0",
      "release: prepare SpaceLabels 1.4.0",
    ],
  ]),
  "1.3.0": new Map([
    [
      "Adicionar Histórico de apps da Mesa atual",
      "Add App History for the current Space",
    ],
    [
      "Reabrir aplicativos do Histórico",
      "Reopen applications from History",
    ],
    [
      "Consultar o Histórico de outras Mesas e de Todas as Mesas",
      "Browse the History of other Spaces and All Spaces",
    ],
    [
      "Remover apps do Histórico com deleção lógica",
      "Remove apps from History with soft deletion",
    ],
    [
      "Adicionar privacidade e exclusão permanente ao Histórico",
      "Add privacy controls and permanent History deletion",
    ],
    [
      "Preparar SpaceLabels 1.3.0",
      "Prepare SpaceLabels 1.3.0",
    ],
  ]),
};

const RELEASE_NOTE_SOURCE_LANGUAGES = {
  "1.4.0": "en",
};

function supportedLanguage(language) {
  return language === PORTUGUESE ? PORTUGUESE : "en";
}

export function formatReleaseSize(bytes, language) {
  const locale = supportedLanguage(language);
  const megabytes = bytes / 1_000_000;
  return `${new Intl.NumberFormat(locale, {
    maximumFractionDigits: 1,
    minimumFractionDigits: 1,
  }).format(megabytes)} MB`;
}

function localizedNotes(release, language) {
  if (release.notes.length === 0) {
    return {
      notes: [COPY[language].emptyNotes],
      notesLanguage: language,
    };
  }

  if (language === PORTUGUESE) {
    return {
      notes: release.notes,
      notesLanguage: RELEASE_NOTE_SOURCE_LANGUAGES[release.version] ?? PORTUGUESE,
    };
  }

  const translations = RELEASE_NOTE_TRANSLATIONS[release.version];
  const translated = translations
    ? release.notes.map((note) => translations.get(note))
    : [];

  if (translated.length === release.notes.length && translated.every(Boolean)) {
    return {
      notes: translated,
      notesLanguage: "en",
    };
  }

  return {
    notes: release.notes,
    notesLanguage: PORTUGUESE,
  };
}

export function getReleasePresentation(release, requestedLanguage) {
  const language = supportedLanguage(requestedLanguage);
  const copy = COPY[language];

  return {
    size: formatReleaseSize(release.dmgSize, language),
    compactDownloadLabel: copy.compactDownloadLabel(release.version),
    fullDownloadLabel: copy.fullDownloadLabel(release.version),
    artifactLabel: copy.artifactLabel(release.version),
    ...localizedNotes(release, language),
  };
}

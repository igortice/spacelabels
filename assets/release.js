export class ReleaseValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "ReleaseValidationError";
  }
}

const RELEASES_ORIGIN = "https://github.com";
const REPOSITORY_PATH = "/igortice/spacelabels/releases/download/";
const SEMANTIC_TAG = /^v(\d+\.\d+\.\d+)$/;
const SHA256_DIGEST = /^sha256:([a-f0-9]{64})$/;

function requireCondition(condition, message) {
  if (!condition) throw new ReleaseValidationError(message);
}

function validatedDownloadUrl(value, tag, expectedName) {
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new ReleaseValidationError("URL pública do artefato é inválida.");
  }

  const expectedPath = `${REPOSITORY_PATH}${tag}/${expectedName}`;
  requireCondition(
    url.origin === RELEASES_ORIGIN && url.pathname === expectedPath,
    "Artefato não pertence à Release pública esperada.",
  );

  return url.href;
}

function findUniqueAsset(assets, expectedName) {
  const matches = assets.filter((asset) => asset?.name === expectedName);
  requireCondition(
    matches.length === 1,
    `Release deve conter exatamente um ${expectedName}.`,
  );
  return matches[0];
}

function validatedAssetDigest(asset, label) {
  const digestMatch = String(asset.digest ?? "").match(SHA256_DIGEST);
  requireCondition(digestMatch, `${label} não possui digest SHA-256 válido.`);
  requireCondition(
    Number.isSafeInteger(asset.size) && asset.size > 0,
    `Tamanho de ${label} é inválido.`,
  );
  return digestMatch[1];
}

function releaseNotes(body) {
  if (typeof body !== "string") return [];

  return body
    .split(/\r?\n/)
    .map((line) => line.match(/^\s*[-*]\s+(.+?)\s*$/)?.[1] ?? "")
    .filter(Boolean)
    .slice(0, 8);
}

export function normalizePublicRelease(payload) {
  requireCondition(
    payload && typeof payload === "object",
    "Resposta da Release é inválida.",
  );
  requireCondition(
    payload.draft === false &&
      payload.prerelease === false &&
      typeof payload.published_at === "string" &&
      payload.published_at.length > 0,
    "Release ainda não está publicada e validada.",
  );

  const tagMatch = String(payload.tag_name ?? "").match(SEMANTIC_TAG);
  requireCondition(tagMatch, "Tag da Release não é semântica.");

  const version = tagMatch[1];
  const tag = payload.tag_name;
  const dmgName = `SpaceLabels-${version}.dmg`;
  const checksumName = `${dmgName}.sha256`;
  const assets = Array.isArray(payload.assets) ? payload.assets : [];
  const dmg = findUniqueAsset(assets, dmgName);
  const checksumAsset = findUniqueAsset(assets, checksumName);
  const dmgDigest = validatedAssetDigest(dmg, "DMG");
  validatedAssetDigest(checksumAsset, "arquivo de checksum");

  return {
    version,
    tag,
    publishedAt: payload.published_at,
    dmgName,
    dmgUrl: validatedDownloadUrl(
      dmg.browser_download_url,
      tag,
      dmgName,
    ),
    dmgSize: dmg.size,
    checksum: dmgDigest,
    checksumUrl: validatedDownloadUrl(
      checksumAsset.browser_download_url,
      tag,
      checksumName,
    ),
    notes: releaseNotes(payload.body),
  };
}

export async function loadPublicRelease({ fetchRelease, endpoints }) {
  requireCondition(
    typeof fetchRelease === "function" &&
      Array.isArray(endpoints) &&
      endpoints.length > 0,
    "Carregador da Release não foi configurado.",
  );

  let lastError;
  for (const endpoint of endpoints) {
    try {
      const response = await fetchRelease(endpoint);
      requireCondition(
        response?.ok === true && typeof response.json === "function",
        "Fonte da Release está indisponível.",
      );
      return normalizePublicRelease(await response.json());
    } catch (error) {
      lastError = error;
    }
  }

  throw new ReleaseValidationError(
    lastError instanceof Error
      ? `Nenhuma Release pública válida foi encontrada: ${lastError.message}`
      : "Nenhuma Release pública válida foi encontrada.",
  );
}

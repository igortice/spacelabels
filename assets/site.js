import { loadPublicRelease } from "./release.js";

const LATEST_RELEASE_API =
  "https://api.github.com/repos/igortice/spacelabels/releases/latest";
const RELEASE_FALLBACK = "assets/release-fallback.json";

const page = document.body;
const loadingMessage = document.querySelector("[data-release-loading]");
const unavailableMessage = document.querySelector(
  "[data-release-unavailable]",
);
const downloads = [...document.querySelectorAll("[data-download-link]")];
const checksumLink = document.querySelector("[data-checksum-link]");

function setReleaseState(state) {
  page.dataset.releaseState = state;
  loadingMessage.hidden = state !== "loading";
  unavailableMessage.hidden = state !== "unavailable";
}

function formatSize(bytes) {
  const megabytes = bytes / 1_000_000;
  return `${new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: 1,
    minimumFractionDigits: 1,
  }).format(megabytes)} MB`;
}

function releaseNotes(notes) {
  const values = notes.length > 0
    ? notes
    : ["Consulte a Release pública para ver as mudanças desta versão."];
  return values.map((note) => {
    const item = document.createElement("li");
    item.textContent = note;
    return item;
  });
}

function enableLink(link, href) {
  link.href = href;
  link.setAttribute("aria-disabled", "false");
  link.removeAttribute("tabindex");
}

function renderRelease(release) {
  const size = formatSize(release.dmgSize);

  document.querySelectorAll("[data-release-version]").forEach((element) => {
    element.textContent = release.version;
  });
  document.querySelectorAll("[data-release-size]").forEach((element) => {
    element.textContent = size;
  });

  downloads.forEach((link) => {
    enableLink(link, release.dmgUrl);
    if (link.dataset.downloadLabel === "compact") {
      link.textContent = `Baixar v${release.version} ↓`;
    }
    if (link.dataset.downloadLabel === "full") {
      link.textContent = `Baixar SpaceLabels ${release.version} ↓`;
    }
  });

  const checksum = document.querySelector("[data-release-checksum]");
  checksum.textContent = release.checksum;
  enableLink(checksumLink, release.checksumUrl);

  const notes = document.querySelector("[data-release-notes]");
  notes.replaceChildren(...releaseNotes(release.notes));

  const artifact = document.querySelector("[data-install-artifact]");
  artifact.setAttribute(
    "aria-label",
    `SpaceLabels ${release.version} para macOS 15 ou superior`,
  );

  setReleaseState("ready");
}

async function fetchRelease(url) {
  return fetch(url, {
    cache: "no-cache",
    headers: {
      Accept: "application/vnd.github+json",
    },
  });
}

async function setupRelease() {
  setReleaseState("loading");
  try {
    const release = await loadPublicRelease({
      fetchRelease,
      endpoints: [LATEST_RELEASE_API, RELEASE_FALLBACK],
    });
    renderRelease(release);
  } catch (error) {
    console.warn("Release pública indisponível.", error);
    setReleaseState("unavailable");
  }
}

function preventDisabledLink(event) {
  if (event.currentTarget.getAttribute("aria-disabled") === "true") {
    event.preventDefault();
  }
}

function setupScrollReveals() {
  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  if (reducedMotion || !("IntersectionObserver" in window)) return;

  const targets = [...document.querySelectorAll([
    ".desktop-context-copy",
    ".desktop-media",
    ".story-heading",
    ".feature-copy",
    ".feature-media",
    ".rename-copy",
    ".rename-media",
    ".preferences-copy",
    ".preferences-media",
    ".install-heading",
    ".install-steps",
    ".technical-details",
  ].join(","))];

  targets.forEach((target) => target.classList.add("reveal-target"));
  document.documentElement.classList.add("motion-ready");

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("has-entered", "is-visible");
        return;
      }

      if (entry.target.classList.contains("has-entered")) {
        entry.target.classList.remove("is-visible");
      }
    });
  }, {
    root: null,
    rootMargin: "-6% 0px -10% 0px",
    threshold: 0.12,
  });

  targets.forEach((target) => observer.observe(target));
}

[...downloads, checksumLink].forEach((link) => {
  link.addEventListener("click", preventDisabledLink);
});

setupScrollReveals();
setupRelease();

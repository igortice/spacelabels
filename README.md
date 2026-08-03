# SpaceLabels

**Name every Space on your Mac.** Recognize each context at a glance. When you
switch Spaces, SpaceLabels briefly shows the Space name and its visible apps —
without opening Mission Control.

<p>
  <a href="https://github.com/igortice/spacelabels/releases/latest">Download for macOS</a> ·
  <a href="https://igortice.github.io/spacelabels/">Optional visual guide</a> ·
  <a href="https://igortice.github.io/spacelabels/pt-BR/">Português</a> ·
  <a href="https://github.com/igortice/spacelabels/issues">Send feedback</a>
</p>

SpaceLabels is a free menu bar utility for **macOS 15 or later**. It keeps its
data on your Mac: there is no account, cloud, or telemetry.

You do not need to open the website to install or use the app. The website is
an optional visual guide for people who want to see the real screens before
downloading.

## What SpaceLabels does

- **Names the current Space.** Replace “Desktop 3” with a short name that
  describes the context you actually work in.
- **Confirms a Space switch.** A native, non-modal HUD briefly shows the active
  Space and up to four visible apps without taking focus.
- **Keeps App History by Space.** Review apps closed in a Space and reopen one
  app or all of them when you return.
- **Stays in the menu bar.** The current Space, visible apps and main actions
  are one click away inside macOS, with an optional Space name in the menu bar
  and monitor context.
- **Manages Spaces together.** Manage Desktops groups Spaces by monitor so you
  can rename them, restore default names and see the current Space.
- **Adapts to your workflow.** Preferences control HUD duration, app icons,
  Mission Control behavior, global shortcuts, the optional menu bar name and
  local History deletion.

## First use

The real app follows this flow:

1. **Menu bar menu:** the current Space, its monitor context, visible app icons,
   History, rename, Manage Desktops, Preferences and the other app actions.
2. **SpaceLabels HUD:** a short signal that appears after you change Spaces,
   names the destination and fades without interrupting your work.
3. **App History:** a local window with a Space selector, the apps that were
   closed there and actions to reopen one app or all apps.
4. **Rename Space:** a native dialog where a default name such as “Desktop 3”
   becomes a useful label for your context.
5. **Preferences:** controls for the HUD, icons, Mission Control and permanent
   deletion of local History data, plus the optional menu bar name and global
   shortcuts.

For screenshots and the Portuguese walkthrough, use the [optional visual
guide](https://igortice.github.io/spacelabels/). Nothing on that site is
required for the app to work.

## Requirements

- macOS 15 or later.

## Download and install

1. [Download the latest DMG](https://github.com/igortice/spacelabels/releases/latest)
   from the public Releases page.
2. Open the downloaded DMG.
3. Move **SpaceLabels** to **Applications**.
4. Open SpaceLabels from Finder. If macOS shows a first-launch Gatekeeper
   warning, use the Finder context menu and choose **Open**. The public bundle
   is ad hoc signed and is not notarized. If macOS still blocks the app, see
   [Apple's Gatekeeper guidance](https://support.apple.com/en-us/102445) after
   confirming the checksum, before using **Open Anyway** in System Settings.
5. Look for the SpaceLabels icon in the menu bar.

Starting with SpaceLabels 1.4.0, public releases use a branded DMG. Downloads
remain locked to the latest verified public version.

No installer account or additional service is required.

## Release and checksum

The [latest public Release](https://github.com/igortice/spacelabels/releases/latest)
is the source of truth for the current version, DMG and checksum. The current
reference release is **v1.4.1**:

- DMG: `SpaceLabels-1.4.1.dmg` (5.1 MB)
- SHA-256:
  `fa46824e020c590f1d7f5808f42cae9077376fc546d40ef08e5cf63291c606d0`
- [Download the v1.4.1 DMG](https://github.com/igortice/spacelabels/releases/download/v1.4.1/SpaceLabels-1.4.1.dmg)
- [Download the v1.4.1 checksum](https://github.com/igortice/spacelabels/releases/download/v1.4.1/SpaceLabels-1.4.1.dmg.sha256)

To verify a downloaded DMG locally:

```bash
shasum -a 256 SpaceLabels-1.4.1.dmg
```

Compare the output with the digest above or with the `.sha256` file from the
same Release. When a newer version is published, use that Release's
version-specific checksum.

### Product highlights

- App History for the current Space.
- Reopen one app or all apps from a Space's History.
- Browse the History of another Space or all Spaces.
- Remove History entries with local logical deletion.
- Privacy controls and permanent History deletion.
- Optional Space name in the menu bar and monitor context.
- Manage Desktops grouped by monitor.
- Configurable global shortcuts for showing the current Space and renaming it.

## Privacy

- Space names and App History stay on your Mac.
- SpaceLabels has no account, cloud sync, analytics or telemetry.
- History can be deleted from Preferences.

## Feedback, not a support desk

Use the public [GitHub Issues](https://github.com/igortice/spacelabels/issues)
to report a reproducible bug or suggest an improvement. Issues are the public
feedback channel; there is no dedicated support desk or SLA, and no response
time is promised.

When possible, include your macOS version, SpaceLabels version, steps to
reproduce and relevant screenshots. Do not attach private data or secrets.

## Português

O SpaceLabels dá nomes às Mesas do macOS, mostra a Mesa ativa e mantém o
Histórico local dos aplicativos de cada contexto. Ele é gratuito, funciona no
macOS 15 ou superior e não exige conta, nuvem ou telemetria.

- [Abrir o guia visual opcional em português](https://igortice.github.io/spacelabels/pt-BR/)
- [Baixar a Release pública mais recente](https://github.com/igortice/spacelabels/releases/latest)
- [Relatar um problema ou sugerir uma melhoria](https://github.com/igortice/spacelabels/issues)

Para instalar: baixe e abra o DMG, arraste o SpaceLabels para Aplicativos e,
se o macOS pedir confirmação na primeira abertura, escolha **Abrir** no Finder.
O site é apenas uma referência visual; não é necessário para usar o aplicativo.

## Sobre este repositório

Este repositório é a casa pública de distribuição do SpaceLabels: publica as
Releases, os checksums e o guia visual em GitHub Pages. O código Swift e a
suíte de testes do aplicativo permanecem no repositório privado de
desenvolvimento.

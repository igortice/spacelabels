import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const styles = await readFile(
  new URL("../assets/styles.css", import.meta.url),
  "utf8",
);

test("language selector and download CTA share compact and touch heights", () => {
  assert.match(styles, /--control-height-compact: 38px;/);
  assert.match(styles, /--control-height-touch: 44px;/);
  assert.match(
    styles,
    /\.language-switch\s*{[^}]*height: var\(--control-height-compact\);/s,
  );
  assert.match(
    styles,
    /\.site-nav \.pill-button\s*{[^}]*min-height: var\(--control-height-compact\);/s,
  );
  assert.match(
    styles,
    /@media \(max-width: 720px\)[\s\S]*?\.language-switch\s*{[^}]*height: var\(--control-height-touch\);/s,
  );
  assert.match(
    styles,
    /@media \(pointer: coarse\)[\s\S]*?\.language-switch\s*{[^}]*height: var\(--control-height-touch\);[^}]*padding-block: 0;/s,
  );
  assert.match(
    styles,
    /@media \(pointer: coarse\)[\s\S]*?\.site-nav \.pill-button\s*{[^}]*min-height: var\(--control-height-touch\);/s,
  );
});

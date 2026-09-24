import assert from "node:assert/strict";
import {
  embedSizeAttributes,
  extractLinkPreviewMeta,
  isFramingBlocked,
  normalizeWikiTarget,
  parseEmbedSize,
  parseWikiReference,
  splitTargetSuffix,
  telegramEmbedUrl,
} from "../src/helpers/link-helpers";

function test(name: string, fn: () => void): void {
  try {
    fn();
    console.log(`PASS ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    throw error;
  }
}

test("parses wiki links with alias", () => {
  const parsed = parseWikiReference("Zielseite|Titel");
  assert.equal(parsed.core, "Zielseite");
  assert.equal(parsed.display, "Titel");
  assert.equal(parsed.size, null);
});

test("parses wiki embeds with size hints", () => {
  const parsed = parseWikiReference("bild.png|320x180");
  assert.equal(parsed.core, "bild.png");
  assert.deepEqual(parsed.size, { width: 320, height: 180 });
});

test("normalizes wrapped wiki syntax", () => {
  assert.equal(normalizeWikiTarget("[[Test]]"), "Test");
  assert.equal(normalizeWikiTarget("![[Ordner/Bild.png]]"), "Ordner/Bild.png");
});

test("parses single width embed size", () => {
  assert.deepEqual(parseEmbedSize("480"), { width: 480 });
});

test("renders embed size attributes", () => {
  assert.equal(embedSizeAttributes({ width: 320, height: 200 }), ' width="320" height="200"');
});

test("splits target suffixes into path and suffix", () => {
  assert.deepEqual(splitTargetSuffix("Ordner/Datei.md#Abschnitt"), {
    path: "Ordner/Datei.md",
    suffix: "#Abschnitt",
  });
  assert.deepEqual(splitTargetSuffix("Ordner/Datei.md?query=1"), {
    path: "Ordner/Datei.md",
    suffix: "?query=1",
  });
});

test("builds embeddable Telegram post URLs", () => {
  assert.equal(telegramEmbedUrl("https://t.me/plotgifts/469", true), "https://t.me/plotgifts/469?embed=1&dark=1");
  assert.equal(telegramEmbedUrl("https://t.me/plotgifts/2398?single", false), "https://t.me/plotgifts/2398?embed=1");
  assert.equal(telegramEmbedUrl("https://t.me/s/plotgifts/12", false), "https://t.me/plotgifts/12?embed=1");
  assert.equal(telegramEmbedUrl("https://t.me/plotgifts", false), null);
  assert.equal(telegramEmbedUrl("https://example.com/plotgifts/1", false), null);
});

test("detects pages that refuse to be framed", () => {
  assert.equal(isFramingBlocked({ "X-Frame-Options": "SAMEORIGIN" }), true);
  assert.equal(isFramingBlocked({ "content-security-policy": "frame-ancestors https://web.telegram.org" }), true);
  assert.equal(isFramingBlocked({ "content-security-policy": "default-src 'self'; frame-ancestors *" }), false);
  assert.equal(isFramingBlocked({ "content-security-policy": "default-src 'self' https:" }), false);
  assert.equal(isFramingBlocked({}), false);
});

test("extracts preview metadata with absolute image URLs", () => {
  const meta = extractLinkPreviewMeta(
    '<title>Fallback</title><meta property="og:title" content="Shop &amp; Co"><meta name="description" content="Desc"><meta property="og:image" content="/cover.png">',
    "https://example.com/profile/a",
  );
  assert.deepEqual(meta, { title: "Shop & Co", description: "Desc", image: "https://example.com/cover.png" });
  assert.equal(extractLinkPreviewMeta('<meta property="og:image" content="javascript:alert(1)">', "https://example.com").image, undefined);
  assert.equal(extractLinkPreviewMeta("<title> Plain </title>", "https://example.com").title, "Plain");
});

export type ParsedWikiRef = { core: string; display: string | null; size: { width?: number; height?: number } | null };

export function splitTargetSuffix(value: string): { path: string; suffix: string } {
  const hashIndex = value.indexOf("#");
  const queryIndex = value.indexOf("?");
  let cut = -1;
  if (hashIndex >= 0 && queryIndex >= 0) cut = Math.min(hashIndex, queryIndex);
  else cut = Math.max(hashIndex, queryIndex);
  if (cut < 0) return { path: value, suffix: "" };
  return { path: value.slice(0, cut), suffix: value.slice(cut) };
}

export function parseWikiReference(value: string): ParsedWikiRef {
  const normalized = normalizeWikiTarget(value);
  const pipeIndex = normalized.indexOf("|");
  const core = (pipeIndex >= 0 ? normalized.slice(0, pipeIndex) : normalized).trim();
  const displayRaw = pipeIndex >= 0 ? normalized.slice(pipeIndex + 1).trim() : "";
  return { core, display: displayRaw || null, size: parseEmbedSize(displayRaw) };
}

export function parseEmbedSize(value: string): { width?: number; height?: number } | null {
  const raw = (value || "").trim();
  if (!raw) return null;
  const cleaned = raw.replace(/\s+/g, "");
  const pair = cleaned.match(/^(\d+)x(\d+)$/i);
  if (pair) {
    return { width: Number(pair[1]), height: Number(pair[2]) };
  }
  const single = cleaned.match(/^(\d+)$/);
  if (single) {
    return { width: Number(single[1]) };
  }
  return null;
}

export function embedSizeAttributes(size: { width?: number; height?: number } | null): string {
  if (!size) return "";
  const attrs: string[] = [];
  if (size.width && Number.isFinite(size.width)) attrs.push(` width="${Math.max(1, Math.round(size.width))}"`);
  if (size.height && Number.isFinite(size.height)) attrs.push(` height="${Math.max(1, Math.round(size.height))}"`);
  return attrs.join("");
}

export function normalizeWikiTarget(value: string): string {
  let out = value.trim();
  if (!out) return out;
  if (out.startsWith("![[") && out.endsWith("]]")) {
    out = out.slice(3, -2);
  } else if (out.startsWith("[[") && out.endsWith("]]")) {
    out = out.slice(2, -2);
  }
  return out.trim();
}

/** Reject executable navigation schemes before writing untrusted link targets. */
export function safeNavigationUrl(value: string): string {
  const normalized = value.replace(/^[\p{Cc}\s]+|[\p{Cc}\s]+$/gu, "").replace(/[\t\r\n]/g, "");
  if (/^(?:javascript|vbscript|data):/i.test(normalized)) return "#";
  return normalized;
}

export function safeWebPreviewUrl(value: string): string {
  const normalized = safeNavigationUrl(value);
  return /^https?:\/\//i.test(normalized) ? normalized : "about:blank";
}

export function telegramEmbedUrl(value: string, darkMode: boolean): string | null {
  const match = value.trim().match(/^https?:\/\/(?:www\.)?(?:t|telegram)\.me\/(?:s\/)?([A-Za-z][A-Za-z0-9_]{3,})\/(\d+)(?:[/?#].*)?$/i);
  if (!match) return null;
  return `https://t.me/${match[1]}/${match[2]}?embed=1${darkMode ? "&dark=1" : ""}`;
}

export function isFramingBlocked(headers: Record<string, string>): boolean {
  const read = (name: string) => Object.entries(headers)
    .filter(([key]) => key.toLowerCase() === name)
    .map(([, value]) => value)
    .join(",");
  if (/\b(?:deny|sameorigin|allow-from)\b/i.test(read("x-frame-options"))) return true;
  const frameAncestors = read("content-security-policy")
    .split(/[;,]/)
    .map((directive) => directive.trim())
    .filter((directive) => /^frame-ancestors\b/i.test(directive));
  return frameAncestors.some((directive) => !/(?:^|\s)\*(?:\s|$)/.test(directive.replace(/^frame-ancestors/i, " ")));
}

export type LinkPreviewMeta = {
  title?: string;
  description?: string;
  image?: string;
};

export function extractLinkPreviewMeta(html: string, pageUrl: string): LinkPreviewMeta {
  const meta: Record<string, string> = {};
  for (const tag of html.match(/<meta\b[^>]*>/gi) || []) {
    const key = tag.match(/\b(?:property|name)\s*=\s*["']([^"']+)["']/i)?.[1]?.toLowerCase();
    const content = tag.match(/\bcontent\s*=\s*["']([^"']*)["']/i)?.[1];
    if (key && content && !(key in meta)) meta[key] = decodeHtmlEntities(content).trim();
  }
  const titleTag = html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1];
  const image = meta["og:image"] || meta["twitter:image"];
  let absoluteImage: string | undefined;
  if (image) {
    try {
      const resolved = new URL(image, pageUrl);
      if (/^https?:$/.test(resolved.protocol)) absoluteImage = resolved.href;
    } catch {
      absoluteImage = undefined;
    }
  }
  return {
    title: meta["og:title"] || meta["twitter:title"] || (titleTag ? decodeHtmlEntities(titleTag).trim() : undefined) || undefined,
    description: meta["og:description"] || meta["twitter:description"] || meta["description"] || undefined,
    image: absoluteImage,
  };
}

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&quot;/g, "\"")
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&amp;/g, "&");
}

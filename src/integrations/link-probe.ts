import { requestUrl } from "obsidian";
import type { RequestUrlResponse } from "obsidian";
import type { LinkProbeResult, LinkProber } from "../export/exporter";
import { extractLinkPreviewMeta, isFramingBlocked } from "../helpers/link-helpers";

const PROBE_TIMEOUT_MS = 8000;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const IMAGE_EXTENSIONS: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};

function withTimeout<T>(promise: Promise<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = window.setTimeout(() => reject(new Error("Link probe timed out")), PROBE_TIMEOUT_MS);
    promise.then(
      (value) => {
        window.clearTimeout(timer);
        resolve(value);
      },
      (error: unknown) => {
        window.clearTimeout(timer);
        reject(error instanceof Error ? error : new Error(String(error)));
      },
    );
  });
}

function fetchUrl(url: string): Promise<RequestUrlResponse> {
  return withTimeout(requestUrl({ url, method: "GET", throw: false }));
}

function headerValue(headers: Record<string, string>, name: string): string {
  const entry = Object.entries(headers).find(([key]) => key.toLowerCase() === name);
  return entry ? entry[1] : "";
}

async function downloadImage(url: string): Promise<LinkProbeResult["image"]> {
  try {
    const response = await fetchUrl(url);
    if (response.status < 200 || response.status >= 300) return undefined;
    const mime = headerValue(response.headers, "content-type").split(";")[0].trim().toLowerCase();
    const extension = IMAGE_EXTENSIONS[mime];
    if (!extension || response.arrayBuffer.byteLength > MAX_IMAGE_BYTES) return undefined;
    return { data: response.arrayBuffer, extension };
  } catch {
    return undefined;
  }
}

export function createLinkProber(): LinkProber {
  const cache = new Map<string, Promise<LinkProbeResult | null>>();

  const probe = async (url: string): Promise<LinkProbeResult | null> => {
    if (!/^https?:\/\//i.test(url)) return null;
    try {
      const response = await fetchUrl(url);
      if (!isFramingBlocked(response.headers)) return { blocked: false };
      const contentType = headerValue(response.headers, "content-type").toLowerCase();
      if (!contentType.includes("html")) return { blocked: true };
      const meta = extractLinkPreviewMeta(response.text, url);
      return {
        blocked: true,
        title: meta.title,
        description: meta.description,
        image: meta.image ? await downloadImage(meta.image) : undefined,
      };
    } catch {
      return null;
    }
  };

  return (url: string) => {
    const cached = cache.get(url);
    if (cached) return cached;
    const pending = probe(url);
    cache.set(url, pending);
    return pending;
  };
}

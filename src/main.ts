import { Notice, Plugin, TFile } from "obsidian";
import { convertCanvasToHtml } from "./render/converter";
import { isAbsoluteFilesystemPath, requireDesktopNodeApis } from "./helpers/desktop-paths";
import { exportCanvasPackage } from "./export/exporter";
import { CanvasHtmlExporterSettingTab, DEFAULT_SETTINGS, normalizePluginSettings, PluginSettings } from "./settings";
import { normalizeThemeColor } from "./helpers/color-helpers";
import { resolveInitialCanvasFoldState } from "./integrations/canvas-folding";
import { buildStoredPluginData, readPluginData } from "./plugin-data";
import { collectCanvasColorKeys } from "./export/canvas-data";
import { createLinkProber } from "./integrations/link-probe";
import { runNotedPublish, type NotedPublishReport } from "./integrations/noted-publish";

type CanvasColorMap = Record<string, string>;
type CalloutColorMap = Record<string, string>;
type HeadingColorMap = Record<string, string>;
type InlineStyleColorMap = Record<string, string>;
const FALLBACK_HEADING_COLORS: HeadingColorMap = {
  h1: "#e63242",
  h2: "#fa8d3e",
  h3: "#f9c74f",
  h4: "#56ae6c",
  h5: "#04a5e5",
  h6: "#9c6bae",
};

export default class CanvasHtmlExporterPlugin extends Plugin {
  settings: PluginSettings = DEFAULT_SETTINGS;
  private disposed = false;
  private exportInProgress = false;
  private publishInProgress = false;
  private saveQueue: Promise<void> = Promise.resolve();

  async onload(): Promise<void> {
    this.disposed = false;
    await this.loadSettings();
    if (this.disposed) return;

    this.addRibbonIcon("file-down", "Export canvas as HTML", () => {
      void this.exportCurrentCanvas();
    });

    this.addCommand({
      id: "export-active-canvas",
      name: "Export active canvas as HTML",
      callback: () => {
        void this.exportCurrentCanvas();
      },
    });

    this.addRibbonIcon("upload-cloud", "Опубликовать на сайт", () => {
      void this.publishCurrentCanvasToNoted();
    });

    this.addCommand({
      id: "publish-to-noted",
      name: "Опубликовать на сайт",
      callback: () => {
        void this.publishCurrentCanvasToNoted();
      },
    });

    this.addSettingTab(new CanvasHtmlExporterSettingTab(this.app, this));
  }

  onunload(): void {
    this.disposed = true;
  }

  async exportCurrentCanvas(): Promise<void> {
    const result = await this.exportActiveCanvas();
    if (!result) return;
    const label = result.outputKind === "file" ? "Self-contained canvas HTML exported" : "Canvas package exported";
    new Notice(`${label}: ${result.outputPath}`, 6000);
  }

  async publishCurrentCanvasToNoted(): Promise<void> {
    if (this.disposed) return;
    const repoPath = this.settings.publishRepoPath.trim();
    if (!repoPath) {
      new Notice("Укажи папку сайта в настройках плагина.", 7000);
      return;
    }
    if (this.settings.exportFormat === "single-html") {
      new Notice("Для публикации нужен экспорт папкой, а не одним файлом.", 7000);
      return;
    }
    if (this.publishInProgress) {
      new Notice("Публикация уже идёт.", 4000);
      return;
    }
    this.publishInProgress = true;
    let progress: Notice | null = null;
    try {
      const result = await this.exportActiveCanvas();
      if (!result) return;
      progress = new Notice("Публикую на сайт…", 0);
      const report = await runNotedPublish(repoPath, this.resolveAbsoluteOutputPath(result.outputPath));
      progress.hide();
      progress = null;
      this.showPublishReport(report);
    } catch (error) {
      console.error("[canvas-html-exporter] Publish failed", error);
      const message = error instanceof Error ? error.message : "Unknown error";
      new Notice(`Публикация не удалась: ${message}`, 12000);
    } finally {
      progress?.hide();
      this.publishInProgress = false;
    }
  }

  private resolveAbsoluteOutputPath(outputPath: string): string {
    if (isAbsoluteFilesystemPath(outputPath)) return outputPath;
    const adapter = this.app.vault.adapter as { getBasePath?: () => string };
    const basePath = typeof adapter.getBasePath === "function" ? adapter.getBasePath() : "";
    if (!basePath) throw new Error("Не удалось определить путь к хранилищу Obsidian.");
    const { path } = requireDesktopNodeApis();
    return path.join(basePath, outputPath);
  }

  private showPublishReport(report: NotedPublishReport): void {
    const entry = report.published[0];
    const fragment = createFragment();
    const title = entry ? `«${entry.title}»` : "Запись";
    let text: string;
    if (report.pushed) text = `Опубликовано: ${title}. Сайт обновится примерно через минуту.`;
    else if (report.committed) text = `${title}: коммит создан, но отправить на GitHub не удалось. ${report.pushError}`;
    else text = `${title} уже на сайте — изменений нет.`;
    if (entry?.isNew) text += " Новая запись скрыта — открой к ней доступ в админке.";
    fragment.appendText(text);
    if (report.siteUrl && entry) {
      fragment.appendText(" ");
      fragment.createEl("a", {
        text: entry.isNew ? "Открыть админку" : "Открыть запись",
        href: entry.isNew ? `${report.siteUrl}/admin/` : `${report.siteUrl}/canvases/${encodeURIComponent(entry.folder)}/`,
        attr: { target: "_blank", rel: "noopener" },
      });
    }
    new Notice(fragment, 15000);
  }

  private async exportActiveCanvas(): Promise<{ outputPath: string; outputKind: "folder" | "file" } | null> {
    if (this.disposed) return null;
    if (this.exportInProgress) {
      new Notice("A canvas export is already running.", 4000);
      return null;
    }
    const file = this.getActiveCanvasFile();
    if (!file) {
      new Notice("No active canvas file found.", 4000);
      return null;
    }

    this.exportInProgress = true;
    const settings = { ...this.settings };
    try {
      const canvasColors = this.readCanvasPaletteColors();
      const calloutColors = this.readCalloutColors();
      const headingColors = this.readHeadingColors(canvasColors);
      const inlineStyleColors = this.readInlineStyleColors();
      const initialFoldState = await resolveInitialCanvasFoldState(
        this.app,
        file.path,
        settings.foldingInitialState,
      );
      const result = await exportCanvasPackage(this.app, file, {
        ...settings,
        canvasColors,
        calloutColors,
        headingColors,
        inlineStyleColors,
        foldingInitiallyEnabled: settings.foldingInitialState !== "none",
        initialFoldState: initialFoldState ?? undefined,
        probeLink: createLinkProber(),
      });
      result.options.canvasColors = this.readCanvasPaletteColors(collectCanvasColorKeys(result.data));
      const html = await convertCanvasToHtml(result.data, result.options);
      await this.writeOutput(result.outputPath, result.outputKind, html);
      return { outputPath: result.outputPath, outputKind: result.outputKind };
    } catch (error) {
      console.error("[canvas-html-exporter] Export failed", error);
      const message = error instanceof Error ? error.message : "Unknown error";
      new Notice(`Canvas export failed: ${message}`, 7000);
      return null;
    } finally {
      this.exportInProgress = false;
    }
  }

  private async writeOutput(outputPath: string, outputKind: "folder" | "file", html: string): Promise<void> {
    if (isAbsoluteFilesystemPath(outputPath)) {
      const { fs, path } = requireDesktopNodeApis();
      const targetPath = outputKind === "folder" ? path.join(outputPath, "index.html") : outputPath;
      await fs.mkdir(path.dirname(targetPath), { recursive: true });
      await fs.writeFile(targetPath, html, "utf8");
      return;
    }

    const filePath = outputKind === "folder" ? `${outputPath}/index.html` : outputPath;
    const existing = this.app.vault.getAbstractFileByPath(filePath);
    if (existing instanceof TFile) {
      await this.app.vault.modify(existing, html);
      return;
    }
    await this.app.vault.create(filePath, html);
  }

  private getActiveCanvasFile(): TFile | null {
    const file = this.app.workspace.getActiveFile();
    if (!file || file.extension !== "canvas") return null;
    return file;
  }

  private readCanvasPaletteColors(additionalColorKeys: readonly string[] = []): CanvasColorMap {
    if (typeof window === "undefined" || typeof activeDocument === "undefined" || !activeDocument.body) {
      return {};
    }

    const result: CanvasColorMap = {};
    const defaultEdgeColor = this.readDefaultCanvasEdgeColor();
    if (defaultEdgeColor) {
      result["0"] = defaultEdgeColor;
    }

    const colorMap: Record<string, string> = {
      "1": "--color-red-rgb",
      "2": "--color-orange-rgb",
      "3": "--color-yellow-rgb",
      "4": "--color-green-rgb",
      "5": "--color-cyan-rgb",
      "6": "--color-purple-rgb",
    };

    for (const [colorIndex, cssVar] of Object.entries(colorMap)) {
      const resolved = this.resolveCssVariable(cssVar);
      if (resolved) {
        result[colorIndex] = resolved;
      }
    }

    for (const colorIndex of additionalColorKeys) {
      if (result[colorIndex] || !/^\d+$/.test(colorIndex)) continue;
      const resolved = this.resolveCssVariable(`--canvas-color-${colorIndex}`);
      if (resolved) {
        result[colorIndex] = resolved;
      }
    }

    return result;
  }

  private readDefaultCanvasEdgeColor(): string {
    const styleScope = this.getThemeStyleScope();
    const svg = createSvg("svg");
    const edgeGroup = createSvg("g");
    const edgePath = createSvg("path");
    svg.classList.add("canvas-edges", "canvas-html-exporter-hidden-probe");
    edgePath.classList.add("canvas-display-path");
    edgePath.setAttribute("d", "M 0 0 L 10 10");
    edgeGroup.appendChild(edgePath);
    svg.appendChild(edgeGroup);
    styleScope.appendChild(svg);

    try {
      const sampledStroke = this.normalizeThemeColor(getComputedStyle(edgePath).stroke);
      return sampledStroke
        || this.resolveCssVariable("--canvas-color")
        || this.resolveCssVariable("--text-muted");
    } finally {
      svg.remove();
    }
  }

  private readCalloutColors(): CalloutColorMap {
    if (typeof window === "undefined" || typeof activeDocument === "undefined" || !activeDocument.body) {
      return {};
    }

    const result: CalloutColorMap = {};
    const types = [
      "note",
      "info",
      "todo",
      "abstract",
      "summary",
      "tldr",
      "tip",
      "hint",
      "important",
      "success",
      "check",
      "done",
      "warning",
      "caution",
      "attention",
      "question",
      "help",
      "faq",
      "danger",
      "error",
      "failure",
      "fail",
      "missing",
      "bug",
      "example",
      "quote",
      "cite",
      "settings",
      "award",
    ];
    const host = createDiv();
    this.applyHiddenProbeStyles(host);
    activeDocument.body.appendChild(host);

    try {
      for (const type of types) {
        const callout = createDiv({ cls: "callout" });
        callout.setAttribute("data-callout", type);
        const title = createDiv({ cls: "callout-title" });
        title.textContent = type;
        callout.appendChild(title);
        host.appendChild(callout);

        const calloutStyles = getComputedStyle(callout);
        const titleStyles = getComputedStyle(title);
        const cssVar = calloutStyles.getPropertyValue("--callout-color").trim();
        const resolved = this.normalizeThemeColor(cssVar) || this.normalizeThemeColor(titleStyles.color) || this.normalizeThemeColor(calloutStyles.borderColor);
        if (resolved) {
          result[type] = resolved;
        }

        callout.remove();
      }
    } finally {
      host.remove();
    }

    return result;
  }

  private readHeadingColors(canvasColors: CanvasColorMap = {}): HeadingColorMap {
    if (typeof window === "undefined" || typeof activeDocument === "undefined" || !activeDocument.body) {
      return this.buildHeadingFallbackColors(canvasColors);
    }

    const styleScope = this.getThemeStyleScope();
    const fallbackColors = this.buildHeadingFallbackColors(canvasColors);
    const host = createDiv();
    host.className = "markdown-rendered markdown-preview-view";
    this.applyHiddenProbeStyles(host);
    styleScope.appendChild(host);

    try {
      const sampledColors: HeadingColorMap = {};

      for (const level of ["h1", "h2", "h3", "h4", "h5", "h6"]) {
        const heading = createEl(level as keyof HTMLElementTagNameMap);
        heading.textContent = level.toUpperCase();
        host.appendChild(heading);
        const resolved = this.normalizeThemeColor(getComputedStyle(heading).color);
        if (resolved) {
          sampledColors[level] = resolved;
        }
        heading.remove();
      }

      return { ...fallbackColors, ...sampledColors };
    } finally {
      host.remove();
    }
  }

  private readInlineStyleColors(): InlineStyleColorMap {
    if (typeof window === "undefined" || typeof activeDocument === "undefined" || !activeDocument.body) {
      return {};
    }

    const styleScope = this.getThemeStyleScope();
    const host = createDiv();
    host.className = "markdown-rendered markdown-preview-view";
    this.applyHiddenProbeStyles(host);
    styleScope.appendChild(host);

    try {
      const paragraph = createEl("p");
      const strong = createEl("strong");
      strong.textContent = "Bold";
      const em = createEl("em");
      em.textContent = "Italic";
      const del = createEl("del");
      del.textContent = "Deleted";
      paragraph.append(strong, em, del);
      host.appendChild(paragraph);
      const result: InlineStyleColorMap = {};
      const textColor = this.normalizeThemeColor(getComputedStyle(paragraph).color) || this.resolveCssVariable("--text-normal");
      const probes: Array<[keyof InlineStyleColorMap, string]> = [
        ["strong", "strong"],
        ["em", "em"],
        ["del", "del"],
      ];

      for (const [key, selector] of probes) {
        const element = paragraph.querySelector(selector);
        if (!(element instanceof HTMLElement)) continue;
        const color = this.normalizeThemeColor(getComputedStyle(element).color);
        if (color && !this.sameCssColor(color, textColor)) {
          result[key] = color;
        }
      }

      return result;
    } finally {
      host.remove();
    }
  }

  private normalizeThemeColor(raw: string): string {
    const css = activeDocument.defaultView?.CSS;
    return normalizeThemeColor(
      raw,
      css ? (value) => css.supports("color", value) : undefined,
    );
  }

  private resolveCssVariable(cssVar: string): string {
    if (typeof activeDocument === "undefined" || !activeDocument.body) return "";

    const styleScope = this.getThemeStyleScope();
    const rootValue = getComputedStyle(activeDocument.documentElement).getPropertyValue(cssVar).trim();
    const bodyValue = getComputedStyle(activeDocument.body).getPropertyValue(cssVar).trim();
    const scopeValue = getComputedStyle(styleScope).getPropertyValue(cssVar).trim();
    const value = scopeValue || bodyValue || rootValue;

    if (value) {
      const rgbMatch = value.match(/^(\d+)\s*,\s*(\d+)\s*,\s*(\d+)$/);
      if (rgbMatch) {
        return `rgb(${value})`;
      }

      if (/^(rgb|#)/.test(value) || /^rgba?\(/.test(value)) {
        return value;
      }
    }

    const probe = createDiv();
    this.applyHiddenProbeStyles(probe);
    probe.addClass("canvas-html-exporter-color-probe");
    probe.setCssProps({ "--canvas-html-exporter-probe-bg": `var(${cssVar})` });

    styleScope.appendChild(probe);
    const resolved = getComputedStyle(probe).backgroundColor.trim();
    probe.remove();

    if (!resolved || resolved === "rgba(0, 0, 0, 0)" || resolved === "transparent") {
      return "";
    }

    return resolved;
  }

  private applyHiddenProbeStyles(element: HTMLElement): void {
    element.addClass("canvas-html-exporter-hidden-probe");
  }

  private buildHeadingFallbackColors(canvasColors: CanvasColorMap): HeadingColorMap {
    return {
      h1: canvasColors["1"] || FALLBACK_HEADING_COLORS.h1,
      h2: canvasColors["2"] || FALLBACK_HEADING_COLORS.h2,
      h3: canvasColors["3"] || FALLBACK_HEADING_COLORS.h3,
      h4: canvasColors["4"] || FALLBACK_HEADING_COLORS.h4,
      h5: canvasColors["5"] || FALLBACK_HEADING_COLORS.h5,
      h6: canvasColors["6"] || FALLBACK_HEADING_COLORS.h6,
    };
  }

  private sameCssColor(a: string, b: string): boolean {
    const normalize = (value: string) => String(value || "").replace(/\s+/g, "").toLowerCase();
    return normalize(a) === normalize(b);
  }

  private getThemeStyleScope(): HTMLElement {
    const appContainer = activeDocument.querySelector(".app-container");
    return appContainer instanceof HTMLElement
      ? appContainer
      : activeDocument.body;
  }

  private async loadSettings(): Promise<void> {
    const saved: unknown = await this.loadData();
    const pluginData = readPluginData(saved);
    this.settings = normalizePluginSettings(pluginData.settingsSource);
  }

  async saveSettings(): Promise<void> {
    await this.savePluginData();
  }

  private async savePluginData(): Promise<void> {
    if (this.disposed) return;
    const snapshot = buildStoredPluginData(this.settings);
    const write = this.saveQueue.catch(() => {}).then(() => this.saveData(snapshot));
    this.saveQueue = write;
    await write;
  }
}

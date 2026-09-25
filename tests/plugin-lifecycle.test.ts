import assert from "node:assert/strict";
import vm from "node:vm";
import { buildSync } from "esbuild";

const bundle = buildSync({ entryPoints: ["src/main.ts"], bundle: true, write: false, platform: "node", format: "cjs", external: ["obsidian"], loader: { ".md": "text" }, logLevel: "silent" }).outputFiles[0].text;
type RuntimePlugin = {
  onload(): Promise<void>;
  exportCurrentCanvas(): Promise<void>;
  onunload(): void;
  saveSettings(): Promise<void>;
  saveData(data: unknown): Promise<void>;
  settings: { outputDir: string };
};
function fixture(saved: unknown = {}) {
  const writes: unknown[] = [];
  const notices: string[] = [];
  const commands: string[] = [];
  const vault = { read: async () => "" };
  let activeFile: unknown = null;
  class MockPlugin {
    app = { vault, workspace: { getActiveFile: () => activeFile, onLayoutReady: (callback: () => void) => callback() } };
    async loadData() { return saved; }
    async saveData(data: unknown) { writes.push(data); }
    addRibbonIcon() {}
    addCommand(command: { id: string }) { commands.push(command.id); }
    addSettingTab() {}
  }
  const obsidian = {
    Plugin: MockPlugin, Modal: class {}, PluginSettingTab: class {}, FuzzySuggestModal: class {}, Notice: class { constructor(message: string) { notices.push(message); } }, TFile: class {}, TFolder: class {},
    Component: class { load() {} unload() {} },
    MarkdownRenderer: { render: () => Promise.resolve() },
    requestUrl: () => Promise.reject(new Error("offline")),
  };
  const context = { module: { exports: {} as { default: new () => RuntimePlugin } }, require: (name: string) => { assert.equal(name, "obsidian"); return obsidian; }, console, setTimeout, clearTimeout, TextEncoder, TextDecoder };
  vm.runInNewContext(bundle, context);
  return { plugin: new context.module.exports.default(), writes, notices, commands, vault, setActiveFile: (file: unknown) => { activeFile = file; } };
}
const flush = async () => { for (let i = 0; i < 10; i++) await Promise.resolve(); };
(async () => {
  const loaded = fixture({ schemaVersion: 1, settings: { outputDir: "preserved" }, ui: { lastShownReleaseNotesId: "release-1.3.2" } });
  await loaded.plugin.onload();
  assert.equal(loaded.plugin.settings.outputDir, "preserved");
  assert.equal(loaded.writes.length, 0, "loading never writes plugin data");
  assert.ok(loaded.commands.includes("export-active-canvas"));
  loaded.plugin.onunload();

  const exporting = fixture();
  await exporting.plugin.onload();
  exporting.setActiveFile({ path: "test.canvas", extension: "canvas", basename: "test" });
  let finishRead = (_value: string) => {};
  let reads = 0;
  exporting.vault.read = () => { reads++; return new Promise<string>((resolve) => { finishRead = resolve; }); };
  const exportTask = exporting.plugin.exportCurrentCanvas();
  await flush();
  await exporting.plugin.exportCurrentCanvas();
  assert.equal(reads, 1);
  assert.ok(exporting.notices.some((notice) => /already running|уже идёт/.test(notice)));
  finishRead("invalid JSON");
  await exportTask;
  const retry = exporting.plugin.exportCurrentCanvas();
  await flush();
  assert.equal(reads, 2, "failed export releases the concurrency guard");
  finishRead("invalid JSON");
  await retry;

  const concurrent = fixture();
  await concurrent.plugin.onload();
  const started: unknown[] = [];
  let finishFirst = () => {};
  concurrent.plugin.saveData = async (snapshot) => {
    started.push(snapshot);
    if (started.length === 1) await new Promise<void>((resolve) => { finishFirst = resolve; });
  };
  concurrent.plugin.settings.outputDir = "first";
  const first = concurrent.plugin.saveSettings();
  await flush();
  concurrent.plugin.settings.outputDir = "second";
  const second = concurrent.plugin.saveSettings();
  await flush();
  assert.equal(started.length, 1);
  assert.equal((started[0] as { settings: { outputDir: string } }).settings.outputDir, "first");
  finishFirst();
  await Promise.all([first, second]);
  assert.equal(started.length, 2);
  assert.equal((started[1] as { settings: { outputDir: string } }).settings.outputDir, "second");
  assert.equal((started[1] as { ui?: unknown }).ui, undefined, "stale UI state is not written back");
  concurrent.plugin.saveData = () => Promise.reject(new Error("disk full"));
  await assert.rejects(concurrent.plugin.saveSettings(), /disk full/);
  concurrent.plugin.saveData = async () => {};
  await concurrent.plugin.saveSettings();

  const future = fixture({ schemaVersion: 99, settings: { outputDir: "future" } });
  await assert.rejects(future.plugin.onload(), /requires a newer/);
  assert.equal(future.writes.length, 0);
  console.log("PASS lifecycle loads settings silently, guards concurrent exports, orders saves and protects future schemas");
})().catch((error) => { console.error(error); process.exitCode = 1; });

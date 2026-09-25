import assert from "node:assert/strict";
import {
  buildStoredPluginData,
  PLUGIN_DATA_SCHEMA_VERSION,
  readPluginData,
} from "../src/plugin-data";
import type { PluginSettings } from "../src/settings";

function test(name: string, fn: () => void): void {
  try {
    fn();
    console.log(`PASS ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    throw error;
  }
}

const settings: PluginSettings = {
  darkMode: false,
  outputDir: "Canvas-Exports",
  exportFormat: "package",
  foldingInitialState: "none",
  highlightingTheme: "shiki",
  showMinimap: true,
  showSearch: true,
  language: "ru",
  publishRepoPath: "",
};

test("reads legacy top-level settings without losing the migration source", () => {
  const legacy = { ...settings };
  assert.deepEqual(readPluginData(legacy), { settingsSource: legacy });
});

test("reads settings from versioned plugin data and ignores stale UI state", () => {
  assert.deepEqual(readPluginData({
    schemaVersion: 1,
    settings,
    ui: { lastShownReleaseNotesId: " folding-v1 " },
  }), { settingsSource: settings });
});

test("builds versioned plugin data", () => {
  assert.deepEqual(buildStoredPluginData(settings), {
    schemaVersion: PLUGIN_DATA_SCHEMA_VERSION,
    settings,
  });
});

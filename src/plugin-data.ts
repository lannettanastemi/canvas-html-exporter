import type { PluginSettings } from "./settings";

export const PLUGIN_DATA_SCHEMA_VERSION = 1;

export type PluginDataSnapshot = {
  settingsSource: unknown;
};

export type StoredPluginData = {
  schemaVersion: typeof PLUGIN_DATA_SCHEMA_VERSION;
  settings: PluginSettings;
};

export function readPluginData(saved: unknown): PluginDataSnapshot {
  const data = asRecord(saved);
  if (typeof data.schemaVersion === "number" && data.schemaVersion > PLUGIN_DATA_SCHEMA_VERSION) {
    throw new Error(`Plugin data schema ${data.schemaVersion} requires a newer Canvas HTML Exporter. Existing data was not changed.`);
  }
  const settingsSource = data.settings && typeof data.settings === "object"
    ? data.settings
    : saved;

  return { settingsSource };
}

export function buildStoredPluginData(settings: PluginSettings): StoredPluginData {
  return {
    schemaVersion: PLUGIN_DATA_SCHEMA_VERSION,
    settings: { ...settings },
  };
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object"
    ? value as Record<string, unknown>
    : {};
}

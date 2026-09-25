import type { ChildProcess, SpawnOptions } from "node:child_process";
import { getRuntimeRequire } from "../helpers/desktop-paths";

export type NotedPublishedRecord = {
  title: string;
  folder: string;
  isNew: boolean;
};

export type NotedPublishReport = {
  ok: boolean;
  published: NotedPublishedRecord[];
  changed: boolean;
  committed: boolean;
  pushed: boolean;
  pushError: string;
  siteUrl: string;
  error?: string;
};

type SpawnFunction = (command: string, args: string[], options: SpawnOptions) => ChildProcess;

const PUBLISH_TIMEOUT_MS = 3 * 60 * 1000;

function loadNodeModules(): { spawn: SpawnFunction; existsSync: (path: string) => boolean; join: (...parts: string[]) => string } {
  const requireFn = getRuntimeRequire();
  if (!requireFn) throw new Error("Публикация в Noted доступна только в Obsidian для компьютера.");
  const childProcess = requireFn("node:child_process") as { spawn: SpawnFunction };
  const fsModule = requireFn("node:fs") as { existsSync: (path: string) => boolean };
  const pathModule = requireFn("node:path") as { join: (...parts: string[]) => string };
  return { spawn: childProcess.spawn, existsSync: fsModule.existsSync, join: pathModule.join };
}

function isMissingExecutable(error: unknown): boolean {
  return typeof error === "object" && error !== null && (error as { code?: string }).code === "ENOENT";
}

function runScript(spawn: SpawnFunction, command: string, args: string[], cwd: string, extraEnv: Record<string, string>): Promise<NotedPublishReport> {
  return new Promise((resolve, reject) => {
    let stdout = "";
    let stderr = "";
    let settled = false;
    const child = spawn(command, args, {
      cwd,
      env: { ...process.env, ...extraEnv },
      windowsHide: true,
    });
    const finish = (callback: () => void) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      callback();
    };
    const timer = window.setTimeout(() => {
      child.kill();
      finish(() => reject(new Error("Публикация заняла больше 3 минут и была остановлена.")));
    }, PUBLISH_TIMEOUT_MS);
    child.stdout?.on("data", (chunk: Buffer | string) => { stdout += chunk.toString(); });
    child.stderr?.on("data", (chunk: Buffer | string) => { stderr += chunk.toString(); });
    child.on("error", (error: Error) => finish(() => reject(error)));
    child.on("close", (code: number | null) => {
      finish(() => {
        const line = stdout.trim().split(/\r?\n/).reverse().find((entry) => entry.trim().startsWith("{"));
        if (line) {
          try {
            const report = JSON.parse(line) as NotedPublishReport;
            if (report.ok) resolve(report);
            else reject(new Error(report.error || "Публикация не удалась."));
            return;
          } catch {
            reject(new Error("Не удалось прочитать ответ publish.js."));
            return;
          }
        }
        const details = (stderr || stdout).trim().split(/\r?\n/).slice(-3).join(" ");
        reject(new Error(details || `publish.js завершился с кодом ${String(code)}.`));
      });
    });
  });
}

export async function runNotedPublish(repoPath: string, exportDir: string): Promise<NotedPublishReport> {
  const { spawn, existsSync, join } = loadNodeModules();
  const script = join(repoPath, "scripts", "publish.js");
  if (!existsSync(script)) {
    throw new Error(`Не найден ${script}. Проверь «Папку сайта Noted» в настройках плагина.`);
  }
  const args = [script, "--yes", "--json", "--export", exportDir];
  try {
    return await runScript(spawn, "node", args, repoPath, {});
  } catch (error) {
    if (!isMissingExecutable(error)) throw error;
    return runScript(spawn, process.execPath, args, repoPath, { ELECTRON_RUN_AS_NODE: "1" });
  }
}

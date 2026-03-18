import { describe, it, expect, afterEach, beforeEach } from "bun:test";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { makeTempProject, runScript, assertExists, FRAMEWORK_DIR } from "./helpers";

let dir: string;
let cleanup: () => void;

beforeEach(() => {
  ({ dir, cleanup } = makeTempProject());
  // Start with a clean install
  runScript("install.sh", [dir]);
});

afterEach(() => {
  cleanup();
});

describe("update.sh", () => {
  it("reports up-to-date when versions match", () => {
    const { exitCode, stdout } = runScript("update.sh", [dir]);
    expect(exitCode).toBe(0);
    expect(stdout).toContain("up to date");
  });

  it("detects an outdated installation and updates commands", () => {
    // Downgrade the installed version stamp
    const versionFile = join(dir, ".claude/commands/office/.version");
    writeFileSync(versionFile, "0.0.1");

    // update.sh prompts — pipe 'Y' via stdin
    const proc = Bun.spawnSync(["bash", "update.sh", dir], {
      cwd: FRAMEWORK_DIR,
      stdin: new TextEncoder().encode("Y\n"),
      stdout: "pipe",
      stderr: "pipe",
    });
    expect(proc.exitCode).toBe(0);
    const stdout = new TextDecoder().decode(proc.stdout);
    expect(stdout).toContain("Updated to");

    // Version stamp updated
    const installed = readFileSync(versionFile, "utf8").trim();
    const source = readFileSync(join(FRAMEWORK_DIR, "VERSION"), "utf8").trim();
    expect(installed).toBe(source);
  });

  it("preserves existing .ai-office/ structure after update", () => {
    writeFileSync(join(dir, ".claude/commands/office/.version"), "0.0.1");

    Bun.spawnSync(["bash", "update.sh", dir], {
      cwd: FRAMEWORK_DIR,
      stdin: new TextEncoder().encode("Y\n"),
      stdout: "pipe",
      stderr: "pipe",
    });

    assertExists(join(dir, ".ai-office/tasks/BACKLOG"), "BACKLOG");
    assertExists(join(dir, ".ai-office/tasks/DONE"), "DONE");
  });
});

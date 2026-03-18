import { describe, it, expect, afterEach, beforeEach } from "bun:test";
import { readFileSync } from "fs";
import { join } from "path";
import { makeTempProject, runScript, assertExists } from "./helpers";

let dir: string;
let cleanup: () => void;

beforeEach(() => {
  ({ dir, cleanup } = makeTempProject());
  runScript("install.sh", [dir]);
});

afterEach(() => {
  cleanup();
});

describe("setup.sh", () => {
  it("exits 0 in non-interactive mode", () => {
    const { exitCode } = runScript("setup.sh", [
      dir,
      "--non-interactive",
      "--agency=software-studio",
      "--name=test-project",
    ]);
    expect(exitCode).toBe(0);
  });

  it("creates project.config.md with all required frontmatter fields", () => {
    runScript("setup.sh", [
      dir,
      "--non-interactive",
      "--agency=software-studio",
      "--name=test-project",
    ]);
    const config = join(dir, ".ai-office/project.config.md");
    assertExists(config);
    const content = readFileSync(config, "utf8");
    expect(content).toContain("agency: software-studio");
    expect(content).toContain("project_name: test-project");
    expect(content).toContain("typecheck_cmd:");
    expect(content).toContain("lint_cmd:");
    expect(content).toContain("test_cmd:");
    expect(content).toContain("coverage_min:");
    expect(content).toContain("lighthouse_min:");
    expect(content).toContain("advance_mode:");
  });

  it("defaults advance_mode to manual", () => {
    runScript("setup.sh", [
      dir,
      "--non-interactive",
      "--agency=software-studio",
      "--name=test-project",
    ]);
    const content = readFileSync(join(dir, ".ai-office/project.config.md"), "utf8");
    expect(content).toContain("advance_mode: manual");
  });

  it("respects --advance-mode=auto", () => {
    runScript("setup.sh", [
      dir,
      "--non-interactive",
      "--agency=software-studio",
      "--name=test-project",
      "--advance-mode=auto",
    ]);
    const content = readFileSync(join(dir, ".ai-office/project.config.md"), "utf8");
    expect(content).toContain("advance_mode: auto");
  });

  it("creates agency.json with the selected agency name", () => {
    runScript("setup.sh", [
      dir,
      "--non-interactive",
      "--agency=lean-startup",
      "--name=my-mvp",
    ]);
    const agencyJson = join(dir, ".ai-office/agency.json");
    assertExists(agencyJson);
    const data = JSON.parse(readFileSync(agencyJson, "utf8"));
    expect(data.name).toBe("lean-startup");
    expect(typeof data.selectedAt).toBe("string");
  });

  it("copies all 5 bundled agency templates", () => {
    runScript("setup.sh", [
      dir,
      "--non-interactive",
      "--agency=software-studio",
      "--name=test-project",
    ]);
    const agencies = [
      "software-studio",
      "lean-startup",
      "game-studio",
      "creative-agency",
      "penetration-test-agency",
    ];
    for (const agency of agencies) {
      assertExists(join(dir, `.ai-office/agencies/${agency}`), agency);
      assertExists(join(dir, `.ai-office/agencies/${agency}/config.md`), `${agency}/config.md`);
    }
  });

  it("applies --stack=node-react preset commands", () => {
    runScript("setup.sh", [
      dir,
      "--non-interactive",
      "--agency=software-studio",
      "--name=test-project",
      "--stack=node-react",
    ]);
    const content = readFileSync(join(dir, ".ai-office/project.config.md"), "utf8");
    expect(content).toContain("vitest");
    expect(content).toContain("npm run lint");
  });

  it("does not overwrite an existing project.config.md", () => {
    runScript("setup.sh", [
      dir,
      "--non-interactive",
      "--agency=software-studio",
      "--name=test-project",
    ]);
    const configPath = join(dir, ".ai-office/project.config.md");
    const original = readFileSync(configPath, "utf8");
    const { stdout } = runScript("setup.sh", [
      dir,
      "--non-interactive",
      "--agency=lean-startup",
      "--name=other",
    ]);
    expect(stdout).toContain("already exists");
    expect(readFileSync(configPath, "utf8")).toBe(original);
  });

  it("exits with error if .ai-office/ does not exist", () => {
    const { dir: emptyDir, cleanup: c } = makeTempProject();
    const { exitCode, stdout } = runScript("setup.sh", [
      emptyDir,
      "--non-interactive",
      "--agency=software-studio",
      "--name=x",
    ]);
    expect(exitCode).not.toBe(0);
    expect(stdout).toContain("install.sh");
    c();
  });
});

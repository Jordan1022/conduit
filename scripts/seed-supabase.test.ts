import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";

const tsxBin = resolve("node_modules/.bin/tsx");
const seedScript = resolve("scripts/seed-supabase.ts");

describe("seed-supabase script", () => {
  it("prints dry-run counts without writing rows", () => {
    const output = execFileSync(
      tsxBin,
      [seedScript, "--dry-run"],
      {
        cwd: process.cwd(),
        env: {
          ...process.env,
          SUPABASE_URL: "https://example.supabase.co",
          SUPABASE_SERVICE_ROLE_KEY: "test-service-role-key",
        },
        encoding: "utf8",
      },
    );

    expect(output).toContain("Dry run only. No rows were written.");
    expect(output).toContain("members");
    expect(output).toContain("14");
    expect(output).toContain("opportunities");
    expect(output).toContain("8");
  });

  it("allows dry-run without a service role key", () => {
    const output = execFileSync(tsxBin, [seedScript, "--dry-run"], {
      cwd: process.cwd(),
      env: {
        ...process.env,
        SUPABASE_URL: "https://example.supabase.co",
        SUPABASE_SERVICE_ROLE_KEY: "",
      },
      encoding: "utf8",
    });

    expect(output).toContain("Dry run only. No rows were written.");
  });

  it("fails before writing when the service role key is missing", () => {
    expect(() =>
      execFileSync(tsxBin, [seedScript], {
        cwd: process.cwd(),
        env: {
          ...process.env,
          SUPABASE_URL: "https://example.supabase.co",
          SUPABASE_SERVICE_ROLE_KEY: "",
        },
        encoding: "utf8",
        stdio: "pipe",
      }),
    ).toThrow(/Missing SUPABASE_SERVICE_ROLE_KEY/);
  });

  it("loads Supabase credentials from a Next-style .env.local file", () => {
    const tempProject = mkdtempSync(join(tmpdir(), "conduit-seed-env-"));

    try {
      writeFileSync(
        join(tempProject, ".env.local"),
        [
          "NEXT_PUBLIC_SUPABASE_URL=https://example.supabase.co",
          "SUPABASE_SERVICE_ROLE_KEY=test-service-role-key",
        ].join("\n"),
      );

      const output = execFileSync(tsxBin, [seedScript, "--dry-run"], {
        cwd: tempProject,
        env: {
          PATH: process.env.PATH,
          HOME: process.env.HOME,
        },
        encoding: "utf8",
      });

      expect(output).toContain("Dry run only. No rows were written.");
      expect(output).toContain("members");
    } finally {
      rmSync(tempProject, { recursive: true, force: true });
    }
  });
});

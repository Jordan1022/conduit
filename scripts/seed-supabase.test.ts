import { execFileSync } from "node:child_process";
import { describe, expect, it } from "vitest";

describe("seed-supabase script", () => {
  it("prints dry-run counts without writing rows", () => {
    const output = execFileSync(
      "npx",
      ["tsx", "scripts/seed-supabase.ts", "--dry-run"],
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

  it("fails before writing when the service role key is missing", () => {
    expect(() =>
      execFileSync("npx", ["tsx", "scripts/seed-supabase.ts", "--dry-run"], {
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
});

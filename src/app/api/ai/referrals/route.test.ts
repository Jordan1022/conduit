import { describe, expect, it } from "vitest";
import { POST } from "./route";

describe("POST /api/ai/referrals", () => {
  it("returns ranked matches and an intro draft for a valid opportunity", async () => {
    const response = await POST(
      new Request("http://localhost/api/ai/referrals", {
        method: "POST",
        body: JSON.stringify({
          opportunityId: "opp-fractional-cfo",
        }),
      }),
    );

    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.matches[0].name).toBe("Lena Ortiz");
    expect(payload.introDraft).toContain("double opt-in");
    expect(payload.timeline[0].label).toBe("Drafted");
  });
});

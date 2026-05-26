import { describe, expect, it } from "vitest";
import { seedData } from "./seed";
import { rankReferralMatches } from "./referrals";

describe("rankReferralMatches", () => {
  it("ranks members with matching expertise, trust context, and referral history highest", () => {
    const matches = rankReferralMatches(seedData.opportunities[0], seedData.members, seedData.referrals);

    expect(matches[0]?.member.name).toBe("Lena Ortiz");
    expect(matches[0]?.confidence).toBeGreaterThanOrEqual(90);
    expect(matches[0]?.reasons).toContain("Fractional finance expertise matches the request");
    expect(matches[0]?.risk).toBe("Low risk: prior accepted referral and direct operator overlap.");
  });

  it("does not recommend the requesting member as their own match", () => {
    const matches = rankReferralMatches(seedData.opportunities[0], seedData.members, seedData.referrals);

    expect(matches.some((match) => match.member.id === seedData.opportunities[0].requesterId)).toBe(false);
  });
});

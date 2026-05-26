import { describe, expect, it } from "vitest";
import { seedData } from "./seed";

describe("seedData", () => {
  it("contains enough mock data for a credible referral network demo", () => {
    expect(seedData.members).toHaveLength(14);
    expect(seedData.opportunities.length).toBeGreaterThanOrEqual(8);
    expect(seedData.referrals.length).toBeGreaterThanOrEqual(12);
    expect(seedData.activity.length).toBeGreaterThanOrEqual(10);
  });

  it("keeps opportunity and referral references internally consistent", () => {
    const memberIds = new Set(seedData.members.map((member) => member.id));
    const opportunityIds = new Set(seedData.opportunities.map((opportunity) => opportunity.id));

    for (const opportunity of seedData.opportunities) {
      expect(memberIds.has(opportunity.requesterId), opportunity.id).toBe(true);
    }

    for (const referral of seedData.referrals) {
      expect(opportunityIds.has(referral.opportunityId), referral.id).toBe(true);
      expect(memberIds.has(referral.fromMemberId), referral.id).toBe(true);
      expect(memberIds.has(referral.toMemberId), referral.id).toBe(true);
    }
  });
});

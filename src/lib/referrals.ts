import type { Member, Opportunity, Referral, ReferralMatch } from "./types";

const availabilityBoost = {
  Open: 8,
  Selective: 5,
  Limited: 1,
} satisfies Record<Member["availability"], number>;

export function rankReferralMatches(
  opportunity: Opportunity,
  members: Member[],
  referrals: Referral[],
): ReferralMatch[] {
  return members
    .filter((member) => member.id !== opportunity.requesterId)
    .map((member) => {
      const matchingExpertise = member.expertise.filter((skill) =>
        opportunity.keywords.some((keyword) => normalizedOverlap(skill, keyword)),
      );
      const acceptedReferral = referrals.some(
        (referral) => referral.toMemberId === member.id && referral.status === "accepted",
      );
      const operatorOverlap = member.trustSignals.some((signal) =>
        signal.toLowerCase().includes("operator overlap"),
      );
      const score =
        matchingExpertise.length * 19 +
        member.relationshipStrength * 0.34 +
        availabilityBoost[member.availability] +
        (acceptedReferral ? 12 : 0) +
        (operatorOverlap ? 8 : 0);

      return {
        member,
        confidence: Math.min(98, Math.round(score)),
        reasons: buildReasons(opportunity, member, matchingExpertise, acceptedReferral),
        sharedContext: buildSharedContext(member),
        risk: buildRisk(member, acceptedReferral, operatorOverlap),
      };
    })
    .sort((a, b) => b.confidence - a.confidence);
}

export function createIntroDraft(opportunity: Opportunity, match: ReferralMatch): string {
  return `Maya, here is a double opt-in draft for ${match.member.name}: ${match.member.name}, I am checking whether you would be open to an introduction to a trusted operator in the network who needs help with ${opportunity.title.toLowerCase()}. The request is ${opportunity.urgency.toLowerCase()}, and the strongest fit is your work across ${match.member.expertise.slice(0, 3).join(", ")}. If useful, I can send a concise company brief before making the introduction.`;
}

function normalizedOverlap(left: string, right: string): boolean {
  const a = left.toLowerCase();
  const b = right.toLowerCase();
  return a.includes(b) || b.includes(a) || tokenOverlap(a, b);
}

function tokenOverlap(left: string, right: string): boolean {
  const leftTokens = left.split(/[^a-z0-9]+/).filter((token) => token.length > 2);
  const rightTokens = new Set(right.split(/[^a-z0-9]+/).filter((token) => token.length > 2));
  return leftTokens.some((token) => rightTokens.has(token));
}

function buildReasons(
  opportunity: Opportunity,
  member: Member,
  matchingExpertise: string[],
  acceptedReferral: boolean,
): string[] {
  const reasons: string[] = [];

  if (matchingExpertise.some((skill) => skill.includes("fractional finance"))) {
    reasons.push("Fractional finance expertise matches the request");
  } else if (matchingExpertise.length > 0) {
    reasons.push(`${matchingExpertise[0]} matches the request`);
  }

  if (opportunity.urgency === "This week" && member.availability !== "Limited") {
    reasons.push(`${member.availability} availability fits the urgency`);
  }

  if (acceptedReferral) {
    reasons.push("Prior accepted referral reduces introduction risk");
  }

  if (member.trustSignals.length > 0) {
    reasons.push(member.trustSignals[0]);
  }

  return reasons.slice(0, 4);
}

function buildSharedContext(member: Member): string {
  return `${member.company} shares ${member.trustSignals.slice(0, 2).join(" and ")} with the network.`;
}

function buildRisk(member: Member, acceptedReferral: boolean, operatorOverlap: boolean): string {
  if (acceptedReferral && operatorOverlap) {
    return "Low risk: prior accepted referral and direct operator overlap.";
  }

  if (member.availability === "Limited") {
    return "Medium risk: strong fit, but availability is limited.";
  }

  return "Low-medium risk: useful fit with lighter verified history.";
}

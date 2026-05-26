import { NextResponse } from "next/server";
import { createIntroDraft, rankReferralMatches } from "@/lib/referrals";
import { seedData } from "@/lib/seed";
import type { Opportunity, ReferralMatch } from "@/lib/types";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const opportunity = resolveOpportunity(body);

  if (!opportunity) {
    return NextResponse.json({ error: "Missing opportunityId or opportunity payload." }, { status: 400 });
  }

  const matches = rankReferralMatches(opportunity, seedData.members, seedData.referrals).slice(0, 3);
  const introDraft = await createAiIntroDraft(opportunity, matches);

  return NextResponse.json({
    opportunity,
    matches: matches.map((match) => ({
      id: match.member.id,
      name: match.member.name,
      role: match.member.role,
      company: match.member.company,
      confidence: match.confidence,
      reasons: match.reasons,
      sharedContext: match.sharedContext,
      risk: match.risk,
    })),
    introDraft,
    timeline: seedData.activity,
  });
}

function resolveOpportunity(body: unknown): Opportunity | undefined {
  if (!body || typeof body !== "object") {
    return undefined;
  }

  if ("opportunityId" in body && typeof body.opportunityId === "string") {
    return seedData.opportunities.find((opportunity) => opportunity.id === body.opportunityId);
  }

  if ("opportunity" in body && body.opportunity && typeof body.opportunity === "object") {
    return body.opportunity as Opportunity;
  }

  return undefined;
}

async function createAiIntroDraft(opportunity: Opportunity, matches: ReferralMatch[]): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  const topMatch = matches[0];

  if (!apiKey || !topMatch) {
    return topMatch ? createIntroDraft(opportunity, topMatch) : "";
  }

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL ?? "gpt-5-mini",
        instructions:
          "Draft concise, high-trust double opt-in referral intros. Use only the supplied people and opportunity details. Do not invent facts.",
        input: JSON.stringify({
          opportunity,
          match: topMatch,
        }),
      }),
    });

    if (!response.ok) {
      return createIntroDraft(opportunity, topMatch);
    }

    const payload = await response.json();
    return payload.output_text || createIntroDraft(opportunity, topMatch);
  } catch {
    return createIntroDraft(opportunity, topMatch);
  }
}

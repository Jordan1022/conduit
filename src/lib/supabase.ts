import { createClient } from "@supabase/supabase-js";
import { seedData } from "./seed";
import type { DemoData } from "./types";

export async function getDemoData(): Promise<DemoData> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    return seedData;
  }

  const supabase = createClient(url, key);
  const [members, opportunities, referrals, activity] = await Promise.all([
    supabase.from("members").select("*"),
    supabase.from("opportunities").select("*"),
    supabase.from("referrals").select("*"),
    supabase.from("activity").select("*").order("sort_order", { ascending: true }),
  ]);

  if (members.error || opportunities.error || referrals.error || activity.error) {
    return seedData;
  }

  return {
    members: members.data.map((member) => ({
      id: member.id,
      name: member.name,
      role: member.role,
      company: member.company,
      location: member.location,
      expertise: member.expertise,
      trustSignals: member.trust_signals,
      availability: member.availability,
      relationshipStrength: member.relationship_strength,
    })),
    opportunities: opportunities.data.map((opportunity) => ({
      id: opportunity.id,
      requesterId: opportunity.requester_id,
      title: opportunity.title,
      description: opportunity.description,
      category: opportunity.category,
      urgency: opportunity.urgency,
      keywords: opportunity.keywords,
    })),
    referrals: referrals.data.map((referral) => ({
      id: referral.id,
      opportunityId: referral.opportunity_id,
      fromMemberId: referral.from_member_id,
      toMemberId: referral.to_member_id,
      status: referral.status,
      note: referral.note,
    })),
    activity: activity.data.map((entry) => ({
      id: entry.id,
      label: entry.label,
      detail: entry.detail,
      timestamp: entry.timestamp,
    })),
  };
}

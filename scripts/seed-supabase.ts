import { createClient } from "@supabase/supabase-js";
import { loadEnvConfig } from "@next/env";
import { seedData } from "../src/lib/seed";

loadEnvConfig(process.cwd());

const dryRun = process.argv.includes("--dry-run");
const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error("Missing SUPABASE_URL. You can also reuse NEXT_PUBLIC_SUPABASE_URL.");
}

const resolvedSupabaseUrl = supabaseUrl;

const members = seedData.members.map((member) => ({
  id: member.id,
  name: member.name,
  role: member.role,
  company: member.company,
  location: member.location,
  expertise: member.expertise,
  trust_signals: member.trustSignals,
  availability: member.availability,
  relationship_strength: member.relationshipStrength,
}));

const opportunities = seedData.opportunities.map((opportunity) => ({
  id: opportunity.id,
  requester_id: opportunity.requesterId,
  title: opportunity.title,
  description: opportunity.description,
  category: opportunity.category,
  urgency: opportunity.urgency,
  keywords: opportunity.keywords,
}));

const referrals = seedData.referrals.map((referral) => ({
  id: referral.id,
  opportunity_id: referral.opportunityId,
  from_member_id: referral.fromMemberId,
  to_member_id: referral.toMemberId,
  status: referral.status,
  note: referral.note,
}));

const activity = seedData.activity.map((entry, index) => ({
  id: entry.id,
  label: entry.label,
  detail: entry.detail,
  timestamp: entry.timestamp,
  sort_order: index + 1,
}));

async function main() {
  console.log("Conduit Supabase seed");
  console.table([
    { table: "members", rows: members.length },
    { table: "opportunities", rows: opportunities.length },
    { table: "referrals", rows: referrals.length },
    { table: "activity", rows: activity.length },
  ]);

  if (dryRun) {
    console.log("Dry run only. No rows were written.");
    return;
  }

  if (!serviceRoleKey) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY. Do not expose this key in NEXT_PUBLIC_* env vars.");
  }

  const resolvedServiceRoleKey = serviceRoleKey;

  const supabase = createClient(resolvedSupabaseUrl, resolvedServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  async function upsertTable(table: string, rows: object[]) {
    const { error } = await supabase.from(table).upsert(rows, { onConflict: "id" });

    if (error) {
      throw new Error(formatSeedError(table, error.message));
    }

    console.log(`Seeded ${rows.length} ${table} rows.`);
  }

  await upsertTable("members", members);
  await upsertTable("opportunities", opportunities);
  await upsertTable("referrals", referrals);
  await upsertTable("activity", activity);

  console.log("Seed complete.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

function formatSeedError(table: string, message: string) {
  if (message.includes("Could not find the table")) {
    return [
      `Failed to seed ${table}: ${message}`,
      "",
      "The Supabase tables do not exist yet, or your env vars point at a different Supabase project.",
      "Run supabase/schema.sql in the Supabase SQL Editor first, then rerun npm run seed:supabase.",
    ].join("\n");
  }

  return `Failed to seed ${table}: ${message}`;
}

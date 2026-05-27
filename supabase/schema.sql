create table if not exists public.members (
  id text primary key,
  name text not null,
  role text not null,
  company text not null,
  location text not null,
  expertise text[] not null default '{}',
  trust_signals text[] not null default '{}',
  availability text not null check (availability in ('Open', 'Selective', 'Limited')),
  relationship_strength integer not null check (relationship_strength between 0 and 100)
);

create table if not exists public.opportunities (
  id text primary key,
  requester_id text not null references public.members(id),
  title text not null,
  description text not null,
  category text not null,
  urgency text not null check (urgency in ('This week', 'This month', 'Exploratory')),
  keywords text[] not null default '{}'
);

create table if not exists public.referrals (
  id text primary key,
  opportunity_id text not null references public.opportunities(id),
  from_member_id text not null references public.members(id),
  to_member_id text not null references public.members(id),
  status text not null check (status in ('drafted', 'sent', 'accepted', 'declined', 'closed')),
  note text not null
);

create table if not exists public.activity (
  id text primary key,
  label text not null,
  detail text not null,
  timestamp text not null,
  sort_order integer not null
);

alter table public.members enable row level security;
alter table public.opportunities enable row level security;
alter table public.referrals enable row level security;
alter table public.activity enable row level security;

grant select on public.members to anon;
grant select on public.opportunities to anon;
grant select on public.referrals to anon;
grant select on public.activity to anon;

grant all on public.members to service_role;
grant all on public.opportunities to service_role;
grant all on public.referrals to service_role;
grant all on public.activity to service_role;

create policy "demo read members" on public.members for select to anon using (true);
create policy "demo read opportunities" on public.opportunities for select to anon using (true);
create policy "demo read referrals" on public.referrals for select to anon using (true);
create policy "demo read activity" on public.activity for select to anon using (true);

insert into public.members (id, name, role, company, location, expertise, trust_signals, availability, relationship_strength)
values
  ('member-maya', 'Maya Chen', 'Founder', 'Northstar Labs', 'Austin', array['B2B SaaS', 'operator network', 'product strategy'], array['Founding member circle', '3 accepted referrals', 'direct operator overlap'], 'Open', 88),
  ('member-lena', 'Lena Ortiz', 'Fractional CFO', 'Atlas Finance Partners', 'Dallas', array['fractional finance', 'Series A readiness', 'SaaS metrics', 'board reporting'], array['prior accepted referral', 'direct operator overlap', 'worked with two members'], 'Selective', 94),
  ('member-darius', 'Darius Patel', 'Managing Partner', 'Kinetic Growth', 'Chicago', array['go-to-market', 'RevOps', 'pricing', 'CRM systems'], array['closed 2 network deals', 'agency partner overlap'], 'Open', 81),
  ('member-evelyn', 'Evelyn Brooks', 'Principal', 'Summit Talent', 'Nashville', array['executive search', 'finance leaders', 'private equity operators'], array['vetted service provider', 'member sponsor verified'], 'Limited', 76),
  ('member-noah', 'Noah Kim', 'Partner', 'Harbor Legal', 'Denver', array['M&A counsel', 'SaaS contracts', 'data privacy'], array['trusted by founding circle', 'rapid response history'], 'Selective', 73),
  ('member-sophia', 'Sophia Ramirez', 'COO', 'Meridian Health Ventures', 'Phoenix', array['clinic expansion', 'payer strategy', 'healthcare operations', 'provider networks'], array['opened 4 regional markets', 'member-backed operator'], 'Open', 86),
  ('member-jonathan', 'Jonathan Reed', 'CEO', 'Forge Industrial', 'Pittsburgh', array['industrial automation', 'manufacturing', 'channel partnerships', 'field service'], array['closed channel referral', 'operator peer verified'], 'Selective', 79),
  ('member-amara', 'Amara Singh', 'Partner', 'Northline Capital', 'New York', array['private equity', 'acquisition search', 'debt financing', 'operator diligence'], array['co-invested with two members', 'warm lender network'], 'Limited', 84),
  ('member-caleb', 'Caleb Wright', 'CTO', 'SignalWorks', 'Seattle', array['AI infrastructure', 'security reviews', 'data platforms', 'vendor diligence'], array['technical diligence lead', 'rapid response history'], 'Open', 82),
  ('member-priya', 'Priya Shah', 'Founder', 'Ledgerly', 'San Francisco', array['embedded payments', 'fintech compliance', 'bank partnerships', 'risk operations'], array['regulated-market founder', 'referred by finance circle'], 'Selective', 78),
  ('member-marcus', 'Marcus Ellis', 'Principal', 'CivicGrid', 'Atlanta', array['municipal procurement', 'govtech', 'grant programs', 'public-sector sales'], array['city CIO network', 'two accepted civic introductions'], 'Open', 80),
  ('member-talia', 'Talia Morrison', 'Head of People', 'Orbit Labs', 'Boston', array['executive coaching', 'compensation design', 'remote teams', 'leadership onboarding'], array['trusted talent advisor', 'founder coach verified'], 'Selective', 71),
  ('member-henry', 'Henry Locke', 'Advisor', 'Craft Retail Group', 'Minneapolis', array['ecommerce', 'inventory planning', 'marketplaces', 'retail operations'], array['operator turnaround history', 'marketplace partner network'], 'Open', 69),
  ('member-isabel', 'Isabel Grant', 'Managing Director', 'Blue Oak Philanthropy', 'Charlotte', array['nonprofit strategy', 'donor networks', 'family offices', 'board governance'], array['family office connector', 'board placement history'], 'Limited', 74)
on conflict (id) do nothing;

insert into public.opportunities (id, requester_id, title, description, category, urgency, keywords)
values
  ('opp-fractional-cfo', 'member-maya', 'Fractional CFO for a Series A SaaS company', 'Northstar Labs needs a finance operator who can clean up SaaS metrics, build a board package, and prepare for a Series A process.', 'Finance', 'This week', array['fractional finance', 'Series A', 'SaaS metrics', 'board reporting']),
  ('opp-revops', 'member-maya', 'RevOps audit before enterprise pipeline push', 'A member company needs help rationalizing HubSpot stages, attribution, and pricing packages before hiring sales leadership.', 'Growth', 'This month', array['RevOps', 'pricing', 'CRM systems', 'go-to-market']),
  ('opp-clinic-expansion', 'member-sophia', 'Regional clinic expansion operator', 'A healthcare group is evaluating two new markets and needs a trusted operator who understands payer strategy and provider networks.', 'Healthcare', 'This month', array['clinic expansion', 'payer strategy', 'provider networks', 'healthcare operations']),
  ('opp-ai-security-review', 'member-noah', 'AI vendor security review', 'A legal client needs a technical reviewer for AI infrastructure, data handling, and vendor diligence before procurement approval.', 'Technology', 'This week', array['AI infrastructure', 'security reviews', 'data platforms', 'vendor diligence']),
  ('opp-acquisition-search', 'member-jonathan', 'Acquisition target screen for industrial services', 'Forge Industrial is screening industrial services targets and wants a capital partner familiar with operator diligence and debt financing.', 'Capital', 'Exploratory', array['acquisition search', 'debt financing', 'operator diligence', 'private equity']),
  ('opp-payments-partner', 'member-henry', 'Embedded payments partner for marketplace launch', 'A retail marketplace needs advice on embedded payments, risk operations, and bank partnership options before launch.', 'Fintech', 'This month', array['embedded payments', 'bank partnerships', 'risk operations', 'fintech compliance']),
  ('opp-vp-sales-search', 'member-darius', 'VP Sales search for vertical SaaS', 'A bootstrapped vertical SaaS company needs an executive search partner who can calibrate sales leadership and compensation.', 'Talent', 'This week', array['executive search', 'compensation design', 'leadership onboarding', 'finance leaders']),
  ('opp-municipal-procurement', 'member-marcus', 'Municipal procurement path for infrastructure software', 'A govtech founder needs introductions to city operators who understand procurement, grants, and public-sector sales cycles.', 'Public sector', 'This month', array['municipal procurement', 'grant programs', 'public-sector sales', 'govtech'])
on conflict (id) do nothing;

insert into public.referrals (id, opportunity_id, from_member_id, to_member_id, status, note)
values
  ('ref-001', 'opp-fractional-cfo', 'member-maya', 'member-lena', 'accepted', 'Lena previously helped a network member build a board-ready finance model.'),
  ('ref-002', 'opp-revops', 'member-maya', 'member-darius', 'sent', 'Darius is reviewing the GTM systems brief.'),
  ('ref-003', 'opp-clinic-expansion', 'member-sophia', 'member-marcus', 'drafted', 'Marcus may know two city health leaders evaluating outpatient access grants.'),
  ('ref-004', 'opp-ai-security-review', 'member-noah', 'member-caleb', 'accepted', 'Caleb accepted a technical diligence call this week.'),
  ('ref-005', 'opp-acquisition-search', 'member-jonathan', 'member-amara', 'sent', 'Amara asked for target criteria and EBITDA range.'),
  ('ref-006', 'opp-payments-partner', 'member-henry', 'member-priya', 'accepted', 'Priya offered to review payment risk assumptions before partner outreach.'),
  ('ref-007', 'opp-vp-sales-search', 'member-darius', 'member-evelyn', 'drafted', 'Evelyn is a strong match if timing works despite limited availability.'),
  ('ref-008', 'opp-vp-sales-search', 'member-darius', 'member-talia', 'sent', 'Talia can help calibrate compensation and onboarding requirements.'),
  ('ref-009', 'opp-municipal-procurement', 'member-marcus', 'member-sophia', 'accepted', 'Sophia has provider-network context relevant to municipal health programs.'),
  ('ref-010', 'opp-payments-partner', 'member-henry', 'member-noah', 'closed', 'Noah shared data privacy constraints for payment partner diligence.'),
  ('ref-011', 'opp-acquisition-search', 'member-jonathan', 'member-lena', 'declined', 'Lena declined because the target screen is too early for finance-model work.'),
  ('ref-012', 'opp-clinic-expansion', 'member-sophia', 'member-isabel', 'sent', 'Isabel may know family office funders interested in regional care access.'),
  ('ref-013', 'opp-ai-security-review', 'member-noah', 'member-priya', 'drafted', 'Priya can pressure-test regulated-data risk from the fintech side.')
on conflict (id) do nothing;

insert into public.activity (id, label, detail, timestamp, sort_order)
values
  ('act-001', 'Drafted', 'AI prepared a double opt-in note for Lena Ortiz.', '9:12 AM', 1),
  ('act-002', 'Sent', 'Maya sent the intro request with context and urgency.', '9:18 AM', 2),
  ('act-003', 'Accepted', 'Lena accepted and asked for the company brief.', '10:04 AM', 3),
  ('act-004', 'Closed', 'Awaiting outcome after first finance working session.', 'Pending', 4),
  ('act-005', 'Screened', 'Conduit screened 14 members against 8 open asks.', 'Yesterday', 5),
  ('act-006', 'Accepted', 'Caleb accepted the AI vendor diligence intro.', 'Yesterday', 6),
  ('act-007', 'Sent', 'Amara received the industrial acquisition brief.', 'Mon', 7),
  ('act-008', 'Drafted', 'Evelyn and Talia were shortlisted for the VP Sales search.', 'Mon', 8),
  ('act-009', 'Accepted', 'Priya agreed to review payment partner risk assumptions.', 'Fri', 9),
  ('act-010', 'Declined', 'Lena declined the acquisition screen because the ask was too early.', 'Thu', 10),
  ('act-011', 'Sent', 'Isabel received the clinic expansion funding context.', 'Wed', 11),
  ('act-012', 'Closed', 'Noah completed the privacy diligence note for the payments launch.', 'Tue', 12)
on conflict (id) do nothing;

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
  ('member-noah', 'Noah Kim', 'Partner', 'Harbor Legal', 'Denver', array['M&A counsel', 'SaaS contracts', 'data privacy'], array['trusted by founding circle', 'rapid response history'], 'Selective', 73)
on conflict (id) do nothing;

insert into public.opportunities (id, requester_id, title, description, category, urgency, keywords)
values
  ('opp-fractional-cfo', 'member-maya', 'Fractional CFO for a Series A SaaS company', 'Northstar Labs needs a finance operator who can clean up SaaS metrics, build a board package, and prepare for a Series A process.', 'Finance', 'This week', array['fractional finance', 'Series A', 'SaaS metrics', 'board reporting']),
  ('opp-revops', 'member-maya', 'RevOps audit before enterprise pipeline push', 'A member company needs help rationalizing HubSpot stages, attribution, and pricing packages before hiring sales leadership.', 'Growth', 'This month', array['RevOps', 'pricing', 'CRM systems', 'go-to-market'])
on conflict (id) do nothing;

insert into public.referrals (id, opportunity_id, from_member_id, to_member_id, status, note)
values
  ('ref-001', 'opp-fractional-cfo', 'member-maya', 'member-lena', 'accepted', 'Lena previously helped a network member build a board-ready finance model.'),
  ('ref-002', 'opp-revops', 'member-maya', 'member-darius', 'sent', 'Darius is reviewing the GTM systems brief.')
on conflict (id) do nothing;

insert into public.activity (id, label, detail, timestamp, sort_order)
values
  ('act-001', 'Drafted', 'AI prepared a double opt-in note for Lena Ortiz.', '9:12 AM', 1),
  ('act-002', 'Sent', 'Maya sent the intro request with context and urgency.', '9:18 AM', 2),
  ('act-003', 'Accepted', 'Lena accepted and asked for the company brief.', '10:04 AM', 3),
  ('act-004', 'Closed', 'Awaiting outcome after first finance working session.', 'Pending', 4)
on conflict (id) do nothing;

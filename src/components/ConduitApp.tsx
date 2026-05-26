"use client";

import {
  ArrowUpRight,
  CheckCircle2,
  CircleDot,
  Clock3,
  Handshake,
  LockKeyhole,
  Network,
  PenLine,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { createIntroDraft, rankReferralMatches } from "@/lib/referrals";
import type { Activity, DemoData, Opportunity, ReferralMatch } from "@/lib/types";

type ApiMatch = {
  id: string;
  name: string;
  role: string;
  company: string;
  confidence: number;
  reasons: string[];
  sharedContext: string;
  risk: string;
};

type ApiResult = {
  matches: ApiMatch[];
  introDraft: string;
  timeline: Activity[];
};

const defaultNeed =
  "Need a fractional CFO for a Series A SaaS company to clean up metrics, build a board package, and prepare for diligence.";

export function ConduitApp({ initialData }: { initialData: DemoData }) {
  const [need, setNeed] = useState(defaultNeed);
  const [category, setCategory] = useState("Finance");
  const [urgency, setUrgency] = useState<Opportunity["urgency"]>("This week");
  const [selectedMatchId, setSelectedMatchId] = useState("member-lena");
  const [isGenerating, setIsGenerating] = useState(false);
  const [apiResult, setApiResult] = useState<ApiResult | null>(null);
  const [timeline, setTimeline] = useState<Activity[]>(initialData.activity);

  const activeOpportunity = useMemo<Opportunity>(
    () => ({
      ...initialData.opportunities[0],
      title: need.split(" to ")[0].replace(/^Need /, "") || initialData.opportunities[0].title,
      description: need,
      category,
      urgency,
      keywords: inferKeywords(need, category),
    }),
    [category, initialData.opportunities, need, urgency],
  );

  const deterministicMatches = useMemo(
    () => rankReferralMatches(activeOpportunity, initialData.members, initialData.referrals).slice(0, 3),
    [activeOpportunity, initialData.members, initialData.referrals],
  );

  const matches = apiResult?.matches ?? deterministicMatches.map(toApiMatch);
  const selectedMatch = matches.find((match) => match.id === selectedMatchId) ?? matches[0];
  const introDraft =
    apiResult?.introDraft ??
    (deterministicMatches[0] ? createIntroDraft(activeOpportunity, deterministicMatches[0]) : "");
  const [editableDraft, setEditableDraft] = useState(introDraft);

  async function handleFindMatches(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsGenerating(true);

    const response = await fetch("/api/ai/referrals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ opportunity: activeOpportunity }),
    });

    const result = (await response.json()) as ApiResult;
    setApiResult(result);
    setSelectedMatchId(result.matches[0]?.id ?? selectedMatchId);
    setEditableDraft(result.introDraft);
    setTimeline(result.timeline);
    setIsGenerating(false);
  }

  function markSent() {
    setTimeline((current) => [
      {
        id: `act-${Date.now()}`,
        label: "Sent",
        detail: `${selectedMatch.name} received the double opt-in request with context.`,
        timestamp: "Now",
      },
      ...current,
    ]);
  }

  return (
    <main className="app-shell">
      <aside className="sidebar" aria-label="Conduit navigation">
        <div className="brand-lockup">
          <div className="brand-mark">
            <Network size={20} />
          </div>
          <span>Conduit</span>
        </div>

        <nav className="nav-list">
          <a className="nav-item active" href="#opportunities">
            <Sparkles size={18} />
            Intelligence
          </a>
          <a className="nav-item" href="#members">
            <UsersRound size={18} />
            Members
          </a>
          <a className="nav-item" href="#referrals">
            <Handshake size={18} />
            Referrals
          </a>
          <a className="nav-item" href="#trust">
            <ShieldCheck size={18} />
            Trust graph
          </a>
        </nav>

        <div className="sidebar-footer">
          <LockKeyhole size={17} />
          <div>
            <strong>Private network</strong>
            <span>Invite-only data room</span>
          </div>
        </div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="microcopy">Servant member workspace</p>
            <h1>Referral intelligence for trusted operators</h1>
          </div>
          <div className="member-chip">
            <span className="avatar">MC</span>
            <div>
              <strong>Maya Chen</strong>
              <span>Northstar Labs</span>
            </div>
          </div>
        </header>

        <div className="dashboard-grid">
          <section className="panel intake-panel" id="opportunities">
            <div className="section-heading">
              <div>
                <p className="microcopy">Opportunity intake</p>
                <h2>Describe the trusted ask</h2>
              </div>
              <Search size={19} />
            </div>

            <form onSubmit={handleFindMatches}>
              <label htmlFor="need">Need</label>
              <textarea
                id="need"
                value={need}
                onChange={(event) => setNeed(event.target.value)}
                rows={5}
              />

              <div className="form-row">
                <label>
                  Category
                  <select value={category} onChange={(event) => setCategory(event.target.value)}>
                    <option>Finance</option>
                    <option>Growth</option>
                    <option>Legal</option>
                    <option>Talent</option>
                  </select>
                </label>
                <label>
                  Urgency
                  <select
                    value={urgency}
                    onChange={(event) => setUrgency(event.target.value as Opportunity["urgency"])}
                  >
                    <option>This week</option>
                    <option>This month</option>
                    <option>Exploratory</option>
                  </select>
                </label>
              </div>

              <button className="primary-action" type="submit" disabled={isGenerating}>
                <Sparkles size={18} />
                {isGenerating ? "Finding matches" : "Find trusted matches"}
              </button>
            </form>

            <div className="signal-list">
              <Signal label="Network fit" value="94%" />
              <Signal label="Open referrals" value="12" />
              <Signal label="Avg response" value="4h" />
            </div>
          </section>

          <section className="panel match-panel">
            <div className="section-heading">
              <div>
                <p className="microcopy">AI match review</p>
                <h2>Ranked introductions</h2>
              </div>
              <CircleDot size={18} />
            </div>

            <div className="match-list">
              {matches.map((match, index) => (
                <button
                  key={match.id}
                  className={`match-row ${match.id === selectedMatch.id ? "selected" : ""}`}
                  onClick={() => setSelectedMatchId(match.id)}
                  type="button"
                >
                  <span className="rank">{index + 1}</span>
                  <span className="match-main">
                    <strong>{match.name}</strong>
                    <small>
                      {match.role}, {match.company}
                    </small>
                    <em>{match.reasons[0]}</em>
                  </span>
                  <span className="confidence">{match.confidence}%</span>
                </button>
              ))}
            </div>

            <div className="rationale">
              <div className="rationale-header">
                <div>
                  <p className="microcopy">Selected match</p>
                  <h3>{selectedMatch.name}</h3>
                </div>
                <span className="status-chip">{selectedMatch.confidence}% confidence</span>
              </div>
              <p>{selectedMatch.sharedContext}</p>
              <ul>
                {selectedMatch.reasons.map((reason) => (
                  <li key={reason}>
                    <CheckCircle2 size={16} />
                    {reason}
                  </li>
                ))}
              </ul>
              <div className="risk-note">
                <ShieldCheck size={17} />
                {selectedMatch.risk}
              </div>
            </div>
          </section>

          <section className="panel composer-panel" id="referrals">
            <div className="section-heading">
              <div>
                <p className="microcopy">Intro composer</p>
                <h2>Double opt-in draft</h2>
              </div>
              <PenLine size={18} />
            </div>

            <textarea
              aria-label="Editable intro draft"
              className="intro-draft"
              value={editableDraft}
              onChange={(event) => setEditableDraft(event.target.value)}
            />

            <div className="composer-actions">
              <button className="secondary-action" type="button">
                Save draft
              </button>
              <button className="primary-action compact" onClick={markSent} type="button">
                <Send size={17} />
                Mark sent
              </button>
            </div>

            <div className="timeline" id="trust">
              <div className="section-heading compact-heading">
                <div>
                  <p className="microcopy">Referral timeline</p>
                  <h2>Outcome trail</h2>
                </div>
                <Clock3 size={18} />
              </div>
              {timeline.map((entry) => (
                <div className="timeline-row" key={entry.id}>
                  <span className="timeline-dot" />
                  <div>
                    <strong>{entry.label}</strong>
                    <p>{entry.detail}</p>
                  </div>
                  <time>{entry.timestamp}</time>
                </div>
              ))}
            </div>
          </section>

          <section className="panel opportunity-panel">
            <div className="section-heading">
              <div>
                <p className="microcopy">Today’s referral opportunities</p>
                <h2>High-signal asks</h2>
              </div>
              <ArrowUpRight size={18} />
            </div>
            {initialData.opportunities.map((opportunity) => (
              <article className="opportunity-row" key={opportunity.id}>
                <div>
                  <strong>{opportunity.title}</strong>
                  <p>{opportunity.description}</p>
                </div>
                <span>{opportunity.urgency}</span>
              </article>
            ))}
          </section>
        </div>
      </section>
    </main>
  );
}

function Signal({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function toApiMatch(match: ReferralMatch): ApiMatch {
  return {
    id: match.member.id,
    name: match.member.name,
    role: match.member.role,
    company: match.member.company,
    confidence: match.confidence,
    reasons: match.reasons,
    sharedContext: match.sharedContext,
    risk: match.risk,
  };
}

function inferKeywords(need: string, category: string): string[] {
  const terms = need.toLowerCase();
  const keywords = new Set<string>();

  if (terms.includes("cfo") || category === "Finance") {
    ["fractional finance", "Series A", "SaaS metrics", "board reporting"].forEach((keyword) =>
      keywords.add(keyword),
    );
  }

  if (terms.includes("revops") || category === "Growth") {
    ["RevOps", "pricing", "CRM systems", "go-to-market"].forEach((keyword) => keywords.add(keyword));
  }

  if (terms.includes("legal") || category === "Legal") {
    ["M&A counsel", "SaaS contracts", "data privacy"].forEach((keyword) => keywords.add(keyword));
  }

  return Array.from(keywords);
}

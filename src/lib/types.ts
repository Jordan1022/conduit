export type Member = {
  id: string;
  name: string;
  role: string;
  company: string;
  location: string;
  expertise: string[];
  trustSignals: string[];
  availability: "Open" | "Selective" | "Limited";
  relationshipStrength: number;
};

export type Opportunity = {
  id: string;
  requesterId: string;
  title: string;
  description: string;
  category: string;
  urgency: "This week" | "This month" | "Exploratory";
  keywords: string[];
};

export type Referral = {
  id: string;
  opportunityId: string;
  fromMemberId: string;
  toMemberId: string;
  status: "drafted" | "sent" | "accepted" | "declined" | "closed";
  note: string;
};

export type Activity = {
  id: string;
  label: string;
  detail: string;
  timestamp: string;
};

export type DemoData = {
  members: Member[];
  opportunities: Opportunity[];
  referrals: Referral[];
  activity: Activity[];
};

export type ReferralMatch = {
  member: Member;
  confidence: number;
  reasons: string[];
  sharedContext: string;
  risk: string;
};

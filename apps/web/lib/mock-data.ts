export type Role = "admin" | "dept-head" | "citizen";

export type Department = {
  id: string;
  name: string;
  slug: string;
  description: string;
  headName: string;
  officerAddress: string;
  officerContact: string;
  officerEmail: string;
  icon: string;
  color: string;
  verificationCode: string | null;
};

export type ComplaintStatus =
  | "submitted"
  | "classified"
  | "assigned"
  | "in-progress"
  | "resolved"
  | "closed";

export type Priority = "low" | "medium" | "high" | "urgent";

export type ClassificationStep = {
  id: string;
  label: string;
  description: string;
  status: "complete" | "active" | "pending";
  durationMs: number;
};

export type Complaint = {
  id: string;
  referenceNumber: string;
  citizenName: string;
  citizenEmail: string;
  subject: string;
  body: string;
  language: string;
  location: string;
  submittedAt: string;
  status: ComplaintStatus;
  priority: Priority;
  departmentId: string;
  confidence: number;
  sentimentScore: number;
  reasoning: ClassificationStep[];
  severityTimeline: { t: number; value: number }[];
  resolutionFeedback?: "UNSATISFIED" | "AVERAGE" | "SATISFIED";
};

const baseFields = {
  officerAddress: "",
  officerContact: "",
  officerEmail: "",
};

export const departments: Department[] = [
  {
    id: "dept-electricity",
    name: "Electricity",
    slug: "electricity",
    description: "Power outages, billing disputes, meter issues",
    headName: "Rajesh Kumar",
    icon: "Zap",
    color: "#f59e0b",
    verificationCode: null,
    ...baseFields,
  },
  {
    id: "dept-water",
    name: "Water Supply",
    slug: "water",
    description: "Water leaks, supply disruptions, contamination",
    headName: "Priya Sharma",
    icon: "Droplet",
    color: "#3b82f6",
    verificationCode: null,
    ...baseFields,
  },
  {
    id: "dept-sanitation",
    name: "Sanitation",
    slug: "sanitation",
    description: "Waste collection, drainage, public hygiene",
    headName: "Amit Patel",
    icon: "Trash2",
    color: "#10b981",
    verificationCode: null,
    ...baseFields,
  },
  {
    id: "dept-roads",
    name: "Roads & Transport",
    slug: "roads",
    description: "Potholes, signage, traffic lights, road repair",
    headName: "Sunita Iyer",
    icon: "Construction",
    color: "#8b5cf6",
    verificationCode: null,
    ...baseFields,
  },
  {
    id: "dept-public-services",
    name: "Public Services",
    slug: "public-services",
    description: "Certificates, public records, civic services",
    headName: "Vikram Singh",
    icon: "Building2",
    color: "#ec4899",
    verificationCode: null,
    ...baseFields,
  },
  {
    id: "dept-health",
    name: "Health & Hospitals",
    slug: "health",
    description: "Public health, hospital services, sanitation",
    headName: "Dr. Anjali Mehta",
    icon: "Heart",
    color: "#ef4444",
    verificationCode: null,
    ...baseFields,
  },
];

const reasoningTemplate = (subject: string, deptName: string): ClassificationStep[] => [
  {
    id: "preprocess",
    label: "Text preprocessing",
    description: `Tokenized · 8 stop-words removed · language detected (en)`,
    status: "complete",
    durationMs: 320,
  },
  {
    id: "embed",
    label: "Semantic embedding",
    description: "Generated 768-dim vector via XLM-RoBERTa multilingual model",
    status: "complete",
    durationMs: 540,
  },
  {
    id: "classify",
    label: "Department classification",
    description: `Top match → ${deptName} (cross-checked against 6 candidate departments)`,
    status: "complete",
    durationMs: 690,
  },
  {
    id: "sentiment",
    label: "Severity analysis",
    description: `Sentiment polarity computed · urgency keywords extracted from "${subject.slice(0, 40)}…"`,
    status: "complete",
    durationMs: 410,
  },
  {
    id: "route",
    label: "Routing decision",
    description: `Assigned to ${deptName} · priority flag set · notification dispatched to dept head`,
    status: "complete",
    durationMs: 240,
  },
];

const buildSeverity = (priority: Priority): { t: number; value: number }[] => {
  const peak = priority === "urgent" ? 0.95 : priority === "high" ? 0.78 : priority === "medium" ? 0.55 : 0.32;
  return Array.from({ length: 24 }, (_, i) => ({
    t: i,
    value: Math.max(0, peak * (0.4 + 0.6 * Math.sin((i / 24) * Math.PI)) + (Math.random() - 0.5) * 0.08),
  }));
};

export const complaints: Complaint[] = [
  {
    id: "c-001",
    referenceNumber: "GRV-2026-00142",
    citizenName: "Anita Desai",
    citizenEmail: "anita.d@email.com",
    subject: "No power for 18 hours in Block C",
    body: "Our entire block has been without electricity since yesterday evening. Multiple complaints to the substation went unanswered. Elderly residents are suffering.",
    language: "en",
    location: "Sector 21, Block C",
    submittedAt: "2026-05-10T18:24:00Z",
    status: "in-progress",
    priority: "urgent",
    departmentId: "dept-electricity",
    confidence: 0.94,
    sentimentScore: -0.82,
    reasoning: reasoningTemplate("No power for 18 hours in Block C", "Electricity"),
    severityTimeline: buildSeverity("urgent"),
  },
  {
    id: "c-002",
    referenceNumber: "GRV-2026-00141",
    citizenName: "Rahul Verma",
    citizenEmail: "rverma@email.com",
    subject: "Water pipe burst near MG Road",
    body: "Water gushing onto main road for past 3 hours. Causing traffic jam and wastage. Need urgent attention from water department.",
    language: "en",
    location: "MG Road, Junction 4",
    submittedAt: "2026-05-10T14:12:00Z",
    status: "assigned",
    priority: "high",
    departmentId: "dept-water",
    confidence: 0.97,
    sentimentScore: -0.61,
    reasoning: reasoningTemplate("Water pipe burst near MG Road", "Water Supply"),
    severityTimeline: buildSeverity("high"),
  },
  {
    id: "c-003",
    referenceNumber: "GRV-2026-00140",
    citizenName: "Meera Krishnan",
    citizenEmail: "meera.k@email.com",
    subject: "Garbage not collected for 5 days",
    body: "The waste collection truck has not visited our colony for almost a week. Stench is unbearable and stray dogs are scattering trash.",
    language: "en",
    location: "Lakshmi Colony",
    submittedAt: "2026-05-09T09:45:00Z",
    status: "in-progress",
    priority: "medium",
    departmentId: "dept-sanitation",
    confidence: 0.91,
    sentimentScore: -0.54,
    reasoning: reasoningTemplate("Garbage not collected for 5 days", "Sanitation"),
    severityTimeline: buildSeverity("medium"),
  },
  {
    id: "c-004",
    referenceNumber: "GRV-2026-00139",
    citizenName: "Karan Mehta",
    citizenEmail: "karan@email.com",
    subject: "Large pothole on highway entrance",
    body: "A massive pothole has developed at the highway entry ramp. Two motorcycle accidents reported yesterday. Needs immediate repair.",
    language: "en",
    location: "NH-44, Entry Ramp",
    submittedAt: "2026-05-08T17:30:00Z",
    status: "resolved",
    priority: "high",
    departmentId: "dept-roads",
    confidence: 0.96,
    sentimentScore: -0.69,
    reasoning: reasoningTemplate("Large pothole on highway entrance", "Roads & Transport"),
    severityTimeline: buildSeverity("high"),
    resolutionFeedback: "SATISFIED",
  },
  {
    id: "c-005",
    referenceNumber: "GRV-2026-00138",
    citizenName: "Sneha Reddy",
    citizenEmail: "sneha.r@email.com",
    subject: "Birth certificate delayed by 2 months",
    body: "Applied for child's birth certificate online over 2 months ago. Status still shows 'pending verification'. Multiple visits to office yielded no response.",
    language: "en",
    location: "Ward 7 Office",
    submittedAt: "2026-05-07T11:20:00Z",
    status: "in-progress",
    priority: "low",
    departmentId: "dept-public-services",
    confidence: 0.88,
    sentimentScore: -0.41,
    reasoning: reasoningTemplate("Birth certificate delayed by 2 months", "Public Services"),
    severityTimeline: buildSeverity("low"),
  },
  {
    id: "c-006",
    referenceNumber: "GRV-2026-00137",
    citizenName: "Arjun Nair",
    citizenEmail: "arjun.n@email.com",
    subject: "Dengue outbreak in our area",
    body: "Three confirmed dengue cases in our apartment complex this week. Health department has not visited for fogging despite multiple calls.",
    language: "en",
    location: "Green Park Apartments",
    submittedAt: "2026-05-09T20:15:00Z",
    status: "assigned",
    priority: "urgent",
    departmentId: "dept-health",
    confidence: 0.93,
    sentimentScore: -0.75,
    reasoning: reasoningTemplate("Dengue outbreak in our area", "Health & Hospitals"),
    severityTimeline: buildSeverity("urgent"),
  },
  {
    id: "c-007",
    referenceNumber: "GRV-2026-00136",
    citizenName: "Pooja Iyer",
    citizenEmail: "pooja@email.com",
    subject: "Street light not working since last week",
    body: "The street light at our corner has been broken for over a week. The area is dark and unsafe at night.",
    language: "en",
    location: "Sector 12, Lane 4",
    submittedAt: "2026-05-08T19:00:00Z",
    status: "resolved",
    priority: "medium",
    departmentId: "dept-electricity",
    confidence: 0.89,
    sentimentScore: -0.38,
    reasoning: reasoningTemplate("Street light not working since last week", "Electricity"),
    severityTimeline: buildSeverity("medium"),
    resolutionFeedback: "AVERAGE",
  },
  {
    id: "c-008",
    referenceNumber: "GRV-2026-00135",
    citizenName: "Vivek Joshi",
    citizenEmail: "vivek.j@email.com",
    subject: "Drainage overflow causing flooding",
    body: "Drainage outside our shop has been overflowing for 3 days. Wastewater pooling on sidewalk. Health hazard.",
    language: "en",
    location: "Market Square",
    submittedAt: "2026-05-09T16:42:00Z",
    status: "classified",
    priority: "high",
    departmentId: "dept-sanitation",
    confidence: 0.92,
    sentimentScore: -0.66,
    reasoning: reasoningTemplate("Drainage overflow causing flooding", "Sanitation"),
    severityTimeline: buildSeverity("high"),
  },
];

export const currentUser = {
  citizen: {
    id: "user-citizen-1",
    name: "Anita Desai",
    email: "anita.d@email.com",
    role: "citizen" as Role,
  },
  "dept-head": {
    id: "user-dept-1",
    name: "Rajesh Kumar",
    email: "rajesh.k@gov.in",
    role: "dept-head" as Role,
    departmentId: "dept-electricity",
  },
  admin: {
    id: "user-admin-1",
    name: "Shaban Haider",
    email: "shaban@gov.in",
    role: "admin" as Role,
  },
};

export function getDepartmentById(id: string): Department | undefined {
  return departments.find((d) => d.id === id);
}

export function getComplaintsByRole(role: Role, departmentId?: string): Complaint[] {
  if (role === "admin") return complaints;
  if (role === "dept-head" && departmentId) {
    return complaints.filter((c) => c.departmentId === departmentId);
  }
  if (role === "citizen") {
    return complaints.filter((c) => c.citizenEmail === currentUser.citizen.email);
  }
  return [];
}

export type SimulatedClassification = {
  referenceNumber: string;
  departmentId: string;
  departmentName: string;
  priority: Priority;
  confidence: number;
  reasoning: ClassificationStep[];
  severityTimeline: { t: number; value: number }[];
};

const urgencyKeywords = ["urgent", "immediate", "emergency", "dying", "hours", "danger", "accident"];
const deptKeywords: Record<string, string[]> = {
  "dept-electricity": ["power", "electricity", "light", "current", "meter", "substation", "voltage"],
  "dept-water": ["water", "pipe", "supply", "leak", "tap", "drainage"],
  "dept-sanitation": ["garbage", "waste", "trash", "drain", "sewer", "stench", "hygiene"],
  "dept-roads": ["pothole", "road", "traffic", "highway", "street", "lane", "bridge"],
  "dept-public-services": ["certificate", "document", "record", "office", "verification", "permit"],
  "dept-health": ["dengue", "hospital", "health", "doctor", "fever", "outbreak", "fogging"],
};

export async function simulateClassification(
  body: string,
  onStep?: (step: ClassificationStep, index: number) => void
): Promise<SimulatedClassification> {
  const lower = body.toLowerCase();
  let bestDept = "dept-public-services";
  let bestScore = 0;
  for (const [deptId, keywords] of Object.entries(deptKeywords)) {
    const score = keywords.filter((k) => lower.includes(k)).length;
    if (score > bestScore) {
      bestScore = score;
      bestDept = deptId;
    }
  }
  const dept = getDepartmentById(bestDept)!;
  const urgencyHits = urgencyKeywords.filter((k) => lower.includes(k)).length;
  const priority: Priority =
    urgencyHits >= 2 ? "urgent" : urgencyHits === 1 ? "high" : bestScore >= 2 ? "medium" : "low";
  const confidence = Math.min(0.99, 0.65 + bestScore * 0.08 + urgencyHits * 0.04);
  const reasoning = reasoningTemplate(body.slice(0, 60), dept.name);

  for (let i = 0; i < reasoning.length; i++) {
    const step = reasoning[i]!;
    await new Promise((r) => setTimeout(r, step.durationMs));
    onStep?.(step, i);
  }

  const referenceNumber = `GRV-2026-${String(Math.floor(Math.random() * 90000) + 10000).padStart(5, "0")}`;
  return {
    referenceNumber,
    departmentId: bestDept,
    departmentName: dept.name,
    priority,
    confidence,
    reasoning,
    severityTimeline: buildSeverity(priority),
  };
}

export const chartMockData = {
  area: Array.from({ length: 30 }, (_, i) => ({
    date: new Date(2026, 4, i + 1).getTime(),
    value: 40 + Math.floor(Math.random() * 60) + (i > 15 ? 20 : 0),
  })),
  bar: departments.map((d) => ({
    label: d.name,
    value: complaints.filter((c) => c.departmentId === d.id).length + Math.floor(Math.random() * 12),
    color: d.color,
  })),
  pie: departments.map((d) => ({
    label: d.name,
    value: complaints.filter((c) => c.departmentId === d.id).length + Math.floor(Math.random() * 30) + 5,
    color: d.color,
  })),
  ring: [
    { label: "Resolved", value: 68, color: "#10b981" },
    { label: "In Progress", value: 22, color: "#3b82f6" },
    { label: "Pending", value: 10, color: "#f59e0b" },
  ],
  funnel: [
    { label: "Submitted", value: 1200 },
    { label: "Classified", value: 1180 },
    { label: "Assigned", value: 1150 },
    { label: "In Progress", value: 920 },
    { label: "Resolved", value: 815 },
  ],
  radar: [
    {
      label: "This Month",
      data: departments.map((d) => ({
        axis: d.name,
        value: 40 + Math.floor(Math.random() * 60),
      })),
    },
    {
      label: "Last Month",
      data: departments.map((d) => ({
        axis: d.name,
        value: 30 + Math.floor(Math.random() * 50),
      })),
    },
  ],
  line: Array.from({ length: 30 }, (_, i) => ({
    date: new Date(2026, 4, i + 1).getTime(),
    resolved: 20 + Math.floor(Math.random() * 30),
    submitted: 30 + Math.floor(Math.random() * 50),
  })),
  candlestick: Array.from({ length: 20 }, (_, i) => {
    const open = 50 + Math.random() * 40;
    const close = open + (Math.random() - 0.5) * 20;
    const high = Math.max(open, close) + Math.random() * 8;
    const low = Math.min(open, close) - Math.random() * 8;
    return { date: new Date(2026, 4, i + 1).getTime(), open, close, high, low };
  }),
  sankey: {
    nodes: [
      { name: "Submitted" },
      { name: "Electricity" },
      { name: "Water" },
      { name: "Sanitation" },
      { name: "Roads" },
      { name: "Resolved" },
      { name: "Pending" },
    ],
    links: [
      { source: 0, target: 1, value: 32 },
      { source: 0, target: 2, value: 28 },
      { source: 0, target: 3, value: 24 },
      { source: 0, target: 4, value: 18 },
      { source: 1, target: 5, value: 22 },
      { source: 1, target: 6, value: 10 },
      { source: 2, target: 5, value: 21 },
      { source: 2, target: 6, value: 7 },
      { source: 3, target: 5, value: 17 },
      { source: 3, target: 6, value: 7 },
      { source: 4, target: 5, value: 12 },
      { source: 4, target: 6, value: 6 },
    ],
  },
};

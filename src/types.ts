export interface Location {
  lat: number;
  lng: number;
  address: string;
  ward: string;
  district: string;
}

export interface TimelineEntry {
  status: string;
  updatedAt: number;
  note: string;
}

export interface Comment {
  id: string;
  user: string;
  role: "Citizen" | "Official" | "Department Head";
  text: string;
  timestamp: number;
}

export interface CommunityImpact {
  score: number;
  citizensAffected: number;
  schoolsHospitalsNearby: string[];
  trafficDisruption: "None" | "Low" | "Medium" | "High";
}

export interface TrustBreakdown {
  aiConfidence: number;
  communityValidations: number;
  gpsVerified: boolean;
  duplicateStatus: "Checked-Clear" | "Potential-Merged";
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  image?: string; // Original complaint photo
  resolutionImage?: string; // Resolved photo
  beforeAfterResult?: string; // AI analysis comparing the two
  beforeAfterConfidence?: number; // AI confidence on resolution (0-100)
  category: "Road Issue" | "Waste Management" | "Water Supply" | "Electrical" | "Sanitation" | "Environment";
  severity: "Low" | "Medium" | "High" | "Critical";
  severityExplanation?: string; // Why it was rated this severity
  priorityScore?: number; // Calculated priority score (e.g. 1-100)
  priorityReasoning?: string; // Explainable AI (XAI) detail for priority
  confidence: number;
  location: Location;
  status: "Reported" | "Verified" | "Assigned" | "In Progress" | "Resolved";
  statusTimeline: TimelineEntry[];
  votes: number;
  upvoters: string[];
  verifiedCount: number;
  validators: string[];
  isFakeFlagged: boolean;
  fakeReportReason?: string;
  reputationPointsGiven: boolean;
  resolutionCost: number;
  resolutionSuggestions: string[];
  rootCauseAnalysis: string;
  predictiveAlert: string;
  assignedDepartment: string;
  slaHours: number;
  slaDeadline: number;
  escalationLevel: "None" | "Department Head" | "District Officer" | "Commissioner";
  comments: Comment[];
  followers: string[];
  createdAt: number;
  originalLanguage: string;
  
  // Upgraded hackathon properties
  communityImpact?: CommunityImpact;
  trustBreakdown?: TrustBreakdown;
  trustScore?: number;
  isEmergencyEscalated?: boolean;
}

export interface User {
  email: string;
  name: string;
  reputationPoints: number;
  badges: string[];
}

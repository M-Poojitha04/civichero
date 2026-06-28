/**
 * CivicHero AI - Enterprise Citizen Directory Utility
 * Provides deterministic, high-fidelity metadata (avatars, badges, stats) for citizen profiles.
 */

export interface CitizenProfile {
  name: string;
  avatarUrl: string;
  badge: string;
  reputation: number;
  verificationLevel: string;
  joinedDate: string;
  accuracyRate: string;
}

const INDIAN_AVATARS = [
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150", // Male 1
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150", // Female 1
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150", // Male 2
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150", // Female 2
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=150", // Male 3
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150", // Female 3
  "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=150", // Male 4
  "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&q=80&w=150", // Female 4
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=150", // Male 5
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=150"  // Female 5
];

const CITIZEN_BADGES = [
  "Infrastructure Guardian",
  "Water Watchdog",
  "Green Hero",
  "Air Quality Warden",
  "SLA Auditor",
  "Community Sentinel"
];

const JOINED_DATES = [
  "March 2025",
  "June 2025",
  "September 2025",
  "December 2025",
  "January 2026"
];

// Deterministic string hashing helper
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

export function getCitizenProfile(email: string, name: string): CitizenProfile {
  const identifier = email || name || "unknown";
  const hash = hashString(identifier);
  
  const formattedName = name 
    ? name.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, c => c.toUpperCase())
    : "Citizen Sentinel";
  
  const avatarUrl = INDIAN_AVATARS[hash % INDIAN_AVATARS.length];
  const badge = CITIZEN_BADGES[hash % CITIZEN_BADGES.length];
  const joinedDate = JOINED_DATES[hash % JOINED_DATES.length];
  
  // Deterministic realistic metrics
  const accuracyRate = `${(92 + (hash % 8) + parseFloat(((hash % 10) / 10).toFixed(1)))}%`;
  const levelNum = (hash % 5) + 1;
  const verificationLevel = `Level ${levelNum} Senior Auditor`;
  const reputation = 150 + (hash % 850);

  return {
    name: formattedName,
    avatarUrl,
    badge,
    reputation,
    verificationLevel,
    joinedDate,
    accuracyRate
  };
}

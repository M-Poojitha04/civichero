import { pgTable, serial, text, integer, doublePrecision, boolean, bigint, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  uid: text("uid").notNull().unique(), // Firebase Auth UID
  email: text("email").notNull().unique(),
  name: text("name"),
  reputationPoints: integer("reputation_points").default(0),
  badges: text("badges"), // JSON string array
  createdAt: timestamp("created_at").defaultNow(),
});

export const issues = pgTable("issues", {
  id: text("id").primaryKey(), // complaint-...
  title: text("title").notNull(),
  description: text("description"),
  category: text("category").notNull(),
  severity: text("severity").notNull(),
  confidence: integer("confidence").default(90),
  lat: doublePrecision("lat").notNull(),
  lng: doublePrecision("lng").notNull(),
  address: text("address"),
  ward: text("ward"),
  district: text("district"),
  status: text("status").notNull().default("Reported"),
  statusTimeline: text("status_timeline"), // JSON string array of TimelineEntry
  votes: integer("votes").default(0),
  upvoters: text("upvoters"), // JSON string array of emails
  verifiedCount: integer("verified_count").default(0),
  validators: text("validators"), // JSON string array of emails
  isFakeFlagged: boolean("is_fake_flagged").default(false),
  reputationPointsGiven: boolean("reputation_points_given").default(false),
  resolutionCost: integer("resolution_cost").default(0),
  resolutionSuggestions: text("resolution_suggestions"), // JSON string array
  rootCauseAnalysis: text("root_cause_analysis"),
  predictiveAlert: text("predictive_alert"),
  assignedDepartment: text("assigned_department"),
  followers: text("followers"), // JSON string array of emails
  createdAt: bigint("created_at", { mode: "number" }).notNull(),
  originalLanguage: text("original_language").default("English"),
  reporterEmail: text("reporter_email"),
  image: text("image"), // Original complaint photo (base64 or URL)
  resolutionImage: text("resolution_image"),
  beforeAfterResult: text("before_after_result"),
  beforeAfterConfidence: integer("before_after_confidence"),
  trustScore: integer("trust_score"),
  isEmergencyEscalated: boolean("is_emergency_escalated").default(false),
  // Community Impact fields
  communityImpactScore: integer("community_impact_score"),
  communityImpactCitizensAffected: integer("community_impact_citizens_affected"),
  communityImpactSchoolsHospitals: text("community_impact_schools_hospitals"), // JSON string array
  communityImpactTrafficDisruption: text("community_impact_traffic_disruption"), // "None" | "Low" | "Medium" | "High"
  // Trust Breakdown fields
  trustBreakdownAiConfidence: integer("trust_breakdown_ai_confidence"),
  trustBreakdownCommunityValidations: integer("trust_breakdown_community_validations"),
  trustBreakdownGpsVerified: boolean("trust_breakdown_gps_verified"),
  trustBreakdownDuplicateStatus: text("trust_breakdown_duplicate_status"), // "Checked-Clear" | "Potential-Merged"
});

export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  issueId: text("issue_id").notNull().references(() => issues.id, { onDelete: "cascade" }),
  text: text("text").notNull(),
  userEmail: text("user_email").notNull(),
  userName: text("user_name").notNull(),
  userRole: text("user_role").notNull(),
  timestamp: bigint("timestamp", { mode: "number" }).notNull(),
});

// Relationships
export const issuesRelations = relations(issues, ({ many }) => ({
  commentsList: many(comments),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  issue: one(issues, {
    fields: [comments.issueId],
    references: [issues.id],
  }),
}));

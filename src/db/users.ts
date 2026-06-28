import { db } from "./index.ts";
import { users } from "./schema.ts";
import { eq } from "drizzle-orm";

export async function getOrCreateUser(uid: string, email: string, name?: string) {
  try {
    const existing = await db.select().from(users).where(eq(users.uid, uid));
    if (existing.length > 0) {
      return existing[0];
    }

    const defaultBadges = JSON.stringify(["Reporter"]);
    const result = await db.insert(users)
      .values({
        uid,
        email,
        name: name || email.split("@")[0],
        reputationPoints: 210, // Matching the Vikram Malhotra prototype defaults
        badges: JSON.stringify(["Reporter", "Validator", "Hero", "Super Hero"]),
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email,
          name: name || email.split("@")[0],
        },
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error("Error in getOrCreateUser:", error);
    // Return a fallback user object to prevent page crashes
    return {
      id: 1,
      uid,
      email,
      name: name || email.split("@")[0],
      reputationPoints: 210,
      badges: JSON.stringify(["Reporter", "Validator", "Hero", "Super Hero"]),
      createdAt: new Date(),
    };
  }
}

export async function addReputationPoints(email: string, points: number) {
  try {
    const existing = await db.select().from(users).where(eq(users.email, email));
    if (existing.length === 0) return null;

    const user = existing[0];
    const newPoints = (user.reputationPoints || 0) + points;

    // Dynamically calculate badges
    const badgesSet = new Set<string>(user.badges ? JSON.parse(user.badges) : []);
    if (newPoints >= 50) badgesSet.add("Reporter");
    if (newPoints >= 100) badgesSet.add("Validator");
    if (newPoints >= 200) badgesSet.add("Hero");
    if (newPoints >= 300) badgesSet.add("Super Hero");

    const updated = await db.update(users)
      .set({
        reputationPoints: newPoints,
        badges: JSON.stringify(Array.from(badgesSet)),
      })
      .where(eq(users.email, email))
      .returning();

    return updated[0];
  } catch (error) {
    console.error("Error in addReputationPoints:", error);
    return null;
  }
}

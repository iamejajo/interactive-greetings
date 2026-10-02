/**
 * End-to-end check of the data layer against the configured Supabase project:
 * creates an experience, reads it back, checks a missing slug, then deletes
 * the test row. Run with `npm run db:smoke` (reads .env.local).
 */
import { getDb } from "@/lib/db/client";
import { createExperience, getExperienceBySlug } from "@/lib/db/experiences";

async function main() {
  const created = await createExperience({
    type: "valentine",
    senderName: "Smoke Test",
    recipientName: "Supabase",
    message: "If you can read this, the data layer works.",
  });
  console.log(`✓ created   slug=${created.slug} id=${created.id}`);

  try {
    const found = await getExperienceBySlug(created.slug);
    if (!found || found.id !== created.id) throw new Error("read-back mismatch");
    console.log(`✓ read back ${found.senderName} → ${found.recipientName}`);

    const missing = await getExperienceBySlug("zzzzzzzz");
    if (missing !== null) throw new Error("expected null for unknown slug");
    console.log("✓ unknown slug returns null");
  } finally {
    const { error } = await getDb().from("experiences").delete().eq("id", created.id);
    if (error) throw error;
    console.log("✓ cleaned up test row");
  }
}

main().catch((error) => {
  console.error("✗ smoke test failed:", error);
  process.exit(1);
});

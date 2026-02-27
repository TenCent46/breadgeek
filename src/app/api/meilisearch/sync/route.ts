import { NextResponse } from "next/server";
import {
  syncServicesToMeilisearch,
  syncSchoolsToMeilisearch,
  configureMeilisearchIndexes,
} from "@/lib/meilisearch-sync";

export async function POST(req: Request) {
  const authHeader = req.headers.get("authorization");
  const expectedKey = process.env.MEILISEARCH_API_KEY;

  // Simple auth check for cron/admin calls
  if (expectedKey && authHeader !== `Bearer ${expectedKey}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await configureMeilisearchIndexes();
    const [serviceCount, schoolCount] = await Promise.all([
      syncServicesToMeilisearch(),
      syncSchoolsToMeilisearch(),
    ]);

    return NextResponse.json({
      success: true,
      synced: { services: serviceCount, schools: schoolCount },
    });
  } catch (error) {
    console.error("Meilisearch sync error:", error);
    return NextResponse.json(
      { error: "Sync failed", details: String(error) },
      { status: 500 }
    );
  }
}

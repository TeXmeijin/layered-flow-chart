/**
 * Analytics API for a specific short URL.
 *
 * GET /api/analytics/[slug] - Returns detailed click analytics
 *   including timeline, referrer breakdown, device stats, etc.
 */

import { NextResponse } from "next/server";
import { getAnalytics } from "@/lib/store";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const analytics = getAnalytics(slug);

  if (!analytics) {
    return NextResponse.json(
      { error: "Short URL not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(analytics);
}

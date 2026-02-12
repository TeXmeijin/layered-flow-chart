/**
 * Redirect endpoint for short URLs.
 *
 * GET /api/r/[slug] - Look up the slug, record click analytics,
 *                     and redirect (302) to the original URL.
 */

import { NextRequest, NextResponse } from "next/server";
import { getLink, recordClick } from "@/lib/store";
import { parseUserAgent } from "@/lib/ua-parser";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  // Look up the link
  const link = getLink(slug);

  if (!link) {
    return NextResponse.json(
      { error: "Short URL not found" },
      { status: 404 }
    );
  }

  // Parse User-Agent for analytics
  const userAgent = request.headers.get("user-agent");
  const parsed = parseUserAgent(userAgent);

  // Extract referrer
  const referrer = request.headers.get("referer") || null;

  // Extract IP (best effort)
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  // Record the click
  recordClick(slug, {
    timestamp: new Date().toISOString(),
    referrer,
    browser: parsed.browser,
    browserVersion: parsed.browserVersion,
    os: parsed.os,
    deviceType: parsed.deviceType,
    ip,
  });

  // 302 redirect to the original URL
  return NextResponse.redirect(link.originalUrl, 302);
}

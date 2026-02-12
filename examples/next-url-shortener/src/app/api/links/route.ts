/**
 * API routes for creating and listing short URLs.
 *
 * POST /api/links - Create a new short URL
 * GET  /api/links - List all links with click counts
 */

import { NextRequest, NextResponse } from "next/server";
import { validateUrl } from "@/lib/validators";
import { generateSlug } from "@/lib/slug";
import { createLink, getAllLinks, slugExists } from "@/lib/store";

// ─── POST /api/links ─────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  let body: { url?: string };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  // Validate the URL
  const validation = validateUrl(body.url);
  if (!validation.valid) {
    return NextResponse.json(
      { error: validation.error },
      { status: 400 }
    );
  }

  // Generate a unique slug (retry if collision, though unlikely)
  let slug = generateSlug();
  let attempts = 0;
  while (slugExists(slug) && attempts < 10) {
    slug = generateSlug();
    attempts++;
  }

  if (slugExists(slug)) {
    return NextResponse.json(
      { error: "Failed to generate unique slug. Please try again." },
      { status: 500 }
    );
  }

  // Create and store the link
  const link = createLink(slug, body.url!.trim());

  return NextResponse.json(
    { slug: link.slug, originalUrl: link.originalUrl, createdAt: link.createdAt },
    { status: 201 }
  );
}

// ─── GET /api/links ──────────────────────────────────────────────────

export async function GET() {
  const links = getAllLinks();
  return NextResponse.json({ links });
}

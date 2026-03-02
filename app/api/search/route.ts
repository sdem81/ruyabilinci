import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/search?q=...&page=1&perPage=20
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q")?.trim();
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const perPage = Math.min(100, parseInt(searchParams.get("perPage") || "20", 10));

  if (!query) {
    return NextResponse.json(
      { error: "Arama sorgusu gerekli (q parametresi)" },
      { status: 400 }
    );
  }

  const where = {
    isPublished: true,
    title: { contains: query, mode: "insensitive" as const },
  };

  const [dreams, total] = await Promise.all([
    prisma.dream.findMany({
      where,
      include: { category: { select: { id: true, name: true, slug: true } } },
      orderBy: { views: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.dream.count({ where }),
  ]);

  return NextResponse.json({
    dreams,
    query,
    pagination: {
      page,
      perPage,
      total,
      totalPages: Math.ceil(total / perPage),
    },
  });
}

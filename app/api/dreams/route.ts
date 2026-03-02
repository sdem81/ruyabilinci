import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/dreams - List dreams with pagination
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const perPage = Math.min(100, parseInt(searchParams.get("perPage") || "20", 10));
  const categoryId = searchParams.get("categoryId");

  const where: any = {};
  if (categoryId) where.categoryId = parseInt(categoryId, 10);

  const [dreams, total] = await Promise.all([
    prisma.dream.findMany({
      where,
      include: { category: { select: { id: true, name: true, slug: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.dream.count({ where }),
  ]);

  return NextResponse.json({
    dreams,
    pagination: {
      page,
      perPage,
      total,
      totalPages: Math.ceil(total / perPage),
    },
  });
}

// POST /api/dreams - Create a new dream
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, slug, content, shortSummary, categoryId, isPublished } = body;

    if (!title || !slug || !content || !categoryId) {
      return NextResponse.json(
        { error: "title, slug, content ve categoryId zorunludur" },
        { status: 400 }
      );
    }

    const dream = await prisma.dream.create({
      data: {
        title,
        slug,
        content,
        shortSummary: shortSummary || null,
        categoryId: parseInt(categoryId, 10),
        isPublished: isPublished ?? true,
      },
      include: { category: true },
    });

    return NextResponse.json(dream, { status: 201 });
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Bu slug zaten mevcut" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Bir hata oluştu" },
      { status: 500 }
    );
  }
}

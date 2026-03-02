import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/categories
export async function GET() {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { dreams: true } } },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(categories);
}

// POST /api/categories
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, slug, seoText } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { error: "name ve slug zorunludur" },
        { status: 400 }
      );
    }

    const category = await prisma.category.create({
      data: { name, slug, seoText: seoText || null },
    });

    return NextResponse.json(category, { status: 201 });
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

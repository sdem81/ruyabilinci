import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: { id: string };
}

// GET /api/categories/[id]
export async function GET(_request: NextRequest, { params }: RouteParams) {
  const id = parseInt(params.id, 10);
  if (isNaN(id)) {
    return NextResponse.json({ error: "Geçersiz ID" }, { status: 400 });
  }

  const category = await prisma.category.findUnique({
    where: { id },
    include: { _count: { select: { dreams: true } } },
  });

  if (!category) {
    return NextResponse.json(
      { error: "Kategori bulunamadı" },
      { status: 404 }
    );
  }

  return NextResponse.json(category);
}

// PUT /api/categories/[id]
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const id = parseInt(params.id, 10);
  if (isNaN(id)) {
    return NextResponse.json({ error: "Geçersiz ID" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { name, slug, seoText } = body;

    const category = await prisma.category.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(slug && { slug }),
        ...(seoText !== undefined && { seoText }),
      },
    });

    return NextResponse.json(category);
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Kategori bulunamadı" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: "Bir hata oluştu" },
      { status: 500 }
    );
  }
}

// DELETE /api/categories/[id]
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const id = parseInt(params.id, 10);
  if (isNaN(id)) {
    return NextResponse.json({ error: "Geçersiz ID" }, { status: 400 });
  }

  try {
    // Check if category has dreams
    const dreamCount = await prisma.dream.count({
      where: { categoryId: id },
    });

    if (dreamCount > 0) {
      return NextResponse.json(
        {
          error: `Bu kategoride ${dreamCount} rüya bulunuyor. Önce rüyaları silmelisiniz.`,
        },
        { status: 400 }
      );
    }

    await prisma.category.delete({ where: { id } });
    return NextResponse.json({ message: "Kategori silindi" });
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Kategori bulunamadı" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: "Bir hata oluştu" },
      { status: 500 }
    );
  }
}

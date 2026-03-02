import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: { id: string };
}

// GET /api/dreams/[id]
export async function GET(_request: NextRequest, { params }: RouteParams) {
  const id = parseInt(params.id, 10);
  if (isNaN(id)) {
    return NextResponse.json({ error: "Geçersiz ID" }, { status: 400 });
  }

  const dream = await prisma.dream.findUnique({
    where: { id },
    include: { category: true },
  });

  if (!dream) {
    return NextResponse.json(
      { error: "Rüya bulunamadı" },
      { status: 404 }
    );
  }

  return NextResponse.json(dream);
}

// PUT /api/dreams/[id]
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const id = parseInt(params.id, 10);
  if (isNaN(id)) {
    return NextResponse.json({ error: "Geçersiz ID" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { title, slug, content, shortSummary, categoryId, isPublished } = body;

    const dream = await prisma.dream.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(slug && { slug }),
        ...(content && { content }),
        ...(shortSummary !== undefined && { shortSummary }),
        ...(categoryId && { categoryId: parseInt(categoryId, 10) }),
        ...(isPublished !== undefined && { isPublished }),
      },
      include: { category: true },
    });

    return NextResponse.json(dream);
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Rüya bulunamadı" },
        { status: 404 }
      );
    }
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

// DELETE /api/dreams/[id]
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const id = parseInt(params.id, 10);
  if (isNaN(id)) {
    return NextResponse.json({ error: "Geçersiz ID" }, { status: 400 });
  }

  try {
    await prisma.dream.delete({ where: { id } });
    return NextResponse.json({ message: "Rüya silindi" });
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Rüya bulunamadı" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: "Bir hata oluştu" },
      { status: 500 }
    );
  }
}

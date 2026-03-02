import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    const [dreamCount, categoryCount, sampleDream] = await Promise.all([
      prisma.dream.count(),
      prisma.category.count(),
      prisma.dream.findFirst({
        select: {
          id: true,
          title: true,
          slug: true,
          category: { select: { name: true } },
        },
      }),
    ]);

    return NextResponse.json({
      status: 'ok',
      database: {
        connected: true,
        dreams: dreamCount,
        categories: categoryCount,
      },
      sample: sampleDream
        ? {
            id: sampleDream.id,
            title: sampleDream.title,
            slug: sampleDream.slug,
            category: sampleDream.category?.name ?? null,
          }
        : null,
      env: {
        hasDbUrl: Boolean(process.env.DATABASE_URL),
        hasDirectUrl: Boolean(process.env.DIRECT_URL),
        nodeEnv: process.env.NODE_ENV,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: 'error',
        error: error?.message ?? 'Unknown error',
        env: {
          hasDbUrl: Boolean(process.env.DATABASE_URL),
          hasDirectUrl: Boolean(process.env.DIRECT_URL),
          nodeEnv: process.env.NODE_ENV,
        },
      },
      { status: 500 }
    );
  }
}

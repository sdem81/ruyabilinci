import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    const dbUrl = process.env.DATABASE_URL || '';
    const directUrl = process.env.DIRECT_URL || '';
    
    // Check database connectivity
    let dbStatus = 'unknown';
    let dreamCount = 0;
    let categoryCount = 0;
    let sampleDream = null;
    let error = null;

    try {
      dreamCount = await prisma.dream.count();
      categoryCount = await prisma.category.count();
      sampleDream = await prisma.dream.findFirst({
        select: { title: true, slug: true }
      });
      dbStatus = 'connected';
    } catch (e: any) {
      dbStatus = 'error';
      error = e.message;
    }

    return NextResponse.json({
      environment: process.env.NODE_ENV,
      vercel: process.env.VERCEL === '1',
      database: {
        status: dbStatus,
        urlHost: dbUrl.match(/@([^/]+)\//)?.[1] || 'not-found',
        directHost: directUrl.match(/@([^/]+)\//)?.[1] || 'not-found',
        hasUtf8Param: dbUrl.includes('client_encoding=UTF8'),
        dreamCount,
        categoryCount,
        sampleDream,
        error
      },
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}

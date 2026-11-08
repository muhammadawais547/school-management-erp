import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const classId = searchParams.get('classId');

  const where: any = {};
  if (classId && classId !== 'ALL') {
    where.classId = classId;
  }

  const subjects = await prisma.subject.findMany({
    where,
    orderBy: { name: 'asc' },
  });

  return NextResponse.json({ success: true, data: { subjects } });
}

import React from 'react';
import prisma from '@/lib/prisma';
import { ExaminationsClient } from '@/components/examinations/ExaminationsClient';

export const dynamic = 'force-dynamic';

export default async function ExaminationsPage() {
  const [exams, classes] = await Promise.all([
    prisma.exam.findMany({
      include: {
        _count: {
          select: { marks: true },
        },
      },
      orderBy: { startDate: 'desc' },
    }),
    prisma.academicClass.findMany({
      orderBy: { gradeLevel: 'asc' },
    }),
  ]);

  return <ExaminationsClient initialExams={exams} classes={classes} />;
}

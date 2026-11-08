import React from 'react';
import prisma from '@/lib/prisma';
import { ClassListClient } from '@/components/classes/ClassListClient';

export const dynamic = 'force-dynamic';

export default async function ClassesPage() {
  const [classes, teachers, institute] = await Promise.all([
    prisma.academicClass.findMany({
      include: {
        sections: {
          include: {
            classTeacher: true,
            _count: { select: { students: true } },
          },
        },
        subjects: true,
        feeStructures: true,
        _count: { select: { students: true } },
      },
      orderBy: { gradeLevel: 'asc' },
    }),
    prisma.teacher.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { name: 'asc' },
    }),
    prisma.institute.findFirst(),
  ]);

  return (
    <ClassListClient
      initialClasses={classes}
      teachers={teachers}
      currency={institute?.currencySymbol || '$'}
    />
  );
}

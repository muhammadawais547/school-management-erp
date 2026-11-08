import React from 'react';
import prisma from '@/lib/prisma';
import { SubjectListClient } from '@/components/subjects/SubjectListClient';

export const dynamic = 'force-dynamic';

export default async function SubjectsPage() {
  const [subjects, classes, teachers] = await Promise.all([
    prisma.subject.findMany({
      include: {
        class: true,
        teacher: true,
      },
      orderBy: [{ class: { gradeLevel: 'asc' } }, { name: 'asc' }],
    }),
    prisma.academicClass.findMany({
      orderBy: { gradeLevel: 'asc' },
    }),
    prisma.teacher.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { name: 'asc' },
    }),
  ]);

  return (
    <SubjectListClient
      initialSubjects={subjects}
      classes={classes}
      teachers={teachers}
    />
  );
}

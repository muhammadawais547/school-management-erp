import React from 'react';
import prisma from '@/lib/prisma';
import { StudentListClient } from '@/components/students/StudentListClient';

export const dynamic = 'force-dynamic';

export default async function StudentsPage() {
  const [students, classes, institute] = await Promise.all([
    prisma.student.findMany({
      include: {
        class: true,
        section: true,
      },
      orderBy: [{ class: { gradeLevel: 'asc' } }, { rollNo: 'asc' }],
    }),
    prisma.academicClass.findMany({
      include: {
        sections: true,
      },
      orderBy: { gradeLevel: 'asc' },
    }),
    prisma.institute.findFirst(),
  ]);

  return (
    <StudentListClient
      initialStudents={students}
      classes={classes}
      currency={institute?.currencySymbol || '$'}
    />
  );
}

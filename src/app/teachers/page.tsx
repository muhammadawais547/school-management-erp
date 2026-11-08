import React from 'react';
import prisma from '@/lib/prisma';
import { TeacherListClient } from '@/components/teachers/TeacherListClient';

export const dynamic = 'force-dynamic';

export default async function TeachersPage() {
  const [teachers, institute] = await Promise.all([
    prisma.teacher.findMany({
      include: {
        sections: {
          include: { class: true },
        },
        subjects: {
          include: { class: true },
        },
      },
      orderBy: { name: 'asc' },
    }),
    prisma.institute.findFirst(),
  ]);

  return (
    <TeacherListClient
      initialTeachers={teachers}
      currency={institute?.currencySymbol || '$'}
    />
  );
}

import React from 'react';
import prisma from '@/lib/prisma';
import { TimetableClient } from '@/components/timetable/TimetableClient';

export const dynamic = 'force-dynamic';

export default async function TimetablePage() {
  const [classes, slots, teachers] = await Promise.all([
    prisma.academicClass.findMany({
      include: {
        sections: true,
        subjects: true,
      },
      orderBy: { gradeLevel: 'asc' },
    }),
    prisma.timetableSlot.findMany({
      include: {
        subject: true,
        teacher: true,
        class: true,
        section: true,
      },
      orderBy: [{ dayOfWeek: 'asc' }, { periodNumber: 'asc' }],
    }),
    prisma.teacher.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { name: 'asc' },
    }),
  ]);

  return (
    <TimetableClient
      classes={classes}
      initialSlots={slots}
      teachers={teachers}
    />
  );
}

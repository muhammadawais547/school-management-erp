import React from 'react';
import prisma from '@/lib/prisma';
import { AttendanceClient } from '@/components/attendance/AttendanceClient';

export const dynamic = 'force-dynamic';

export default async function AttendancePage() {
  const classes = await prisma.academicClass.findMany({
    include: {
      sections: true,
    },
    orderBy: { gradeLevel: 'asc' },
  });

  return <AttendanceClient classes={classes} />;
}

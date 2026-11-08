import React from 'react';
import prisma from '@/lib/prisma';
import { FeeSlipListClient } from '@/components/fees/FeeSlipListClient';

export const dynamic = 'force-dynamic';

export default async function FeeSlipsPage() {
  const [slips, classes, students, institute] = await Promise.all([
    prisma.feeSlip.findMany({
      include: {
        student: true,
        class: true,
        section: true,
        payments: {
          include: { receipt: true },
        },
      },
      orderBy: { issueDate: 'desc' },
    }),
    prisma.academicClass.findMany({
      include: { sections: true },
      orderBy: { gradeLevel: 'asc' },
    }),
    prisma.student.findMany({
      where: { status: 'ACTIVE' },
      include: { class: true, section: true },
      orderBy: [{ class: { gradeLevel: 'asc' } }, { rollNo: 'asc' }],
    }),
    prisma.institute.findFirst(),
  ]);

  return (
    <FeeSlipListClient
      initialSlips={slips}
      classes={classes}
      students={students}
      currency={institute?.currencySymbol || '$'}
    />
  );
}

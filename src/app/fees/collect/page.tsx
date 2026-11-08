import React from 'react';
import prisma from '@/lib/prisma';
import { CollectCashClient } from '@/components/fees/CollectCashClient';

export const dynamic = 'force-dynamic';

export default async function CollectFeesPage() {
  const [students, slips, institute] = await Promise.all([
    prisma.student.findMany({
      where: { status: 'ACTIVE' },
      include: { class: true, section: true },
      orderBy: [{ class: { gradeLevel: 'asc' } }, { rollNo: 'asc' }],
    }),
    prisma.feeSlip.findMany({
      where: {
        balance: { gt: 0 },
      },
      include: {
        student: {
          include: { class: true, section: true },
        },
        class: true,
        section: true,
      },
      orderBy: [{ dueDate: 'asc' }, { slipNumber: 'asc' }],
    }),
    prisma.institute.findFirst(),
  ]);

  return (
    <CollectCashClient
      students={students}
      slips={slips}
      currency={institute?.currencySymbol || '$'}
    />
  );
}

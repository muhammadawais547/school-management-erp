import React from 'react';
import prisma from '@/lib/prisma';
import { DefaultersClient } from '@/components/fees/DefaultersClient';

export const dynamic = 'force-dynamic';

export default async function FeeDefaultersPage() {
  const [defaulterSlips, institute] = await Promise.all([
    prisma.feeSlip.findMany({
      where: {
        status: { in: ['UNPAID', 'PARTIAL', 'OVERDUE'] },
        balance: { gt: 0 },
      },
      include: {
        student: {
          include: { class: true, section: true },
        },
      },
      orderBy: [{ dueDate: 'asc' }, { balance: 'desc' }],
    }),
    prisma.institute.findFirst(),
  ]);

  const totalDefaulterAmount = defaulterSlips.reduce((acc, s) => acc + s.balance, 0);

  return (
    <DefaultersClient
      slips={defaulterSlips}
      totalDefaulterAmount={totalDefaulterAmount}
      currency={institute?.currencySymbol || '$'}
    />
  );
}

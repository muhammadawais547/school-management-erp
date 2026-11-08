import React from 'react';
import prisma from '@/lib/prisma';
import { FeeStructureClient } from '@/components/fees/FeeStructureClient';

export const dynamic = 'force-dynamic';

export default async function FeeStructuresPage() {
  const [structures, classes, institute] = await Promise.all([
    prisma.feeStructure.findMany({
      include: { class: true },
      orderBy: [{ class: { gradeLevel: 'asc' } }, { feeType: 'asc' }],
    }),
    prisma.academicClass.findMany({
      orderBy: { gradeLevel: 'asc' },
    }),
    prisma.institute.findFirst(),
  ]);

  return (
    <FeeStructureClient
      initialStructures={structures}
      classes={classes}
      currency={institute?.currencySymbol || '$'}
    />
  );
}

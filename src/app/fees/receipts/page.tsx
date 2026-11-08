import React from 'react';
import prisma from '@/lib/prisma';
import { ReceiptListClient } from '@/components/fees/ReceiptListClient';

export const dynamic = 'force-dynamic';

export default async function FeeReceiptsPage() {
  const [receipts, institute] = await Promise.all([
    prisma.feeReceipt.findMany({
      include: {
        student: {
          include: { class: true, section: true },
        },
        feeSlip: true,
        feePayment: true,
      },
      orderBy: { receiptDate: 'desc' },
    }),
    prisma.institute.findFirst(),
  ]);

  return (
    <ReceiptListClient
      initialReceipts={receipts}
      currency={institute?.currencySymbol || '$'}
    />
  );
}

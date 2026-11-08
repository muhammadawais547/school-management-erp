import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Printer, CheckCircle, GraduationCap, ShieldCheck } from 'lucide-react';
import { getFeeReceiptById } from '@/actions/fees';
import { formatCurrency, formatDate, numberToWords } from '@/lib/utils';
import { PrintButton } from '@/components/ui/PrintButton';

export const dynamic = 'force-dynamic';

export default async function PrintableFeeReceiptPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const result = await getFeeReceiptById(resolvedParams.id);

  if (!result.success || !result.data) {
    notFound();
  }

  const { receipt, institute } = result.data;
  const currency = institute?.currencySymbol || '$';

  return (
    <div className="space-y-6">
      {/* Top Action Bar (Hidden in print) */}
      <div className="flex items-center justify-between no-print bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <Link
          href="/fees/receipts"
          className="inline-flex items-center gap-2 text-xs font-bold text-indigo-600 hover:text-indigo-800"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Receipts Ledger</span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href={`/fees/slips/${receipt.feeSlip.id}`}
            className="text-xs font-bold text-slate-600 hover:underline"
          >
            View Parent Fee Slip →
          </Link>
          <PrintButton label="Print Official Receipt" />
        </div>
      </div>

      {/* Official Voucher Card */}
      <div className="printable-card max-w-3xl mx-auto bg-white p-8 sm:p-10 rounded-3xl border-2 border-slate-800 shadow-xl text-slate-900">
        {/* Institutional Header */}
        <div className="text-center pb-6 border-b-2 border-slate-800">
          <div className="flex items-center justify-center gap-2 mb-1">
            <GraduationCap className="w-7 h-7 text-indigo-700" />
            <h1 className="text-xl sm:text-2xl font-black tracking-tight uppercase">
              {institute?.name || 'Apex International Grammar School'}
            </h1>
          </div>
          <p className="text-xs text-slate-600 font-medium">
            {institute?.address} • Phone: {institute?.phone} • Email: {institute?.email}
          </p>
          <div className="mt-3 inline-flex items-center gap-2 px-4 py-1 rounded-sm bg-slate-900 text-white font-extrabold text-xs uppercase tracking-widest shadow-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>OFFICIAL FEE CASH PAYMENT RECEIPT</span>
          </div>
        </div>

        {/* Voucher Meta Strip */}
        <div className="grid grid-cols-2 gap-4 py-4 border-b border-slate-300 text-xs">
          <div>
            <span className="text-slate-500 font-semibold block text-[10px] uppercase">Receipt Number</span>
            <strong className="font-mono text-base font-black text-indigo-900">{receipt.receiptNumber}</strong>
          </div>
          <div className="text-right">
            <span className="text-slate-500 font-semibold block text-[10px] uppercase">Date of Payment</span>
            <strong className="text-sm font-bold text-slate-900">{formatDate(receipt.receiptDate)}</strong>
          </div>
          <div>
            <span className="text-slate-500 font-semibold block text-[10px] uppercase">Fee Slip Ref</span>
            <span className="font-mono font-bold text-slate-700">{receipt.feeSlip.slipNumber}</span>
          </div>
          <div className="text-right">
            <span className="text-slate-500 font-semibold block text-[10px] uppercase">Payment Mode</span>
            <span className="inline-block px-2.5 py-0.5 rounded-sm bg-emerald-100 text-emerald-900 font-black text-[11px] uppercase">
              {receipt.feePayment?.paymentMode || 'CASH'}
            </span>
          </div>
        </div>

        {/* Student Bio Details */}
        <div className="my-5 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
          <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
            <span className="text-slate-500 font-semibold">Received with thanks from Student:</span>
            <strong className="text-sm font-extrabold text-slate-900">
              {receipt.student.firstName} {receipt.student.lastName}
            </strong>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-200 text-[11px]">
            <div>
              <span className="text-slate-400 font-semibold block">Admission No:</span>
              <strong className="font-mono">{receipt.student.admissionNo}</strong>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block">Roll Number:</span>
              <strong>{receipt.student.rollNo}</strong>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block">Class & Section:</span>
              <strong>{receipt.student.class?.name} ({receipt.student.section?.name})</strong>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block">Parent / Guardian:</span>
              <strong>{receipt.student.parentName}</strong>
            </div>
          </div>
        </div>

        {/* Payment Line Item Description */}
        <div className="my-6">
          <table className="w-full text-left text-xs border border-slate-300">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-300 font-bold text-slate-700">
                <th className="py-2.5 px-3 border-r border-slate-300">Description / Fee Head</th>
                <th className="py-2.5 px-3 border-r border-slate-300">Billing Period</th>
                <th className="py-2.5 px-3 text-right">Amount Paid</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-3 px-3 border-r border-slate-200 font-semibold text-slate-900">
                  {receipt.feeSlip.title}
                  <span className="block text-[11px] text-slate-500 font-normal">
                    Cash settlement recorded at administrative counter
                  </span>
                </td>
                <td className="py-3 px-3 border-r border-slate-200 text-slate-700">
                  {receipt.feeSlip.month} {receipt.feeSlip.year}
                </td>
                <td className="py-3 px-3 text-right font-black text-sm text-emerald-800">
                  {formatCurrency(receipt.amountPaid, currency)}
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-800 bg-slate-50 font-black">
                <td colSpan={2} className="py-2.5 px-3 border-r border-slate-300 uppercase text-slate-900">
                  Total Cash Received
                </td>
                <td className="py-2.5 px-3 text-right text-emerald-900 text-base">
                  {formatCurrency(receipt.amountPaid, currency)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Amount in Words */}
        <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 text-xs">
          <span className="text-slate-500 font-semibold">Amount in Words: </span>
          <strong className="text-slate-900 font-bold italic">
            {numberToWords(receipt.amountPaid)}
          </strong>
        </div>

        {/* Outstanding Dues Notice */}
        <div className="my-4 p-3 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
          <span className="text-slate-600 font-semibold">Remaining Balance for this Invoice:</span>
          {receipt.balanceRemaining > 0 ? (
            <strong className="text-amber-700 font-extrabold text-sm">
              {formatCurrency(receipt.balanceRemaining, currency)} (Partially Paid)
            </strong>
          ) : (
            <strong className="text-emerald-700 font-extrabold text-sm flex items-center gap-1">
              <CheckCircle className="w-4 h-4" />
              <span>Full Payment Settled ($0.00 Balance)</span>
            </strong>
          )}
        </div>

        {/* Footer & Stamps */}
        <div className="mt-12 pt-6 border-t border-slate-300 grid grid-cols-2 gap-6 items-end text-xs">
          <div>
            <div className="text-[10px] text-slate-400 space-y-0.5">
              <p>Collected By: <strong>{receipt.feePayment?.collectedBy || 'Admin Cashier'}</strong></p>
              <p>Transaction Ref: <strong>{receipt.feePayment?.transactionRef || 'N/A'}</strong></p>
              <p>Generated electronically by Apex ERP. Signature confirms receipt of cash.</p>
            </div>
          </div>

          <div className="text-center ml-auto">
            <div className="w-40 border-b-2 border-slate-800 mb-2" />
            <span className="font-extrabold text-slate-800 uppercase text-[11px] tracking-wider block">
              Authorized Accounts Officer / Cashier
            </span>
            <span className="text-[10px] text-slate-400 italic">Signature & Official Stamp</span>
          </div>
        </div>
      </div>
    </div>
  );
}

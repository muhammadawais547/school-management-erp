import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Printer, Wallet, Receipt, GraduationCap } from 'lucide-react';
import { getFeeSlipById } from '@/actions/fees';
import { formatCurrency, formatDate } from '@/lib/utils';
import { StatusBadge } from '@/components/ui/Badge';
import { PrintButton } from '@/components/ui/PrintButton';

export const dynamic = 'force-dynamic';

export default async function PrintableFeeSlipPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const result = await getFeeSlipById(resolvedParams.id);

  if (!result.success || !result.data) {
    notFound();
  }

  const { slip, institute } = result.data;
  const currency = institute?.currencySymbol || '$';

  let breakdown: Array<{ item: string; amount: number }> = [];
  try {
    breakdown = JSON.parse(slip.breakdownJson);
  } catch (e) {
    breakdown = [{ item: slip.title, amount: slip.totalAmount }];
  }

  const lateSurcharge = slip.lateFine > 0 ? slip.lateFine : 20;
  const amountAfterDue = slip.totalAmount + lateSurcharge;

  // Single slip copy component to render identically for Student Copy & School Copy
  const SlipCopy = ({ copyTitle }: { copyTitle: string }) => (
    <div className="flex-1 p-5 border-2 border-slate-800 rounded-xl bg-white text-slate-900 text-xs flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="text-center pb-3 border-b-2 border-slate-800">
          <div className="flex items-center justify-center gap-2">
            <GraduationCap className="w-5 h-5 text-indigo-700" />
            <h2 className="text-sm font-black tracking-tight uppercase">
              {institute?.name || 'Apex International Grammar School'}
            </h2>
          </div>
          <p className="text-[10px] text-slate-600 font-medium">
            {institute?.address} • Ph: {institute?.phone}
          </p>
          <div className="mt-1.5 inline-block px-3 py-0.5 rounded-sm bg-slate-900 text-white font-extrabold text-[10px] tracking-wider uppercase">
            FEES CHALLAN / SLIP ({copyTitle})
          </div>
        </div>

        {/* Invoice Meta */}
        <div className="grid grid-cols-2 gap-2 py-2.5 border-b border-slate-200 text-[11px]">
          <div>
            <span className="text-slate-500 font-semibold">Slip No: </span>
            <strong className="font-mono font-bold text-indigo-900">{slip.slipNumber}</strong>
          </div>
          <div className="text-right">
            <span className="text-slate-500 font-semibold">Billing Month: </span>
            <strong>{slip.month} {slip.year}</strong>
          </div>
          <div>
            <span className="text-slate-500 font-semibold">Issue Date: </span>
            <span>{formatDate(slip.issueDate)}</span>
          </div>
          <div className="text-right">
            <span className="text-rose-600 font-bold">Due Date: </span>
            <strong className="text-rose-700">{formatDate(slip.dueDate)}</strong>
          </div>
        </div>

        {/* Student Details */}
        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 my-2 text-[11px] space-y-1">
          <div className="flex justify-between">
            <span className="text-slate-500 font-semibold">Student Name:</span>
            <strong className="text-slate-900">{slip.student.firstName} {slip.student.lastName}</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 font-semibold">Admission No:</span>
            <strong className="font-mono">{slip.student.admissionNo}</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 font-semibold">Class & Section:</span>
            <strong>{slip.class.name} ({slip.section.name})</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 font-semibold">Roll No:</span>
            <strong>{slip.student.rollNo}</strong>
          </div>
        </div>

        {/* Fee Items Table */}
        <div className="mt-3">
          <table className="w-full text-left text-[11px] border border-slate-300">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-300 font-bold text-slate-700">
                <th className="py-1.5 px-2 border-r border-slate-300">#</th>
                <th className="py-1.5 px-2 border-r border-slate-300">Particulars / Fee Item</th>
                <th className="py-1.5 px-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {breakdown.map((item, idx) => (
                <tr key={idx}>
                  <td className="py-1.5 px-2 border-r border-slate-200 text-slate-500">{idx + 1}</td>
                  <td className="py-1.5 px-2 border-r border-slate-200 font-medium">{item.item}</td>
                  <td className="py-1.5 px-2 text-right font-bold text-slate-800">
                    {formatCurrency(item.amount, currency)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-800 font-extrabold bg-slate-50">
                <td colSpan={2} className="py-1.5 px-2 border-r border-slate-300 text-slate-900 uppercase">
                  Payable Within Due Date
                </td>
                <td className="py-1.5 px-2 text-right text-indigo-900 text-xs">
                  {formatCurrency(slip.totalAmount, currency)}
                </td>
              </tr>
              <tr className="border-t border-slate-200 text-rose-700 font-semibold">
                <td colSpan={2} className="py-1 px-2 border-r border-slate-200 text-[10px]">
                  Late Payment Surcharge (After Due Date)
                </td>
                <td className="py-1 px-2 text-right text-[10px]">
                  +{formatCurrency(lateSurcharge, currency)}
                </td>
              </tr>
              <tr className="border-t border-slate-300 font-extrabold bg-rose-50/50 text-rose-900">
                <td colSpan={2} className="py-1.5 px-2 border-r border-slate-200 uppercase text-[10px]">
                  Payable After Due Date
                </td>
                <td className="py-1.5 px-2 text-right text-xs">
                  {formatCurrency(amountAfterDue, currency)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Status Notice */}
        <div className="mt-3 p-2 rounded-md border text-[10px] flex items-center justify-between bg-slate-50">
          <div>
            <span className="font-bold text-slate-700">Payment Status: </span>
            <span className="font-extrabold text-indigo-700">{slip.status}</span>
          </div>
          {slip.balance > 0 ? (
            <span className="font-bold text-amber-700">Dues: {formatCurrency(slip.balance, currency)}</span>
          ) : (
            <span className="font-bold text-emerald-700">Settled In Full</span>
          )}
        </div>
      </div>

      {/* Footer Notes & Signatures */}
      <div className="mt-6 pt-3 border-t border-slate-300 space-y-4">
        <div className="text-[9px] text-slate-500 leading-tight">
          <strong>Note:</strong> Cash must be submitted directly to the School Accounts Office during counter hours (8:30 AM - 1:30 PM). An official Fee Receipt will be issued upon cash reception.
        </div>
        <div className="flex justify-between items-end pt-4 text-[10px]">
          <div className="text-center">
            <div className="w-24 border-b border-slate-400 mb-1" />
            <span className="text-slate-500 font-semibold">Depositor</span>
          </div>
          <div className="text-center">
            <div className="w-28 border-b border-slate-400 mb-1" />
            <span className="text-slate-500 font-semibold">Cashier / Accountant</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Action Bar (Hidden during print) */}
      <div className="flex items-center justify-between no-print bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <Link
          href="/fees/slips"
          className="inline-flex items-center gap-2 text-xs font-bold text-indigo-600 hover:text-indigo-800"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Slips</span>
        </Link>

        <div className="flex items-center gap-3">
          {slip.balance > 0 && (
            <Link
              href={`/fees/collect?slipId=${slip.id}`}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
            >
              <Wallet className="w-4 h-4" />
              <span>Collect Cash Payment</span>
            </Link>
          )}

          {slip.receipts.length > 0 && (
            <Link
              href={`/fees/receipts/${slip.receipts[0].id}`}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
            >
              <Receipt className="w-4 h-4" />
              <span>View Official Receipt</span>
            </Link>
          )}

          <PrintButton />
        </div>
      </div>

      {/* Printable Dual Copy Layout */}
      <div className="printable-card max-w-5xl mx-auto flex flex-col md:flex-row gap-6 bg-white p-6 rounded-3xl border border-slate-300 shadow-md">
        <SlipCopy copyTitle="STUDENT / PARENT COPY" />
        <SlipCopy copyTitle="SCHOOL / CASHIER COPY" />
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Receipt,
  Search,
  Printer,
  Calendar,
  Wallet,
  CheckCircle2,
  Filter
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

interface ReceiptListClientProps {
  initialReceipts: any[];
  currency: string;
}

export function ReceiptListClient({ initialReceipts, currency }: ReceiptListClientProps) {
  const [receipts, setReceipts] = useState(initialReceipts);
  const [search, setSearch] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const filteredReceipts = receipts.filter(r => {
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchReceipt = r.receiptNumber.toLowerCase().includes(q);
      const matchSlip = r.feeSlip.slipNumber.toLowerCase().includes(q);
      const matchName = `${r.student.firstName} ${r.student.lastName}`.toLowerCase().includes(q);
      const matchAdm = r.student.admissionNo.toLowerCase().includes(q);
      if (!matchReceipt && !matchSlip && !matchName && !matchAdm) return false;
    }
    if (fromDate && new Date(r.receiptDate) < new Date(fromDate)) return false;
    if (toDate && new Date(r.receiptDate) > new Date(toDate)) return false;
    return true;
  });

  const totalCollected = filteredReceipts.reduce((acc, r) => acc + r.amountPaid, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Fee Payment Receipts (Realized Cash Inflow)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Official proof of payment generated automatically upon manual cash collection at the fee counter.
          </p>
        </div>

        <Link
          href="/fees/collect"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-200 transition"
        >
          <Wallet className="w-4 h-4" />
          <span>Collect Cash Payment</span>
        </Link>
      </div>

      {/* KPI Total Collections */}
      <div className="p-5 bg-linear-to-r from-emerald-800 to-teal-900 rounded-2xl text-white shadow-md flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-emerald-200 uppercase tracking-wider">
            Total Realized Cash Collected
          </span>
          <div className="text-2xl sm:text-3xl font-black mt-1">
            {formatCurrency(totalCollected, currency)}
          </div>
        </div>
        <div className="text-right text-xs text-emerald-200">
          <span>Total Receipts: <strong>{filteredReceipts.length}</strong></span>
        </div>
      </div>

      {/* Search & Date Filter */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center gap-3 justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search receipt #, student, slip #..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs font-medium border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-slate-50"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto text-xs font-semibold">
          <span className="text-slate-400">From:</span>
          <input
            type="date"
            value={fromDate}
            onChange={e => setFromDate(e.target.value)}
            className="px-2.5 py-1.5 border border-slate-200 rounded-xl bg-slate-50"
          />
          <span className="text-slate-400">To:</span>
          <input
            type="date"
            value={toDate}
            onChange={e => setToDate(e.target.value)}
            className="px-2.5 py-1.5 border border-slate-200 rounded-xl bg-slate-50"
          />
          {(search || fromDate || toDate) && (
            <button
              onClick={() => {
                setSearch('');
                setFromDate('');
                setToDate('');
              }}
              className="text-indigo-600 hover:underline ml-2"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Receipts Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Receipt #</th>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Class</th>
                <th className="py-3 px-4">Slip Ref</th>
                <th className="py-3 px-4">Date Issued</th>
                <th className="py-3 px-4">Payment Mode</th>
                <th className="py-3 px-4">Amount Paid</th>
                <th className="py-3 px-4">Balance Remaining</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredReceipts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    No payment receipts found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredReceipts.map(r => (
                  <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-indigo-700">
                      {r.receiptNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <Link
                        href={`/students/${r.student.id}`}
                        className="font-bold text-slate-900 hover:text-indigo-600 block"
                      >
                        {r.student.firstName} {r.student.lastName}
                      </Link>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {r.student.admissionNo}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700">
                      {r.student.class?.name} ({r.student.section?.name})
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">
                      <Link href={`/fees/slips/${r.feeSlip.id}`} className="hover:underline">
                        {r.feeSlip.slipNumber}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      {formatDate(r.receiptDate)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-sm bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                        {r.feePayment?.paymentMode || 'CASH'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-emerald-700 text-sm">
                      {formatCurrency(r.amountPaid, currency)}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-600">
                      {r.balanceRemaining > 0 ? (
                        <span className="text-amber-700 font-bold">{formatCurrency(r.balanceRemaining, currency)}</span>
                      ) : (
                        <span className="text-emerald-600 font-bold">Settled ($0.00)</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/fees/receipts/${r.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl font-bold transition text-xs"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Print Receipt</span>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

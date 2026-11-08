'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  AlertCircle,
  Phone,
  Search,
  Wallet,
  Printer,
  Calendar,
  Clock,
  Filter
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { StatusBadge } from '@/components/ui/Badge';

interface DefaultersClientProps {
  slips: any[];
  totalDefaulterAmount: number;
  currency: string;
}

export function DefaultersClient({ slips, totalDefaulterAmount, currency }: DefaultersClientProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredSlips = slips.filter(s => {
    if (statusFilter !== 'ALL' && s.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchSlip = s.slipNumber.toLowerCase().includes(q);
      const matchName = `${s.student.firstName} ${s.student.lastName}`.toLowerCase().includes(q);
      const matchAdm = s.student.admissionNo.toLowerCase().includes(q);
      const matchPhone = s.student.parentPhone?.includes(q);
      if (!matchSlip && !matchName && !matchAdm && !matchPhone) return false;
    }
    return true;
  });

  const totalFilteredDue = filteredSlips.reduce((acc, s) => acc + s.balance, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Fee Defaulters & Outstanding Balances
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track students with overdue or partial fee balances. Follow up with parents and collect cash at the counter.
          </p>
        </div>

        <Link
          href="/fees/collect"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-200 transition"
        >
          <Wallet className="w-4 h-4" />
          <span>Collect Cash Now</span>
        </Link>
      </div>

      {/* KPI Total Balances */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-linear-to-r from-amber-700 to-amber-900 rounded-2xl text-white shadow-md">
          <span className="text-xs font-semibold text-amber-200 uppercase tracking-wider">
            Total Outstanding Receivables
          </span>
          <div className="text-2xl sm:text-3xl font-black mt-1">
            {formatCurrency(totalDefaulterAmount, currency)}
          </div>
          <span className="text-[11px] text-amber-300 mt-1 block">
            Across {slips.length} pending student invoices
          </span>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Critical Overdue Invoices
          </span>
          <div className="text-2xl font-extrabold text-rose-700 mt-1">
            {slips.filter(s => s.status === 'OVERDUE').length}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Past final deadline</span>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Partial Balances
          </span>
          <div className="text-2xl font-extrabold text-amber-600 mt-1">
            {slips.filter(s => s.status === 'PARTIAL').length}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Partially submitted cash</span>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center gap-3 justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search student, parent phone, slip #..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs font-medium border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-slate-50"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs font-semibold border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-slate-50 text-slate-700"
          >
            <option value="ALL">All Dues Statuses</option>
            <option value="OVERDUE">Overdue Only</option>
            <option value="UNPAID">Unpaid Only</option>
            <option value="PARTIAL">Partial Only</option>
          </select>
          <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">
            Showing: <strong>{filteredSlips.length}</strong>
          </span>
        </div>
      </div>

      {/* Defaulter Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Slip #</th>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Class</th>
                <th className="py-3 px-4">Parent / Contact</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4">Total Billed</th>
                <th className="py-3 px-4">Balance Pending</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Counter Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSlips.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    No outstanding fee balances found matching the filter.
                  </td>
                </tr>
              ) : (
                filteredSlips.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-indigo-700">
                      {s.slipNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <Link
                        href={`/students/${s.student.id}`}
                        className="font-bold text-slate-900 hover:text-indigo-600 block"
                      >
                        {s.student.firstName} {s.student.lastName}
                      </Link>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {s.student.admissionNo} • Roll: {s.student.rollNo}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700">
                      {s.student.class?.name} ({s.student.section?.name})
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-800 block">{s.student.parentName}</span>
                      <a
                        href={`tel:${s.student.parentPhone}`}
                        className="flex items-center gap-1 text-[11px] text-indigo-600 hover:underline mt-0.5"
                      >
                        <Phone className="w-3 h-3" />
                        <span>{s.student.parentPhone}</span>
                      </a>
                    </td>
                    <td className="py-3.5 px-4 text-rose-700 font-semibold">
                      {formatDate(s.dueDate)}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-700">
                      {formatCurrency(s.totalAmount, currency)}
                    </td>
                    <td className="py-3.5 px-4 font-black text-amber-700 text-sm">
                      {formatCurrency(s.balance, currency)}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={s.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/fees/collect?slipId=${s.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition text-xs shadow-2xs"
                      >
                        <Wallet className="w-3.5 h-3.5" />
                        <span>Collect Cash</span>
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

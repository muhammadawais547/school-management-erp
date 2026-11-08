import React from 'react';
import Link from 'next/link';
import {
  GraduationCap,
  Users,
  School,
  Wallet,
  AlertCircle,
  CalendarCheck,
  Receipt,
  ArrowUpRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  DollarSign
} from 'lucide-react';
import { getDashboardStats } from '@/actions/dashboard';
import { formatCurrency, formatDate } from '@/lib/utils';
import { StatusBadge } from '@/components/ui/Badge';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const result = await getDashboardStats();

  if (!result.success || !result.stats) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-red-200">
        <h2 className="text-lg font-bold text-red-600">Failed to load dashboard data</h2>
        <p className="text-sm text-slate-500 mt-1">{result.error}</p>
      </div>
    );
  }

  const { stats, recentStudents, recentPayments, notifications, institute } = result;
  const currency = institute?.currencySymbol || '$';

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-linear-to-r from-indigo-900 via-indigo-800 to-indigo-700 text-white shadow-xl">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-indigo-200 mb-3">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            School ERP System Online & Ready
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {institute?.name || 'Apex International Grammar School'}
          </h1>
          <p className="text-sm sm:text-base text-indigo-100 mt-2 font-medium">
            Administrative overview for academic session {institute?.currentSession || '2024-2025'}. Manage admissions, attendance, and manual fee collections seamlessly.
          </p>

          <div className="flex flex-wrap gap-3 mt-6">
            <Link
              href="/fees/collect"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition shadow-lg shadow-emerald-900/30"
            >
              <Wallet className="w-4 h-4" />
              Collect Cash Fee
            </Link>
            <Link
              href="/attendance"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition backdrop-blur-md"
            >
              <CalendarCheck className="w-4 h-4 text-indigo-300" />
              Take Attendance
            </Link>
            <Link
              href="/students?action=new"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition backdrop-blur-md"
            >
              <GraduationCap className="w-4 h-4 text-indigo-300" />
              New Admission
            </Link>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-12 -bottom-12 w-80 h-80 rounded-full bg-indigo-500/20 blur-3xl" />
      </div>

      {/* Primary KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Students */}
        <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md transition group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Students
            </span>
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 group-hover:scale-110 transition-transform">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-slate-900">
              {stats.totalStudents}
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Active Enrollment</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between text-xs text-slate-500">
            <span>Classes: {stats.totalClasses}</span>
            <Link href="/students" className="font-semibold text-indigo-600 hover:underline">
              View Roster →
            </Link>
          </div>
        </div>

        {/* Total Teachers */}
        <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md transition group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Faculty & Staff
            </span>
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-slate-900">
              {stats.totalTeachers}
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-600 mt-1">
              <span>Verified Faculty</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between text-xs text-slate-500">
            <span>Sections: {stats.totalSections}</span>
            <Link href="/teachers" className="font-semibold text-purple-600 hover:underline">
              Manage Staff →
            </Link>
          </div>
        </div>

        {/* Total Collected Cash Fees */}
        <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md transition group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Collected Fees
            </span>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 group-hover:scale-110 transition-transform">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-emerald-700">
              {formatCurrency(stats.totalCollectedFees, currency)}
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 mt-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Realized Cash Collection</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between text-xs text-slate-500">
            <span>Paid Slips: {stats.paidSlipsCount}</span>
            <Link href="/fees/receipts" className="font-semibold text-emerald-600 hover:underline">
              Receipts Log →
            </Link>
          </div>
        </div>

        {/* Pending Balances / Dues */}
        <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md transition group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Pending Dues
            </span>
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 group-hover:scale-110 transition-transform">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-amber-700">
              {formatCurrency(stats.totalPendingFees, currency)}
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 mt-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{stats.unpaidSlipsCount + stats.partialSlipsCount + stats.overdueSlipsCount} Pending Invoices</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between text-xs text-slate-500">
            <span>Overdue: {stats.overdueSlipsCount}</span>
            <Link href="/fees/defaulters" className="font-semibold text-amber-700 hover:underline">
              Defaulter List →
            </Link>
          </div>
        </div>
      </div>

      {/* Middle Grid: Attendance & Fee Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Summary */}
        <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Attendance Overview</h3>
              <p className="text-xs text-slate-500">Daily student presence rate</p>
            </div>
            <Link
              href="/attendance"
              className="text-xs font-bold text-indigo-600 hover:underline"
            >
              Roll Call →
            </Link>
          </div>

          <div className="mt-6 flex items-center justify-center">
            <div className="relative flex items-center justify-center w-36 h-36 rounded-full border-8 border-indigo-100">
              <div className="text-center">
                <span className="text-3xl font-extrabold text-indigo-600">
                  {stats.attendance.percentage}%
                </span>
                <span className="block text-[11px] font-semibold text-slate-400 uppercase">
                  Present
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-6 pt-4 border-t border-slate-100">
            <div className="p-3 bg-emerald-50 rounded-xl">
              <span className="block text-[11px] font-bold text-emerald-800 uppercase">Present</span>
              <span className="text-lg font-bold text-emerald-700">{stats.attendance.present}</span>
            </div>
            <div className="p-3 bg-rose-50 rounded-xl">
              <span className="block text-[11px] font-bold text-rose-800 uppercase">Absent</span>
              <span className="text-lg font-bold text-rose-700">{stats.attendance.absent}</span>
            </div>
            <div className="p-3 bg-amber-50 rounded-xl">
              <span className="block text-[11px] font-bold text-amber-800 uppercase">Late</span>
              <span className="text-lg font-bold text-amber-700">{stats.attendance.late}</span>
            </div>
            <div className="p-3 bg-sky-50 rounded-xl">
              <span className="block text-[11px] font-bold text-sky-800 uppercase">Leave</span>
              <span className="text-lg font-bold text-sky-700">{stats.attendance.leave}</span>
            </div>
          </div>
        </div>

        {/* Fee Collection Status Engine */}
        <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-2xs lg:col-span-2">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Manual Fee Settlement Status</h3>
              <p className="text-xs text-slate-500">Breakdown of generated slips across the school</p>
            </div>
            <Link
              href="/fees/slips"
              className="text-xs font-bold text-indigo-600 hover:underline"
            >
              All Slips →
            </Link>
          </div>

          {/* Progress Bar of Collection */}
          <div className="mt-6 space-y-4">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1.5">
                <span className="text-slate-600">Total Billed Volume: {formatCurrency(stats.totalBilledFees, currency)}</span>
                <span className="text-emerald-600 font-bold">
                  {stats.totalBilledFees > 0
                    ? Math.round((stats.totalCollectedFees / stats.totalBilledFees) * 100)
                    : 0}% Collected
                </span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">
                <div
                  className="bg-emerald-500 h-full"
                  style={{
                    width: `${stats.totalBilledFees > 0 ? (stats.totalCollectedFees / stats.totalBilledFees) * 100 : 0}%`,
                  }}
                />
                <div
                  className="bg-amber-400 h-full"
                  style={{
                    width: `${stats.totalBilledFees > 0 ? (stats.totalPendingFees / stats.totalBilledFees) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
              <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/50">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-xs font-bold text-emerald-900">Paid In Full</span>
                </div>
                <div className="text-xl font-extrabold text-emerald-700 mt-2">
                  {stats.paidSlipsCount}
                </div>
                <span className="text-[11px] text-emerald-800">Slips Settled</span>
              </div>

              <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/50">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span className="text-xs font-bold text-amber-900">Partially Paid</span>
                </div>
                <div className="text-xl font-extrabold text-amber-700 mt-2">
                  {stats.partialSlipsCount}
                </div>
                <span className="text-[11px] text-amber-800">Partial Cash</span>
              </div>

              <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/50">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span className="text-xs font-bold text-rose-900">Unpaid</span>
                </div>
                <div className="text-xl font-extrabold text-rose-700 mt-2">
                  {stats.unpaidSlipsCount}
                </div>
                <span className="text-[11px] text-rose-800">Awaiting Cash</span>
              </div>

              <div className="p-3.5 rounded-xl border border-red-300 bg-red-100/50">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
                  <span className="text-xs font-bold text-red-900">Overdue</span>
                </div>
                <div className="text-xl font-extrabold text-red-700 mt-2">
                  {stats.overdueSlipsCount}
                </div>
                <span className="text-[11px] text-red-800">Past Due Date</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Recent Cash Receipts & Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Cash Fee Transactions */}
        <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-2xs lg:col-span-2">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Recent Manual Cash Collections</h3>
              <p className="text-xs text-slate-500">Latest payments received at the fee counter</p>
            </div>
            <Link
              href="/fees/receipts"
              className="text-xs font-bold text-indigo-600 hover:underline"
            >
              All Receipts →
            </Link>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-2.5 px-3">Receipt #</th>
                  <th className="py-2.5 px-3">Student</th>
                  <th className="py-2.5 px-3">Class</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Mode</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentPayments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-slate-400">
                      No cash transactions recorded yet.
                    </td>
                  </tr>
                ) : (
                  recentPayments.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-3 font-bold text-indigo-700">
                        {p.receipt?.receiptNumber || 'RCT-MANUAL'}
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-bold text-slate-900">
                          {p.student.firstName} {p.student.lastName}
                        </span>
                        <span className="block text-[11px] text-slate-400">
                          {p.student.admissionNo}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-600">
                        {p.student.class.name}
                      </td>
                      <td className="py-3 px-3 text-slate-500">
                        {formatDate(p.paymentDate)}
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-sm bg-emerald-100 text-emerald-800 font-semibold text-[11px]">
                          {p.paymentMode}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-extrabold text-emerald-700">
                        {formatCurrency(p.amountPaid, currency)}
                      </td>
                      <td className="py-3 px-3 text-right">
                        {p.receipt && (
                          <Link
                            href={`/fees/receipts/${p.receipt.id}`}
                            className="inline-flex items-center gap-1 font-bold text-indigo-600 hover:text-indigo-800"
                          >
                            <Receipt className="w-3.5 h-3.5" />
                            <span>Print Receipt</span>
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Institutional Notifications */}
        <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Institutional Board</h3>
              <p className="text-xs text-slate-500">Announcements & circulars</p>
            </div>
          </div>

          <div className="mt-4 space-y-3.5">
            {notifications.map(n => (
              <div
                key={n.id}
                className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm bg-indigo-100 text-indigo-800">
                    {n.type}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {formatDate(n.createdAt)}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 mt-1.5">{n.title}</h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{n.message}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

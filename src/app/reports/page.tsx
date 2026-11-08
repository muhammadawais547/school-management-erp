import React from 'react';
import Link from 'next/link';
import {
  FileSpreadsheet,
  GraduationCap,
  Wallet,
  Users,
  Award,
  ArrowRight,
  Printer
} from 'lucide-react';
import { getComprehensiveReports } from '@/actions/reports';
import { formatCurrency } from '@/lib/utils';
import { PrintButton } from '@/components/ui/PrintButton';

export const dynamic = 'force-dynamic';

export default async function ReportsPage() {
  const result = await getComprehensiveReports();

  if (!result.success || !result.data) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-red-200">
        <h2 className="text-lg font-bold text-red-600">Failed to load reports</h2>
      </div>
    );
  }

  const {
    totalStudents,
    maleStudents,
    femaleStudents,
    classEnrollment,
    totalTeachers,
    totalSalaryExpense,
    financials,
    institute,
  } = result.data;

  const currency = institute?.currencySymbol || '$';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs no-print">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Institutional Reports & Financial Ledgers
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Official executive summary of student demographics, staff payroll, and realized cash fee settlements.
          </p>
        </div>
        <PrintButton label="Print Audit Report" />
      </div>

      {/* Printable Report Document Card */}
      <div className="printable-card bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-md space-y-8">
        {/* Report Header */}
        <div className="text-center pb-6 border-b-2 border-slate-900">
          <div className="flex items-center justify-center gap-2 mb-1">
            <GraduationCap className="w-8 h-8 text-indigo-700" />
            <h2 className="text-2xl font-black uppercase tracking-tight">
              {institute?.name || 'Apex International Grammar School'}
            </h2>
          </div>
          <p className="text-xs text-slate-600 font-medium">
            Academic Session {institute?.currentSession || '2024-2025'} • Annual Operations & Financial Audit
          </p>
        </div>

        {/* 1. Institutional Summary Metrics */}
        <div>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-200 flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-indigo-600" />
            <span>1. Enrollment & Staffing Metrics</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Total Students</span>
              <div className="text-2xl font-extrabold text-slate-900 mt-1">{totalStudents}</div>
              <span className="text-[11px] text-slate-500">
                {maleStudents} Male • {femaleStudents} Female
              </span>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Teaching Staff</span>
              <div className="text-2xl font-extrabold text-slate-900 mt-1">{totalTeachers}</div>
              <span className="text-[11px] text-slate-500">Verified Full-time</span>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Monthly Payroll</span>
              <div className="text-2xl font-extrabold text-purple-700 mt-1">
                {formatCurrency(totalSalaryExpense, currency)}
              </div>
              <span className="text-[11px] text-slate-500">Faculty Remuneration</span>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Realized Revenue</span>
              <div className="text-2xl font-extrabold text-emerald-700 mt-1">
                {formatCurrency(financials.totalCollected, currency)}
              </div>
              <span className="text-[11px] text-slate-500">Cash Collections</span>
            </div>
          </div>
        </div>

        {/* 2. Class Enrollment Breakdown */}
        <div>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-200 flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-600" />
            <span>2. Class Enrollment Roster</span>
          </h3>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-200">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 font-bold text-slate-700">
                  <th className="py-2.5 px-3 border-r border-slate-200">Grade Level</th>
                  <th className="py-2.5 px-3 border-r border-slate-200 text-center">Male Students</th>
                  <th className="py-2.5 px-3 border-r border-slate-200 text-center">Female Students</th>
                  <th className="py-2.5 px-3 text-right">Total Enrollment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {classEnrollment.map(c => (
                  <tr key={c.className} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 border-r border-slate-200 font-bold text-slate-900">
                      {c.className}
                    </td>
                    <td className="py-2.5 px-3 border-r border-slate-200 text-center">{c.male}</td>
                    <td className="py-2.5 px-3 border-r border-slate-200 text-center">{c.female}</td>
                    <td className="py-2.5 px-3 text-right font-black text-slate-900">{c.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 3. Class Financial Ledger */}
        <div>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-200 flex items-center gap-2">
            <Wallet className="w-4 h-4 text-emerald-600" />
            <span>3. Class-by-Class Fee Collection Ledger</span>
          </h3>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-200">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 font-bold text-slate-700">
                  <th className="py-2.5 px-3 border-r border-slate-200">Class</th>
                  <th className="py-2.5 px-3 border-r border-slate-200 text-right">Billed Amount</th>
                  <th className="py-2.5 px-3 border-r border-slate-200 text-right text-emerald-700">Cash Received</th>
                  <th className="py-2.5 px-3 border-r border-slate-200 text-right text-amber-700">Pending Dues</th>
                  <th className="py-2.5 px-3 text-right">Settlement Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {financials.classFinancials.map(cf => {
                  const rate = cf.billed > 0 ? Math.round((cf.paid / cf.billed) * 100) : 0;
                  return (
                    <tr key={cf.className} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 border-r border-slate-200 font-bold text-slate-900">
                        {cf.className}
                      </td>
                      <td className="py-2.5 px-3 border-r border-slate-200 text-right font-bold text-slate-800">
                        {formatCurrency(cf.billed, currency)}
                      </td>
                      <td className="py-2.5 px-3 border-r border-slate-200 text-right font-extrabold text-emerald-700">
                        {formatCurrency(cf.paid, currency)}
                      </td>
                      <td className="py-2.5 px-3 border-r border-slate-200 text-right font-bold text-amber-700">
                        {formatCurrency(cf.pending, currency)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-indigo-700">
                        {rate}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-900 bg-slate-100 font-black text-xs">
                  <td className="py-3 px-3 border-r border-slate-300 uppercase">Overall Total</td>
                  <td className="py-3 px-3 border-r border-slate-300 text-right">
                    {formatCurrency(financials.totalBilled, currency)}
                  </td>
                  <td className="py-3 px-3 border-r border-slate-300 text-right text-emerald-800 text-sm">
                    {formatCurrency(financials.totalCollected, currency)}
                  </td>
                  <td className="py-3 px-3 border-r border-slate-300 text-right text-amber-800 text-sm">
                    {formatCurrency(financials.totalPending, currency)}
                  </td>
                  <td className="py-3 px-3 text-right text-indigo-900 text-sm">
                    {financials.totalBilled > 0
                      ? Math.round((financials.totalCollected / financials.totalBilled) * 100)
                      : 0}%
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Audit Signatures */}
        <div className="pt-10 border-t border-slate-300 grid grid-cols-2 gap-8 text-xs text-center">
          <div>
            <div className="w-36 border-b-2 border-slate-800 mx-auto mb-2" />
            <span className="font-bold text-slate-800 block">Senior Accountant / Bursar</span>
            <span className="text-[10px] text-slate-400">Financial Audit Certified</span>
          </div>
          <div>
            <div className="w-36 border-b-2 border-slate-800 mx-auto mb-2" />
            <span className="font-bold text-slate-800 block">Principal / Academic Director</span>
            <span className="text-[10px] text-slate-400">Authorized Official Stamp</span>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  FileText,
  Search,
  Plus,
  Printer,
  Wallet,
  Receipt,
  AlertCircle,
  X,
  CheckCircle2,
  Calendar,
  Filter
} from 'lucide-react';
import { StatusBadge } from '@/components/ui/Badge';
import { formatCurrency, formatDate } from '@/lib/utils';
import { generateBulkFeeSlips, generateSingleFeeSlip } from '@/actions/fees';

interface FeeSlipListClientProps {
  initialSlips: any[];
  classes: any[];
  students: any[];
  currency: string;
}

export function FeeSlipListClient({ initialSlips, classes, students, currency }: FeeSlipListClientProps) {
  const [slips, setSlips] = useState(initialSlips);
  const [search, setSearch] = useState('');
  const [selectedClass, setSelectedClass] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedMonth, setSelectedMonth] = useState('ALL');

  // Modals
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isSingleModalOpen, setIsSingleModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Bulk Form
  const [bulkForm, setBulkForm] = useState({
    classId: classes[0]?.id || '',
    sectionId: 'ALL',
    month: 'November',
    year: 2024,
    dueDate: '2024-11-20',
    title: 'November 2024 Monthly Fee',
  });

  // Single Form
  const [singleForm, setSingleForm] = useState({
    studentId: students[0]?.id || '',
    month: 'November',
    year: 2024,
    dueDate: '2024-11-20',
    title: 'Special Academic Fee Slip',
    tuition: 180,
    lab: 25,
    activity: 15,
  });

  const handleBulkGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedbackMsg(null);

    try {
      const res = await generateBulkFeeSlips(bulkForm);
      if (res.success) {
        setFeedbackMsg({
          type: 'success',
          text: `Successfully generated ${res.count} new fee slips! Refreshing...`,
        });
        setIsBulkModalOpen(false);
        setTimeout(() => {
          window.location.reload();
        }, 1200);
      } else {
        setFeedbackMsg({ type: 'error', text: res.error || 'Failed to generate slips' });
      }
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSingleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedbackMsg(null);

    try {
      const breakdown = [
        { item: 'Tuition Fee', amount: Number(singleForm.tuition) || 0 },
        { item: 'Lab & Computer Fee', amount: Number(singleForm.lab) || 0 },
        { item: 'Sports & Activity Fee', amount: Number(singleForm.activity) || 0 },
      ].filter(b => b.amount > 0);

      const res = await generateSingleFeeSlip({
        studentId: singleForm.studentId,
        month: singleForm.month,
        year: Number(singleForm.year),
        dueDate: singleForm.dueDate,
        title: singleForm.title,
        breakdown,
      });

      if (res.success) {
        setFeedbackMsg({
          type: 'success',
          text: `Fee slip issued successfully for student! Refreshing...`,
        });
        setIsSingleModalOpen(false);
        setTimeout(() => {
          window.location.reload();
        }, 1200);
      } else {
        setFeedbackMsg({ type: 'error', text: res.error || 'Failed to issue slip' });
      }
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredSlips = slips.filter(s => {
    if (selectedClass !== 'ALL' && s.classId !== selectedClass) return false;
    if (selectedStatus !== 'ALL' && s.status !== selectedStatus) return false;
    if (selectedMonth !== 'ALL' && s.month !== selectedMonth) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchSlip = s.slipNumber.toLowerCase().includes(q);
      const matchName = `${s.student.firstName} ${s.student.lastName}`.toLowerCase().includes(q);
      const matchAdm = s.student.admissionNo.toLowerCase().includes(q);
      const matchTitle = s.title.toLowerCase().includes(q);
      if (!matchSlip && !matchName && !matchAdm && !matchTitle) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Fee Slips & Invoices (Payable Notices)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Generate and print individual or bulk monthly student fee slips. Fees remain <strong>UNPAID</strong> until cash is manually collected.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setFeedbackMsg(null);
              setIsBulkModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-200 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Generate Class Slips</span>
          </button>

          <button
            onClick={() => {
              setFeedbackMsg(null);
              setIsSingleModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-200 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Single Student Slip</span>
          </button>
        </div>
      </div>

      {feedbackMsg && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2 ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border border-rose-200 text-rose-800'
          }`}
        >
          {feedbackMsg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search slip #, student, adm #..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs font-medium border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-slate-50"
            />
          </div>

          <div>
            <select
              value={selectedClass}
              onChange={e => setSelectedClass(e.target.value)}
              className="w-full px-3 py-2 text-xs font-semibold border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-slate-50 text-slate-700"
            >
              <option value="ALL">All Classes</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 text-xs font-semibold border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-slate-50 text-slate-700"
            >
              <option value="ALL">All Statuses</option>
              <option value="UNPAID">Unpaid (Awaiting Cash)</option>
              <option value="PARTIAL">Partially Paid</option>
              <option value="PAID">Fully Paid</option>
              <option value="OVERDUE">Overdue (Defaulter)</option>
            </select>
          </div>

          <div>
            <select
              value={selectedMonth}
              onChange={e => setSelectedMonth(e.target.value)}
              className="w-full px-3 py-2 text-xs font-semibold border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-slate-50 text-slate-700"
            >
              <option value="ALL">All Months</option>
              {['October', 'November', 'December', 'January', 'February', 'March'].map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs font-semibold text-slate-500 pt-2 border-t border-slate-100">
          <span>
            Displaying <strong>{filteredSlips.length}</strong> Fee Slips
          </span>
          <Link
            href="/fees/collect"
            className="font-bold text-emerald-700 hover:underline flex items-center gap-1"
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>Open Cash Counter →</span>
          </Link>
        </div>
      </div>

      {/* Slips Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Slip #</th>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Class</th>
                <th className="py-3 px-4">Month / Title</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4">Cash Received</th>
                <th className="py-3 px-4">Balance Dues</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSlips.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-400">
                    No fee slips found matching the selected filters.
                  </td>
                </tr>
              ) : (
                filteredSlips.map(slip => (
                  <tr key={slip.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-indigo-700">
                      {slip.slipNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <Link
                        href={`/students/${slip.student.id}`}
                        className="font-bold text-slate-900 hover:text-indigo-600 block"
                      >
                        {slip.student.firstName} {slip.student.lastName}
                      </Link>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {slip.student.admissionNo} • Roll: {slip.student.rollNo}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700">
                      {slip.class.name} ({slip.section?.name})
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-800 block">{slip.title}</span>
                      <span className="text-[11px] text-slate-400">{slip.month} {slip.year}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      {formatDate(slip.dueDate)}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {formatCurrency(slip.totalAmount, currency)}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-emerald-700">
                      {formatCurrency(slip.paidAmount, currency)}
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-amber-700">
                      {formatCurrency(slip.balance, currency)}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={slip.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        {/* Print Fee Slip */}
                        <Link
                          href={`/fees/slips/${slip.id}`}
                          title="Printable Fee Slip"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[11px] transition"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Slip</span>
                        </Link>

                        {/* Collect Cash (if unpaid/partial) */}
                        {slip.balance > 0 && (
                          <Link
                            href={`/fees/collect?slipId=${slip.id}`}
                            title="Collect Cash Payment"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition shadow-2xs"
                          >
                            <Wallet className="w-3.5 h-3.5" />
                            <span>Collect</span>
                          </Link>
                        )}

                        {/* Receipt (if payment made) */}
                        {slip.payments.length > 0 && slip.payments[0].receipt && (
                          <Link
                            href={`/fees/receipts/${slip.payments[0].receipt.id}`}
                            title="Official Fee Receipt"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] transition"
                          >
                            <Receipt className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Receipt</span>
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Bulk Generate Fee Slips */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 bg-linear-to-r from-indigo-700 to-indigo-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-300" />
                <h3 className="text-base font-bold">Generate Class Fee Slips</h3>
              </div>
              <button
                onClick={() => setIsBulkModalOpen(false)}
                className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBulkGenerate} className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-900">
                Fee slips will be issued for all active students in the selected class based on defined fee categories. Status will initially be <strong>UNPAID</strong> until cash is manually collected.
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Class *</label>
                <select
                  value={bulkForm.classId}
                  onChange={e => setBulkForm({ ...bulkForm, classId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Billing Month *</label>
                  <select
                    value={bulkForm.month}
                    onChange={e => setBulkForm({ ...bulkForm, month: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    {['November', 'December', 'January', 'February', 'March', 'April', 'May'].map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Academic Year *</label>
                  <input
                    type="number"
                    value={bulkForm.year}
                    onChange={e => setBulkForm({ ...bulkForm, year: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Payment Due Date *</label>
                <input
                  type="date"
                  required
                  value={bulkForm.dueDate}
                  onChange={e => setBulkForm({ ...bulkForm, dueDate: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Slip Title</label>
                <input
                  type="text"
                  value={bulkForm.title}
                  onChange={e => setBulkForm({ ...bulkForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsBulkModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-200 transition disabled:opacity-50"
                >
                  {isSubmitting ? 'Generating...' : 'Generate Fee Slips'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Single Student Fee Slip */}
      {isSingleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 bg-linear-to-r from-purple-700 to-indigo-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-300" />
                <h3 className="text-base font-bold">Issue Individual Fee Slip</h3>
              </div>
              <button
                onClick={() => setIsSingleModalOpen(false)}
                className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSingleGenerate} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Student *</label>
                <select
                  value={singleForm.studentId}
                  onChange={e => setSingleForm({ ...singleForm, studentId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  {students.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.firstName} {s.lastName} ({s.admissionNo}) - {s.class.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Month *</label>
                  <select
                    value={singleForm.month}
                    onChange={e => setSingleForm({ ...singleForm, month: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    {['November', 'December', 'January', 'February', 'March'].map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Due Date *</label>
                  <input
                    type="date"
                    required
                    value={singleForm.dueDate}
                    onChange={e => setSingleForm({ ...singleForm, dueDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Breakdown Fields */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                <span className="font-bold text-slate-700 block">Fee Breakdown ({currency})</span>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-0.5">Tuition Fee</label>
                    <input
                      type="number"
                      value={singleForm.tuition}
                      onChange={e => setSingleForm({ ...singleForm, tuition: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-0.5">Lab / Computer</label>
                    <input
                      type="number"
                      value={singleForm.lab}
                      onChange={e => setSingleForm({ ...singleForm, lab: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-0.5">Sports / Activity</label>
                    <input
                      type="number"
                      value={singleForm.activity}
                      onChange={e => setSingleForm({ ...singleForm, activity: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
                    />
                  </div>
                </div>
                <div className="text-right pt-1 font-bold text-slate-800">
                  Total Payable: {formatCurrency(Number(singleForm.tuition) + Number(singleForm.lab) + Number(singleForm.activity), currency)}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsSingleModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold shadow-md shadow-purple-200 transition disabled:opacity-50"
                >
                  {isSubmitting ? 'Issuing...' : 'Issue Fee Slip'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

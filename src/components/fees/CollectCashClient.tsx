'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Wallet,
  Search,
  CheckCircle2,
  AlertCircle,
  Receipt,
  FileText,
  DollarSign,
  ArrowRight,
  User,
  School,
  Clock,
  Printer
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { StatusBadge } from '@/components/ui/Badge';
import { recordManualCashPayment } from '@/actions/fees';

interface CollectCashClientProps {
  students: any[];
  slips: any[];
  currency: string;
}

export function CollectCashClient({ students, slips, currency }: CollectCashClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preSlipId = searchParams.get('slipId');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [selectedSlip, setSelectedSlip] = useState<any | null>(null);

  // Form Fields
  const [amountPaid, setAmountPaid] = useState<number>(0);
  const [paymentMode, setPaymentMode] = useState('CASH');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [transactionRef, setTransactionRef] = useState(`CSH-${Date.now().toString().slice(-6)}`);
  const [collectedBy, setCollectedBy] = useState('Admin Cashier');
  const [notes, setNotes] = useState('Cash received at school counter');

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successReceipt, setSuccessReceipt] = useState<any | null>(null);

  // Handle pre-selected slip from query
  useEffect(() => {
    if (preSlipId) {
      const foundSlip = slips.find(s => s.id === preSlipId);
      if (foundSlip) {
        setSelectedSlip(foundSlip);
        setSelectedStudent(foundSlip.student);
        setAmountPaid(foundSlip.balance);
      }
    }
  }, [preSlipId, slips]);

  // When a student is selected
  const handleSelectStudent = (stu: any) => {
    setSelectedStudent(stu);
    const stuSlips = slips.filter(s => s.studentId === stu.id && s.balance > 0);
    if (stuSlips.length > 0) {
      setSelectedSlip(stuSlips[0]);
      setAmountPaid(stuSlips[0].balance);
    } else {
      setSelectedSlip(null);
      setAmountPaid(0);
    }
    setErrorMsg('');
  };

  const handleSelectSlip = (slip: any) => {
    setSelectedSlip(slip);
    setAmountPaid(slip.balance);
    setErrorMsg('');
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlip) return;

    if (amountPaid <= 0) {
      setErrorMsg('Payment amount must be greater than zero.');
      return;
    }

    if (amountPaid > selectedSlip.balance) {
      setErrorMsg(`Payment amount (${currency}${amountPaid}) cannot exceed remaining dues (${currency}${selectedSlip.balance}).`);
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const res = await recordManualCashPayment({
        feeSlipId: selectedSlip.id,
        amountPaid,
        paymentDate,
        paymentMode,
        transactionRef,
        notes,
        collectedBy,
      });

      if (res.success && res.data) {
        setSuccessReceipt(res.data);
      } else {
        setErrorMsg(res.error || 'Failed to record payment');
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter students based on search
  const filteredStudents = searchQuery.trim()
    ? students.filter(s => {
        const q = searchQuery.toLowerCase();
        return (
          `${s.firstName} ${s.lastName}`.toLowerCase().includes(q) ||
          s.admissionNo.toLowerCase().includes(q) ||
          s.rollNo.toLowerCase().includes(q)
        );
      })
    : [];

  // Slips for currently selected student
  const studentSlips = selectedStudent
    ? slips.filter(s => s.studentId === selectedStudent.id)
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Manual Cash Fee Collection Counter
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Accept manual cash or physical voucher submissions. Records payment, updates outstanding dues, and <strong>automatically generates an official printable Fee Receipt</strong>.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/fees/receipts"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
          >
            <Receipt className="w-4 h-4 text-emerald-600" />
            <span>Receipts Ledger</span>
          </Link>
        </div>
      </div>

      {/* Main Grid: Student Search & Payment Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Search & Select Student */}
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Search className="w-4 h-4 text-indigo-600" />
              <span>Step 1: Find Student</span>
            </h3>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search by student name, adm #, roll..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs font-medium border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-slate-50"
              />
            </div>

            {/* Quick search dropdown results */}
            {searchQuery.trim() && (
              <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-xl bg-white shadow-lg">
                {filteredStudents.length === 0 ? (
                  <div className="p-3 text-xs text-slate-400 text-center">No student found</div>
                ) : (
                  filteredStudents.map(stu => (
                    <button
                      key={stu.id}
                      type="button"
                      onClick={() => {
                        handleSelectStudent(stu);
                        setSearchQuery('');
                      }}
                      className="w-full text-left p-2.5 hover:bg-indigo-50 transition flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-slate-900 block">
                          {stu.firstName} {stu.lastName}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {stu.admissionNo} • {stu.class.name} ({stu.section.name})
                        </span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-indigo-500" />
                    </button>
                  ))
                )}
              </div>
            )}

            {/* Selected Student Card */}
            {selectedStudent ? (
              <div className="p-4 bg-indigo-50/60 rounded-xl border border-indigo-100 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-800">
                    Active Student Selection
                  </span>
                  <StatusBadge status={selectedStudent.status} />
                </div>
                <div className="font-bold text-slate-900 text-sm">
                  {selectedStudent.firstName} {selectedStudent.lastName}
                </div>
                <div className="text-slate-600 space-y-0.5 text-[11px]">
                  <div>Admission #: <strong>{selectedStudent.admissionNo}</strong></div>
                  <div>Class: <strong>{selectedStudent.class.name} ({selectedStudent.section.name})</strong></div>
                  <div>Roll #: <strong>{selectedStudent.rollNo}</strong></div>
                  <div>Parent: <strong>{selectedStudent.parentName} ({selectedStudent.parentPhone})</strong></div>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-xs">
                Search and click a student above, or pick from recent list below.
              </div>
            )}
          </div>

          {/* Outstanding Fee Slips for Selected Student */}
          {selectedStudent && (
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-600" />
                <span>Step 2: Select Fee Slip</span>
              </h3>

              {studentSlips.length === 0 ? (
                <p className="text-xs text-slate-400 py-3">No fee slips issued for this student.</p>
              ) : (
                <div className="space-y-2">
                  {studentSlips.map(slip => {
                    const isSelected = selectedSlip?.id === slip.id;
                    return (
                      <div
                        key={slip.id}
                        onClick={() => handleSelectSlip(slip)}
                        className={`p-3 rounded-xl border cursor-pointer transition text-xs ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50/40 shadow-xs'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-mono font-bold text-indigo-900">{slip.slipNumber}</span>
                          <StatusBadge status={slip.status} />
                        </div>
                        <div className="font-bold text-slate-800">{slip.title}</div>
                        <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100">
                          <span>Total: {formatCurrency(slip.totalAmount, currency)}</span>
                          <span className="font-bold text-amber-700">
                            Due: {formatCurrency(slip.balance, currency)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Cash Collection Entry Form */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
            <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
              <Wallet className="w-5 h-5 text-emerald-600" />
              <span>Step 3: Record Cash Payment Voucher</span>
            </h3>

            {!selectedSlip ? (
              <div className="py-16 text-center text-slate-400 text-xs">
                Please search a student and select a fee slip on the left to collect cash payment.
              </div>
            ) : (
              <form onSubmit={handleSubmitPayment} className="mt-5 space-y-5 text-xs">
                {errorMsg && (
                  <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-medium flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Slip Overview Banner */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 font-semibold block text-[10px] uppercase">Slip #</span>
                    <strong className="font-mono text-indigo-700">{selectedSlip.slipNumber}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold block text-[10px] uppercase">Invoice Total</span>
                    <strong className="text-slate-900">{formatCurrency(selectedSlip.totalAmount, currency)}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold block text-[10px] uppercase">Already Paid</span>
                    <strong className="text-emerald-700">{formatCurrency(selectedSlip.paidAmount, currency)}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold block text-[10px] uppercase">Current Dues</span>
                    <strong className="text-amber-700 text-sm">{formatCurrency(selectedSlip.balance, currency)}</strong>
                  </div>
                </div>

                {/* Input: Payment Amount */}
                <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="font-extrabold text-emerald-950 text-xs">
                      Cash Amount Received ({currency}) *
                    </label>
                    <button
                      type="button"
                      onClick={() => setAmountPaid(selectedSlip.balance)}
                      className="text-[11px] font-bold text-emerald-700 hover:underline"
                    >
                      Pay Full Dues ({formatCurrency(selectedSlip.balance, currency)})
                    </button>
                  </div>

                  <div className="relative">
                    <DollarSign className="w-5 h-5 text-emerald-600 absolute left-3 top-2.5" />
                    <input
                      type="number"
                      required
                      min="1"
                      max={selectedSlip.balance}
                      step="any"
                      value={amountPaid}
                      onChange={e => setAmountPaid(Number(e.target.value))}
                      className="w-full pl-9 pr-3 py-2.5 text-base font-extrabold border border-emerald-300 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-white text-emerald-900"
                    />
                  </div>
                  <span className="text-[11px] text-emerald-800 mt-1 block">
                    Remaining balance after this transaction: <strong>{formatCurrency(Math.max(0, selectedSlip.balance - amountPaid), currency)}</strong>
                  </span>
                </div>

                {/* Grid: Mode, Ref, Date, Cashier */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Payment Mode *
                    </label>
                    <select
                      value={paymentMode}
                      onChange={e => setPaymentMode(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white"
                    >
                      <option value="CASH">Cash (School Counter)</option>
                      <option value="CHEQUE">Cheque / Pay Order</option>
                      <option value="BANK_TRANSFER">Manual Bank Deposit Slip</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Receipt / Voucher Ref No
                    </label>
                    <input
                      type="text"
                      value={transactionRef}
                      onChange={e => setTransactionRef(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Collection Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={paymentDate}
                      onChange={e => setPaymentDate(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Collected By (Staff / Cashier)
                    </label>
                    <input
                      type="text"
                      value={collectedBy}
                      onChange={e => setCollectedBy(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Notes / Remarks
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Submit Action */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-slate-500 text-[11px]">
                    Submitting will immediately record payment and generate official Receipt.
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting || amountPaid <= 0}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-emerald-200 disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isSubmitting ? 'Recording...' : `Record Payment of ${formatCurrency(amountPaid, currency)}`}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Success Modal with direct link to PRINT FEE RECEIPT */}
      {successReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md p-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-lg font-black text-slate-900">Payment Successfully Recorded!</h3>
              <p className="text-xs text-slate-500 mt-1">
                Official payment receipt has been automatically issued.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-left space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400">Receipt Number:</span>
                <strong className="font-mono font-bold text-indigo-700">{successReceipt.receiptNumber}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Updated Status:</span>
                <StatusBadge status={successReceipt.newStatus} />
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Remaining Balance:</span>
                <strong className="font-bold text-amber-700">
                  {formatCurrency(successReceipt.remainingBalance, currency)}
                </strong>
              </div>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <Link
                href={`/fees/receipts/${successReceipt.receiptId}`}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-200 transition"
              >
                <Printer className="w-4 h-4" />
                <span>Print Official Fee Receipt</span>
              </Link>

              <button
                type="button"
                onClick={() => {
                  setSuccessReceipt(null);
                  setSelectedSlip(null);
                  router.refresh();
                }}
                className="w-full px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Collect Another Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

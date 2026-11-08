import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  GraduationCap,
  ArrowLeft,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  FileText,
  Receipt,
  Award,
  CalendarCheck,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { getStudentById } from '@/actions/students';
import { formatCurrency, formatDate } from '@/lib/utils';
import { StatusBadge } from '@/components/ui/Badge';

export const dynamic = 'force-dynamic';

export default async function StudentProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const result = await getStudentById(resolvedParams.id);

  if (!result.success || !result.data) {
    notFound();
  }

  const student = result.data;
  const attTotal = student.attendanceRecords.length;
  const attPresent = student.attendanceRecords.filter(a => a.status === 'PRESENT').length;
  const attPct = attTotal > 0 ? Math.round((attPresent / attTotal) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/students"
          className="inline-flex items-center gap-2 text-xs font-bold text-indigo-600 hover:text-indigo-800"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Students Roster</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href={`/fees/collect`}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
          >
            Collect Cash Fee
          </Link>
        </div>
      </div>

      {/* Profile Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-2xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-linear-to-tr from-indigo-600 to-indigo-800 text-white flex items-center justify-center font-extrabold text-2xl shadow-md shadow-indigo-200">
            {student.firstName[0]}{student.lastName[0]}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                {student.firstName} {student.lastName}
              </h1>
              <StatusBadge status={student.status} />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 pt-4 border-t border-slate-100 text-xs">
              <div>
                <span className="block text-slate-400 font-semibold uppercase text-[10px]">Admission No</span>
                <span className="font-mono font-bold text-indigo-700">{student.admissionNo}</span>
              </div>
              <div>
                <span className="block text-slate-400 font-semibold uppercase text-[10px]">Class & Section</span>
                <span className="font-bold text-slate-800">{student.class.name} - {student.section.name}</span>
              </div>
              <div>
                <span className="block text-slate-400 font-semibold uppercase text-[10px]">Roll Number</span>
                <span className="font-bold text-slate-800">{student.rollNo}</span>
              </div>
              <div>
                <span className="block text-slate-400 font-semibold uppercase text-[10px]">Attendance Rate</span>
                <span className="font-bold text-emerald-600">{attPct}% Present</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Bio Details & Guardian Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Details */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs">
          <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-indigo-600" />
            <span>Personal & Demographic Information</span>
          </h3>
          <div className="divide-y divide-slate-100 text-xs mt-2">
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-400 font-medium">Full Name</span>
              <span className="font-bold text-slate-800">{student.firstName} {student.lastName}</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-400 font-medium">Gender</span>
              <span className="font-semibold text-slate-700">{student.gender}</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-400 font-medium">Date of Birth</span>
              <span className="font-semibold text-slate-700">{formatDate(student.dob)}</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-400 font-medium">Blood Group</span>
              <span className="font-semibold text-slate-700">{student.bloodGroup || 'N/A'}</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-400 font-medium">Admission Date</span>
              <span className="font-semibold text-slate-700">{formatDate(student.admissionDate)}</span>
            </div>
          </div>
        </div>

        {/* Parent & Guardian Info */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs">
          <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
            <Phone className="w-4 h-4 text-indigo-600" />
            <span>Parent / Guardian Information</span>
          </h3>
          <div className="divide-y divide-slate-100 text-xs mt-2">
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-400 font-medium">Parent / Guardian</span>
              <span className="font-bold text-slate-800">{student.parentName} ({student.parentRelationship})</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-400 font-medium">Contact Phone</span>
              <span className="font-bold text-indigo-700">{student.parentPhone}</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-400 font-medium">Email Address</span>
              <span className="font-semibold text-slate-700">{student.parentEmail || 'Not provided'}</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-400 font-medium">Occupation</span>
              <span className="font-semibold text-slate-700">{student.parentOccupation || 'Not provided'}</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-400 font-medium">Residential Address</span>
              <span className="font-semibold text-slate-700 text-right">{student.address || 'Lahore, Pakistan'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Fee History & Invoices */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-emerald-600" />
              <span>Fee Invoices & Cash Payment History</span>
            </h3>
            <p className="text-xs text-slate-500">Record of fee slips issued and cash collected</p>
          </div>
          <Link
            href="/fees/slips"
            className="text-xs font-bold text-indigo-600 hover:underline"
          >
            All Fee Slips →
          </Link>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-2.5 px-3">Slip #</th>
                <th className="py-2.5 px-3">Title / Month</th>
                <th className="py-2.5 px-3">Issue Date</th>
                <th className="py-2.5 px-3">Due Date</th>
                <th className="py-2.5 px-3">Billed</th>
                <th className="py-2.5 px-3">Paid</th>
                <th className="py-2.5 px-3">Balance</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Documents</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {student.feeSlips.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-6 text-center text-slate-400">
                    No fee slips generated for this student yet.
                  </td>
                </tr>
              ) : (
                student.feeSlips.map(slip => (
                  <tr key={slip.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-indigo-700">
                      {slip.slipNumber}
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-800">
                      {slip.title}
                    </td>
                    <td className="py-3 px-3 text-slate-500">{formatDate(slip.issueDate)}</td>
                    <td className="py-3 px-3 text-slate-500">{formatDate(slip.dueDate)}</td>
                    <td className="py-3 px-3 font-bold text-slate-900">{formatCurrency(slip.totalAmount)}</td>
                    <td className="py-3 px-3 font-bold text-emerald-700">{formatCurrency(slip.paidAmount)}</td>
                    <td className="py-3 px-3 font-bold text-amber-700">{formatCurrency(slip.balance)}</td>
                    <td className="py-3 px-3"><StatusBadge status={slip.status} /></td>
                    <td className="py-3 px-3 text-right space-x-2">
                      <Link
                        href={`/fees/slips/${slip.id}`}
                        className="inline-flex items-center gap-1 font-bold text-indigo-600 hover:underline"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Print Slip</span>
                      </Link>

                      {slip.payments.length > 0 && slip.payments[0].receipt && (
                        <Link
                          href={`/fees/receipts/${slip.payments[0].receipt.id}`}
                          className="inline-flex items-center gap-1 font-bold text-emerald-600 hover:underline"
                        >
                          <Receipt className="w-3.5 h-3.5" />
                          <span>Receipt</span>
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

      {/* Examination Performance & Report Cards */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-purple-600" />
              <span>Examination Records & Results</span>
            </h3>
            <p className="text-xs text-slate-500">Academic performance and grade assessments</p>
          </div>
          {student.examMarks.length > 0 && (
            <Link
              href={`/examinations/reports/${student.examMarks[0].examId}?studentId=${student.id}`}
              className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
            >
              Print Report Card
            </Link>
          )}
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-2.5 px-3">Examination</th>
                <th className="py-2.5 px-3">Subject</th>
                <th className="py-2.5 px-3">Max Marks</th>
                <th className="py-2.5 px-3">Pass Marks</th>
                <th className="py-2.5 px-3">Obtained Marks</th>
                <th className="py-2.5 px-3">Grade</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {student.examMarks.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-6 text-center text-slate-400">
                    No examination marks uploaded for this student yet.
                  </td>
                </tr>
              ) : (
                student.examMarks.map(mark => (
                  <tr key={mark.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3 font-semibold text-slate-800">{mark.exam.title}</td>
                    <td className="py-3 px-3 font-bold text-indigo-700">{mark.subject.name}</td>
                    <td className="py-3 px-3 text-slate-500">{mark.maxMarks}</td>
                    <td className="py-3 px-3 text-slate-500">{mark.passMarks}</td>
                    <td className="py-3 px-3 font-extrabold text-slate-900">{mark.obtainedMarks}</td>
                    <td className="py-3 px-3">
                      <span className="font-extrabold px-2 py-0.5 rounded-sm bg-purple-100 text-purple-800 text-[11px]">
                        {mark.grade}
                      </span>
                    </td>
                    <td className="py-3 px-3"><StatusBadge status={mark.status} /></td>
                    <td className="py-3 px-3 text-slate-500">{mark.remarks || '-'}</td>
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

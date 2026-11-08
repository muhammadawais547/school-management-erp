import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  Users,
  ArrowLeft,
  Mail,
  Phone,
  BookOpen,
  School,
  CalendarDays,
  Award
} from 'lucide-react';
import { getTeacherById } from '@/actions/teachers';
import { formatCurrency, formatDate } from '@/lib/utils';
import { StatusBadge } from '@/components/ui/Badge';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function TeacherProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const [result, institute] = await Promise.all([
    getTeacherById(resolvedParams.id),
    prisma.institute.findFirst(),
  ]);

  if (!result.success || !result.data) {
    notFound();
  }

  const teacher = result.data;
  const currency = institute?.currencySymbol || '$';

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <Link
          href="/teachers"
          className="inline-flex items-center gap-2 text-xs font-bold text-indigo-600 hover:text-indigo-800"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Faculty List</span>
        </Link>
      </div>

      {/* Header Profile Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-2xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-linear-to-tr from-purple-600 to-indigo-800 text-white flex items-center justify-center font-extrabold text-2xl shadow-md shadow-purple-200">
            {teacher.name[0]}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                {teacher.name}
              </h1>
              <StatusBadge status={teacher.status} />
            </div>
            <p className="text-sm font-semibold text-indigo-600 mt-1">
              {teacher.designation} • {teacher.qualification}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 pt-4 border-t border-slate-100 text-xs">
              <div>
                <span className="block text-slate-400 font-semibold uppercase text-[10px]">Employee ID</span>
                <span className="font-mono font-bold text-indigo-700">{teacher.employeeId}</span>
              </div>
              <div>
                <span className="block text-slate-400 font-semibold uppercase text-[10px]">Phone</span>
                <span className="font-bold text-slate-800">{teacher.phone}</span>
              </div>
              <div>
                <span className="block text-slate-400 font-semibold uppercase text-[10px]">Monthly Salary</span>
                <span className="font-bold text-emerald-700">{formatCurrency(teacher.salary, currency)}</span>
              </div>
              <div>
                <span className="block text-slate-400 font-semibold uppercase text-[10px]">Joining Date</span>
                <span className="font-bold text-slate-800">{formatDate(teacher.joiningDate)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Assigned Classes & Subjects */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs">
          <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
            <School className="w-4 h-4 text-indigo-600" />
            <span>Assigned Classes (Class Teacher)</span>
          </h3>
          <div className="mt-4 space-y-3">
            {teacher.sections.length === 0 ? (
              <p className="text-xs text-slate-400">Not currently assigned as in-charge class teacher.</p>
            ) : (
              teacher.sections.map(sec => (
                <div key={sec.id} className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-indigo-900">{sec.class.name} - {sec.name}</span>
                    <span className="block text-[11px] text-indigo-600 mt-0.5">Enrolled: {sec.students.length} Students</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-sm bg-indigo-200 text-indigo-800 font-bold text-[10px]">
                    Class Teacher
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs">
          <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-purple-600" />
            <span>Assigned Curriculum Subjects</span>
          </h3>
          <div className="mt-4 space-y-2">
            {teacher.subjects.length === 0 ? (
              <p className="text-xs text-slate-400">No subjects currently linked to this teacher.</p>
            ) : (
              teacher.subjects.map(sub => (
                <div key={sub.id} className="p-3 bg-purple-50/50 border border-purple-100 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-purple-900">{sub.name}</span>
                    <span className="block text-[11px] text-purple-600 mt-0.5">{sub.class.name} • Code: {sub.code}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-sm bg-purple-200 text-purple-800 font-bold text-[10px]">
                    {sub.type}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Weekly Routine / Timetable */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs">
        <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
          <CalendarDays className="w-4 h-4 text-indigo-600" />
          <span>Weekly Teaching Schedule & Timetable Slots</span>
        </h3>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <th className="py-2.5 px-3">Day</th>
                <th className="py-2.5 px-3">Period #</th>
                <th className="py-2.5 px-3">Time</th>
                <th className="py-2.5 px-3">Class & Section</th>
                <th className="py-2.5 px-3">Subject</th>
                <th className="py-2.5 px-3">Room</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {teacher.timetableSlots.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-400">
                    No scheduled timetable slots found for this faculty member.
                  </td>
                </tr>
              ) : (
                teacher.timetableSlots.map(slot => (
                  <tr key={slot.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-bold text-indigo-700">{slot.dayOfWeek}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-700">Period {slot.periodNumber}</td>
                    <td className="py-2.5 px-3 text-slate-500">{slot.startTime} - {slot.endTime}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">{slot.class.name} ({slot.section.name})</td>
                    <td className="py-2.5 px-3 font-semibold text-purple-700">{slot.subject.name}</td>
                    <td className="py-2.5 px-3 text-slate-500">{slot.roomNumber || '-'}</td>
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

import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Printer, Award, GraduationCap, CheckCircle } from 'lucide-react';
import prisma from '@/lib/prisma';
import { formatDate } from '@/lib/utils';
import { PrintButton } from '@/components/ui/PrintButton';
import { StatusBadge } from '@/components/ui/Badge';

export const dynamic = 'force-dynamic';

export default async function ReportCardsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ studentId?: string }>;
}) {
  const resolvedParams = await params;
  const resolvedSearch = await searchParams;

  const [exam, institute] = await Promise.all([
    prisma.exam.findUnique({
      where: { id: resolvedParams.id },
    }),
    prisma.institute.findFirst(),
  ]);

  if (!exam) notFound();

  // Find all students who have marks in this exam
  const marks = await prisma.examMark.findMany({
    where: { examId: exam.id },
    include: {
      student: {
        include: { class: true, section: true },
      },
      subject: true,
    },
    orderBy: [{ student: { rollNo: 'asc' } }, { subject: { name: 'asc' } }],
  });

  // Group marks by student
  const studentsMap = new Map<string, { student: any; marks: any[] }>();
  for (const m of marks) {
    if (!studentsMap.has(m.studentId)) {
      studentsMap.set(m.studentId, { student: m.student, marks: [] });
    }
    studentsMap.get(m.studentId)!.marks.push(m);
  }

  const studentEntries = Array.from(studentsMap.values());
  const activeStudentId = resolvedSearch.studentId || studentEntries[0]?.student.id;
  const currentEntry = studentEntries.find(e => e.student.id === activeStudentId) || studentEntries[0];

  const currentMarks = currentEntry?.marks || [];
  const totalMax = currentMarks.reduce((acc, m) => acc + m.maxMarks, 0);
  const totalObtained = currentMarks.reduce((acc, m) => acc + m.obtainedMarks, 0);
  const percentage = totalMax > 0 ? ((totalObtained / totalMax) * 100).toFixed(1) : '0';

  let overallGrade = 'F';
  const pctNum = parseFloat(percentage);
  if (pctNum >= 90) overallGrade = 'A+';
  else if (pctNum >= 80) overallGrade = 'A';
  else if (pctNum >= 70) overallGrade = 'B';
  else if (pctNum >= 60) overallGrade = 'C';
  else if (pctNum >= 50) overallGrade = 'D';
  else overallGrade = 'F';

  const hasFailed = currentMarks.some(m => m.status === 'FAIL');

  return (
    <div className="space-y-6">
      {/* Top Controls (Hidden when printing) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 no-print bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <Link
          href="/examinations"
          className="inline-flex items-center gap-2 text-xs font-bold text-indigo-600 hover:text-indigo-800"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Examinations</span>
        </Link>

        {/* Student Selector */}
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Select Student:
          </label>
          <div className="flex gap-2">
            {studentEntries.slice(0, 8).map(e => (
              <Link
                key={e.student.id}
                href={`/examinations/reports/${exam.id}?studentId=${e.student.id}`}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  e.student.id === activeStudentId
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {e.student.firstName} ({e.student.rollNo})
              </Link>
            ))}
          </div>

          <PrintButton label="Print Report Card" />
        </div>
      </div>

      {!currentEntry ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-400 text-sm">
          No student marks records found for this examination. Please input marks first.
        </div>
      ) : (
        /* Printable Report Card Transcript Document */
        <div className="printable-card max-w-4xl mx-auto bg-white p-8 sm:p-12 rounded-3xl border-2 border-slate-900 shadow-xl text-slate-900">
          {/* Header */}
          <div className="text-center pb-6 border-b-2 border-slate-900">
            <div className="flex items-center justify-center gap-2 mb-1">
              <GraduationCap className="w-8 h-8 text-indigo-800" />
              <h1 className="text-2xl font-black uppercase tracking-tight">
                {institute?.name || 'Apex International Grammar School'}
              </h1>
            </div>
            <p className="text-xs text-slate-600 font-medium">
              {institute?.address} • Phone: {institute?.phone} • School Code: {institute?.code}
            </p>

            <div className="mt-4 inline-block px-5 py-1.5 rounded-sm bg-slate-900 text-white font-extrabold text-xs tracking-widest uppercase shadow-xs">
              OFFICIAL ACADEMIC PROGRESS REPORT CARD
            </div>
            <div className="text-xs font-bold text-indigo-900 uppercase tracking-wider mt-1.5">
              {exam.title} ({exam.session})
            </div>
          </div>

          {/* Student Bio Grid */}
          <div className="my-6 p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-slate-400 font-semibold block text-[10px] uppercase">Student Name</span>
              <strong className="text-sm font-black text-slate-900">
                {currentEntry.student.firstName} {currentEntry.student.lastName}
              </strong>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block text-[10px] uppercase">Admission Number</span>
              <strong className="font-mono text-indigo-900">{currentEntry.student.admissionNo}</strong>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block text-[10px] uppercase">Class & Section</span>
              <strong>{currentEntry.student.class?.name} ({currentEntry.student.section?.name})</strong>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block text-[10px] uppercase">Roll Number</span>
              <strong>{currentEntry.student.rollNo}</strong>
            </div>
          </div>

          {/* Marks Table */}
          <div className="my-6">
            <table className="w-full text-left text-xs border border-slate-300">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300 font-bold text-slate-700">
                  <th className="py-2.5 px-3 border-r border-slate-300">#</th>
                  <th className="py-2.5 px-3 border-r border-slate-300">Subject</th>
                  <th className="py-2.5 px-3 border-r border-slate-300 text-center">Max Marks</th>
                  <th className="py-2.5 px-3 border-r border-slate-300 text-center">Pass Marks</th>
                  <th className="py-2.5 px-3 border-r border-slate-300 text-center">Marks Obtained</th>
                  <th className="py-2.5 px-3 border-r border-slate-300 text-center">Grade</th>
                  <th className="py-2.5 px-3 border-r border-slate-300 text-center">Status</th>
                  <th className="py-2.5 px-3">Teacher Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {currentMarks.map((m, idx) => (
                  <tr key={m.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 border-r border-slate-200 text-slate-500">{idx + 1}</td>
                    <td className="py-2.5 px-3 border-r border-slate-200 font-bold text-slate-900">
                      {m.subject.name}
                    </td>
                    <td className="py-2.5 px-3 border-r border-slate-200 text-center">{m.maxMarks}</td>
                    <td className="py-2.5 px-3 border-r border-slate-200 text-center">{m.passMarks}</td>
                    <td className="py-2.5 px-3 border-r border-slate-200 text-center font-black text-slate-900">
                      {m.obtainedMarks}
                    </td>
                    <td className="py-2.5 px-3 border-r border-slate-200 text-center font-black text-purple-800">
                      {m.grade}
                    </td>
                    <td className="py-2.5 px-3 border-r border-slate-200 text-center font-bold">
                      <span className={m.status === 'PASS' ? 'text-emerald-700' : 'text-rose-700'}>
                        {m.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 text-[11px]">{m.remarks || 'Satisfactory'}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-900 bg-slate-50 font-black text-xs">
                  <td colSpan={2} className="py-3 px-3 border-r border-slate-300 uppercase text-slate-900">
                    Grand Total
                  </td>
                  <td className="py-3 px-3 border-r border-slate-300 text-center">{totalMax}</td>
                  <td className="py-3 px-3 border-r border-slate-300 text-center">-</td>
                  <td className="py-3 px-3 border-r border-slate-300 text-center text-indigo-900 text-sm">
                    {totalObtained}
                  </td>
                  <td className="py-3 px-3 border-r border-slate-300 text-center text-purple-900 text-sm">
                    {overallGrade}
                  </td>
                  <td colSpan={2} className="py-3 px-3 text-right">
                    Percentage: <strong className="text-indigo-900 text-sm">{percentage}%</strong>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Result Standing Banner */}
          <div className="my-6 p-4 rounded-xl border-2 border-slate-300 bg-slate-50 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-500 font-semibold">Final Academic Standing: </span>
              <strong className={`text-sm font-black uppercase ${hasFailed ? 'text-rose-700' : 'text-emerald-700'}`}>
                {hasFailed ? 'FAILED - NEEDS RE-EXAMINATION' : 'PASSED WITH MERIT'}
              </strong>
            </div>
            <div>
              <span className="text-slate-500 font-semibold">Overall Grade: </span>
              <span className="px-3 py-1 rounded-sm bg-purple-700 text-white font-black text-sm">
                Grade {overallGrade}
              </span>
            </div>
          </div>

          {/* Grading Scale Legend */}
          <div className="my-6 p-3 rounded-lg border border-slate-200 text-[10px] text-slate-600">
            <span className="font-bold text-slate-800 uppercase block mb-1">Grading Scale:</span>
            <div className="flex flex-wrap gap-4">
              <span><strong>A+</strong>: 90% - 100% (Outstanding)</span>
              <span><strong>A</strong>: 80% - 89% (Excellent)</span>
              <span><strong>B</strong>: 70% - 79% (Very Good)</span>
              <span><strong>C</strong>: 60% - 69% (Good)</span>
              <span><strong>D</strong>: 50% - 59% (Satisfactory)</span>
              <span><strong>F</strong>: Below 40% (Fail)</span>
            </div>
          </div>

          {/* Signatures */}
          <div className="mt-14 pt-8 border-t border-slate-300 grid grid-cols-3 gap-6 text-center text-xs">
            <div>
              <div className="w-32 border-b-2 border-slate-800 mx-auto mb-2" />
              <span className="font-bold text-slate-800 block text-[11px]">Class Teacher</span>
              <span className="text-[10px] text-slate-400">Signature</span>
            </div>
            <div>
              <div className="w-32 border-b-2 border-slate-800 mx-auto mb-2" />
              <span className="font-bold text-slate-800 block text-[11px]">Controller of Examinations</span>
              <span className="text-[10px] text-slate-400">Verified</span>
            </div>
            <div>
              <div className="w-32 border-b-2 border-slate-800 mx-auto mb-2" />
              <span className="font-bold text-slate-800 block text-[11px]">Principal / Headmaster</span>
              <span className="text-[10px] text-slate-400">Official Stamp</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

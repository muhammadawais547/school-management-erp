'use client';

import React, { useState, useEffect } from 'react';
import {
  CalendarCheck,
  Check,
  X,
  Clock,
  FileText,
  AlertCircle,
  Calendar,
  Save,
  CheckCircle2,
  Users
} from 'lucide-react';
import { getAttendanceRegister, saveAttendanceRegister, getAttendanceReport } from '@/actions/attendance';
import { StatusBadge } from '@/components/ui/Badge';

interface AttendanceClientProps {
  classes: any[];
}

export function AttendanceClient({ classes }: AttendanceClientProps) {
  const [selectedClassId, setSelectedClassId] = useState(classes[0]?.id || '');
  const [selectedSectionId, setSelectedSectionId] = useState(classes[0]?.sections[0]?.id || '');
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  const [register, setRegister] = useState<any[]>([]);
  const [isMarked, setIsMarked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Tab switch
  const [activeTab, setActiveTab] = useState<'register' | 'report'>('register');
  const [reportData, setReportData] = useState<any[]>([]);
  const [reportMonth, setReportMonth] = useState(new Date().getMonth());
  const [reportYear, setReportYear] = useState(new Date().getFullYear());
  const [isReportLoading, setIsReportLoading] = useState(false);

  const activeClass = classes.find(c => c.id === selectedClassId) || classes[0];
  const availableSections = activeClass?.sections || [];

  const handleClassChange = (cId: string) => {
    setSelectedClassId(cId);
    const cls = classes.find(c => c.id === cId);
    if (cls && cls.sections.length > 0) {
      setSelectedSectionId(cls.sections[0].id);
    } else {
      setSelectedSectionId('');
    }
  };

  const loadRegister = async () => {
    if (!selectedClassId || !selectedSectionId) return;
    setIsLoading(true);
    setFeedbackMsg(null);
    try {
      const res = await getAttendanceRegister(selectedClassId, selectedSectionId, selectedDate);
      if (res.success && res.data) {
        setRegister(res.data.register);
        setIsMarked(res.data.isMarked);
      } else {
        setFeedbackMsg({ type: 'error', text: res.error || 'Failed to load register' });
      }
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'register') {
      loadRegister();
    }
  }, [selectedClassId, selectedSectionId, selectedDate, activeTab]);

  const loadReport = async () => {
    if (!selectedClassId) return;
    setIsReportLoading(true);
    try {
      const res = await getAttendanceReport({
        classId: selectedClassId,
        sectionId: selectedSectionId,
        month: Number(reportMonth),
        year: Number(reportYear),
      });
      if (res.success && res.data) {
        setReportData(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsReportLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'report') {
      loadReport();
    }
  }, [selectedClassId, selectedSectionId, reportMonth, reportYear, activeTab]);

  const setAllStatus = (status: string) => {
    setRegister(prev =>
      prev.map(r => ({
        ...r,
        status,
      }))
    );
  };

  const handleStatusChange = (studentId: string, status: string) => {
    setRegister(prev =>
      prev.map(r => (r.studentId === studentId ? { ...r, status } : r))
    );
  };

  const handleRemarkChange = (studentId: string, remarks: string) => {
    setRegister(prev =>
      prev.map(r => (r.studentId === studentId ? { ...r, remarks } : r))
    );
  };

  const handleSaveAttendance = async () => {
    if (register.length === 0) return;
    setIsSaving(true);
    setFeedbackMsg(null);

    try {
      const records = register.map(r => ({
        studentId: r.studentId,
        status: r.status,
        remarks: r.remarks,
      }));

      const res = await saveAttendanceRegister({
        classId: selectedClassId,
        sectionId: selectedSectionId,
        dateString: selectedDate,
        records,
      });

      if (res.success) {
        setIsMarked(true);
        setFeedbackMsg({
          type: 'success',
          text: `Daily roll-call recorded successfully for ${register.length} students!`,
        });
      } else {
        setFeedbackMsg({ type: 'error', text: res.error || 'Failed to save attendance' });
      }
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message });
    } finally {
      setIsSaving(false);
    }
  };

  // Counts
  const totalStudents = register.length;
  const presentCount = register.filter(r => r.status === 'PRESENT').length;
  const absentCount = register.filter(r => r.status === 'ABSENT').length;
  const lateCount = register.filter(r => r.status === 'LATE').length;
  const leaveCount = register.filter(r => r.status === 'LEAVE').length;
  const pct = totalStudents > 0 ? Math.round((presentCount / totalStudents) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Daily Attendance Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Conduct daily roll call, mark Present, Absent, Late, or Leave, and export monthly attendance registers.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('register')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'register'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Daily Register
          </button>
          <button
            onClick={() => setActiveTab('report')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'report'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Monthly Sheet
          </button>
        </div>
      </div>

      {/* Control Panel: Filters */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {/* Class Select */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Select Class
            </label>
            <select
              value={selectedClassId}
              onChange={e => handleClassChange(e.target.value)}
              className="w-full px-3 py-2 text-xs font-semibold border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-slate-50"
            >
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Section Select */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Select Section
            </label>
            <select
              value={selectedSectionId}
              onChange={e => setSelectedSectionId(e.target.value)}
              className="w-full px-3 py-2 text-xs font-semibold border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-slate-50"
            >
              {availableSections.map((sec: any) => (
                <option key={sec.id} value={sec.id}>{sec.name}</option>
              ))}
            </select>
          </div>

          {/* Date Picker (for Register) */}
          {activeTab === 'register' ? (
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Attendance Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-slate-50"
              />
            </div>
          ) : (
            <>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Report Month
                </label>
                <select
                  value={reportMonth}
                  onChange={e => setReportMonth(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs font-semibold border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-slate-50"
                >
                  {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(
                    (m, i) => (
                      <option key={i} value={i}>{m}</option>
                    )
                  )}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Report Year
                </label>
                <select
                  value={reportYear}
                  onChange={e => setReportYear(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs font-semibold border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-slate-50"
                >
                  <option value={2024}>2024</option>
                  <option value={2025}>2025</option>
                </select>
              </div>
            </>
          )}

          {activeTab === 'register' && (
            <div className="flex items-end">
              <button
                onClick={() => setAllStatus('PRESENT')}
                className="w-full px-3 py-2 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Mark All Present</span>
              </button>
            </div>
          )}
        </div>

        {/* Feedback message */}
        {feedbackMsg && (
          <div
            className={`mt-4 p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
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
      </div>

      {activeTab === 'register' ? (
        <>
          {/* Summary Metric Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
              <span className="block text-[11px] font-bold text-slate-400 uppercase">Enrolled</span>
              <span className="text-xl font-extrabold text-slate-900 mt-1 block">{totalStudents}</span>
            </div>
            <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200 shadow-2xs">
              <span className="block text-[11px] font-bold text-emerald-800 uppercase">Present</span>
              <span className="text-xl font-extrabold text-emerald-700 mt-1 block">{presentCount}</span>
            </div>
            <div className="p-4 bg-rose-50/70 rounded-2xl border border-rose-200 shadow-2xs">
              <span className="block text-[11px] font-bold text-rose-800 uppercase">Absent</span>
              <span className="text-xl font-extrabold text-rose-700 mt-1 block">{absentCount}</span>
            </div>
            <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-200 shadow-2xs">
              <span className="block text-[11px] font-bold text-amber-800 uppercase">Late</span>
              <span className="text-xl font-extrabold text-amber-700 mt-1 block">{lateCount}</span>
            </div>
            <div className="p-4 bg-sky-50/70 rounded-2xl border border-sky-200 shadow-2xs col-span-2 sm:col-span-1">
              <span className="block text-[11px] font-bold text-sky-800 uppercase">Presence Rate</span>
              <span className="text-xl font-extrabold text-indigo-700 mt-1 block">{pct}%</span>
            </div>
          </div>

          {/* Student Roll Call Register Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-xs">
                  {activeClass?.name} - {availableSections.find((s: any) => s.id === selectedSectionId)?.name}
                </span>
                {isMarked ? (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    Marked for this date
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                    Pending Submission
                  </span>
                )}
              </div>

              <button
                onClick={handleSaveAttendance}
                disabled={isSaving || register.length === 0}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-indigo-200 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Submitting...' : 'Save Daily Attendance'}</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="py-3 px-4">Roll</th>
                    <th className="py-3 px-4">Admission #</th>
                    <th className="py-3 px-4">Student Name</th>
                    <th className="py-3 px-4 text-center">Attendance Status</th>
                    <th className="py-3 px-4">Remarks / Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400">
                        Loading class roll-call register...
                      </td>
                    </tr>
                  ) : register.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400">
                        No students enrolled in this section.
                      </td>
                    </tr>
                  ) : (
                    register.map(student => (
                      <tr key={student.studentId} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-bold text-slate-700">{student.rollNo}</td>
                        <td className="py-3 px-4 font-mono font-semibold text-indigo-700">{student.admissionNo}</td>
                        <td className="py-3 px-4 font-bold text-slate-900">{student.studentName}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* Present Button */}
                            <button
                              type="button"
                              onClick={() => handleStatusChange(student.studentId, 'PRESENT')}
                              className={`px-3 py-1.5 rounded-lg font-bold text-xs transition ${
                                student.status === 'PRESENT'
                                  ? 'bg-emerald-600 text-white shadow-xs'
                                  : 'bg-slate-100 text-slate-600 hover:bg-emerald-100 hover:text-emerald-700'
                              }`}
                            >
                              Present (P)
                            </button>

                            {/* Absent Button */}
                            <button
                              type="button"
                              onClick={() => handleStatusChange(student.studentId, 'ABSENT')}
                              className={`px-3 py-1.5 rounded-lg font-bold text-xs transition ${
                                student.status === 'ABSENT'
                                  ? 'bg-rose-600 text-white shadow-xs'
                                  : 'bg-slate-100 text-slate-600 hover:bg-rose-100 hover:text-rose-700'
                              }`}
                            >
                              Absent (A)
                            </button>

                            {/* Late Button */}
                            <button
                              type="button"
                              onClick={() => handleStatusChange(student.studentId, 'LATE')}
                              className={`px-3 py-1.5 rounded-lg font-bold text-xs transition ${
                                student.status === 'LATE'
                                  ? 'bg-amber-500 text-white shadow-xs'
                                  : 'bg-slate-100 text-slate-600 hover:bg-amber-100 hover:text-amber-700'
                              }`}
                            >
                              Late (L)
                            </button>

                            {/* Leave Button */}
                            <button
                              type="button"
                              onClick={() => handleStatusChange(student.studentId, 'LEAVE')}
                              className={`px-3 py-1.5 rounded-lg font-bold text-xs transition ${
                                student.status === 'LEAVE'
                                  ? 'bg-sky-600 text-white shadow-xs'
                                  : 'bg-slate-100 text-slate-600 hover:bg-sky-100 hover:text-sky-700'
                              }`}
                            >
                              Leave (E)
                            </button>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <input
                            type="text"
                            placeholder="Reason for absence/leave..."
                            value={student.remarks}
                            onChange={e => handleRemarkChange(student.studentId, e.target.value)}
                            className="w-full px-2.5 py-1 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 bg-white"
                          />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {register.length > 0 && (
              <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">
                  Confirm presence of all students before final submission.
                </span>
                <button
                  onClick={handleSaveAttendance}
                  disabled={isSaving}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-indigo-200 disabled:opacity-50"
                >
                  {isSaving ? 'Submitting...' : 'Save Daily Attendance'}
                </button>
              </div>
            )}
          </div>
        </>
      ) : (
        /* Monthly Attendance Sheet Report */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">
              Monthly Attendance Register - {classes.find(c => c.id === selectedClassId)?.name}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Cumulative presence matrix and attendance percentages
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Roll</th>
                  <th className="py-3 px-4">Adm #</th>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Total Days</th>
                  <th className="py-3 px-4 text-emerald-700">Present</th>
                  <th className="py-3 px-4 text-rose-700">Absent</th>
                  <th className="py-3 px-4 text-amber-700">Late</th>
                  <th className="py-3 px-4 text-sky-700">Leave</th>
                  <th className="py-3 px-4 text-right">Attendance %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isReportLoading ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-400">
                      Generating monthly attendance sheet...
                    </td>
                  </tr>
                ) : reportData.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-400">
                      No records found for the selected month and class.
                    </td>
                  </tr>
                ) : (
                  reportData.map(row => (
                    <tr key={row.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-bold text-slate-700">{row.rollNo}</td>
                      <td className="py-3 px-4 font-mono font-semibold text-indigo-700">{row.admissionNo}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{row.name}</td>
                      <td className="py-3 px-4 font-semibold text-slate-700">{row.total}</td>
                      <td className="py-3 px-4 font-bold text-emerald-700">{row.present}</td>
                      <td className="py-3 px-4 font-bold text-rose-700">{row.absent}</td>
                      <td className="py-3 px-4 font-bold text-amber-700">{row.late}</td>
                      <td className="py-3 px-4 font-bold text-sky-700">{row.leave}</td>
                      <td className="py-3 px-4 text-right">
                        <span className="font-extrabold text-indigo-700 px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-200">
                          {row.percentage}%
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

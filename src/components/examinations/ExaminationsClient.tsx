'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Award,
  Plus,
  BookOpen,
  Calendar,
  Save,
  CheckCircle2,
  AlertCircle,
  X,
  Printer,
  ChevronRight,
  FileSpreadsheet
} from 'lucide-react';
import { StatusBadge } from '@/components/ui/Badge';
import { createExam, getMarksEntrySheet, saveMarksEntry } from '@/actions/examinations';
import { formatDate } from '@/lib/utils';

interface ExaminationsClientProps {
  initialExams: any[];
  classes: any[];
}

export function ExaminationsClient({ initialExams, classes }: ExaminationsClientProps) {
  const [exams, setExams] = useState(initialExams);
  const [activeTab, setActiveTab] = useState<'exams' | 'marks' | 'cards'>('exams');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // New Exam Form
  const [examForm, setExamForm] = useState({
    title: '',
    session: '2024-2025',
    term: 'MID_TERM',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
  });

  // Marks Entry State
  const [selectedExamId, setSelectedExamId] = useState(exams[0]?.id || '');
  const [selectedClassId, setSelectedClassId] = useState(classes[0]?.id || '');
  const [availableSubjects, setAvailableSubjects] = useState<any[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [marksRows, setMarksRows] = useState<any[]>([]);
  const [isLoadingMarks, setIsLoadingMarks] = useState(false);
  const [isSavingMarks, setIsSavingMarks] = useState(false);

  // Load subjects for selected class
  useEffect(() => {
    if (!selectedClassId) return;
    const cls = classes.find(c => c.id === selectedClassId);
    if (cls) {
      // Fetch subjects for class
      fetch(`/api/subjects?classId=${selectedClassId}`)
        .then(r => r.json())
        .then(d => {
          if (d.data?.subjects) {
            setAvailableSubjects(d.data.subjects);
            if (d.data.subjects.length > 0) {
              setSelectedSubjectId(d.data.subjects[0].id);
            } else {
              setSelectedSubjectId('');
            }
          }
        })
        .catch(() => {
          // fallback if direct action
        });
    }
  }, [selectedClassId, classes]);

  // Load marks entry sheet
  const loadMarksSheet = async () => {
    if (!selectedExamId || !selectedClassId || !selectedSubjectId) return;
    setIsLoadingMarks(true);
    setFeedbackMsg(null);
    try {
      const res = await getMarksEntrySheet(selectedExamId, selectedClassId, selectedSubjectId);
      if (res.success && res.data) {
        setMarksRows(res.data.rows);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoadingMarks(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'marks' && selectedExamId && selectedClassId && selectedSubjectId) {
      loadMarksSheet();
    }
  }, [activeTab, selectedExamId, selectedClassId, selectedSubjectId]);

  const handleMarkChange = (studentId: string, val: string) => {
    setMarksRows(prev =>
      prev.map(r => {
        if (r.studentId === studentId) {
          const num = Number(val);
          let grade = 'F';
          let status = 'FAIL';
          if (num >= 90) grade = 'A+';
          else if (num >= 80) grade = 'A';
          else if (num >= 70) grade = 'B';
          else if (num >= 60) grade = 'C';
          else if (num >= 50) grade = 'D';
          else grade = 'F';

          if (num >= r.passMarks) status = 'PASS';

          return {
            ...r,
            obtainedMarks: val,
            grade,
            status,
          };
        }
        return r;
      })
    );
  };

  const handleRemarkChange = (studentId: string, remarks: string) => {
    setMarksRows(prev =>
      prev.map(r => (r.studentId === studentId ? { ...r, remarks } : r))
    );
  };

  const handleSaveMarks = async () => {
    setIsSavingMarks(true);
    setFeedbackMsg(null);
    try {
      const records = marksRows.map(r => ({
        studentId: r.studentId,
        obtainedMarks: Number(r.obtainedMarks) || 0,
        remarks: r.remarks,
      }));

      const res = await saveMarksEntry({
        examId: selectedExamId,
        classId: selectedClassId,
        subjectId: selectedSubjectId,
        records,
      });

      if (res.success) {
        setFeedbackMsg(`Examination marks successfully saved for ${records.length} students!`);
      } else {
        alert(res.error || 'Failed to save marks');
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSavingMarks(false);
    }
  };

  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const res = await createExam(examForm);
      if (res.success && res.data) {
        setExams(prev => [res.data, ...prev]);
        setIsCreateModalOpen(false);
        setExamForm({
          title: '',
          session: '2024-2025',
          term: 'MID_TERM',
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
        });
      } else {
        setErrorMsg(res.error || 'Failed to create exam');
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Examinations, Marks & Report Cards
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Schedule examinations, enter subject marks, auto-calculate percentages and grades, and print official report cards.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('exams')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'exams'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Exams
          </button>
          <button
            onClick={() => setActiveTab('marks')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'marks'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Enter Marks
          </button>
        </div>
      </div>

      {feedbackMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {activeTab === 'exams' ? (
        /* Exams Tab */
        <div className="space-y-6">
          <div className="flex justify-end">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-indigo-200 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Examination</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exams.map(ex => (
              <div
                key={ex.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                        <Award className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm leading-tight">{ex.title}</h3>
                        <span className="text-[11px] text-slate-400 font-medium">Session: {ex.session}</span>
                      </div>
                    </div>
                    <StatusBadge status={ex.status} />
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Term:</span>
                      <strong className="text-slate-800">{ex.term.replace('_', ' ')}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Date Range:</span>
                      <span className="font-semibold text-slate-700">
                        {formatDate(ex.startDate)} - {formatDate(ex.endDate)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => {
                      setSelectedExamId(ex.id);
                      setActiveTab('marks');
                    }}
                    className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1"
                  >
                    <span>Enter Student Marks →</span>
                  </button>

                  <Link
                    href={`/examinations/reports/${ex.id}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-purple-700 hover:underline"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Report Cards</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Marks Entry Tab */
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Examination *
                </label>
                <select
                  value={selectedExamId}
                  onChange={e => setSelectedExamId(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-semibold border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-slate-50"
                >
                  {exams.map(ex => (
                    <option key={ex.id} value={ex.id}>{ex.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Class (Grade) *
                </label>
                <select
                  value={selectedClassId}
                  onChange={e => setSelectedClassId(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-semibold border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-slate-50"
                >
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Curriculum Subject *
                </label>
                <select
                  value={selectedSubjectId}
                  onChange={e => setSelectedSubjectId(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-semibold border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-slate-50"
                >
                  {availableSubjects.map((sub: any) => (
                    <option key={sub.id} value={sub.id}>{sub.name} ({sub.code})</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Marks Entry Sheet Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Marks Entry Sheet — Max: 100 | Pass: 40
                </h3>
                <p className="text-xs text-slate-400">
                  Input obtained marks for each student. Grade and status will auto-compute.
                </p>
              </div>

              <button
                onClick={handleSaveMarks}
                disabled={isSavingMarks || marksRows.length === 0}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-indigo-200 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSavingMarks ? 'Saving...' : 'Save & Publish Marks'}</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="py-3 px-4">Roll</th>
                    <th className="py-3 px-4">Adm #</th>
                    <th className="py-3 px-4">Student Name</th>
                    <th className="py-3 px-4">Section</th>
                    <th className="py-3 px-4 w-32">Obtained Marks (/100)</th>
                    <th className="py-3 px-4 text-center">Computed Grade</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Teacher Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {isLoadingMarks ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400">
                        Loading student marks sheet...
                      </td>
                    </tr>
                  ) : marksRows.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400">
                        No students enrolled in this class.
                      </td>
                    </tr>
                  ) : (
                    marksRows.map(row => (
                      <tr key={row.studentId} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-bold text-slate-700">{row.rollNo}</td>
                        <td className="py-3 px-4 font-mono font-semibold text-indigo-700">{row.admissionNo}</td>
                        <td className="py-3 px-4 font-bold text-slate-900">{row.studentName}</td>
                        <td className="py-3 px-4 text-slate-600">{row.sectionName}</td>
                        <td className="py-3 px-4">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={row.obtainedMarks}
                            onChange={e => handleMarkChange(row.studentId, e.target.value)}
                            className="w-24 px-3 py-1.5 text-xs font-black border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
                          />
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="font-black px-2 py-0.5 rounded-sm bg-purple-100 text-purple-800 text-[11px]">
                            {row.grade}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <StatusBadge status={row.status} />
                        </td>
                        <td className="py-3 px-4">
                          <input
                            type="text"
                            placeholder="e.g. Excellent progress"
                            value={row.remarks}
                            onChange={e => handleRemarkChange(row.studentId, e.target.value)}
                            className="w-full px-2.5 py-1 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 bg-white"
                          />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {marksRows.length > 0 && (
              <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end">
                <button
                  onClick={handleSaveMarks}
                  disabled={isSavingMarks}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-indigo-200 disabled:opacity-50"
                >
                  {isSavingMarks ? 'Saving...' : 'Save & Publish Marks'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal: Create Exam */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 bg-linear-to-r from-indigo-700 to-indigo-900 text-white flex items-center justify-between">
              <h3 className="text-base font-bold">Schedule Examination</h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateExam} className="p-6 space-y-4 text-xs">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Exam Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Annual Final Examination 2024"
                  value={examForm.title}
                  onChange={e => setExamForm({ ...examForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Academic Session</label>
                  <input
                    type="text"
                    value={examForm.session}
                    onChange={e => setExamForm({ ...examForm, session: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Term</label>
                  <select
                    value={examForm.term}
                    onChange={e => setExamForm({ ...examForm, term: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="FIRST_TERM">First Term</option>
                    <option value="MID_TERM">Mid Term</option>
                    <option value="FINAL_TERM">Final Term</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={examForm.startDate}
                    onChange={e => setExamForm({ ...examForm, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">End Date *</label>
                  <input
                    type="date"
                    required
                    value={examForm.endDate}
                    onChange={e => setExamForm({ ...examForm, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-200 transition disabled:opacity-50"
                >
                  {isSubmitting ? 'Scheduling...' : 'Schedule Exam'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

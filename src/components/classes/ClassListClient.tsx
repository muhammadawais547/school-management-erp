'use client';

import React, { useState } from 'react';
import {
  School,
  Plus,
  Trash2,
  Users,
  BookOpen,
  DollarSign,
  X,
  AlertCircle,
  UserCheck
} from 'lucide-react';
import { createClass, createSection, deleteClass, deleteSection } from '@/actions/classes';
import { formatCurrency } from '@/lib/utils';

interface ClassListClientProps {
  initialClasses: any[];
  teachers: any[];
  currency: string;
}

export function ClassListClient({ initialClasses, teachers, currency }: ClassListClientProps) {
  const [classes, setClasses] = useState(initialClasses);
  const [isAddClassModalOpen, setIsAddClassModalOpen] = useState(false);
  const [isAddSectionModalOpen, setIsAddSectionModalOpen] = useState(false);
  const [selectedClassForSection, setSelectedClassForSection] = useState<any>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Class Form
  const [classForm, setClassForm] = useState({
    name: '',
    gradeLevel: 1,
    numericCode: '',
  });

  // Section Form
  const [sectionForm, setSectionForm] = useState({
    name: 'Section B',
    classTeacherId: '',
    roomNumber: 'Room 102',
    capacity: 40,
  });

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const res = await createClass(classForm);
      if (res.success && res.data) {
        setClasses(prev => [
          ...prev,
          {
            ...res.data,
            sections: [{ id: 'new-sec', name: 'Section A', classTeacher: null, _count: { students: 0 } }],
            subjects: [],
            feeStructures: [],
            _count: { students: 0 },
          },
        ]);
        setIsAddClassModalOpen(false);
        setClassForm({ name: '', gradeLevel: 1, numericCode: '' });
      } else {
        setErrorMsg(res.error || 'Failed to create class');
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenAddSection = (cls: any) => {
    setSelectedClassForSection(cls);
    setSectionForm({
      name: `Section ${String.fromCharCode(65 + cls.sections.length)}`,
      classTeacherId: teachers[0]?.id || '',
      roomNumber: `Room ${cls.gradeLevel}0${cls.sections.length + 1}`,
      capacity: 40,
    });
    setErrorMsg('');
    setIsAddSectionModalOpen(true);
  };

  const handleCreateSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClassForSection) return;
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const res = await createSection({
        classId: selectedClassForSection.id,
        ...sectionForm,
      });

      if (res.success && res.data) {
        const teacherObj = teachers.find(t => t.id === sectionForm.classTeacherId);
        setClasses(prev =>
          prev.map(c => {
            if (c.id === selectedClassForSection.id) {
              return {
                ...c,
                sections: [
                  ...c.sections,
                  {
                    ...res.data,
                    classTeacher: teacherObj || null,
                    _count: { students: 0 },
                  },
                ],
              };
            }
            return c;
          })
        );
        setIsAddSectionModalOpen(false);
      } else {
        setErrorMsg(res.error || 'Failed to create section');
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClass = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
    const res = await deleteClass(id);
    if (res.success) {
      setClasses(prev => prev.filter(c => c.id !== id));
    } else {
      alert(`Error: ${res.error}`);
    }
  };

  const handleDeleteSection = async (sectionId: string, sectionName: string, classId: string) => {
    if (!confirm(`Are you sure you want to delete "${sectionName}"?`)) return;
    const res = await deleteSection(sectionId);
    if (res.success) {
      setClasses(prev =>
        prev.map(c => {
          if (c.id === classId) {
            return {
              ...c,
              sections: c.sections.filter((s: any) => s.id !== sectionId),
            };
          }
          return c;
        })
      );
    } else {
      alert(`Error: ${res.error}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Academic Classes & Sections
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Configure school grades, divide into sections, assign in-charge class teachers, and view enrollments.
          </p>
        </div>
        <button
          onClick={() => {
            setErrorMsg('');
            setIsAddClassModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-indigo-200 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Class</span>
        </button>
      </div>

      {/* Classes List Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {classes.map(cls => (
          <div
            key={cls.id}
            className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs hover:shadow-md transition flex flex-col justify-between"
          >
            <div>
              {/* Class Title & Badges */}
              <div className="flex items-start justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-extrabold text-lg">
                    {cls.gradeLevel}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">{cls.name}</h2>
                    <span className="text-xs text-slate-400 font-medium">
                      Code: {cls.numericCode || `G${cls.gradeLevel}`} • Grade Level: {cls.gradeLevel}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {cls._count?.students || 0} Students
                  </span>
                  <button
                    onClick={() => handleDeleteClass(cls.id, cls.name)}
                    title="Delete Class"
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Sections Breakdown */}
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <span>Sections ({cls.sections.length})</span>
                  <button
                    onClick={() => handleOpenAddSection(cls)}
                    className="inline-flex items-center gap-1 text-indigo-600 hover:underline capitalize"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Section</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {cls.sections.map((sec: any) => (
                    <div
                      key={sec.id}
                      className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{sec.name}</span>
                          <span className="text-[11px] text-slate-400">({sec.roomNumber || 'Room N/A'})</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-1">
                          <UserCheck className="w-3 h-3 text-indigo-500" />
                          <span>
                            Class Teacher: <strong className="text-slate-700">{sec.classTeacher ? sec.classTeacher.name : 'Unassigned'}</strong>
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-slate-600 bg-white px-2 py-0.5 rounded-md border border-slate-200 text-[11px]">
                          {sec._count?.students || 0} / {sec.capacity} Enrolled
                        </span>
                        <button
                          onClick={() => handleDeleteSection(sec.id, sec.name, cls.id)}
                          className="text-slate-400 hover:text-rose-600"
                          title="Remove Section"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Metrics Footer */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                <span>{cls.subjects?.length || 0} Subjects</span>
              </span>
              <span className="flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                <span>{cls.feeStructures?.length || 0} Fee Structures Defined</span>
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Add Class */}
      {isAddClassModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 bg-linear-to-r from-indigo-700 to-indigo-900 text-white flex items-center justify-between">
              <h3 className="text-base font-bold">Add Academic Class</h3>
              <button
                onClick={() => setIsAddClassModalOpen(false)}
                className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateClass} className="p-6 space-y-4 text-xs">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Class Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Grade 11 or Nursery"
                  value={classForm.name}
                  onChange={e => setClassForm({ ...classForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Grade Level (Numeric) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  max="16"
                  value={classForm.gradeLevel}
                  onChange={e => setClassForm({ ...classForm, gradeLevel: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Short Code</label>
                <input
                  type="text"
                  placeholder="e.g. G11"
                  value={classForm.numericCode}
                  onChange={e => setClassForm({ ...classForm, numericCode: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddClassModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-200 transition disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating...' : 'Create Class'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Section */}
      {isAddSectionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 bg-linear-to-r from-indigo-700 to-indigo-900 text-white flex items-center justify-between">
              <h3 className="text-base font-bold">
                Add Section to {selectedClassForSection?.name}
              </h3>
              <button
                onClick={() => setIsAddSectionModalOpen(false)}
                className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateSection} className="p-6 space-y-4 text-xs">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Section Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Section C"
                  value={sectionForm.name}
                  onChange={e => setSectionForm({ ...sectionForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assign Class Teacher</label>
                <select
                  value={sectionForm.classTeacherId}
                  onChange={e => setSectionForm({ ...sectionForm, classTeacherId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="">-- No Class Teacher --</option>
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>{t.name} ({t.employeeId})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Room Number</label>
                  <input
                    type="text"
                    placeholder="e.g. Room 204"
                    value={sectionForm.roomNumber}
                    onChange={e => setSectionForm({ ...sectionForm, roomNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Capacity</label>
                  <input
                    type="number"
                    value={sectionForm.capacity}
                    onChange={e => setSectionForm({ ...sectionForm, capacity: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddSectionModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-200 transition disabled:opacity-50"
                >
                  {isSubmitting ? 'Adding...' : 'Add Section'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

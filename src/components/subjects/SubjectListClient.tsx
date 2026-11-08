'use client';

import React, { useState } from 'react';
import { BookOpen, Plus, Edit2, Trash2, X, AlertCircle } from 'lucide-react';
import { createSubject, updateSubject, deleteSubject } from '@/actions/subjects';

interface SubjectListClientProps {
  initialSubjects: any[];
  classes: any[];
  teachers: any[];
}

export function SubjectListClient({ initialSubjects, classes, teachers }: SubjectListClientProps) {
  const [subjects, setSubjects] = useState(initialSubjects);
  const [selectedClass, setSelectedClass] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    type: 'CORE',
    classId: classes[0]?.id || '',
    teacherId: teachers[0]?.id || '',
  });

  const handleOpenAdd = () => {
    setEditingSubject(null);
    setFormData({
      name: '',
      code: '',
      type: 'CORE',
      classId: classes[0]?.id || '',
      teacherId: teachers[0]?.id || '',
    });
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (sub: any) => {
    setEditingSubject(sub);
    setFormData({
      name: sub.name,
      code: sub.code,
      type: sub.type,
      classId: sub.classId,
      teacherId: sub.teacherId || '',
    });
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      if (editingSubject) {
        const res = await updateSubject(editingSubject.id, formData);
        if (res.success && res.data) {
          const tObj = teachers.find(t => t.id === formData.teacherId);
          const cObj = classes.find(c => c.id === formData.classId);
          setSubjects(prev =>
            prev.map(s =>
              s.id === editingSubject.id
                ? { ...s, ...res.data, teacher: tObj || null, class: cObj }
                : s
            )
          );
          setIsModalOpen(false);
        } else {
          setErrorMsg(res.error || 'Failed to update subject');
        }
      } else {
        const res = await createSubject(formData);
        if (res.success && res.data) {
          const tObj = teachers.find(t => t.id === formData.teacherId);
          const cObj = classes.find(c => c.id === formData.classId);
          setSubjects(prev => [{ ...res.data, teacher: tObj || null, class: cObj }, ...prev]);
          setIsModalOpen(false);
        } else {
          setErrorMsg(res.error || 'Failed to create subject');
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove subject "${name}"?`)) return;
    const res = await deleteSubject(id);
    if (res.success) {
      setSubjects(prev => prev.filter(s => s.id !== id));
    } else {
      alert(`Error deleting: ${res.error}`);
    }
  };

  const filteredSubjects = subjects.filter(s => {
    if (selectedClass !== 'ALL' && s.classId !== selectedClass) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Academic Subjects & Curriculum
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Assign curriculum subjects, course codes, and teacher allocations per grade level.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-indigo-200 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add Subject</span>
        </button>
      </div>

      {/* Filter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Filter By Class:
          </label>
          <select
            value={selectedClass}
            onChange={e => setSelectedClass(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-slate-50"
          >
            <option value="ALL">All Classes</option>
            {classes.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <span className="text-xs text-slate-500 font-semibold">
          Total: <strong>{filteredSubjects.length}</strong> Subjects
        </span>
      </div>

      {/* Subjects Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
              <th className="py-3 px-4">Subject Name</th>
              <th className="py-3 px-4">Code</th>
              <th className="py-3 px-4">Class</th>
              <th className="py-3 px-4">Type</th>
              <th className="py-3 px-4">Assigned Teacher</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredSubjects.map(sub => (
              <tr key={sub.id} className="hover:bg-slate-50">
                <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-indigo-500" />
                  <span>{sub.name}</span>
                </td>
                <td className="py-3 px-4 font-mono font-semibold text-indigo-700">
                  {sub.code}
                </td>
                <td className="py-3 px-4 font-semibold text-slate-700">
                  {sub.class?.name}
                </td>
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 rounded-sm bg-slate-100 text-slate-700 font-semibold text-[10px]">
                    {sub.type}
                  </span>
                </td>
                <td className="py-3 px-4 font-medium text-slate-800">
                  {sub.teacher ? sub.teacher.name : <span className="text-slate-400 italic">Unassigned</span>}
                </td>
                <td className="py-3 px-4 text-right space-x-1">
                  <button
                    onClick={() => handleOpenEdit(sub)}
                    className="p-1.5 text-slate-500 hover:text-amber-600 rounded-lg hover:bg-amber-50"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(sub.id, sub.name)}
                    className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 bg-linear-to-r from-indigo-700 to-indigo-900 text-white flex items-center justify-between">
              <h3 className="text-base font-bold">
                {editingSubject ? 'Edit Subject' : 'Add Curriculum Subject'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Subject Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Physics"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Subject Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. PHY-901"
                  value={formData.code}
                  onChange={e => setFormData({ ...formData, code: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Class *</label>
                <select
                  value={formData.classId}
                  onChange={e => setFormData({ ...formData, classId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Subject Type</label>
                <select
                  value={formData.type}
                  onChange={e => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="CORE">Core Subject</option>
                  <option value="ELECTIVE">Elective Subject</option>
                  <option value="PRACTICAL">Practical / Lab</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assigned Teacher</label>
                <select
                  value={formData.teacherId}
                  onChange={e => setFormData({ ...formData, teacherId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="">-- No Teacher Assigned --</option>
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>{t.name} ({t.designation})</option>
                  ))}
                </select>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-200 transition disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : editingSubject ? 'Update Subject' : 'Save Subject'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

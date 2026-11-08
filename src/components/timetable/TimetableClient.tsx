'use client';

import React, { useState } from 'react';
import {
  CalendarDays,
  Plus,
  Trash2,
  X,
  AlertCircle,
  Clock,
  BookOpen,
  UserCheck
} from 'lucide-react';
import { saveTimetableSlot, deleteTimetableSlot } from '@/actions/timetable';

interface TimetableClientProps {
  classes: any[];
  initialSlots: any[];
  teachers: any[];
}

export function TimetableClient({ classes, initialSlots, teachers }: TimetableClientProps) {
  const [selectedClassId, setSelectedClassId] = useState(classes[0]?.id || '');
  const [selectedSectionId, setSelectedSectionId] = useState(classes[0]?.sections[0]?.id || '');
  const [slots, setSlots] = useState(initialSlots);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const activeClass = classes.find(c => c.id === selectedClassId) || classes[0];
  const availableSections = activeClass?.sections || [];
  const availableSubjects = activeClass?.subjects || [];

  const [formData, setFormData] = useState({
    dayOfWeek: 'MONDAY',
    periodNumber: 1,
    subjectId: availableSubjects[0]?.id || '',
    teacherId: teachers[0]?.id || '',
    startTime: '08:00 AM',
    endTime: '08:45 AM',
    roomNumber: 'Room 801',
  });

  const handleClassChange = (cId: string) => {
    setSelectedClassId(cId);
    const cls = classes.find(c => c.id === cId);
    if (cls && cls.sections.length > 0) {
      setSelectedSectionId(cls.sections[0].id);
    }
  };

  const handleOpenAdd = () => {
    setFormData({
      dayOfWeek: 'MONDAY',
      periodNumber: 1,
      subjectId: availableSubjects[0]?.id || '',
      teacherId: teachers[0]?.id || '',
      startTime: '08:00 AM',
      endTime: '08:45 AM',
      roomNumber: activeClass?.sections[0]?.roomNumber || 'Room 101',
    });
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const res = await saveTimetableSlot({
        classId: selectedClassId,
        sectionId: selectedSectionId,
        ...formData,
      });

      if (res.success && res.data) {
        const sub = availableSubjects.find((s: any) => s.id === formData.subjectId);
        const t = teachers.find((teach: any) => teach.id === formData.teacherId);
        setSlots(prev => [...prev, { ...res.data, subject: sub, teacher: t }]);
        setIsModalOpen(false);
      } else {
        setErrorMsg(res.error || 'Failed to save schedule slot');
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSlot = async (id: string) => {
    if (!confirm('Remove this timetable slot?')) return;
    const res = await deleteTimetableSlot(id);
    if (res.success) {
      setSlots(prev => prev.filter(s => s.id !== id));
    }
  };

  const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];
  const periods = [1, 2, 3, 4, 5];

  // Filter slots for current class & section
  const currentSlots = slots.filter(
    (s: any) => s.classId === selectedClassId && s.sectionId === selectedSectionId
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Academic Timetable & Routines
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Weekly class schedule matrix mapped across periods, subjects, teachers, and classrooms.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-indigo-200 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add Timetable Slot</span>
        </button>
      </div>

      {/* Class and Section Filter */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap gap-4 items-center">
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Select Class
          </label>
          <select
            value={selectedClassId}
            onChange={e => handleClassChange(e.target.value)}
            className="px-3 py-2 text-xs font-semibold border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-slate-50 text-slate-700 min-w-44"
          >
            {classes.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Select Section
          </label>
          <select
            value={selectedSectionId}
            onChange={e => setSelectedSectionId(e.target.value)}
            className="px-3 py-2 text-xs font-semibold border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-slate-50 text-slate-700 min-w-44"
          >
            {availableSections.map((sec: any) => (
              <option key={sec.id} value={sec.id}>{sec.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Weekly Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3 px-4 border-r border-slate-200 w-28">Day / Period</th>
                {periods.map(p => (
                  <th key={p} className="py-3 px-4 border-r border-slate-200 text-center min-w-44">
                    Period {p}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {days.map(day => (
                <tr key={day} className="hover:bg-slate-50/50">
                  <td className="py-4 px-4 font-black text-indigo-900 border-r border-slate-200 bg-slate-50/70">
                    {day}
                  </td>
                  {periods.map(p => {
                    const slot = currentSlots.find(
                      s => s.dayOfWeek === day && s.periodNumber === p
                    );

                    return (
                      <td key={p} className="py-3 px-3 border-r border-slate-200 align-top">
                        {slot ? (
                          <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-100 space-y-1 relative group">
                            <button
                              onClick={() => handleDeleteSlot(slot.id)}
                              className="absolute top-1 right-1 p-1 text-slate-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition"
                              title="Delete Slot"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                            <span className="font-extrabold text-indigo-900 block text-xs">
                              {slot.subject?.name}
                            </span>
                            <span className="text-[11px] text-slate-600 flex items-center gap-1 font-medium">
                              <UserCheck className="w-3 h-3 text-indigo-500" />
                              <span>{slot.teacher ? slot.teacher.name : 'Faculty'}</span>
                            </span>
                            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-indigo-100/60 mt-1">
                              <span>{slot.startTime} - {slot.endTime}</span>
                              <span className="font-semibold text-slate-500">{slot.roomNumber}</span>
                            </div>
                          </div>
                        ) : (
                          <div className="h-20 rounded-xl border-2 border-dashed border-slate-100 flex items-center justify-center text-slate-300 text-[11px]">
                            Free Period
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add Timetable Slot */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 bg-linear-to-r from-indigo-700 to-indigo-900 text-white flex items-center justify-between">
              <h3 className="text-base font-bold">Add Timetable Slot</h3>
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Day of Week *</label>
                  <select
                    value={formData.dayOfWeek}
                    onChange={e => setFormData({ ...formData, dayOfWeek: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    {days.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Period Number *</label>
                  <select
                    value={formData.periodNumber}
                    onChange={e => setFormData({ ...formData, periodNumber: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    {periods.map(p => (
                      <option key={p} value={p}>Period {p}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Subject *</label>
                <select
                  value={formData.subjectId}
                  onChange={e => setFormData({ ...formData, subjectId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  {availableSubjects.map((sub: any) => (
                    <option key={sub.id} value={sub.id}>{sub.name} ({sub.code})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assign Teacher</label>
                <select
                  value={formData.teacherId}
                  onChange={e => setFormData({ ...formData, teacherId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>{t.name} ({t.designation})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Start Time</label>
                  <input
                    type="text"
                    value={formData.startTime}
                    onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">End Time</label>
                  <input
                    type="text"
                    value={formData.endTime}
                    onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Classroom / Hall</label>
                <input
                  type="text"
                  value={formData.roomNumber}
                  onChange={e => setFormData({ ...formData, roomNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
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
                  {isSubmitting ? 'Saving...' : 'Add Slot'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

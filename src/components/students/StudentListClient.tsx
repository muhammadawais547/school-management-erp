'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Filter,
  Plus,
  Eye,
  Edit2,
  Trash2,
  X,
  GraduationCap,
  Phone,
  Mail,
  School,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { StatusBadge } from '@/components/ui/Badge';
import { createStudent, updateStudent, deleteStudent } from '@/actions/students';

interface StudentListClientProps {
  initialStudents: any[];
  classes: any[];
  currency: string;
}

export function StudentListClient({ initialStudents, classes, currency }: StudentListClientProps) {
  const [students, setStudents] = useState(initialStudents);
  const [search, setSearch] = useState('');
  const [selectedClass, setSelectedClass] = useState('ALL');
  const [selectedSection, setSelectedSection] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    admissionNo: '',
    rollNo: '',
    firstName: '',
    lastName: '',
    gender: 'Male',
    dob: '2010-01-01',
    bloodGroup: 'B+',
    classId: classes[0]?.id || '',
    sectionId: classes[0]?.sections[0]?.id || '',
    parentName: '',
    parentRelationship: 'Father',
    parentPhone: '',
    parentEmail: '',
    parentOccupation: '',
    address: '',
  });

  // Filter sections based on selected class
  const activeClassObj = classes.find(c => c.id === formData.classId) || classes[0];
  const availableSections = activeClassObj?.sections || [];

  const handleClassChangeInForm = (cId: string) => {
    const cls = classes.find(c => c.id === cId);
    setFormData(prev => ({
      ...prev,
      classId: cId,
      sectionId: cls?.sections[0]?.id || '',
    }));
  };

  const handleOpenAdd = () => {
    setEditingStudent(null);
    setFormData({
      admissionNo: '',
      rollNo: String(students.length + 1),
      firstName: '',
      lastName: '',
      gender: 'Male',
      dob: '2010-01-01',
      bloodGroup: 'B+',
      classId: classes[0]?.id || '',
      sectionId: classes[0]?.sections[0]?.id || '',
      parentName: '',
      parentRelationship: 'Father',
      parentPhone: '',
      parentEmail: '',
      parentOccupation: '',
      address: '',
    });
    setErrorMsg('');
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (stu: any) => {
    setEditingStudent(stu);
    setFormData({
      admissionNo: stu.admissionNo,
      rollNo: stu.rollNo,
      firstName: stu.firstName,
      lastName: stu.lastName,
      gender: stu.gender,
      dob: stu.dob ? new Date(stu.dob).toISOString().split('T')[0] : '2010-01-01',
      bloodGroup: stu.bloodGroup || 'B+',
      classId: stu.classId,
      sectionId: stu.sectionId,
      parentName: stu.parentName,
      parentRelationship: stu.parentRelationship || 'Father',
      parentPhone: stu.parentPhone,
      parentEmail: stu.parentEmail || '',
      parentOccupation: stu.parentOccupation || '',
      address: stu.address || '',
    });
    setErrorMsg('');
    setIsAddModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      if (editingStudent) {
        const res = await updateStudent(editingStudent.id, formData);
        if (res.success && res.data) {
          setStudents(prev =>
            prev.map(s => (s.id === editingStudent.id ? { ...s, ...res.data } : s))
          );
          setIsAddModalOpen(false);
        } else {
          setErrorMsg(res.error || 'Failed to update student');
        }
      } else {
        const res = await createStudent(formData);
        if (res.success && res.data) {
          const newStudent = {
            ...res.data,
            class: classes.find(c => c.id === formData.classId),
            section: availableSections.find((s: any) => s.id === formData.sectionId),
            feeSlips: [],
          };
          setStudents(prev => [newStudent, ...prev]);
          setIsAddModalOpen(false);
        } else {
          setErrorMsg(res.error || 'Failed to create student');
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove student "${name}"? This action cannot be undone.`)) {
      return;
    }
    const res = await deleteStudent(id);
    if (res.success) {
      setStudents(prev => prev.filter(s => s.id !== id));
    } else {
      alert(`Error deleting: ${res.error}`);
    }
  };

  // Filter students
  const filteredStudents = students.filter(s => {
    if (selectedClass !== 'ALL' && s.classId !== selectedClass) return false;
    if (selectedSection !== 'ALL' && s.sectionId !== selectedSection) return false;
    if (statusFilter !== 'ALL' && s.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = `${s.firstName} ${s.lastName}`.toLowerCase().includes(q);
      const matchAdm = s.admissionNo.toLowerCase().includes(q);
      const matchRoll = s.rollNo.toLowerCase().includes(q);
      const matchParent = s.parentName?.toLowerCase().includes(q);
      if (!matchName && !matchAdm && !matchRoll && !matchParent) return false;
    }
    return true;
  });

  const currentClassObj = classes.find(c => c.id === selectedClass);
  const filterSections = currentClassObj?.sections || [];

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Student Information Management (SIMS)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Browse, admit, edit, and track students across all academic classes.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-indigo-200 transition"
        >
          <Plus className="w-4 h-4" />
          <span>New Admission</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by name, adm #, roll..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs font-medium border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
            />
          </div>

          {/* Class Filter */}
          <div>
            <select
              value={selectedClass}
              onChange={e => {
                setSelectedClass(e.target.value);
                setSelectedSection('ALL');
              }}
              className="w-full px-3 py-2 text-xs font-semibold border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-slate-50/50 text-slate-700"
            >
              <option value="ALL">All Classes (Grades)</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Section Filter */}
          <div>
            <select
              value={selectedSection}
              onChange={e => setSelectedSection(e.target.value)}
              disabled={selectedClass === 'ALL'}
              className="w-full px-3 py-2 text-xs font-semibold border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-slate-50/50 text-slate-700 disabled:opacity-50"
            >
              <option value="ALL">All Sections</option>
              {filterSections.map((sec: any) => (
                <option key={sec.id} value={sec.id}>
                  {sec.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs font-semibold border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-slate-50/50 text-slate-700"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="ALUMNI">Alumni</option>
            </select>
          </div>
        </div>

        {/* Count Pill */}
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500 pt-2 border-t border-slate-100">
          <span>
            Showing <strong className="text-slate-900">{filteredStudents.length}</strong> enrolled students
          </span>
          {(search || selectedClass !== 'ALL' || statusFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearch('');
                setSelectedClass('ALL');
                setSelectedSection('ALL');
                setStatusFilter('ALL');
              }}
              className="text-indigo-600 hover:underline"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Students Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Adm #</th>
                <th className="py-3 px-4">Roll</th>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Class & Section</th>
                <th className="py-3 px-4">Parent / Contact</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No students found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredStudents.map(stu => (
                  <tr key={stu.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-indigo-700">
                      {stu.admissionNo}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-600">
                      {stu.rollNo}
                    </td>
                    <td className="py-3.5 px-4">
                      <Link
                        href={`/students/${stu.id}`}
                        className="font-bold text-slate-900 hover:text-indigo-600 flex items-center gap-1.5"
                      >
                        <GraduationCap className="w-3.5 h-3.5 text-indigo-500" />
                        <span>{stu.firstName} {stu.lastName}</span>
                      </Link>
                      <span className="block text-[11px] text-slate-400">
                        {stu.gender} • Blood: {stu.bloodGroup || 'N/A'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-800">
                        {stu.class?.name}
                      </span>
                      <span className="block text-[11px] text-slate-400">
                        {stu.section?.name || 'Section A'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">
                        {stu.parentName} ({stu.parentRelationship})
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{stu.parentPhone}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={stu.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <Link
                          href={`/students/${stu.id}`}
                          title="View Profile & Records"
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleOpenEdit(stu)}
                          title="Edit Information"
                          className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(stu.id, `${stu.firstName} ${stu.lastName}`)}
                          title="Delete Student"
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Student Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden my-8">
            <div className="px-6 py-4 bg-linear-to-r from-indigo-700 to-indigo-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-indigo-300" />
                <h3 className="text-base font-bold">
                  {editingStudent ? 'Edit Student Details' : 'Student Admission Form'}
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto text-xs">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Academic Placement */}
              <div>
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-3 pb-1 border-b border-slate-100">
                  1. Academic Details
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Admission Number
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. ADM-2024-025"
                      value={formData.admissionNo}
                      onChange={e => setFormData({ ...formData, admissionNo: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-slate-50"
                    />
                    <span className="text-[10px] text-slate-400 mt-0.5 block">Leave blank to auto-generate</span>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Class (Grade) *
                    </label>
                    <select
                      value={formData.classId}
                      onChange={e => handleClassChangeInForm(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white"
                    >
                      {classes.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Section *
                    </label>
                    <select
                      value={formData.sectionId}
                      onChange={e => setFormData({ ...formData, sectionId: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white"
                    >
                      {availableSections.map((sec: any) => (
                        <option key={sec.id} value={sec.id}>{sec.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Bio Details */}
              <div>
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-3 pb-1 border-b border-slate-100">
                  2. Student Bio & Demographics
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">First Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Hamza"
                      value={formData.firstName}
                      onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Last Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Malik"
                      value={formData.lastName}
                      onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Roll No *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 15"
                      value={formData.rollNo}
                      onChange={e => setFormData({ ...formData, rollNo: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Gender *</label>
                    <select
                      value={formData.gender}
                      onChange={e => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Date of Birth</label>
                    <input
                      type="date"
                      value={formData.dob}
                      onChange={e => setFormData({ ...formData, dob: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Blood Group</label>
                    <select
                      value={formData.bloodGroup}
                      onChange={e => setFormData({ ...formData, bloodGroup: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white"
                    >
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Parent & Guardian Info */}
              <div>
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-3 pb-1 border-b border-slate-100">
                  3. Parent / Guardian Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Father / Guardian Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Tariq Malik"
                      value={formData.parentName}
                      onChange={e => setFormData({ ...formData, parentName: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Relationship</label>
                    <select
                      value={formData.parentRelationship}
                      onChange={e => setFormData({ ...formData, parentRelationship: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white"
                    >
                      <option value="Father">Father</option>
                      <option value="Mother">Mother</option>
                      <option value="Guardian">Guardian</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Phone Number *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. +92 300 1234567"
                      value={formData.parentPhone}
                      onChange={e => setFormData({ ...formData, parentPhone: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Parent Email</label>
                    <input
                      type="email"
                      placeholder="parent@example.com"
                      value={formData.parentEmail}
                      onChange={e => setFormData({ ...formData, parentEmail: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-slate-700 mb-1">Residential Address</label>
                    <input
                      type="text"
                      placeholder="Street, Sector, City"
                      value={formData.address}
                      onChange={e => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-200 transition disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : editingStudent ? 'Update Student' : 'Admit Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

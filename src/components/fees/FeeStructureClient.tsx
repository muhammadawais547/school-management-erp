'use client';

import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Plus,
  Trash2,
  X,
  AlertCircle,
  School,
  DollarSign
} from 'lucide-react';
import { createFeeStructure, deleteFeeStructure } from '@/actions/fees';
import { formatCurrency } from '@/lib/utils';

interface FeeStructureClientProps {
  initialStructures: any[];
  classes: any[];
  currency: string;
}

export function FeeStructureClient({ initialStructures, classes, currency }: FeeStructureClientProps) {
  const [structures, setStructures] = useState(initialStructures);
  const [selectedClass, setSelectedClass] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    classId: classes[0]?.id || '',
    feeType: 'Tuition Fee',
    amount: 150,
    frequency: 'MONTHLY',
    description: '',
  });

  const handleOpenAdd = () => {
    setFormData({
      classId: classes[0]?.id || '',
      feeType: 'Tuition Fee',
      amount: 150,
      frequency: 'MONTHLY',
      description: '',
    });
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const res = await createFeeStructure(formData);
      if (res.success && res.data) {
        const cls = classes.find(c => c.id === formData.classId);
        setStructures(prev => [{ ...res.data, class: cls }, ...prev]);
        setIsModalOpen(false);
      } else {
        setErrorMsg(res.error || 'Failed to create fee structure');
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete fee category "${name}"?`)) return;
    const res = await deleteFeeStructure(id);
    if (res.success) {
      setStructures(prev => prev.filter(s => s.id !== id));
    } else {
      alert(`Error: ${res.error}`);
    }
  };

  const filteredStructures = structures.filter(s => {
    if (selectedClass !== 'ALL' && s.classId !== selectedClass) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Fee Structures & Category Rules
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Define tuition fees, computer lab fees, and exam charges per academic class.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-indigo-200 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add Fee Structure</span>
        </button>
      </div>

      {/* Filter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Filter by Class:
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
          Total Rules: <strong>{filteredStructures.length}</strong>
        </span>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
              <th className="py-3 px-4">Class</th>
              <th className="py-3 px-4">Fee Category</th>
              <th className="py-3 px-4">Frequency</th>
              <th className="py-3 px-4">Amount</th>
              <th className="py-3 px-4">Description</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredStructures.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400">
                  No fee categories defined for this class.
                </td>
              </tr>
            ) : (
              filteredStructures.map(s => (
                <tr key={s.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-bold text-slate-900">{s.class?.name}</td>
                  <td className="py-3 px-4 font-semibold text-indigo-700 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                    <span>{s.feeType}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-sm bg-slate-100 text-slate-700 font-semibold text-[10px]">
                      {s.frequency}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-extrabold text-emerald-700 text-sm">
                    {formatCurrency(s.amount, currency)}
                  </td>
                  <td className="py-3 px-4 text-slate-500">{s.description || '-'}</td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleDelete(s.id, s.feeType)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                      title="Delete Structure"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 bg-linear-to-r from-indigo-700 to-indigo-900 text-white flex items-center justify-between">
              <h3 className="text-base font-bold">Add Fee Structure</h3>
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
                <label className="block font-semibold text-slate-700 mb-1">Applicable Class *</label>
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
                <label className="block font-semibold text-slate-700 mb-1">Fee Type / Category *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tuition Fee, Exam Fee, Lab Fee"
                  value={formData.feeType}
                  onChange={e => setFormData({ ...formData, feeType: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Amount ({currency}) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.amount}
                    onChange={e => setFormData({ ...formData, amount: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Billing Frequency</label>
                  <select
                    value={formData.frequency}
                    onChange={e => setFormData({ ...formData, frequency: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="MONTHLY">Monthly</option>
                    <option value="ONE_TIME">One Time</option>
                    <option value="PER_EXAM">Per Exam</option>
                    <option value="ANNUALLY">Annually</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description / Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Standard monthly academic charges"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
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
                  {isSubmitting ? 'Saving...' : 'Save Structure'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

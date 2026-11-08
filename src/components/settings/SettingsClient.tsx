'use client';

import React, { useState } from 'react';
import {
  Settings,
  School,
  ShieldCheck,
  UserPlus,
  Save,
  CheckCircle2,
  AlertCircle,
  X,
  Mail,
  Lock
} from 'lucide-react';
import { updateInstituteSettings, createUser } from '@/actions/institute';
import { StatusBadge } from '@/components/ui/Badge';

interface SettingsClientProps {
  initialInstitute: any;
  initialUsers: any[];
}

export function SettingsClient({ initialInstitute, initialUsers }: SettingsClientProps) {
  const [institute, setInstitute] = useState(initialInstitute);
  const [users, setUsers] = useState(initialUsers);

  const [isSavingInst, setIsSavingInst] = useState(false);
  const [instSuccess, setInstSuccess] = useState(false);
  const [instError, setInstError] = useState('');

  // User Modal
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isSubmittingUser, setIsSubmittingUser] = useState(false);
  const [userError, setUserError] = useState('');

  const [instForm, setInstForm] = useState({
    name: institute?.name || '',
    code: institute?.code || '',
    tagline: institute?.tagline || '',
    address: institute?.address || '',
    phone: institute?.phone || '',
    email: institute?.email || '',
    currencySymbol: institute?.currencySymbol || '$',
    currentSession: institute?.currentSession || '2024-2025',
  });

  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    passwordHash: 'password123',
    role: 'TEACHER',
  });

  const handleUpdateInstitute = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingInst(true);
    setInstSuccess(false);
    setInstError('');

    try {
      const res = await updateInstituteSettings(institute.id, instForm);
      if (res.success && res.data) {
        setInstitute(res.data);
        setInstSuccess(true);
        setTimeout(() => setInstSuccess(false), 3000);
      } else {
        setInstError(res.error || 'Failed to update institute');
      }
    } catch (err: any) {
      setInstError(err.message);
    } finally {
      setIsSavingInst(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingUser(true);
    setUserError('');

    try {
      const res = await createUser(userForm);
      if (res.success && res.data) {
        setUsers(prev => [...prev, res.data]);
        setIsUserModalOpen(false);
        setUserForm({ name: '', email: '', passwordHash: 'password123', role: 'TEACHER' });
      } else {
        setUserError(res.error || 'Failed to create user');
      }
    } catch (err: any) {
      setUserError(err.message);
    } finally {
      setIsSubmittingUser(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Institute Settings & Access Control
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Configure school identity, currency format, active session, and manage role-based user accounts.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Institute Profile Form */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs">
          <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
            <School className="w-5 h-5 text-indigo-600" />
            <span>Institute Profile & Branding</span>
          </h3>

          <form onSubmit={handleUpdateInstitute} className="mt-5 space-y-4 text-xs">
            {instSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Institute settings successfully updated!</span>
              </div>
            )}
            {instError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                <span>{instError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">School Name *</label>
                <input
                  type="text"
                  required
                  value={instForm.name}
                  onChange={e => setInstForm({ ...instForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 font-bold text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">School Code / Reg #</label>
                <input
                  type="text"
                  value={instForm.code}
                  onChange={e => setInstForm({ ...instForm, code: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tagline / Motto</label>
                <input
                  type="text"
                  value={instForm.tagline}
                  onChange={e => setInstForm({ ...instForm, tagline: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Currency Symbol</label>
                <input
                  type="text"
                  value={instForm.currencySymbol}
                  onChange={e => setInstForm({ ...instForm, currencySymbol: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Current Academic Session</label>
                <input
                  type="text"
                  value={instForm.currentSession}
                  onChange={e => setInstForm({ ...instForm, currentSession: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 font-semibold text-indigo-700"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Official Phone</label>
                <input
                  type="text"
                  value={instForm.phone}
                  onChange={e => setInstForm({ ...instForm, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Official Email</label>
                <input
                  type="email"
                  value={instForm.email}
                  onChange={e => setInstForm({ ...instForm, email: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">Campus Address</label>
                <input
                  type="text"
                  value={instForm.address}
                  onChange={e => setInstForm({ ...instForm, address: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={isSavingInst}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-200 transition disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSavingInst ? 'Saving...' : 'Save Settings'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right: Role & User Management */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-purple-600" />
              <span>ERP Staff Accounts</span>
            </h3>
            <button
              onClick={() => {
                setUserError('');
                setIsUserModalOpen(true);
              }}
              className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
              title="Add User"
            >
              <UserPlus className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            {users.map(u => (
              <div
                key={u.id}
                className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{u.name}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-100 text-purple-800">
                    {u.role.replace('_', ' ')}
                  </span>
                </div>
                <div className="text-slate-500 text-[11px] flex items-center gap-1">
                  <Mail className="w-3 h-3 text-slate-400" />
                  <span>{u.email}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal: Add User */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 bg-linear-to-r from-purple-700 to-indigo-900 text-white flex items-center justify-between">
              <h3 className="text-base font-bold">Add System User Account</h3>
              <button
                onClick={() => setIsUserModalOpen(false)}
                className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-6 space-y-4 text-xs">
              {userError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{userError}</span>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Asim Rauf"
                  value={userForm.name}
                  onChange={e => setUserForm({ ...userForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email *</label>
                <input
                  type="email"
                  required
                  placeholder="user@apexschool.edu"
                  value={userForm.email}
                  onChange={e => setUserForm({ ...userForm, email: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Password</label>
                <input
                  type="password"
                  value={userForm.passwordHash}
                  onChange={e => setUserForm({ ...userForm, passwordHash: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assigned Role *</label>
                <select
                  value={userForm.role}
                  onChange={e => setUserForm({ ...userForm, role: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white font-bold text-slate-800"
                >
                  <option value="SUPER_ADMIN">Super Admin (Full Administrative Authority)</option>
                  <option value="SCHOOL_ADMIN">School Admin (Academic & Operations)</option>
                  <option value="ACCOUNTANT">Accountant (Fee Slips, Cash Collection, Receipts)</option>
                  <option value="TEACHER">Teacher (Attendance & Marks Entry)</option>
                </select>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsUserModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingUser}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-200 transition disabled:opacity-50"
                >
                  {isSubmittingUser ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

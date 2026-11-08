'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  BookOpen,
  CalendarCheck,
  Receipt,
  FileSpreadsheet,
  Settings,
  CalendarDays,
  Award,
  Wallet,
  ShieldCheck,
  ChevronDown,
  ChevronRight,
  School,
  X,
  CreditCard,
  AlertCircle,
  FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentRole: string;
  onRoleChange: (role: string) => void;
}

interface NavItem {
  label: string;
  href: string;
  icon: any;
  highlight?: boolean;
}

interface NavGroup {
  title: string;
  isFeeGroup?: boolean;
  items: NavItem[];
}

export function Sidebar({ isOpen, onClose, currentRole, onRoleChange }: SidebarProps) {
  const pathname = usePathname();
  const [feesExpanded, setFeesExpanded] = useState(true);

  const navGroups: NavGroup[] = [
    {
      title: 'MAIN',
      items: [
        { label: 'Dashboard', href: '/', icon: LayoutDashboard },
      ],
    },
    {
      title: 'ACADEMICS',
      items: [
        { label: 'Students', href: '/students', icon: GraduationCap },
        { label: 'Teachers & Staff', href: '/teachers', icon: Users },
        { label: 'Classes & Sections', href: '/classes', icon: School },
        { label: 'Subjects', href: '/subjects', icon: BookOpen },
      ],
    },
    {
      title: 'OPERATIONS',
      items: [
        { label: 'Attendance', href: '/attendance', icon: CalendarCheck },
        { label: 'Examinations', href: '/examinations', icon: Award },
        { label: 'Timetable', href: '/timetable', icon: CalendarDays },
      ],
    },
    {
      title: 'FEE MANAGEMENT',
      isFeeGroup: true,
      items: [
        { label: 'Fee Structures', href: '/fees/structures', icon: FileSpreadsheet },
        { label: 'Fee Slips', href: '/fees/slips', icon: FileText },
        { label: 'Collect Cash', href: '/fees/collect', icon: Wallet, highlight: true },
        { label: 'Payment Receipts', href: '/fees/receipts', icon: Receipt },
        { label: 'Fee Defaulters', href: '/fees/defaulters', icon: AlertCircle },
      ],
    },
    {
      title: 'ADMINISTRATION',
      items: [
        { label: 'Reports & Analytics', href: '/reports', icon: FileSpreadsheet },
        { label: 'Institute Settings', href: '/settings', icon: Settings },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={cn(
          'fixed top-0 bottom-0 left-0 z-50 flex flex-col w-72 bg-white border-r border-slate-200 transition-transform duration-300 ease-in-out lg:translate-x-0 no-print',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-18 px-5 border-b border-slate-200 bg-linear-to-r from-indigo-700 to-indigo-900 text-white">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-inner">
              <GraduationCap className="w-6 h-6 text-indigo-200" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-white leading-tight">
                Apex International
              </h1>
              <p className="text-[11px] font-medium text-indigo-200 uppercase tracking-wider">
                Eskooly ERP Edition
              </p>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Academic Session Pill */}
        <div className="px-5 py-2.5 bg-indigo-50 border-b border-indigo-100 flex items-center justify-between text-xs font-semibold text-indigo-900">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Session: 2024-2025
          </span>
          <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-sm bg-indigo-200/60 text-indigo-800">
            Active
          </span>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {navGroups.map((group, idx) => (
            <div key={idx} className="space-y-1">
              <div className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                {group.title}
              </div>

              {group.items.map(item => {
                const isActive = pathname === item.href;
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => {
                      if (window.innerWidth < 1024) onClose();
                    }}
                    className={cn(
                      'flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group',
                      isActive
                        ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                        : item.highlight
                        ? 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200/70 font-semibold'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className={cn(
                          'w-4.5 h-4.5 transition-colors',
                          isActive
                            ? 'text-white'
                            : item.highlight
                            ? 'text-emerald-600'
                            : 'text-slate-400 group-hover:text-indigo-600'
                        )}
                      />
                      <span>{item.label}</span>
                    </div>

                    {item.highlight && !isActive && (
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                        Manual
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>

        {/* User & Role Switcher Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Testing Role:
            </span>
            <select
              value={currentRole}
              onChange={e => onRoleChange(e.target.value)}
              className="text-xs font-bold bg-white border border-slate-300 rounded-md px-2 py-1 text-indigo-700 shadow-2xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            >
              <option value="SUPER_ADMIN">Super Admin</option>
              <option value="SCHOOL_ADMIN">School Admin</option>
              <option value="ACCOUNTANT">Accountant</option>
              <option value="TEACHER">Teacher</option>
            </select>
          </div>

          <div className="flex items-center gap-3 p-2 rounded-xl bg-white border border-slate-200 shadow-2xs">
            <div className="w-9 h-9 rounded-full bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
              {currentRole === 'ACCOUNTANT' ? 'AR' : currentRole === 'TEACHER' ? 'SQ' : 'TM'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate">
                {currentRole === 'ACCOUNTANT'
                  ? 'Mr. Asim Rauf'
                  : currentRole === 'TEACHER'
                  ? 'Mr. Salman Qureshi'
                  : 'Dr. Tariq Mehmood'}
              </p>
              <p className="text-[11px] text-slate-500 truncate capitalize">
                {currentRole.replace('_', ' ').toLowerCase()}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

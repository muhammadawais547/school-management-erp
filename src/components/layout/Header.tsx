'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Menu,
  Bell,
  Search,
  PlusCircle,
  Wallet,
  CalendarCheck,
  GraduationCap,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { usePathname } from 'next/navigation';

interface HeaderProps {
  onToggleSidebar: () => void;
  currentRole: string;
}

export function Header({ onToggleSidebar, currentRole }: HeaderProps) {
  const pathname = usePathname();
  const [showNotifications, setShowNotifications] = useState(false);

  const formatBreadcrumb = () => {
    if (pathname === '/') return 'Dashboard';
    const parts = pathname.split('/').filter(Boolean);
    return parts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' / ');
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-18 px-4 sm:px-8 bg-white border-b border-slate-200 shadow-2xs no-print">
      {/* Left: Mobile Toggle & Breadcrumbs */}
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="p-2 -ml-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 lg:hidden"
          aria-label="Toggle navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-sm">
          <span className="font-semibold text-slate-400">Portal</span>
          <ChevronRight className="w-4 h-4 text-slate-300" />
          <span className="font-bold text-slate-900 tracking-tight">
            {formatBreadcrumb()}
          </span>
        </div>
      </div>

      {/* Right: Quick Actions & Alerts */}
      <div className="flex items-center gap-3">
        {/* Quick Action: Collect Cash Fee */}
        <Link
          href="/fees/collect"
          className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-all shadow-2xs"
        >
          <Wallet className="w-4 h-4 text-emerald-600" />
          <span>Collect Cash Fee</span>
        </Link>

        {/* Quick Action: Mark Attendance */}
        <Link
          href="/attendance"
          className="hidden md:inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-indigo-800 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl transition-all shadow-2xs"
        >
          <CalendarCheck className="w-4 h-4 text-indigo-600" />
          <span>Attendance</span>
        </Link>

        {/* Quick Action: New Student */}
        <Link
          href="/students?action=new"
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-sm shadow-indigo-200"
        >
          <PlusCircle className="w-4 h-4" />
          <span className="hidden sm:inline">Add Student</span>
        </Link>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2.5 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors"
          >
            <Bell className="w-4.5 h-4.5" />
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-50">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h4 className="text-sm font-bold text-slate-900">Notifications & Alerts</h4>
                <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                  4 unread
                </span>
              </div>
              <div className="divide-y divide-slate-100 text-xs">
                <div className="py-2.5">
                  <p className="font-bold text-slate-800">Fee Collection Deadline: 15th November</p>
                  <p className="text-slate-500 mt-0.5">Cash collection counter open daily until 2:00 PM.</p>
                </div>
                <div className="py-2.5">
                  <p className="font-bold text-slate-800">Mid-Term Result Cards Ready</p>
                  <p className="text-slate-500 mt-0.5">Class teachers can now review and print results.</p>
                </div>
                <div className="py-2.5">
                  <p className="font-bold text-slate-800">Defaulter Notice Dispatch</p>
                  <p className="text-slate-500 mt-0.5">Accountant flagged 4 pending fee accounts.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

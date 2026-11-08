'use client';

import React from 'react';
import { Printer } from 'lucide-react';

export function PrintButton({ label = 'Print Document' }: { label?: string }) {
  return (
    <button
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-sm shadow-indigo-200"
    >
      <Printer className="w-4 h-4" />
      <span>{label}</span>
    </button>
  );
}

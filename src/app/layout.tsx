import type { Metadata } from 'next';
import './globals.css';
import { AppLayout } from '@/components/layout/AppLayout';

export const metadata: Metadata = {
  title: 'Apex International School ERP | Eskooly Edition',
  description: 'Complete Modern School Management ERP with Manual Fee Collection, Attendance, Exams, and Student Information System.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full font-sans bg-slate-50 text-slate-900 antialiased selection:bg-indigo-500 selection:text-white">
        <AppLayout>{children}</AppLayout>
      </body>
    </html>
  );
}

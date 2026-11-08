import React from 'react';
import prisma from '@/lib/prisma';
import { SettingsClient } from '@/components/settings/SettingsClient';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  let [institute, users] = await Promise.all([
    prisma.institute.findFirst(),
    prisma.user.findMany({ orderBy: { createdAt: 'asc' } }),
  ]);

  if (!institute) {
    institute = await prisma.institute.create({
      data: {
        name: 'Apex International Grammar School',
        code: 'AIGS-2024',
        tagline: 'Excellence in Education',
        address: '14 Education Boulevard',
        phone: '+92 42 35789000',
        email: 'admin@apexschool.edu',
        currencySymbol: '$',
        currentSession: '2024-2025',
      },
    });
  }

  return <SettingsClient initialInstitute={institute} initialUsers={users} />;
}

'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getInstituteSettings() {
  try {
    let institute = await prisma.institute.findFirst();
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

    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'asc' },
    });

    return { success: true, data: { institute, users } };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateInstituteSettings(
  id: string,
  data: {
    name?: string;
    code?: string;
    tagline?: string;
    address?: string;
    phone?: string;
    email?: string;
    currencySymbol?: string;
    currentSession?: string;
  }
) {
  try {
    const updated = await prisma.institute.update({
      where: { id },
      data,
    });

    revalidatePath('/settings');
    revalidatePath('/dashboard');
    return { success: true, data: updated };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createUser(data: {
  name: string;
  email: string;
  passwordHash: string;
  role: string;
}) {
  try {
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash: data.passwordHash || 'password123',
        role: data.role || 'TEACHER',
        status: 'ACTIVE',
      },
    });

    revalidatePath('/settings');
    return { success: true, data: user };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

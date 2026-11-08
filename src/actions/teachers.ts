'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getTeachers(params?: { search?: string; status?: string }) {
  try {
    const where: any = {};
    if (params?.status && params.status !== 'ALL') {
      where.status = params.status;
    }
    if (params?.search) {
      const q = params.search.trim();
      where.OR = [
        { name: { contains: q } },
        { employeeId: { contains: q } },
        { email: { contains: q } },
        { designation: { contains: q } },
        { phone: { contains: q } },
      ];
    }

    const teachers = await prisma.teacher.findMany({
      where,
      include: {
        sections: {
          include: {
            class: true,
          },
        },
        subjects: {
          include: {
            class: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return { success: true, data: teachers };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getTeacherById(id: string) {
  try {
    const teacher = await prisma.teacher.findUnique({
      where: { id },
      include: {
        sections: {
          include: {
            class: true,
            students: true,
          },
        },
        subjects: {
          include: {
            class: true,
          },
        },
        timetableSlots: {
          include: {
            class: true,
            section: true,
            subject: true,
          },
          orderBy: [{ dayOfWeek: 'asc' }, { periodNumber: 'asc' }],
        },
      },
    });

    if (!teacher) return { success: false, error: 'Teacher not found' };
    return { success: true, data: teacher };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createTeacher(data: {
  employeeId?: string;
  name: string;
  email: string;
  phone: string;
  gender: string;
  designation: string;
  qualification: string;
  salary: number;
  address?: string;
}) {
  try {
    let employeeId = data.employeeId;
    if (!employeeId) {
      const count = await prisma.teacher.count();
      employeeId = `TCH-${String(count + 1).padStart(3, '0')}`;
    }

    const teacher = await prisma.teacher.create({
      data: {
        employeeId,
        name: data.name,
        email: data.email,
        phone: data.phone,
        gender: data.gender || 'Male',
        designation: data.designation || 'Teacher',
        qualification: data.qualification || "Bachelor's Degree",
        salary: Number(data.salary) || 50000,
        address: data.address || null,
        status: 'ACTIVE',
      },
    });

    revalidatePath('/teachers');
    revalidatePath('/dashboard');
    return { success: true, data: teacher };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateTeacher(
  id: string,
  data: {
    name?: string;
    email?: string;
    phone?: string;
    gender?: string;
    designation?: string;
    qualification?: string;
    salary?: number;
    address?: string;
    status?: string;
  }
) {
  try {
    const teacher = await prisma.teacher.update({
      where: { id },
      data: {
        ...data,
        salary: data.salary !== undefined ? Number(data.salary) : undefined,
      },
    });

    revalidatePath('/teachers');
    revalidatePath(`/teachers/${id}`);
    return { success: true, data: teacher };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteTeacher(id: string) {
  try {
    await prisma.teacher.delete({ where: { id } });
    revalidatePath('/teachers');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

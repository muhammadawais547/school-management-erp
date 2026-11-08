'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getSubjects(params?: { classId?: string }) {
  try {
    const where: any = {};
    if (params?.classId && params.classId !== 'ALL') {
      where.classId = params.classId;
    }

    const subjects = await prisma.subject.findMany({
      where,
      include: {
        class: true,
        teacher: true,
      },
      orderBy: [{ class: { gradeLevel: 'asc' } }, { name: 'asc' }],
    });

    const [classes, teachers] = await Promise.all([
      prisma.academicClass.findMany({ orderBy: { gradeLevel: 'asc' } }),
      prisma.teacher.findMany({ where: { status: 'ACTIVE' }, orderBy: { name: 'asc' } }),
    ]);

    return { success: true, data: { subjects, classes, teachers } };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createSubject(data: {
  name: string;
  code: string;
  type?: string;
  classId: string;
  teacherId?: string;
}) {
  try {
    const subject = await prisma.subject.create({
      data: {
        name: data.name,
        code: data.code,
        type: data.type || 'CORE',
        classId: data.classId,
        teacherId: data.teacherId || null,
      },
    });

    revalidatePath('/subjects');
    return { success: true, data: subject };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateSubject(
  id: string,
  data: {
    name?: string;
    code?: string;
    type?: string;
    classId?: string;
    teacherId?: string;
  }
) {
  try {
    const subject = await prisma.subject.update({
      where: { id },
      data: {
        ...data,
        teacherId: data.teacherId || null,
      },
    });

    revalidatePath('/subjects');
    return { success: true, data: subject };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteSubject(id: string) {
  try {
    await prisma.subject.delete({ where: { id } });
    revalidatePath('/subjects');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

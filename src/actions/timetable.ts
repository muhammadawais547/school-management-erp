'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getTimetable(classId: string, sectionId?: string) {
  try {
    const where: any = { classId };
    if (sectionId && sectionId !== 'ALL') {
      where.sectionId = sectionId;
    }

    const slots = await prisma.timetableSlot.findMany({
      where,
      include: {
        subject: true,
        teacher: true,
        class: true,
        section: true,
      },
      orderBy: [{ dayOfWeek: 'asc' }, { periodNumber: 'asc' }],
    });

    const [classes, subjects, teachers] = await Promise.all([
      prisma.academicClass.findMany({
        include: { sections: true },
        orderBy: { gradeLevel: 'asc' },
      }),
      prisma.subject.findMany({
        where: { classId },
        orderBy: { name: 'asc' },
      }),
      prisma.teacher.findMany({
        where: { status: 'ACTIVE' },
        orderBy: { name: 'asc' },
      }),
    ]);

    return {
      success: true,
      data: {
        slots,
        classes,
        subjects,
        teachers,
      },
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function saveTimetableSlot(data: {
  classId: string;
  sectionId: string;
  subjectId: string;
  teacherId?: string;
  dayOfWeek: string;
  periodNumber: number;
  startTime: string;
  endTime: string;
  roomNumber?: string;
}) {
  try {
    const slot = await prisma.timetableSlot.create({
      data: {
        classId: data.classId,
        sectionId: data.sectionId,
        subjectId: data.subjectId,
        teacherId: data.teacherId || null,
        dayOfWeek: data.dayOfWeek,
        periodNumber: Number(data.periodNumber),
        startTime: data.startTime,
        endTime: data.endTime,
        roomNumber: data.roomNumber || null,
      },
    });

    revalidatePath('/timetable');
    return { success: true, data: slot };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteTimetableSlot(id: string) {
  try {
    await prisma.timetableSlot.delete({ where: { id } });
    revalidatePath('/timetable');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

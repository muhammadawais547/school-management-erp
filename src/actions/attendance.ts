'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getAttendanceRegister(classId: string, sectionId: string, dateString: string) {
  try {
    const targetDate = new Date(dateString);
    targetDate.setHours(0, 0, 0, 0);

    // Get all students enrolled in this class and section
    const students = await prisma.student.findMany({
      where: {
        classId,
        sectionId,
        status: 'ACTIVE',
      },
      select: {
        id: true,
        admissionNo: true,
        rollNo: true,
        firstName: true,
        lastName: true,
        gender: true,
        attendanceRecords: {
          where: {
            date: targetDate,
          },
          select: {
            id: true,
            status: true,
            remarks: true,
          },
        },
      },
      orderBy: { rollNo: 'asc' },
    });

    // Map each student with their existing attendance record or default to PRESENT
    const register = students.map(s => {
      const existing = s.attendanceRecords[0];
      return {
        studentId: s.id,
        admissionNo: s.admissionNo,
        rollNo: s.rollNo,
        studentName: `${s.firstName} ${s.lastName}`,
        gender: s.gender,
        status: existing ? existing.status : 'PRESENT',
        remarks: existing ? existing.remarks || '' : '',
        recordId: existing ? existing.id : null,
      };
    });

    const isMarked = students.some(s => s.attendanceRecords.length > 0);

    return { success: true, data: { register, isMarked } };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function saveAttendanceRegister(payload: {
  classId: string;
  sectionId: string;
  dateString: string;
  records: Array<{
    studentId: string;
    status: string; // PRESENT, ABSENT, LATE, LEAVE
    remarks?: string;
  }>;
}) {
  try {
    const targetDate = new Date(payload.dateString);
    targetDate.setHours(0, 0, 0, 0);

    // Execute in transaction
    await prisma.$transaction(
      payload.records.map(r =>
        prisma.attendanceRecord.upsert({
          where: {
            studentId_date: {
              studentId: r.studentId,
              date: targetDate,
            },
          },
          update: {
            status: r.status,
            remarks: r.remarks || null,
            classId: payload.classId,
            sectionId: payload.sectionId,
          },
          create: {
            studentId: r.studentId,
            date: targetDate,
            status: r.status,
            remarks: r.remarks || null,
            classId: payload.classId,
            sectionId: payload.sectionId,
          },
        })
      )
    );

    revalidatePath('/attendance');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getAttendanceReport(params: {
  classId: string;
  sectionId?: string;
  month: number; // 0-11
  year: number;
}) {
  try {
    const startDate = new Date(params.year, params.month, 1);
    const endDate = new Date(params.year, params.month + 1, 0, 23, 59, 59);

    const where: any = {
      classId: params.classId,
      status: 'ACTIVE',
    };
    if (params.sectionId && params.sectionId !== 'ALL') {
      where.sectionId = params.sectionId;
    }

    const students = await prisma.student.findMany({
      where,
      include: {
        class: true,
        section: true,
        attendanceRecords: {
          where: {
            date: {
              gte: startDate,
              lte: endDate,
            },
          },
          orderBy: { date: 'asc' },
        },
      },
      orderBy: { rollNo: 'asc' },
    });

    const report = students.map(s => {
      const records = s.attendanceRecords;
      const total = records.length;
      const present = records.filter(r => r.status === 'PRESENT').length;
      const absent = records.filter(r => r.status === 'ABSENT').length;
      const late = records.filter(r => r.status === 'LATE').length;
      const leave = records.filter(r => r.status === 'LEAVE').length;
      const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

      return {
        id: s.id,
        admissionNo: s.admissionNo,
        rollNo: s.rollNo,
        name: `${s.firstName} ${s.lastName}`,
        className: `${s.class.name} (${s.section.name})`,
        total,
        present,
        absent,
        late,
        leave,
        percentage,
        records,
      };
    });

    return { success: true, data: report };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

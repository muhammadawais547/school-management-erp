'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getStudents(params?: {
  classId?: string;
  sectionId?: string;
  search?: string;
  status?: string;
}) {
  try {
    const where: any = {};

    if (params?.classId && params.classId !== 'ALL') {
      where.classId = params.classId;
    }

    if (params?.sectionId && params.sectionId !== 'ALL') {
      where.sectionId = params.sectionId;
    }

    if (params?.status && params.status !== 'ALL') {
      where.status = params.status;
    }

    if (params?.search) {
      const q = params.search.trim();
      where.OR = [
        { firstName: { contains: q } },
        { lastName: { contains: q } },
        { admissionNo: { contains: q } },
        { rollNo: { contains: q } },
        { parentName: { contains: q } },
        { parentPhone: { contains: q } },
      ];
    }

    const students = await prisma.student.findMany({
      where,
      include: {
        class: true,
        section: true,
        feeSlips: {
          select: {
            id: true,
            status: true,
            balance: true,
            totalAmount: true,
          },
        },
      },
      orderBy: [
        { class: { gradeLevel: 'asc' } },
        { rollNo: 'asc' },
      ],
    });

    return { success: true, data: students };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getStudentById(id: string) {
  try {
    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        class: true,
        section: true,
        attendanceRecords: {
          orderBy: { date: 'desc' },
          take: 30,
        },
        feeSlips: {
          orderBy: { issueDate: 'desc' },
          include: {
            payments: {
              include: {
                receipt: true,
              },
            },
          },
        },
        examMarks: {
          include: {
            exam: true,
            subject: true,
          },
        },
      },
    });

    if (!student) return { success: false, error: 'Student not found' };

    return { success: true, data: student };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createStudent(data: {
  admissionNo?: string;
  rollNo: string;
  firstName: string;
  lastName: string;
  gender: string;
  dob?: string;
  bloodGroup?: string;
  classId: string;
  sectionId: string;
  parentName: string;
  parentRelationship?: string;
  parentPhone: string;
  parentEmail?: string;
  parentOccupation?: string;
  emergencyContact?: string;
  address?: string;
}) {
  try {
    // Generate admission number if not provided
    let admissionNo = data.admissionNo;
    if (!admissionNo) {
      const count = await prisma.student.count();
      admissionNo = `ADM-2024-${String(count + 1).padStart(3, '0')}`;
    }

    const student = await prisma.student.create({
      data: {
        admissionNo,
        rollNo: data.rollNo,
        firstName: data.firstName,
        lastName: data.lastName,
        gender: data.gender || 'Male',
        dob: data.dob ? new Date(data.dob) : null,
        bloodGroup: data.bloodGroup || 'O+',
        classId: data.classId,
        sectionId: data.sectionId,
        parentName: data.parentName,
        parentRelationship: data.parentRelationship || 'Father',
        parentPhone: data.parentPhone,
        parentEmail: data.parentEmail || null,
        parentOccupation: data.parentOccupation || null,
        emergencyContact: data.emergencyContact || data.parentPhone,
        address: data.address || null,
      },
    });

    revalidatePath('/students');
    revalidatePath('/dashboard');
    return { success: true, data: student };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateStudent(
  id: string,
  data: {
    rollNo?: string;
    firstName?: string;
    lastName?: string;
    gender?: string;
    dob?: string;
    bloodGroup?: string;
    classId?: string;
    sectionId?: string;
    status?: string;
    parentName?: string;
    parentRelationship?: string;
    parentPhone?: string;
    parentEmail?: string;
    parentOccupation?: string;
    emergencyContact?: string;
    address?: string;
  }
) {
  try {
    const updatePayload: any = { ...data };
    if (data.dob) {
      updatePayload.dob = new Date(data.dob);
    }

    const student = await prisma.student.update({
      where: { id },
      data: updatePayload,
    });

    revalidatePath('/students');
    revalidatePath(`/students/${id}`);
    revalidatePath('/dashboard');
    return { success: true, data: student };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteStudent(id: string) {
  try {
    await prisma.student.delete({
      where: { id },
    });

    revalidatePath('/students');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

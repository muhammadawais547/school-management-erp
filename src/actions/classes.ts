'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getClassesWithSections() {
  try {
    const classes = await prisma.academicClass.findMany({
      include: {
        sections: {
          include: {
            classTeacher: true,
            _count: {
              select: { students: true },
            },
          },
        },
        subjects: true,
        feeStructures: true,
        _count: {
          select: { students: true },
        },
      },
      orderBy: { gradeLevel: 'asc' },
    });

    const teachers = await prisma.teacher.findMany({
      where: { status: 'ACTIVE' },
      select: { id: true, name: true, employeeId: true },
      orderBy: { name: 'asc' },
    });

    return { success: true, data: { classes, teachers } };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createClass(data: { name: string; gradeLevel: number; numericCode?: string }) {
  try {
    const newClass = await prisma.academicClass.create({
      data: {
        name: data.name,
        gradeLevel: Number(data.gradeLevel),
        numericCode: data.numericCode || `G${data.gradeLevel}`,
      },
    });

    // Automatically create a default Section A
    await prisma.section.create({
      data: {
        name: 'Section A',
        classId: newClass.id,
        roomNumber: `Room ${data.gradeLevel}01`,
        capacity: 40,
      },
    });

    revalidatePath('/classes');
    revalidatePath('/dashboard');
    return { success: true, data: newClass };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createSection(data: {
  classId: string;
  name: string;
  classTeacherId?: string;
  roomNumber?: string;
  capacity?: number;
}) {
  try {
    const section = await prisma.section.create({
      data: {
        classId: data.classId,
        name: data.name,
        classTeacherId: data.classTeacherId || null,
        roomNumber: data.roomNumber || null,
        capacity: Number(data.capacity) || 40,
      },
    });

    revalidatePath('/classes');
    return { success: true, data: section };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteClass(id: string) {
  try {
    // Check if students exist in class
    const studentCount = await prisma.student.count({ where: { classId: id } });
    if (studentCount > 0) {
      return { success: false, error: `Cannot delete class with ${studentCount} enrolled students.` };
    }

    await prisma.academicClass.delete({ where: { id } });
    revalidatePath('/classes');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteSection(id: string) {
  try {
    const studentCount = await prisma.student.count({ where: { sectionId: id } });
    if (studentCount > 0) {
      return { success: false, error: `Cannot delete section with ${studentCount} enrolled students.` };
    }

    await prisma.section.delete({ where: { id } });
    revalidatePath('/classes');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

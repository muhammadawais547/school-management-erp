'use server';

import prisma from '@/lib/prisma';

export async function getComprehensiveReports() {
  try {
    const [
      classes,
      students,
      teachers,
      feeSlips,
      payments,
      exams,
      institute,
    ] = await Promise.all([
      prisma.academicClass.findMany({
        include: {
          sections: {
            include: {
              _count: { select: { students: true } },
            },
          },
          _count: { select: { students: true, subjects: true } },
        },
        orderBy: { gradeLevel: 'asc' },
      }),
      prisma.student.findMany({
        select: {
          id: true,
          gender: true,
          status: true,
          classId: true,
        },
      }),
      prisma.teacher.findMany({
        select: {
          id: true,
          designation: true,
          salary: true,
          status: true,
        },
      }),
      prisma.feeSlip.findMany({
        include: {
          class: true,
        },
      }),
      prisma.feePayment.findMany({
        include: {
          feeSlip: {
            include: { class: true },
          },
        },
      }),
      prisma.exam.findMany({
        include: {
          _count: { select: { marks: true } },
        },
        orderBy: { startDate: 'desc' },
      }),
      prisma.institute.findFirst(),
    ]);

    // 1. Enrollment summary
    const totalStudents = students.length;
    const maleStudents = students.filter(s => s.gender === 'Male').length;
    const femaleStudents = students.filter(s => s.gender === 'Female').length;

    const classEnrollment = classes.map(c => {
      const classStudents = students.filter(s => s.classId === c.id);
      return {
        className: c.name,
        total: classStudents.length,
        male: classStudents.filter(s => s.gender === 'Male').length,
        female: classStudents.filter(s => s.gender === 'Female').length,
      };
    });

    // 2. Financial Summary
    const totalBilled = feeSlips.reduce((acc, s) => acc + s.totalAmount, 0);
    const totalCollected = payments.reduce((acc, p) => acc + p.amountPaid, 0);
    const totalPending = feeSlips.reduce((acc, s) => acc + s.balance, 0);

    const classFinancials = classes.map(c => {
      const cSlips = feeSlips.filter(s => s.classId === c.id);
      const billed = cSlips.reduce((acc, s) => acc + s.totalAmount, 0);
      const paid = cSlips.reduce((acc, s) => acc + s.paidAmount, 0);
      const pending = cSlips.reduce((acc, s) => acc + s.balance, 0);
      return {
        className: c.name,
        billed,
        paid,
        pending,
      };
    });

    // 3. Staff Summary
    const totalSalaryExpense = teachers.reduce((acc, t) => acc + t.salary, 0);

    return {
      success: true,
      data: {
        institute,
        totalStudents,
        maleStudents,
        femaleStudents,
        classEnrollment,
        totalTeachers: teachers.length,
        totalSalaryExpense,
        financials: {
          totalBilled,
          totalCollected,
          totalPending,
          classFinancials,
        },
        exams,
      },
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

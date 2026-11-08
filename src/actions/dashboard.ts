'use server';

import prisma from '@/lib/prisma';

export async function getDashboardStats() {
  try {
    const institute = await prisma.institute.findFirst();

    const [
      totalStudents,
      totalTeachers,
      totalClasses,
      totalSections,
      feeSlips,
      payments,
      recentStudents,
      recentPayments,
      notifications,
    ] = await Promise.all([
      prisma.student.count({ where: { status: 'ACTIVE' } }),
      prisma.teacher.count({ where: { status: 'ACTIVE' } }),
      prisma.academicClass.count(),
      prisma.section.count(),
      prisma.feeSlip.findMany({
        select: {
          totalAmount: true,
          paidAmount: true,
          balance: true,
          status: true,
        },
      }),
      prisma.feePayment.findMany({
        select: {
          amountPaid: true,
          paymentDate: true,
        },
      }),
      prisma.student.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          class: true,
          section: true,
        },
      }),
      prisma.feePayment.findMany({
        take: 5,
        orderBy: { paymentDate: 'desc' },
        include: {
          student: {
            include: {
              class: true,
              section: true,
            },
          },
          feeSlip: true,
          receipt: true,
        },
      }),
      prisma.notification.findMany({
        take: 4,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    // Financial aggregates
    const totalCollectedFees = payments.reduce((acc, p) => acc + p.amountPaid, 0);
    const totalPendingFees = feeSlips.reduce((acc, s) => acc + s.balance, 0);
    const totalBilledFees = feeSlips.reduce((acc, s) => acc + s.totalAmount, 0);

    const paidSlipsCount = feeSlips.filter(s => s.status === 'PAID').length;
    const partialSlipsCount = feeSlips.filter(s => s.status === 'PARTIAL').length;
    const unpaidSlipsCount = feeSlips.filter(s => s.status === 'UNPAID').length;
    const overdueSlipsCount = feeSlips.filter(s => s.status === 'OVERDUE').length;

    // Today's attendance
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const attendanceRecords = await prisma.attendanceRecord.findMany({
      where: {
        date: today,
      },
      select: {
        status: true,
      },
    });

    // If no records for today, pick most recent date
    let attSource = attendanceRecords;
    if (attendanceRecords.length === 0) {
      const latestRecord = await prisma.attendanceRecord.findFirst({
        orderBy: { date: 'desc' },
        select: { date: true },
      });
      if (latestRecord) {
        attSource = await prisma.attendanceRecord.findMany({
          where: { date: latestRecord.date },
          select: { status: true },
        });
      }
    }

    const presentCount = attSource.filter(a => a.status === 'PRESENT').length;
    const absentCount = attSource.filter(a => a.status === 'ABSENT').length;
    const lateCount = attSource.filter(a => a.status === 'LATE').length;
    const leaveCount = attSource.filter(a => a.status === 'LEAVE').length;
    const totalMarked = attSource.length;
    const attendancePercentage = totalMarked > 0 ? Math.round((presentCount / totalMarked) * 100) : 0;

    return {
      success: true,
      institute,
      stats: {
        totalStudents,
        totalTeachers,
        totalClasses,
        totalSections,
        totalCollectedFees,
        totalPendingFees,
        totalBilledFees,
        paidSlipsCount,
        partialSlipsCount,
        unpaidSlipsCount,
        overdueSlipsCount,
        attendance: {
          present: presentCount,
          absent: absentCount,
          late: lateCount,
          leave: leaveCount,
          total: totalMarked,
          percentage: attendancePercentage,
        },
      },
      recentStudents,
      recentPayments,
      notifications,
    };
  } catch (error: any) {
    console.error('Error fetching dashboard stats:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

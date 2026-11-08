'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// 1. Fee Structures
export async function getFeeStructures(classId?: string) {
  try {
    const where: any = {};
    if (classId && classId !== 'ALL') {
      where.classId = classId;
    }

    const [structures, classes] = await Promise.all([
      prisma.feeStructure.findMany({
        where,
        include: { class: true },
        orderBy: [{ class: { gradeLevel: 'asc' } }, { feeType: 'asc' }],
      }),
      prisma.academicClass.findMany({
        orderBy: { gradeLevel: 'asc' },
      }),
    ]);

    return { success: true, data: { structures, classes } };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createFeeStructure(data: {
  classId: string;
  feeType: string;
  amount: number;
  frequency: string;
  description?: string;
}) {
  try {
    const structure = await prisma.feeStructure.create({
      data: {
        classId: data.classId,
        feeType: data.feeType,
        amount: Number(data.amount),
        frequency: data.frequency || 'MONTHLY',
        description: data.description || null,
      },
    });

    revalidatePath('/fees/structures');
    return { success: true, data: structure };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteFeeStructure(id: string) {
  try {
    await prisma.feeStructure.delete({ where: { id } });
    revalidatePath('/fees/structures');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// 2. Fee Slips (Unpaid, Partial, Paid, Overdue)
export async function getFeeSlips(params?: {
  classId?: string;
  sectionId?: string;
  status?: string;
  month?: string;
  year?: number;
  search?: string;
}) {
  try {
    const where: any = {};
    if (params?.classId && params.classId !== 'ALL') where.classId = params.classId;
    if (params?.sectionId && params.sectionId !== 'ALL') where.sectionId = params.sectionId;
    if (params?.status && params.status !== 'ALL') where.status = params.status;
    if (params?.month && params.month !== 'ALL') where.month = params.month;
    if (params?.year) where.year = Number(params.year);

    if (params?.search) {
      const q = params.search.trim();
      where.OR = [
        { slipNumber: { contains: q } },
        { title: { contains: q } },
        { student: { firstName: { contains: q } } },
        { student: { lastName: { contains: q } } },
        { student: { admissionNo: { contains: q } } },
        { student: { rollNo: { contains: q } } },
      ];
    }

    const slips = await prisma.feeSlip.findMany({
      where,
      include: {
        student: true,
        class: true,
        section: true,
        payments: {
          include: {
            receipt: true,
          },
        },
      },
      orderBy: { issueDate: 'desc' },
    });

    return { success: true, data: slips };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getFeeSlipById(id: string) {
  try {
    const slip = await prisma.feeSlip.findUnique({
      where: { id },
      include: {
        student: {
          include: {
            class: true,
            section: true,
          },
        },
        class: true,
        section: true,
        payments: {
          orderBy: { paymentDate: 'desc' },
          include: {
            receipt: true,
          },
        },
        receipts: {
          orderBy: { receiptDate: 'desc' },
        },
      },
    });

    if (!slip) return { success: false, error: 'Fee slip not found' };

    const institute = await prisma.institute.findFirst();

    return { success: true, data: { slip, institute } };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// 3. Generate Bulk Fee Slips for a Class & Section
export async function generateBulkFeeSlips(payload: {
  classId: string;
  sectionId?: string;
  month: string;
  year: number;
  dueDate: string;
  title: string;
  customBreakdown?: Array<{ item: string; amount: number }>;
}) {
  try {
    // Determine fee items: either custom or fetched from feeStructure for the class
    let breakdown = payload.customBreakdown;
    if (!breakdown || breakdown.length === 0) {
      const structures = await prisma.feeStructure.findMany({
        where: { classId: payload.classId },
      });
      if (structures.length === 0) {
        return {
          success: false,
          error: 'No fee structures defined for this class. Please add fee categories first or provide items.',
        };
      }
      breakdown = structures.map(s => ({
        item: s.feeType,
        amount: s.amount,
      }));
    }

    const totalAmount = breakdown.reduce((acc, cur) => acc + cur.amount, 0);

    // Get active students
    const studentWhere: any = {
      classId: payload.classId,
      status: 'ACTIVE',
    };
    if (payload.sectionId && payload.sectionId !== 'ALL') {
      studentWhere.sectionId = payload.sectionId;
    }

    const students = await prisma.student.findMany({
      where: studentWhere,
    });

    if (students.length === 0) {
      return { success: false, error: 'No active students found in the selected class/section.' };
    }

    const dueDateObj = new Date(payload.dueDate);
    let createdCount = 0;

    for (const stu of students) {
      // Check if slip already exists for this student, month, and year
      const existing = await prisma.feeSlip.findFirst({
        where: {
          studentId: stu.id,
          month: payload.month,
          year: payload.year,
        },
      });

      if (!existing) {
        const count = await prisma.feeSlip.count();
        const slipNumber = `SLIP-${payload.year}-${String(count + 1).padStart(4, '0')}`;

        await prisma.feeSlip.create({
          data: {
            slipNumber,
            studentId: stu.id,
            classId: stu.classId,
            sectionId: stu.sectionId,
            title: payload.title || `${payload.month} ${payload.year} Monthly Fee`,
            month: payload.month,
            year: payload.year,
            issueDate: new Date(),
            dueDate: dueDateObj,
            totalAmount,
            paidAmount: 0,
            balance: totalAmount,
            status: 'UNPAID',
            breakdownJson: JSON.stringify(breakdown),
          },
        });
        createdCount++;
      }
    }

    revalidatePath('/fees/slips');
    revalidatePath('/dashboard');
    return { success: true, count: createdCount };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// 4. Generate Single Fee Slip for an Individual Student
export async function generateSingleFeeSlip(payload: {
  studentId: string;
  month: string;
  year: number;
  dueDate: string;
  title: string;
  breakdown: Array<{ item: string; amount: number }>;
  notes?: string;
}) {
  try {
    const student = await prisma.student.findUnique({
      where: { id: payload.studentId },
    });
    if (!student) return { success: false, error: 'Student not found' };

    const totalAmount = payload.breakdown.reduce((acc, cur) => acc + cur.amount, 0);
    const count = await prisma.feeSlip.count();
    const slipNumber = `SLIP-${payload.year}-${String(count + 1).padStart(4, '0')}`;

    const slip = await prisma.feeSlip.create({
      data: {
        slipNumber,
        studentId: student.id,
        classId: student.classId,
        sectionId: student.sectionId,
        title: payload.title,
        month: payload.month,
        year: payload.year,
        issueDate: new Date(),
        dueDate: new Date(payload.dueDate),
        totalAmount,
        paidAmount: 0,
        balance: totalAmount,
        status: 'UNPAID',
        breakdownJson: JSON.stringify(payload.breakdown),
        notes: payload.notes || null,
      },
    });

    revalidatePath('/fees/slips');
    return { success: true, data: slip };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// 5. MANUAL CASH FEE COLLECTION & AUTOMATIC RECEIPT GENERATION
// NO bank/online gateway! Cash/Manual collection at desk!
export async function recordManualCashPayment(payload: {
  feeSlipId: string;
  amountPaid: number;
  paymentDate?: string;
  paymentMode?: string; // 'CASH', 'CHEQUE', 'BANK_TRANSFER'
  transactionRef?: string;
  notes?: string;
  collectedBy?: string;
}) {
  try {
    const amount = Number(payload.amountPaid);
    if (isNaN(amount) || amount <= 0) {
      return { success: false, error: 'Invalid payment amount. Must be greater than 0.' };
    }

    const feeSlip = await prisma.feeSlip.findUnique({
      where: { id: payload.feeSlipId },
      include: { student: true },
    });

    if (!feeSlip) return { success: false, error: 'Fee slip not found.' };

    if (feeSlip.balance <= 0) {
      return { success: false, error: 'This fee slip is already fully settled (Paid).' };
    }

    if (amount > feeSlip.balance) {
      return {
        success: false,
        error: `Payment amount ($${amount}) exceeds outstanding balance ($${feeSlip.balance}).`,
      };
    }

    const newPaidAmount = feeSlip.paidAmount + amount;
    const newBalance = feeSlip.totalAmount - newPaidAmount;
    const newStatus = newBalance <= 0 ? 'PAID' : 'PARTIAL';

    const payDate = payload.paymentDate ? new Date(payload.paymentDate) : new Date();

    // Use a transaction to update slip, create payment, and issue receipt
    const result = await prisma.$transaction(async tx => {
      // 1. Update Fee Slip
      const updatedSlip = await tx.feeSlip.update({
        where: { id: feeSlip.id },
        data: {
          paidAmount: newPaidAmount,
          balance: newBalance,
          status: newStatus,
        },
      });

      // 2. Create Fee Payment
      const payment = await tx.feePayment.create({
        data: {
          feeSlipId: feeSlip.id,
          studentId: feeSlip.studentId,
          amountPaid: amount,
          paymentDate: payDate,
          paymentMode: payload.paymentMode || 'CASH',
          transactionRef: payload.transactionRef || `CASH-REC-${Date.now().toString().slice(-6)}`,
          collectedBy: payload.collectedBy || 'Administration Cashier',
          notes: payload.notes || null,
        },
      });

      // 3. Automatically issue official Fee Receipt
      const receiptCount = await tx.feeReceipt.count();
      const receiptNumber = `RCT-${new Date().getFullYear()}-${String(receiptCount + 1).padStart(4, '0')}`;

      const receipt = await tx.feeReceipt.create({
        data: {
          receiptNumber,
          feePaymentId: payment.id,
          feeSlipId: feeSlip.id,
          studentId: feeSlip.studentId,
          receiptDate: payDate,
          amountPaid: amount,
          balanceRemaining: newBalance,
          remarks: `Cash payment received for ${feeSlip.title}. Slip #${feeSlip.slipNumber}`,
        },
      });

      return { updatedSlip, payment, receipt };
    });

    revalidatePath('/fees/slips');
    revalidatePath('/fees/receipts');
    revalidatePath('/fees/collect');
    revalidatePath('/dashboard');

    return {
      success: true,
      data: {
        receiptId: result.receipt.id,
        receiptNumber: result.receipt.receiptNumber,
        newStatus: result.updatedSlip.status,
        remainingBalance: result.updatedSlip.balance,
      },
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// 6. Fee Receipts (Printable & Filterable)
export async function getFeeReceipts(params?: { search?: string; fromDate?: string; toDate?: string }) {
  try {
    const where: any = {};

    if (params?.search) {
      const q = params.search.trim();
      where.OR = [
        { receiptNumber: { contains: q } },
        { feeSlip: { slipNumber: { contains: q } } },
        { student: { firstName: { contains: q } } },
        { student: { lastName: { contains: q } } },
        { student: { admissionNo: { contains: q } } },
      ];
    }

    if (params?.fromDate || params?.toDate) {
      where.receiptDate = {};
      if (params.fromDate) where.receiptDate.gte = new Date(params.fromDate);
      if (params.toDate) {
        const toD = new Date(params.toDate);
        toD.setHours(23, 59, 59, 999);
        where.receiptDate.lte = toD;
      }
    }

    const receipts = await prisma.feeReceipt.findMany({
      where,
      include: {
        student: {
          include: {
            class: true,
            section: true,
          },
        },
        feeSlip: true,
        feePayment: true,
      },
      orderBy: { receiptDate: 'desc' },
    });

    return { success: true, data: receipts };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getFeeReceiptById(id: string) {
  try {
    const receipt = await prisma.feeReceipt.findUnique({
      where: { id },
      include: {
        student: {
          include: {
            class: true,
            section: true,
          },
        },
        feeSlip: true,
        feePayment: true,
      },
    });

    if (!receipt) return { success: false, error: 'Fee receipt not found' };

    const institute = await prisma.institute.findFirst();

    return { success: true, data: { receipt, institute } };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// 7. Defaulters / Outstanding Balances Report
export async function getFeeDefaulters() {
  try {
    const defaulterSlips = await prisma.feeSlip.findMany({
      where: {
        status: { in: ['UNPAID', 'PARTIAL', 'OVERDUE'] },
        balance: { gt: 0 },
      },
      include: {
        student: {
          include: {
            class: true,
            section: true,
          },
        },
      },
      orderBy: [{ dueDate: 'asc' }, { balance: 'desc' }],
    });

    const totalDefaulterAmount = defaulterSlips.reduce((acc, s) => acc + s.balance, 0);

    return {
      success: true,
      data: {
        slips: defaulterSlips,
        totalDefaulterAmount,
        count: defaulterSlips.length,
      },
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

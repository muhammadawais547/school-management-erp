'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getExams() {
  try {
    const exams = await prisma.exam.findMany({
      include: {
        _count: {
          select: {
            schedules: true,
            marks: true,
          },
        },
      },
      orderBy: { startDate: 'desc' },
    });

    const classes = await prisma.academicClass.findMany({
      orderBy: { gradeLevel: 'asc' },
    });

    return { success: true, data: { exams, classes } };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createExam(data: {
  title: string;
  session?: string;
  term: string;
  startDate: string;
  endDate: string;
}) {
  try {
    const exam = await prisma.exam.create({
      data: {
        title: data.title,
        session: data.session || '2024-2025',
        term: data.term || 'MID_TERM',
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        status: 'SCHEDULED',
      },
    });

    revalidatePath('/examinations');
    return { success: true, data: exam };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getExamSchedules(examId: string, classId?: string) {
  try {
    const where: any = { examId };
    if (classId && classId !== 'ALL') where.classId = classId;

    const schedules = await prisma.examSchedule.findMany({
      where,
      include: {
        class: true,
        subject: {
          include: { teacher: true },
        },
      },
      orderBy: { examDate: 'asc' },
    });

    return { success: true, data: schedules };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getMarksEntrySheet(examId: string, classId: string, subjectId: string) {
  try {
    const [exam, academicClass, subject, students] = await Promise.all([
      prisma.exam.findUnique({ where: { id: examId } }),
      prisma.academicClass.findUnique({ where: { id: classId } }),
      prisma.subject.findUnique({ where: { id: subjectId } }),
      prisma.student.findMany({
        where: { classId, status: 'ACTIVE' },
        include: {
          section: true,
          examMarks: {
            where: { examId, subjectId },
          },
        },
        orderBy: [{ section: { name: 'asc' } }, { rollNo: 'asc' }],
      }),
    ]);

    if (!exam || !academicClass || !subject) {
      return { success: false, error: 'Exam, Class, or Subject not found.' };
    }

    const rows = students.map(s => {
      const markRecord = s.examMarks[0];
      return {
        studentId: s.id,
        admissionNo: s.admissionNo,
        rollNo: s.rollNo,
        studentName: `${s.firstName} ${s.lastName}`,
        sectionName: s.section.name,
        maxMarks: markRecord ? markRecord.maxMarks : 100,
        passMarks: markRecord ? markRecord.passMarks : 40,
        obtainedMarks: markRecord ? markRecord.obtainedMarks : '',
        grade: markRecord ? markRecord.grade : '-',
        status: markRecord ? markRecord.status : 'PASS',
        remarks: markRecord ? markRecord.remarks || '' : '',
      };
    });

    return {
      success: true,
      data: {
        exam,
        academicClass,
        subject,
        rows,
      },
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function saveMarksEntry(payload: {
  examId: string;
  classId: string;
  subjectId: string;
  records: Array<{
    studentId: string;
    obtainedMarks: number;
    maxMarks?: number;
    passMarks?: number;
    remarks?: string;
  }>;
}) {
  try {
    const max = 100;
    const pass = 40;

    await prisma.$transaction(
      payload.records.map(r => {
        const obtained = Number(r.obtainedMarks) || 0;
        let grade = 'F';
        let status = 'FAIL';

        const percentage = (obtained / max) * 100;
        if (percentage >= 90) grade = 'A+';
        else if (percentage >= 80) grade = 'A';
        else if (percentage >= 70) grade = 'B';
        else if (percentage >= 60) grade = 'C';
        else if (percentage >= 50) grade = 'D';
        else grade = 'F';

        if (percentage >= pass) status = 'PASS';

        return prisma.examMark.upsert({
          where: {
            examId_studentId_subjectId: {
              examId: payload.examId,
              studentId: r.studentId,
              subjectId: payload.subjectId,
            },
          },
          update: {
            obtainedMarks: obtained,
            maxMarks: max,
            passMarks: pass,
            grade,
            status,
            remarks: r.remarks || null,
          },
          create: {
            examId: payload.examId,
            studentId: r.studentId,
            subjectId: payload.subjectId,
            classId: payload.classId,
            obtainedMarks: obtained,
            maxMarks: max,
            passMarks: pass,
            grade,
            status,
            remarks: r.remarks || null,
          },
        });
      })
    );

    revalidatePath('/examinations');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// 7. Student Report Card (Printable Transcript)
export async function getStudentReportCard(examId: string, studentId: string) {
  try {
    const [exam, student, institute] = await Promise.all([
      prisma.exam.findUnique({ where: { id: examId } }),
      prisma.student.findUnique({
        where: { id: studentId },
        include: {
          class: true,
          section: true,
          examMarks: {
            where: { examId },
            include: { subject: true },
            orderBy: { subject: { name: 'asc' } },
          },
        },
      }),
      prisma.institute.findFirst(),
    ]);

    if (!exam || !student) {
      return { success: false, error: 'Exam or Student record not found.' };
    }

    const marks = student.examMarks;
    const totalMax = marks.reduce((acc, m) => acc + m.maxMarks, 0);
    const totalObtained = marks.reduce((acc, m) => acc + m.obtainedMarks, 0);
    const percentage = totalMax > 0 ? ((totalObtained / totalMax) * 100).toFixed(1) : '0';

    let overallGrade = 'F';
    const pctNum = parseFloat(percentage);
    if (pctNum >= 90) overallGrade = 'A+';
    else if (pctNum >= 80) overallGrade = 'A';
    else if (pctNum >= 70) overallGrade = 'B';
    else if (pctNum >= 60) overallGrade = 'C';
    else if (pctNum >= 50) overallGrade = 'D';
    else overallGrade = 'F';

    const hasFailedAny = marks.some(m => m.status === 'FAIL');
    const finalResult = hasFailedAny ? 'NEEDS IMPROVEMENT' : 'PASSED';

    return {
      success: true,
      data: {
        exam,
        student,
        institute,
        marks,
        totalMax,
        totalObtained,
        percentage,
        overallGrade,
        finalResult,
      },
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

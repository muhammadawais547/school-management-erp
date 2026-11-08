import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clean existing data in reverse order of dependencies
  await prisma.notification.deleteMany();
  await prisma.timetableSlot.deleteMany();
  await prisma.examMark.deleteMany();
  await prisma.examSchedule.deleteMany();
  await prisma.exam.deleteMany();
  await prisma.feeReceipt.deleteMany();
  await prisma.feePayment.deleteMany();
  await prisma.feeSlip.deleteMany();
  await prisma.feeStructure.deleteMany();
  await prisma.attendanceRecord.deleteMany();
  await prisma.student.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.section.deleteMany();
  await prisma.academicClass.deleteMany();
  await prisma.teacher.deleteMany();
  await prisma.user.deleteMany();
  await prisma.institute.deleteMany();

  // 1. Institute Settings
  const institute = await prisma.institute.create({
    data: {
      name: 'Apex International Grammar School',
      code: 'AIGS-2024',
      tagline: 'Excellence in Education, Character, & Leadership',
      address: '14 Education Boulevard, University Town, Lahore',
      phone: '+92 (42) 3578-9000',
      email: 'info@apexschool.edu',
      currencySymbol: '$',
      currentSession: '2024-2025',
    },
  });
  console.log('✓ Institute profile created');

  // 2. Users (Roles)
  await prisma.user.createMany({
    data: [
      {
        name: 'Dr. Tariq Mehmood',
        email: 'admin@apexschool.edu',
        passwordHash: 'admin123',
        role: 'SUPER_ADMIN',
        status: 'ACTIVE',
      },
      {
        name: 'Mrs. Fatima Zahra',
        email: 'principal@apexschool.edu',
        passwordHash: 'admin123',
        role: 'SCHOOL_ADMIN',
        status: 'ACTIVE',
      },
      {
        name: 'Mr. Salman Qureshi',
        email: 'teacher@apexschool.edu',
        passwordHash: 'teacher123',
        role: 'TEACHER',
        status: 'ACTIVE',
      },
      {
        name: 'Mr. Asim Rauf',
        email: 'cashier@apexschool.edu',
        passwordHash: 'account123',
        role: 'ACCOUNTANT',
        status: 'ACTIVE',
      },
    ],
  });
  console.log('✓ Users & Roles created');

  // 3. Teachers
  const teacher1 = await prisma.teacher.create({
    data: {
      employeeId: 'TCH-001',
      name: 'Mr. Salman Qureshi',
      email: 'salman.q@apexschool.edu',
      phone: '+92 300 1234567',
      gender: 'Male',
      designation: 'Head of Mathematics',
      qualification: 'M.Sc. Mathematics, B.Ed.',
      salary: 75000,
      address: 'House 45, Model Town, Lahore',
      status: 'ACTIVE',
    },
  });

  const teacher2 = await prisma.teacher.create({
    data: {
      employeeId: 'TCH-002',
      name: 'Ms. Ayesha Siddiqa',
      email: 'ayesha.s@apexschool.edu',
      phone: '+92 301 2345678',
      gender: 'Female',
      designation: 'Senior English Faculty',
      qualification: 'M.A. English Literature',
      salary: 68000,
      address: 'Sector B, DHA Phase 5, Lahore',
      status: 'ACTIVE',
    },
  });

  const teacher3 = await prisma.teacher.create({
    data: {
      employeeId: 'TCH-003',
      name: 'Dr. Kashif Noman',
      email: 'kashif.n@apexschool.edu',
      phone: '+92 302 3456789',
      gender: 'Male',
      designation: 'Science Coordinator',
      qualification: 'Ph.D. Applied Physics',
      salary: 85000,
      address: 'Gulberg III, Lahore',
      status: 'ACTIVE',
    },
  });

  const teacher4 = await prisma.teacher.create({
    data: {
      employeeId: 'TCH-004',
      name: 'Mrs. Saima Noor',
      email: 'saima.n@apexschool.edu',
      phone: '+92 303 4567890',
      gender: 'Female',
      designation: 'Computer Science Instructor',
      qualification: 'MS Software Engineering',
      salary: 72000,
      address: 'WAPDA Town, Lahore',
      status: 'ACTIVE',
    },
  });

  const teacher5 = await prisma.teacher.create({
    data: {
      employeeId: 'TCH-005',
      name: 'Mr. Zeeshan Ali',
      email: 'zeeshan.a@apexschool.edu',
      phone: '+92 304 5678901',
      gender: 'Male',
      designation: 'Social Studies & History Faculty',
      qualification: 'M.A. History & Civics',
      salary: 60000,
      address: 'Johar Town, Lahore',
      status: 'ACTIVE',
    },
  });
  console.log('✓ Teachers created');

  // 4. Academic Classes & Sections
  const classesData = [
    { name: 'Grade 6', gradeLevel: 6, teacher: teacher1 },
    { name: 'Grade 7', gradeLevel: 7, teacher: teacher2 },
    { name: 'Grade 8', gradeLevel: 8, teacher: teacher3 },
    { name: 'Grade 9', gradeLevel: 9, teacher: teacher4 },
    { name: 'Grade 10', gradeLevel: 10, teacher: teacher5 },
  ];

  const classMap = new Map();
  const sectionMap = new Map();

  for (const c of classesData) {
    const createdClass = await prisma.academicClass.create({
      data: {
        name: c.name,
        gradeLevel: c.gradeLevel,
        numericCode: `G${c.gradeLevel}`,
      },
    });
    classMap.set(c.name, createdClass);

    // Create Section A and Section B
    const secA = await prisma.section.create({
      data: {
        name: 'Section A',
        classId: createdClass.id,
        classTeacherId: c.teacher.id,
        roomNumber: `Room ${c.gradeLevel}01`,
        capacity: 40,
      },
    });
    const secB = await prisma.section.create({
      data: {
        name: 'Section B',
        classId: createdClass.id,
        classTeacherId: teacher2.id,
        roomNumber: `Room ${c.gradeLevel}02`,
        capacity: 40,
      },
    });

    sectionMap.set(`${c.name}-A`, secA);
    sectionMap.set(`${c.name}-B`, secB);

    // Create Subjects for this class
    const subjects = [
      { name: 'Mathematics', code: `MTH-${c.gradeLevel}01`, type: 'CORE', teacherId: teacher1.id },
      { name: 'English Literature', code: `ENG-${c.gradeLevel}01`, type: 'CORE', teacherId: teacher2.id },
      { name: 'General Science', code: `SCI-${c.gradeLevel}01`, type: 'CORE', teacherId: teacher3.id },
      { name: 'Computer Science', code: `CS-${c.gradeLevel}01`, type: 'PRACTICAL', teacherId: teacher4.id },
      { name: 'Social Studies', code: `SST-${c.gradeLevel}01`, type: 'CORE', teacherId: teacher5.id },
    ];

    for (const sub of subjects) {
      await prisma.subject.create({
        data: {
          ...sub,
          classId: createdClass.id,
        },
      });
    }

    // Fee Structures for this class
    await prisma.feeStructure.createMany({
      data: [
        {
          classId: createdClass.id,
          feeType: 'Tuition Fee',
          amount: 120 + c.gradeLevel * 10,
          frequency: 'MONTHLY',
          description: `Standard Monthly Tuition Fee for ${c.name}`,
        },
        {
          classId: createdClass.id,
          feeType: 'Computer Lab Fee',
          amount: 25,
          frequency: 'MONTHLY',
          description: 'High-speed internet and computer lab maintenance',
        },
        {
          classId: createdClass.id,
          feeType: 'Examination Fee',
          amount: 40,
          frequency: 'PER_EXAM',
          description: 'Term exam paper printing and evaluation charges',
        },
        {
          classId: createdClass.id,
          feeType: 'Sports & Activity Fee',
          amount: 15,
          frequency: 'MONTHLY',
          description: 'Sports equipment and physical education facilities',
        },
      ],
    });
  }
  console.log('✓ Academic Classes, Sections, Subjects & Fee Structures created');

  // 5. Students
  const rawStudents = [
    { adm: 'ADM-2024-001', roll: '01', first: 'Hamza', last: 'Malik', gender: 'Male', class: 'Grade 8', sec: 'Grade 8-A', parent: 'Tariq Malik', phone: '+92 321 4455661', email: 'tariq.malik@gmail.com', occ: 'Civil Engineer' },
    { adm: 'ADM-2024-002', roll: '02', first: 'Zainab', last: 'Khan', gender: 'Female', class: 'Grade 8', sec: 'Grade 8-A', parent: 'Nasir Khan', phone: '+92 321 4455662', email: 'nasir.khan@yahoo.com', occ: 'Architect' },
    { adm: 'ADM-2024-003', roll: '03', first: 'Bilal', last: 'Ahmed', gender: 'Male', class: 'Grade 8', sec: 'Grade 8-A', parent: 'Farooq Ahmed', phone: '+92 321 4455663', email: 'farooq.a@gmail.com', occ: 'Bank Manager' },
    { adm: 'ADM-2024-004', roll: '04', first: 'Sara', last: 'Farhan', gender: 'Female', class: 'Grade 8', sec: 'Grade 8-A', parent: 'Farhan Sheikh', phone: '+92 321 4455664', email: 'farhan.s@gmail.com', occ: 'Chartered Accountant' },
    { adm: 'ADM-2024-005', roll: '05', first: 'Omar', last: 'Iqbal', gender: 'Male', class: 'Grade 8', sec: 'Grade 8-A', parent: 'Javed Iqbal', phone: '+92 321 4455665', email: 'javed.iqbal@gmail.com', occ: 'Professor' },
    { adm: 'ADM-2024-006', roll: '06', first: 'Anaya', last: 'Rehman', gender: 'Female', class: 'Grade 8', sec: 'Grade 8-B', parent: 'Abdul Rehman', phone: '+92 321 4455666', email: 'abdul.rehman@gmail.com', occ: 'Business Owner' },
    { adm: 'ADM-2024-007', roll: '07', first: 'Daniyal', last: 'Siddiqui', gender: 'Male', class: 'Grade 8', sec: 'Grade 8-B', parent: 'Khurram Siddiqui', phone: '+92 321 4455667', email: 'khurram.sid@gmail.com', occ: 'IT Director' },
    { adm: 'ADM-2024-008', roll: '08', first: 'Fatima', last: 'Babar', gender: 'Female', class: 'Grade 8', sec: 'Grade 8-B', parent: 'Babar Azam', phone: '+92 321 4455668', email: 'babar.azam@gmail.com', occ: 'Consultant' },

    { adm: 'ADM-2024-009', roll: '01', first: 'Ali', last: 'Raza', gender: 'Male', class: 'Grade 9', sec: 'Grade 9-A', parent: 'Hassan Raza', phone: '+92 333 1122331', email: 'hassan.raza@gmail.com', occ: 'Surgeon' },
    { adm: 'ADM-2024-010', roll: '02', first: 'Mariam', last: 'Usman', gender: 'Female', class: 'Grade 9', sec: 'Grade 9-A', parent: 'Usman Ghani', phone: '+92 333 1122332', email: 'usman.ghani@gmail.com', occ: 'Pharmacist' },
    { adm: 'ADM-2024-011', roll: '03', first: 'Mustafa', last: 'Kamal', gender: 'Male', class: 'Grade 9', sec: 'Grade 9-A', parent: 'Kamal Pasha', phone: '+92 333 1122333', email: 'kamal.pasha@gmail.com', occ: 'Advocate High Court' },
    { adm: 'ADM-2024-012', roll: '04', first: 'Hafsa', last: 'Nadeem', gender: 'Female', class: 'Grade 9', sec: 'Grade 9-B', parent: 'Nadeem Akhtar', phone: '+92 333 1122334', email: 'nadeem.akhtar@gmail.com', occ: 'Software Lead' },

    { adm: 'ADM-2024-013', roll: '01', first: 'Shahmeer', last: 'Kazmi', gender: 'Male', class: 'Grade 10', sec: 'Grade 10-A', parent: 'Syed Ali Kazmi', phone: '+92 345 9988771', email: 'ali.kazmi@gmail.com', occ: 'Pilot' },
    { adm: 'ADM-2024-014', roll: '02', first: 'Areeba', last: 'Tanveer', gender: 'Female', class: 'Grade 10', sec: 'Grade 10-A', parent: 'Tanveer Hayat', phone: '+92 345 9988772', email: 'tanveer.h@gmail.com', occ: 'Managing Director' },
    { adm: 'ADM-2024-015', roll: '03', first: 'Zubair', last: 'Hameed', gender: 'Male', class: 'Grade 10', sec: 'Grade 10-B', parent: 'Hameedullah', phone: '+92 345 9988773', email: 'hameed@gmail.com', occ: 'Govt Officer' },
    { adm: 'ADM-2024-016', roll: '04', first: 'Eman', last: 'Rashid', gender: 'Female', class: 'Grade 10', sec: 'Grade 10-B', parent: 'Rashid Minhas', phone: '+92 345 9988774', email: 'rashid.m@gmail.com', occ: 'Customs Officer' },

    { adm: 'ADM-2024-017', roll: '01', first: 'Ayaan', last: 'Qureshi', gender: 'Male', class: 'Grade 6', sec: 'Grade 6-A', parent: 'Faisal Qureshi', phone: '+92 312 6655441', email: 'faisal.q@gmail.com', occ: 'Textile Exporter' },
    { adm: 'ADM-2024-018', roll: '02', first: 'Dua', last: 'Mirza', gender: 'Female', class: 'Grade 6', sec: 'Grade 6-A', parent: 'Mirza Baig', phone: '+92 312 6655442', email: 'mirza.baig@gmail.com', occ: 'Journalist' },
    { adm: 'ADM-2024-019', roll: '01', first: 'Rayyan', last: 'Ansari', gender: 'Male', class: 'Grade 7', sec: 'Grade 7-A', parent: 'Waseem Ansari', phone: '+92 313 7788991', email: 'waseem.a@gmail.com', occ: 'Financial Analyst' },
    { adm: 'ADM-2024-020', roll: '02', first: 'Hania', last: 'Shah', gender: 'Female', class: 'Grade 7', sec: 'Grade 7-B', parent: 'Syed Shah', phone: '+92 313 7788992', email: 'syed.shah@gmail.com', occ: 'Civil Servant' },
  ];

  const studentList = [];

  for (const s of rawStudents) {
    const cls = classMap.get(s.class);
    const sec = sectionMap.get(s.sec);
    const student = await prisma.student.create({
      data: {
        admissionNo: s.adm,
        rollNo: s.roll,
        firstName: s.first,
        lastName: s.last,
        gender: s.gender,
        dob: new Date(2010, 4, 15),
        bloodGroup: 'B+',
        admissionDate: new Date(2023, 7, 1),
        status: 'ACTIVE',
        classId: cls.id,
        sectionId: sec.id,
        parentName: s.parent,
        parentRelationship: 'Father',
        parentPhone: s.phone,
        parentEmail: s.email,
        parentOccupation: s.occ,
        emergencyContact: s.phone,
        address: '12-B Pine Avenue, Cantt, Lahore',
      },
    });
    studentList.push(student);
  }
  console.log(`✓ ${studentList.length} Students enrolled`);

  // 6. Attendance Records (Last 5 days)
  const today = new Date();
  const pastDays = [0, 1, 2, 3, 4].map(offset => {
    const d = new Date(today);
    d.setDate(d.getDate() - offset);
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const statuses = ['PRESENT', 'PRESENT', 'PRESENT', 'PRESENT', 'ABSENT', 'LATE', 'LEAVE'];

  for (const d of pastDays) {
    for (let i = 0; i < studentList.length; i++) {
      const stu = studentList[i];
      // Generate realistic attendance pattern
      const statusIdx = (i + d.getDate()) % statuses.length;
      const status = statuses[statusIdx];
      await prisma.attendanceRecord.create({
        data: {
          date: d,
          studentId: stu.id,
          classId: stu.classId,
          sectionId: stu.sectionId,
          status,
          remarks: status === 'LATE' ? 'Traffic delay' : status === 'LEAVE' ? 'Medical leave application' : null,
        },
      });
    }
  }
  console.log('✓ Daily Attendance records generated');

  // 7. Fee Slips, Manual Cash Payments, & Receipts (VERY IMPORTANT MODULE)
  // Grade 8 monthly fee breakdown
  const g8FeeBreakdown = [
    { item: 'Tuition Fee (November 2024)', amount: 200 },
    { item: 'Computer Lab Fee', amount: 25 },
    { item: 'Sports & Activity Fee', amount: 15 },
  ];
  const g8Total = 240;

  // Let's create diverse fee statuses for demonstration:
  // Student 0: PAID via Cash -> Generate FeePayment and FeeReceipt!
  const stu0 = studentList[0];
  const slip0 = await prisma.feeSlip.create({
    data: {
      slipNumber: 'SLIP-2024-001',
      studentId: stu0.id,
      classId: stu0.classId,
      sectionId: stu0.sectionId,
      title: 'November 2024 Monthly Fee',
      month: 'November',
      year: 2024,
      issueDate: new Date(2024, 10, 1),
      dueDate: new Date(2024, 10, 15),
      totalAmount: g8Total,
      paidAmount: g8Total,
      balance: 0,
      status: 'PAID',
      lateFine: 0,
      breakdownJson: JSON.stringify(g8FeeBreakdown),
      notes: 'Paid on time at school cash counter',
    },
  });

  const payment0 = await prisma.feePayment.create({
    data: {
      feeSlipId: slip0.id,
      studentId: stu0.id,
      amountPaid: g8Total,
      paymentDate: new Date(2024, 10, 5),
      paymentMode: 'CASH',
      transactionRef: 'CSH-VOUCHER-0881',
      collectedBy: 'Mr. Asim Rauf (Cashier)',
      notes: 'Cash received at School Fee Counter',
    },
  });

  await prisma.feeReceipt.create({
    data: {
      receiptNumber: 'RCT-2024-001',
      feePaymentId: payment0.id,
      feeSlipId: slip0.id,
      studentId: stu0.id,
      receiptDate: new Date(2024, 10, 5),
      amountPaid: g8Total,
      balanceRemaining: 0,
      remarks: 'Full settlement of November 2024 dues.',
    },
  });

  // Student 1: PARTIALLY PAID via Cash -> Generate partial FeePayment and FeeReceipt
  const stu1 = studentList[1];
  const partialPaid = 150;
  const slip1 = await prisma.feeSlip.create({
    data: {
      slipNumber: 'SLIP-2024-002',
      studentId: stu1.id,
      classId: stu1.classId,
      sectionId: stu1.sectionId,
      title: 'November 2024 Monthly Fee',
      month: 'November',
      year: 2024,
      issueDate: new Date(2024, 10, 1),
      dueDate: new Date(2024, 10, 15),
      totalAmount: g8Total,
      paidAmount: partialPaid,
      balance: g8Total - partialPaid, // 90
      status: 'PARTIAL',
      lateFine: 0,
      breakdownJson: JSON.stringify(g8FeeBreakdown),
      notes: 'Partial payment received; remaining balance promised by 20th',
    },
  });

  const payment1 = await prisma.feePayment.create({
    data: {
      feeSlipId: slip1.id,
      studentId: stu1.id,
      amountPaid: partialPaid,
      paymentDate: new Date(2024, 10, 8),
      paymentMode: 'CASH',
      transactionRef: 'CSH-VOUCHER-0882',
      collectedBy: 'Mr. Asim Rauf (Cashier)',
      notes: 'Partial cash payment of $150 against $240 dues',
    },
  });

  await prisma.feeReceipt.create({
    data: {
      receiptNumber: 'RCT-2024-002',
      feePaymentId: payment1.id,
      feeSlipId: slip1.id,
      studentId: stu1.id,
      receiptDate: new Date(2024, 10, 8),
      amountPaid: partialPaid,
      balanceRemaining: g8Total - partialPaid,
      remarks: 'Partial fee payment recorded. Pending balance: $90.',
    },
  });

  // Student 2: UNPAID Fee Slip (Ready for manual cash collection)
  const stu2 = studentList[2];
  await prisma.feeSlip.create({
    data: {
      slipNumber: 'SLIP-2024-003',
      studentId: stu2.id,
      classId: stu2.classId,
      sectionId: stu2.sectionId,
      title: 'November 2024 Monthly Fee',
      month: 'November',
      year: 2024,
      issueDate: new Date(2024, 10, 1),
      dueDate: new Date(2024, 10, 20),
      totalAmount: g8Total,
      paidAmount: 0,
      balance: g8Total,
      status: 'UNPAID',
      lateFine: 0,
      breakdownJson: JSON.stringify(g8FeeBreakdown),
      notes: 'Fee slip issued to student. Awaiting cash submission.',
    },
  });

  // Student 3: OVERDUE Fee Slip (Defaulter)
  const stu3 = studentList[3];
  await prisma.feeSlip.create({
    data: {
      slipNumber: 'SLIP-2024-004',
      studentId: stu3.id,
      classId: stu3.classId,
      sectionId: stu3.sectionId,
      title: 'October 2024 Monthly Fee',
      month: 'October',
      year: 2024,
      issueDate: new Date(2024, 9, 1),
      dueDate: new Date(2024, 9, 15),
      totalAmount: g8Total + 20, // includes $20 late fine
      paidAmount: 0,
      balance: g8Total + 20,
      status: 'OVERDUE',
      lateFine: 20,
      breakdownJson: JSON.stringify([...g8FeeBreakdown, { item: 'Late Payment Surcharge', amount: 20 }]),
      notes: 'Overdue reminder notice dispatched to parent.',
    },
  });

  // Create fee slips for remaining students
  for (let i = 4; i < studentList.length; i++) {
    const s = studentList[i];
    const isPaid = i % 2 === 0;
    const slipNum = `SLIP-2024-${String(i + 1).padStart(3, '0')}`;
    const amount = 220;
    const slip = await prisma.feeSlip.create({
      data: {
        slipNumber: slipNum,
        studentId: s.id,
        classId: s.classId,
        sectionId: s.sectionId,
        title: 'November 2024 Monthly Fee',
        month: 'November',
        year: 2024,
        issueDate: new Date(2024, 10, 1),
        dueDate: new Date(2024, 10, 15),
        totalAmount: amount,
        paidAmount: isPaid ? amount : 0,
        balance: isPaid ? 0 : amount,
        status: isPaid ? 'PAID' : 'UNPAID',
        breakdownJson: JSON.stringify([
          { item: 'Tuition Fee', amount: 180 },
          { item: 'Lab & Computer Fee', amount: 25 },
          { item: 'Activity Fee', amount: 15 },
        ]),
      },
    });

    if (isPaid) {
      const pay = await prisma.feePayment.create({
        data: {
          feeSlipId: slip.id,
          studentId: s.id,
          amountPaid: amount,
          paymentDate: new Date(2024, 10, 6),
          paymentMode: 'CASH',
          transactionRef: `CSH-VOUCHER-${1000 + i}`,
          collectedBy: 'Mr. Asim Rauf (Cashier)',
        },
      });

      await prisma.feeReceipt.create({
        data: {
          receiptNumber: `RCT-2024-${String(i + 1).padStart(3, '0')}`,
          feePaymentId: pay.id,
          feeSlipId: slip.id,
          studentId: s.id,
          receiptDate: new Date(2024, 10, 6),
          amountPaid: amount,
          balanceRemaining: 0,
          remarks: 'Official cash payment received.',
        },
      });
    }
  }
  console.log('✓ Fee Slips, Manual Cash Payments & Receipts seeded');

  // 8. Examinations, Schedules, & Marks
  const exam = await prisma.exam.create({
    data: {
      title: 'Mid-Term Examination 2024',
      session: '2024-2025',
      term: 'MID_TERM',
      startDate: new Date(2024, 9, 10),
      endDate: new Date(2024, 9, 25),
      status: 'COMPLETED',
    },
  });

  const g8Class = classMap.get('Grade 8');
  const g8Subjects = await prisma.subject.findMany({ where: { classId: g8Class.id } });

  for (const sub of g8Subjects) {
    await prisma.examSchedule.create({
      data: {
        examId: exam.id,
        classId: g8Class.id,
        subjectId: sub.id,
        examDate: new Date(2024, 9, 12),
        startTime: '09:00 AM',
        endTime: '12:00 PM',
        maxMarks: 100,
        passMarks: 40,
        roomNumber: 'Hall A',
      },
    });
  }

  // Seed marks for Grade 8 students
  const g8Students = studentList.filter(s => s.classId === g8Class.id);
  const sampleMarks = [
    [92, 88, 95, 90, 86], // Hamza
    [85, 91, 89, 94, 88], // Zainab
    [78, 82, 74, 80, 76], // Bilal
    [95, 96, 92, 98, 94], // Sara
    [65, 70, 68, 72, 60], // Omar
    [88, 84, 86, 90, 82], // Anaya
    [72, 68, 75, 70, 74], // Daniyal
    [90, 92, 88, 91, 87], // Fatima
  ];

  for (let sIdx = 0; sIdx < g8Students.length; sIdx++) {
    const stu = g8Students[sIdx];
    const marksForStu = sampleMarks[sIdx] || [75, 80, 85, 78, 82];

    for (let subIdx = 0; subIdx < g8Subjects.length; subIdx++) {
      const sub = g8Subjects[subIdx];
      const obtained = marksForStu[subIdx] || 75;
      let grade = 'A';
      if (obtained >= 90) grade = 'A+';
      else if (obtained >= 80) grade = 'A';
      else if (obtained >= 70) grade = 'B';
      else if (obtained >= 60) grade = 'C';
      else if (obtained >= 50) grade = 'D';
      else grade = 'F';

      await prisma.examMark.create({
        data: {
          examId: exam.id,
          studentId: stu.id,
          subjectId: sub.id,
          classId: g8Class.id,
          maxMarks: 100,
          passMarks: 40,
          obtainedMarks: obtained,
          grade,
          status: obtained >= 40 ? 'PASS' : 'FAIL',
          remarks: obtained >= 85 ? 'Outstanding analytical work' : 'Good consistent progress',
        },
      });
    }
  }
  console.log('✓ Examinations, Schedules & Student Marks created');

  // 9. Timetable
  const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];
  const periods = [
    { period: 1, start: '08:00 AM', end: '08:45 AM' },
    { period: 2, start: '08:45 AM', end: '09:30 AM' },
    { period: 3, start: '09:30 AM', end: '10:15 AM' },
    { period: 4, start: '10:45 AM', end: '11:30 AM' },
    { period: 5, start: '11:30 AM', end: '12:15 PM' },
  ];

  const sec8A = sectionMap.get('Grade 8-A');
  for (let dIdx = 0; dIdx < days.length; dIdx++) {
    const day = days[dIdx];
    for (let pIdx = 0; pIdx < periods.length; pIdx++) {
      const p = periods[pIdx];
      const sub = g8Subjects[(dIdx + pIdx) % g8Subjects.length];
      await prisma.timetableSlot.create({
        data: {
          classId: g8Class.id,
          sectionId: sec8A.id,
          subjectId: sub.id,
          teacherId: sub.teacherId,
          dayOfWeek: day,
          periodNumber: p.period,
          startTime: p.start,
          endTime: p.end,
          roomNumber: sec8A.roomNumber || 'Room 801',
        },
      });
    }
  }
  console.log('✓ Timetable slots created');

  // 10. Notifications
  await prisma.notification.createMany({
    data: [
      {
        title: 'Fee Collection Deadline: 15th November',
        message: 'Reminder for parents and administration: monthly cash fee counters will remain open until 2:00 PM daily.',
        type: 'WARNING',
        targetRole: 'ALL',
      },
      {
        title: 'Mid-Term Result Cards Ready for Distribution',
        message: 'All class teachers can now preview and print the official mid-term report cards from the examination module.',
        type: 'SUCCESS',
        targetRole: 'TEACHER',
      },
      {
        title: 'Annual Sports Gala Announced',
        message: 'Preparations for the Inter-House Sports Gala 2024 will commence next Monday. Schedules will be distributed shortly.',
        type: 'INFO',
        targetRole: 'ALL',
      },
      {
        title: 'Defaulter Notice Dispatch',
        message: 'Account department has flagged 4 pending fee accounts for October and November. Follow-up calls scheduled.',
        type: 'ALERT',
        targetRole: 'ACCOUNTANT',
      },
    ],
  });
  console.log('✓ Institutional notifications created');

  console.log('✨ Seed completed successfully with realistic data!');
}

main()
  .catch(e => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

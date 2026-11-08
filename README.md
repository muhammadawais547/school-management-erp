# Apex International School ERP (Eskooly Edition)

A complete, modern, commercial-grade School Management ERP inspired by **Eskooly (https://eskooly.com/)**. Built with Next.js 16 App Router, TypeScript, Tailwind CSS, Lucide icons, and Prisma ORM.

Designed with an emphasis on institutional usability and a **strict manual cash fee collection engine** (no bank integration / payment gateways), featuring printable dual-copy fee slips, automatic official fee receipt vouchers, daily attendance roll call, examination marks entry, and printable student report cards.

---

## 🏫 Key Features & Reverse-Engineered Modules

### 1. Dashboard
- **Key Metrics Overview**: Real-time counts of Total Active Students, Verified Faculty, Total Classes, and Sections.
- **Financial Status Indicators**: Total Collected Fees (Realized Cash), Pending Dues, Paid vs Partial vs Unpaid vs Overdue invoice distribution.
- **Daily Attendance Gauge**: Today's presence percentage, breakdown of Present, Absent, Late, and Leave.
- **Recent Activity Ledger**: Instant preview of latest cash payments received at the fee desk with direct links to print official receipts.
- **Institutional Board**: School announcements and circulars.

### 2. Student Information System (SIMS)
- **Student Admissions**: Clean modal form with auto-generated admission numbers (`ADM-2024-XXX`), roll numbers, biological data, blood group, class/section assignment, parent/guardian info, and contact details.
- **Advanced Filtering**: Instant search by student name, roll number, admission number, class, section, or active status.
- **Comprehensive Student Profiles (`/students/[id]`)**: Full biographical records, guardian info, past 30 days attendance register, complete fee billing ledger, and examination marks history.

### 3. Faculty & Teacher Management
- **Teacher Profiles (`/teachers`)**: Employee ID (`TCH-XXX`), qualification, designation, joining date, monthly salary, phone, email, and address.
- **Curriculum & Class Allocation**: Direct linkage to assigned classes (as in-charge class teacher) and assigned curriculum subjects.
- **Faculty Profile View (`/teachers/[id]`)**: Shows assigned classes, subjects, and weekly teaching timetable schedule.

### 4. Classes & Section Hierarchy
- **Class Structure (`/classes`)**: Numeric grade levels (Grade 1 to Grade 10) with automatic creation of default Section A.
- **Multi-Section Support**: Create additional sections (Section B, Section C), assign room numbers, student capacities, and assign dedicated class teachers.
- **Student Enrollment Safety**: Prevents deletion of classes or sections with active enrolled students.

### 5. Curriculum & Subject Management
- **Subject Catalog (`/subjects`)**: Manage subjects by code (e.g. `MTH-801`, `ENG-801`), course type (`CORE`, `ELECTIVE`, `PRACTICAL`), class assignment, and faculty teacher assignment.

### 6. Daily Attendance Management
- **Roll Call Register (`/attendance`)**: Date picker (defaults to today), class & section selector.
- **One-Click Actions**: "Mark All Present" button.
- **Quick Status Toggles**: Single-click buttons for **Present (P)**, **Absent (A)**, **Late (L)**, and **Leave (E)** with individual remark inputs.
- **Monthly Attendance Matrix**: Tabular attendance sheet tracking total days, presence counts, and overall attendance percentages.

### 7. Manual Cash Fee Collection System (VERY IMPORTANT)
Strictly engineered for manual cash desk operations without bank or third-party online payment gateways:
1. **Fee Structures (`/fees/structures`)**: Define recurring tuition fees, computer lab fees, examination fees, and activity charges per class.
2. **Fee Slip Generation (`/fees/slips`)**:
   - **Bulk Class Generation**: 1-click generation of monthly fee slips for an entire class with automatic breakdown of fee items.
   - **Individual Student Slip**: Custom billing modal for individual students.
   - **Status Engine**: Unpaid, Partially Paid, Fully Paid, and Overdue. Slips remain strictly **UNPAID** upon generation.
3. **Printable Fee Slips (`/fees/slips/[id]`)**:
   - High-fidelity **Dual-Copy Layout** (Student/Parent Copy & School/Cashier Copy) formatted for clean A4 printing.
   - Includes school header, student details, line-item fee breakdown, payable within due date, late payment surcharge, payable after due date, desk instructions, and signature lines.
4. **Manual Cash Collection Counter (`/fees/collect`)**:
   - Dedicated cashier interface with instant student search (by admission #, name, roll #).
   - Shows outstanding balances and unpaid slips.
   - Allows full payment or partial payment.
   - Records payment mode (`CASH`, `CHEQUE`, `BANK_DEPOSIT`), cashier name, collection date, and notes.
5. **Automatic Fee Receipt Generation & Printing (`/fees/receipts/[id]`)**:
   - Immediately generates official payment voucher with unique Receipt No (`RCT-2024-XXX`).
   - High-fidelity **Official Fee Receipt** voucher formatted for clean printing.
   - Shows amount received in figures AND in words (e.g. *"Two Hundred and Forty Dollars Only"*), remaining balance, cashier signature, and official school stamp box.
6. **Defaulter Tracking (`/fees/defaulters`)**:
   - Real-time audit of overdue and pending accounts with parent phone numbers for follow-up reminders.

### 8. Examinations & Report Cards
- **Exam Scheduling (`/examinations`)**: Create examinations (First Term, Mid Term, Final Term).
- **Marks Entry Sheet**: Batch entry grid by exam, class, and subject with real-time automatic grade computation (A+, A, B, C, D, F) and pass/fail indicators.
- **Printable Student Report Cards (`/examinations/reports/[id]`)**:
   - Official transcript layout with school crest, student bio, marks breakdown per subject, total marks, percentage, overall grade, academic standing, grading scale legend, teacher & principal signatures, and official school stamp.

### 9. Timetable & Weekly Routines
- **Weekly Schedule Grid (`/timetable`)**: Visual routine by Class and Section across weekdays (Monday to Friday) and periods (1 to 5).
- **Slot Scheduling Modal**: Map subject, teacher, start/end time, and classroom.

### 10. Reports & Institutional Audits
- **Comprehensive Ledger (`/reports`)**: Student enrollment demographics (male/female per class), monthly staff payroll expenses, and class-by-class fee collection ledgers.

### 11. Role-Based Access Control (RBAC)
- Includes live testing role switcher in the sidebar to simulate:
  - `SUPER_ADMIN` (Full administrative power)
  - `SCHOOL_ADMIN` (Academics & operations)
  - `ACCOUNTANT` (Fee slips, cash collection, receipts, defaulters)
  - `TEACHER` (Attendance & marks entry)

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS v4 + Institutional Theme (Eskooly Palette) |
| **Icons** | Lucide React |
| **Database ORM** | Prisma ORM 6.x |
| **Local Database** | SQLite (`dev.db`) for immediate zero-config local run |
| **Cloud Database** | PostgreSQL (Neon / Supabase / Vercel Postgres compatible) |
| **Print Engine** | Dedicated `@media print` CSS for A4 fee slips, receipts & report cards |

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18+ (tested on Node v24)
- npm 9+

### 2. Installation
```bash
# Navigate to project directory
cd school-erp

# Install dependencies
npm install
```

### 3. Database Setup & Seeding
```bash
# Push Prisma schema to SQLite
npx prisma db push

# Seed realistic school data (students, teachers, fee slips, exams, attendance)
npx tsx prisma/seed.ts
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Production Build
```bash
npm run build
npm run start
```

---

## 🔐 Demo Credentials / Accounts

| Name | Role | Email | Password |
|---|---|---|---|
| Dr. Tariq Mehmood | Super Admin | `admin@apexschool.edu` | `admin123` |
| Mrs. Fatima Zahra | School Admin | `principal@apexschool.edu` | `admin123` |
| Mr. Asim Rauf | Accountant / Cashier | `cashier@apexschool.edu` | `account123` |
| Mr. Salman Qureshi | Teacher | `teacher@apexschool.edu` | `teacher123` |

*(You can also use the role switcher dropdown at the bottom of the sidebar to test any role instantly).*

---

## 🌐 Deploying to Vercel (PostgreSQL)

When deploying to Vercel with Neon or Supabase:

1. Create a PostgreSQL database on [Neon](https://neon.tech) or [Supabase](https://supabase.com).
2. In `prisma/schema.prisma`, update the datasource provider from `sqlite` to `postgresql`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
3. Set the `DATABASE_URL` environment variable in your Vercel project settings:
   ```env
   DATABASE_URL="postgresql://username:password@ep-cool-fog-123456.us-east-2.aws.neon.tech/neondb?sslmode=require"
   ```
4. Deploy on Vercel. In build settings, ensure `prisma generate && next build` is executed.

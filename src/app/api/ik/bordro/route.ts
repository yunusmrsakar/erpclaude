export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Turkish tax brackets (2024 progressive income tax)
const INCOME_TAX_BRACKETS = [
  { limit: 110000, rate: 0.15 },
  { limit: 230000, rate: 0.20 },
  { limit: 580000, rate: 0.27 },
  { limit: 3000000, rate: 0.35 },
  { limit: Infinity, rate: 0.40 },
];

const SGK_EMPLOYEE_RATE = 0.14;
const SGK_EMPLOYER_RATE = 0.205;
const STAMP_TAX_RATE = 0.00759;

function calculateIncomeTax(annualTaxableIncome: number): number {
  let tax = 0;
  let previousLimit = 0;

  for (const bracket of INCOME_TAX_BRACKETS) {
    if (annualTaxableIncome <= previousLimit) break;

    const taxableInBracket = Math.min(annualTaxableIncome, bracket.limit) - previousLimit;
    tax += taxableInBracket * bracket.rate;
    previousLimit = bracket.limit;
  }

  return tax;
}

function calculateMonthlyPayroll(grossSalary: number, monthIndex: number) {
  // SGK Employee deduction (14% of gross, capped at ceiling)
  const sgkEmployee = grossSalary * SGK_EMPLOYEE_RATE;

  // SGK Employer contribution (20.5% of gross)
  const sgkEmployer = grossSalary * SGK_EMPLOYER_RATE;

  // Taxable income = Gross - SGK Employee
  const monthlyTaxableIncome = grossSalary - sgkEmployee;

  // Cumulative taxable income up to this month (for progressive tax)
  const cumulativePrevious = monthlyTaxableIncome * (monthIndex - 1);
  const cumulativeCurrent = monthlyTaxableIncome * monthIndex;

  // Progressive income tax calculation
  const taxCumCurrent = calculateIncomeTax(cumulativeCurrent);
  const taxCumPrevious = calculateIncomeTax(cumulativePrevious);
  const incomeTax = taxCumCurrent - taxCumPrevious;

  // Stamp tax (0.759% of gross)
  const stampTax = grossSalary * STAMP_TAX_RATE;

  // Net salary
  const netSalary = grossSalary - sgkEmployee - incomeTax - stampTax;

  return {
    grossSalary: Math.round(grossSalary * 100) / 100,
    sgkEmployee: Math.round(sgkEmployee * 100) / 100,
    sgkEmployer: Math.round(sgkEmployer * 100) / 100,
    incomeTax: Math.round(incomeTax * 100) / 100,
    stampTax: Math.round(stampTax * 100) / 100,
    netSalary: Math.round(netSalary * 100) / 100,
  };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const period = searchParams.get("period");

  const where = period ? { period } : {};

  const payrolls = await prisma.payroll.findMany({
    where,
    include: {
      employee: {
        select: { id: true, firstName: true, lastName: true, employeeNo: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(payrolls);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { period } = body; // Format: "2024-01"

    if (!period || !/^\d{4}-\d{2}$/.test(period)) {
      return NextResponse.json(
        { error: "Geçerli bir dönem giriniz (YYYY-AA formatında)." },
        { status: 400 }
      );
    }

    // Check if payroll already exists for this period
    const existingPayroll = await prisma.payroll.findFirst({
      where: { period },
    });

    if (existingPayroll) {
      return NextResponse.json(
        { error: "Bu dönem için bordro zaten oluşturulmuş." },
        { status: 400 }
      );
    }

    // Get all active employees
    const activeEmployees = await prisma.employee.findMany({
      where: { status: { in: ["AKTIF", "IZINLI"] } },
    });

    if (activeEmployees.length === 0) {
      return NextResponse.json(
        { error: "Aktif çalışan bulunamadı." },
        { status: 400 }
      );
    }

    // Calculate month index (1-12) for progressive tax
    const monthIndex = parseInt(period.split("-")[1]);

    // Create payroll records for all employees
    const payrolls = await Promise.all(
      activeEmployees.map(async (emp: any) => {
        const calc = calculateMonthlyPayroll(emp.salary, monthIndex);

        return prisma.payroll.create({
          data: {
            employeeId: emp.id,
            period,
            grossSalary: calc.grossSalary,
            sgkEmployee: calc.sgkEmployee,
            sgkEmployer: calc.sgkEmployer,
            incomeTax: calc.incomeTax,
            stampTax: calc.stampTax,
            netSalary: calc.netSalary,
            status: "HAZIRLANIYOR",
          },
          include: {
            employee: {
              select: { id: true, firstName: true, lastName: true, employeeNo: true },
            },
          },
        });
      })
    );

    return NextResponse.json(payrolls, { status: 201 });
  } catch (error) {
    console.error("Bordro oluşturma hatası:", error);
    return NextResponse.json(
      { error: "Bordro oluşturulurken bir hata oluştu." },
      { status: 500 }
    );
  }
}

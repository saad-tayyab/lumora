import { and, asc, count, desc, eq, gte, lte, type SQL } from 'drizzle-orm';
import { db } from '../../index';
import type {
  AttendanceRecord,
  Department,
  Designation,
  Employee,
  LeaveRequest,
  LeaveType,
  NewAttendanceRecord,
  NewDepartment,
  NewDesignation,
  NewEmployee,
  NewLeaveRequest,
  NewLeaveType,
  NewPayrollRecord,
  NewPayslip,
  NewSalary,
  PayrollRecord,
  Payslip,
  Salary,
} from './schema';
import {
  attendance,
  departments,
  designations,
  employees,
  leaveRequests,
  leaveTypes,
  payroll,
  payslips,
  salaries,
} from './schema';

// ─── Departments ──────────────────────────────────────────────────────────────

export const departmentRepository = {
  async findById(id: string): Promise<Department | undefined> {
    return db.query.departments.findFirst({ where: eq(departments.id, id) });
  },

  async findByCode(code: string): Promise<Department | undefined> {
    return db.query.departments.findFirst({ where: eq(departments.code, code) });
  },

  async findByParentId(parentId: string): Promise<Department[]> {
    return db.query.departments.findMany({
      where: eq(departments.parentId, parentId),
      orderBy: asc(departments.name),
    });
  },

  async findRootDepartments(): Promise<Department[]> {
    return db.query.departments.findMany({
      where: eq(departments.parentId, null),
      orderBy: asc(departments.name),
    });
  },

  async findActive(): Promise<Department[]> {
    return db.query.departments.findMany({
      where: eq(departments.status, 'active'),
      orderBy: asc(departments.name),
    });
  },

  async findMany(args?: { limit?: number; offset?: number; orderBy?: SQL }) {
    const { limit = 50, offset = 0, orderBy = asc(departments.name) } = args ?? {};
    const data = await db.query.departments.findMany({ limit, offset, orderBy });
    const total = await db.select({ count: count() }).from(departments);
    return { data, total: total[0].count, limit, offset };
  },

  async create(data: NewDepartment): Promise<Department[]> {
    return db.insert(departments).values(data).returning();
  },

  async update(id: string, data: Partial<NewDepartment>): Promise<Department[]> {
    return db.update(departments).set(data).where(eq(departments.id, id)).returning();
  },

  async delete(id: string): Promise<Department[]> {
    return db.delete(departments).where(eq(departments.id, id)).returning();
  },
};

// ─── Designations ─────────────────────────────────────────────────────────────

export const designationRepository = {
  async findById(id: string): Promise<Designation | undefined> {
    return db.query.designations.findFirst({ where: eq(designations.id, id) });
  },

  async findByCode(code: string): Promise<Designation | undefined> {
    return db.query.designations.findFirst({ where: eq(designations.code, code) });
  },

  async findByLevel(level: number): Promise<Designation[]> {
    return db.query.designations.findMany({
      where: eq(designations.level, level),
      orderBy: asc(designations.name),
    });
  },

  async findActive(): Promise<Designation[]> {
    return db.query.designations.findMany({
      where: eq(designations.isActive, true),
      orderBy: asc(designations.level),
    });
  },

  async findMany(args?: { limit?: number; offset?: number; orderBy?: SQL }) {
    const { limit = 50, offset = 0, orderBy = asc(designations.level) } = args ?? {};
    const data = await db.query.designations.findMany({ limit, offset, orderBy });
    const total = await db.select({ count: count() }).from(designations);
    return { data, total: total[0].count, limit, offset };
  },

  async create(data: NewDesignation): Promise<Designation[]> {
    return db.insert(designations).values(data).returning();
  },

  async update(id: string, data: Partial<NewDesignation>): Promise<Designation[]> {
    return db.update(designations).set(data).where(eq(designations.id, id)).returning();
  },

  async delete(id: string): Promise<Designation[]> {
    return db.delete(designations).where(eq(designations.id, id)).returning();
  },
};

// ─── Employees ────────────────────────────────────────────────────────────────

export const employeeRepository = {
  async findById(id: string): Promise<Employee | undefined> {
    return db.query.employees.findFirst({ where: eq(employees.id, id) });
  },

  async findByUserId(userId: string): Promise<Employee | undefined> {
    return db.query.employees.findFirst({ where: eq(employees.userId, userId) });
  },

  async findByEmail(email: string): Promise<Employee | undefined> {
    return db.query.employees.findFirst({ where: eq(employees.email, email) });
  },

  async findByDepartment(departmentId: string): Promise<Employee[]> {
    return db.query.employees.findMany({
      where: eq(employees.departmentId, departmentId),
      orderBy: asc(employees.lastName),
    });
  },

  async findByDesignation(designationId: string): Promise<Employee[]> {
    return db.query.employees.findMany({
      where: eq(employees.designationId, designationId),
      orderBy: asc(employees.lastName),
    });
  },

  async findByManager(managerId: string): Promise<Employee[]> {
    return db.query.employees.findMany({
      where: eq(employees.managerId, managerId),
      orderBy: asc(employees.lastName),
    });
  },

  async findActive(): Promise<Employee[]> {
    return db.query.employees.findMany({
      where: eq(employees.status, 'active'),
      orderBy: asc(employees.lastName),
    });
  },

  async findByStatus(status: Employee['status']): Promise<Employee[]> {
    return db.query.employees.findMany({
      where: eq(employees.status, status),
      orderBy: asc(employees.lastName),
    });
  },

  async findMany(args?: { limit?: number; offset?: number; orderBy?: SQL }) {
    const { limit = 50, offset = 0, orderBy = asc(employees.lastName) } = args ?? {};
    const data = await db.query.employees.findMany({ limit, offset, orderBy });
    const total = await db.select({ count: count() }).from(employees);
    return { data, total: total[0].count, limit, offset };
  },

  async create(data: NewEmployee): Promise<Employee[]> {
    return db.insert(employees).values(data).returning();
  },

  async update(id: string, data: Partial<NewEmployee>): Promise<Employee[]> {
    return db.update(employees).set(data).where(eq(employees.id, id)).returning();
  },

  async delete(id: string): Promise<Employee[]> {
    return db.delete(employees).where(eq(employees.id, id)).returning();
  },
};

// ─── Attendance ───────────────────────────────────────────────────────────────

export const attendanceRepository = {
  async findById(id: string): Promise<AttendanceRecord | undefined> {
    return db.query.attendance.findFirst({ where: eq(attendance.id, id) });
  },

  async findByEmployeeAndDate(
    employeeId: string,
    date: string,
  ): Promise<AttendanceRecord | undefined> {
    return db.query.attendance.findFirst({
      where: and(eq(attendance.employeeId, employeeId), eq(attendance.date, date)),
    });
  },

  async findByEmployeeAndDateRange(
    employeeId: string,
    startDate: string,
    endDate: string,
  ): Promise<AttendanceRecord[]> {
    return db.query.attendance.findMany({
      where: and(
        eq(attendance.employeeId, employeeId),
        gte(attendance.date, startDate),
        lte(attendance.date, endDate),
      ),
      orderBy: asc(attendance.date),
    });
  },

  async findByDate(date: string): Promise<AttendanceRecord[]> {
    return db.query.attendance.findMany({
      where: eq(attendance.date, date),
      orderBy: asc(attendance.employeeId),
    });
  },

  async findByStatus(status: AttendanceRecord['status']): Promise<AttendanceRecord[]> {
    return db.query.attendance.findMany({
      where: eq(attendance.status, status),
      orderBy: desc(attendance.date),
    });
  },

  async findMany(args?: { limit?: number; offset?: number; orderBy?: SQL }) {
    const { limit = 50, offset = 0, orderBy = desc(attendance.date) } = args ?? {};
    const data = await db.query.attendance.findMany({ limit, offset, orderBy });
    const total = await db.select({ count: count() }).from(attendance);
    return { data, total: total[0].count, limit, offset };
  },

  async create(data: NewAttendanceRecord): Promise<AttendanceRecord[]> {
    return db.insert(attendance).values(data).returning();
  },

  async update(id: string, data: Partial<NewAttendanceRecord>): Promise<AttendanceRecord[]> {
    return db.update(attendance).set(data).where(eq(attendance.id, id)).returning();
  },

  async delete(id: string): Promise<AttendanceRecord[]> {
    return db.delete(attendance).where(eq(attendance.id, id)).returning();
  },
};

// ─── Leave Types ──────────────────────────────────────────────────────────────

export const leaveTypeRepository = {
  async findById(id: string): Promise<LeaveType | undefined> {
    return db.query.leaveTypes.findFirst({ where: eq(leaveTypes.id, id) });
  },

  async findByCode(code: string): Promise<LeaveType | undefined> {
    return db.query.leaveTypes.findFirst({ where: eq(leaveTypes.code, code) });
  },

  async findActive(): Promise<LeaveType[]> {
    return db.query.leaveTypes.findMany({
      where: eq(leaveTypes.isActive, true),
      orderBy: asc(leaveTypes.name),
    });
  },

  async findMany(args?: { limit?: number; offset?: number; orderBy?: SQL }) {
    const { limit = 50, offset = 0, orderBy = asc(leaveTypes.name) } = args ?? {};
    const data = await db.query.leaveTypes.findMany({ limit, offset, orderBy });
    const total = await db.select({ count: count() }).from(leaveTypes);
    return { data, total: total[0].count, limit, offset };
  },

  async create(data: NewLeaveType): Promise<LeaveType[]> {
    return db.insert(leaveTypes).values(data).returning();
  },

  async update(id: string, data: Partial<NewLeaveType>): Promise<LeaveType[]> {
    return db.update(leaveTypes).set(data).where(eq(leaveTypes.id, id)).returning();
  },

  async delete(id: string): Promise<LeaveType[]> {
    return db.delete(leaveTypes).where(eq(leaveTypes.id, id)).returning();
  },
};

// ─── Leave Requests ───────────────────────────────────────────────────────────

export const leaveRequestRepository = {
  async findById(id: string): Promise<LeaveRequest | undefined> {
    return db.query.leaveRequests.findFirst({ where: eq(leaveRequests.id, id) });
  },

  async findByEmployee(employeeId: string): Promise<LeaveRequest[]> {
    return db.query.leaveRequests.findMany({
      where: eq(leaveRequests.employeeId, employeeId),
      orderBy: desc(leaveRequests.startDate),
    });
  },

  async findByStatus(status: LeaveRequest['status']): Promise<LeaveRequest[]> {
    return db.query.leaveRequests.findMany({
      where: eq(leaveRequests.status, status),
      orderBy: desc(leaveRequests.startDate),
    });
  },

  async findByEmployeeAndStatus(
    employeeId: string,
    status: LeaveRequest['status'],
  ): Promise<LeaveRequest[]> {
    return db.query.leaveRequests.findMany({
      where: and(eq(leaveRequests.employeeId, employeeId), eq(leaveRequests.status, status)),
      orderBy: desc(leaveRequests.startDate),
    });
  },

  async findByDateRange(startDate: string, endDate: string): Promise<LeaveRequest[]> {
    return db.query.leaveRequests.findMany({
      where: and(gte(leaveRequests.startDate, startDate), lte(leaveRequests.endDate, endDate)),
      orderBy: asc(leaveRequests.startDate),
    });
  },

  async findMany(args?: { limit?: number; offset?: number; orderBy?: SQL }) {
    const { limit = 50, offset = 0, orderBy = desc(leaveRequests.startDate) } = args ?? {};
    const data = await db.query.leaveRequests.findMany({ limit, offset, orderBy });
    const total = await db.select({ count: count() }).from(leaveRequests);
    return { data, total: total[0].count, limit, offset };
  },

  async create(data: NewLeaveRequest): Promise<LeaveRequest[]> {
    return db.insert(leaveRequests).values(data).returning();
  },

  async update(id: string, data: Partial<NewLeaveRequest>): Promise<LeaveRequest[]> {
    return db.update(leaveRequests).set(data).where(eq(leaveRequests.id, id)).returning();
  },

  async delete(id: string): Promise<LeaveRequest[]> {
    return db.delete(leaveRequests).where(eq(leaveRequests.id, id)).returning();
  },
};

// ─── Salaries ────────────────────────────────────────────────────────────────

export const salaryRepository = {
  async findById(id: string): Promise<Salary | undefined> {
    return db.query.salaries.findFirst({ where: eq(salaries.id, id) });
  },

  async findByEmployee(employeeId: string): Promise<Salary | undefined> {
    return db.query.salaries.findFirst({
      where: eq(salaries.employeeId, employeeId),
    });
  },

  async findActiveByEmployee(employeeId: string): Promise<Salary | undefined> {
    return db.query.salaries.findFirst({
      where: and(eq(salaries.employeeId, employeeId), eq(salaries.isActive, true)),
    });
  },

  async findMany(args?: { limit?: number; offset?: number; orderBy?: SQL }) {
    const { limit = 50, offset = 0, orderBy = asc(salaries.effectiveDate) } = args ?? {};
    const data = await db.query.salaries.findMany({ limit, offset, orderBy });
    const total = await db.select({ count: count() }).from(salaries);
    return { data, total: total[0].count, limit, offset };
  },

  async create(data: NewSalary): Promise<Salary[]> {
    return db.insert(salaries).values(data).returning();
  },

  async update(id: string, data: Partial<NewSalary>): Promise<Salary[]> {
    return db.update(salaries).set(data).where(eq(salaries.id, id)).returning();
  },

  async delete(id: string): Promise<Salary[]> {
    return db.delete(salaries).where(eq(salaries.id, id)).returning();
  },
};

// ─── Payroll ──────────────────────────────────────────────────────────────────

export const payrollRepository = {
  async findById(id: string): Promise<PayrollRecord | undefined> {
    return db.query.payroll.findFirst({ where: eq(payroll.id, id) });
  },

  async findByEmployee(employeeId: string): Promise<PayrollRecord[]> {
    return db.query.payroll.findMany({
      where: eq(payroll.employeeId, employeeId),
      orderBy: desc(payroll.payPeriodStart),
    });
  },

  async findByStatus(status: PayrollRecord['status']): Promise<PayrollRecord[]> {
    return db.query.payroll.findMany({
      where: eq(payroll.status, status),
      orderBy: desc(payroll.payPeriodStart),
    });
  },

  async findByPayPeriod(startDate: string, endDate: string): Promise<PayrollRecord[]> {
    return db.query.payroll.findMany({
      where: and(eq(payroll.payPeriodStart, startDate), eq(payroll.payPeriodEnd, endDate)),
      orderBy: asc(payroll.employeeId),
    });
  },

  async findByEmployeeAndPayPeriod(
    employeeId: string,
    startDate: string,
    endDate: string,
  ): Promise<PayrollRecord | undefined> {
    return db.query.payroll.findFirst({
      where: and(
        eq(payroll.employeeId, employeeId),
        eq(payroll.payPeriodStart, startDate),
        eq(payroll.payPeriodEnd, endDate),
      ),
    });
  },

  async findMany(args?: { limit?: number; offset?: number; orderBy?: SQL }) {
    const { limit = 50, offset = 0, orderBy = desc(payroll.payPeriodStart) } = args ?? {};
    const data = await db.query.payroll.findMany({ limit, offset, orderBy });
    const total = await db.select({ count: count() }).from(payroll);
    return { data, total: total[0].count, limit, offset };
  },

  async create(data: NewPayrollRecord): Promise<PayrollRecord[]> {
    return db.insert(payroll).values(data).returning();
  },

  async update(id: string, data: Partial<NewPayrollRecord>): Promise<PayrollRecord[]> {
    return db.update(payroll).set(data).where(eq(payroll.id, id)).returning();
  },

  async delete(id: string): Promise<PayrollRecord[]> {
    return db.delete(payroll).where(eq(payroll.id, id)).returning();
  },
};

// ─── Payslips ─────────────────────────────────────────────────────────────────

export const payslipRepository = {
  async findById(id: string): Promise<Payslip | undefined> {
    return db.query.payslips.findFirst({ where: eq(payslips.id, id) });
  },

  async findByEmployee(employeeId: string): Promise<Payslip[]> {
    return db.query.payslips.findMany({
      where: eq(payslips.employeeId, employeeId),
      orderBy: desc(payslips.generatedAt),
    });
  },

  async findByPayrollId(payrollId: string): Promise<Payslip[]> {
    return db.query.payslips.findMany({
      where: eq(payslips.payrollId, payrollId),
      orderBy: desc(payslips.generatedAt),
    });
  },

  async findByPeriod(period: string): Promise<Payslip[]> {
    return db.query.payslips.findMany({
      where: eq(payslips.period, period),
      orderBy: desc(payslips.generatedAt),
    });
  },

  async findByEmployeeAndPeriod(
    employeeId: string,
    period: string,
  ): Promise<Payslip | undefined> {
    return db.query.payslips.findFirst({
      where: and(eq(payslips.employeeId, employeeId), eq(payslips.period, period)),
    });
  },

  async findMany(args?: { limit?: number; offset?: number; orderBy?: SQL }) {
    const { limit = 50, offset = 0, orderBy = desc(payslips.generatedAt) } = args ?? {};
    const data = await db.query.payslips.findMany({ limit, offset, orderBy });
    const total = await db.select({ count: count() }).from(payslips);
    return { data, total: total[0].count, limit, offset };
  },

  async create(data: NewPayslip): Promise<Payslip[]> {
    return db.insert(payslips).values(data).returning();
  },

  async update(id: string, data: Partial<NewPayslip>): Promise<Payslip[]> {
    return db.update(payslips).set(data).where(eq(payslips.id, id)).returning();
  },

  async delete(id: string): Promise<Payslip[]> {
    return db.delete(payslips).where(eq(payslips.id, id)).returning();
  },
};

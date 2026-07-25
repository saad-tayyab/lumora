import {
  type AttendanceRecord,
  attendance,
  type Department,
  type Designation,
  departments,
  designations,
  type Employee,
  employees,
  type LeaveRequest,
  type LeaveType,
  leaveRequests,
  leaveTypes,
  type NewAttendanceRecord,
  type NewDepartment,
  type NewDesignation,
  type NewEmployee,
  type NewLeaveRequest,
  type NewLeaveType,
  type NewPayrollRecord,
  type NewSalary,
  type PayrollRecord,
  type Payslip,
  payroll,
  payslips,
  type Salary,
  salaries,
} from '@lumora/database/schema/hr';
import { and, asc, count, desc, eq, type SQL } from 'drizzle-orm';
import { db } from '../../database';

// ─── Departments ─────────────────────────────────────────────────────────────

export const departmentRepo = {
  async findById(id: string): Promise<Department | undefined> {
    return db.query.departments.findFirst({
      where: eq(departments.id, id),
    });
  },

  async findByCode(tenantId: string, code: string): Promise<Department | undefined> {
    return db.query.departments.findFirst({
      where: and(eq(departments.tenantId, tenantId), eq(departments.code, code)),
    });
  },

  async findByParentId(parentId: string): Promise<Department[]> {
    return db.query.departments.findMany({
      where: eq(departments.parentId, parentId),
      orderBy: asc(departments.name),
    });
  },

  async countEmployeesByDepartment(departmentId: string): Promise<number> {
    const [{ cnt }] = await db
      .select({ cnt: count() })
      .from(employees)
      .where(eq(employees.departmentId, departmentId));
    return cnt;
  },

  async findMany(args?: { tenantId?: string; limit?: number; offset?: number; orderBy?: SQL }) {
    const { tenantId, limit = 50, offset = 0, orderBy = asc(departments.name) } = args ?? {};
    const where = tenantId ? eq(departments.tenantId, tenantId) : undefined;
    const data = await db.query.departments.findMany({
      where,
      limit,
      offset,
      orderBy,
    });
    const [{ count: total }] = await db.select({ count: count() }).from(departments).where(where);
    return { data, total, limit, offset };
  },

  async create(data: NewDepartment): Promise<Department[]> {
    return db.insert(departments).values(data).returning();
  },

  async update(id: string, data: Partial<NewDepartment>): Promise<Department[]> {
    return db.update(departments).set(data).where(eq(departments.id, id)).returning();
  },

  async softDelete(id: string): Promise<Department[]> {
    return db
      .update(departments)
      .set({ deletedAt: new Date() })
      .where(eq(departments.id, id))
      .returning();
  },
};

// ─── Designations ────────────────────────────────────────────────────────────

export const designationRepo = {
  async findById(id: string): Promise<Designation | undefined> {
    return db.query.designations.findFirst({
      where: eq(designations.id, id),
    });
  },

  async findByCode(tenantId: string, code: string): Promise<Designation | undefined> {
    return db.query.designations.findFirst({
      where: and(eq(designations.tenantId, tenantId), eq(designations.code, code)),
    });
  },

  async findActiveByTenant(tenantId: string): Promise<Designation[]> {
    return db.query.designations.findMany({
      where: and(eq(designations.tenantId, tenantId), eq(designations.isActive, true)),
      orderBy: asc(designations.name),
    });
  },

  async countEmployeesByDesignation(designationId: string): Promise<number> {
    const [{ cnt }] = await db
      .select({ cnt: count() })
      .from(employees)
      .where(eq(employees.designationId, designationId));
    return cnt;
  },

  async findMany(args?: { tenantId?: string; limit?: number; offset?: number; orderBy?: SQL }) {
    const { tenantId, limit = 50, offset = 0, orderBy = asc(designations.name) } = args ?? {};
    const where = tenantId ? eq(designations.tenantId, tenantId) : undefined;
    const data = await db.query.designations.findMany({
      where,
      limit,
      offset,
      orderBy,
    });
    const [{ count: total }] = await db.select({ count: count() }).from(designations).where(where);
    return { data, total, limit, offset };
  },

  async create(data: NewDesignation): Promise<Designation[]> {
    return db.insert(designations).values(data).returning();
  },

  async update(id: string, data: Partial<NewDesignation>): Promise<Designation[]> {
    return db.update(designations).set(data).where(eq(designations.id, id)).returning();
  },

  async softDelete(id: string): Promise<Designation[]> {
    return db
      .update(designations)
      .set({ deletedAt: new Date() })
      .where(eq(designations.id, id))
      .returning();
  },
};

// ─── Employees ───────────────────────────────────────────────────────────────

export const employeeRepo = {
  async findById(id: string): Promise<Employee | undefined> {
    return db.query.employees.findFirst({
      where: eq(employees.id, id),
    });
  },

  async findByEmail(email: string): Promise<Employee | undefined> {
    return db.query.employees.findFirst({
      where: eq(employees.email, email),
    });
  },

  async findByUserId(userId: string): Promise<Employee | undefined> {
    return db.query.employees.findFirst({
      where: eq(employees.userId, userId),
    });
  },

  async findByManagerId(managerId: string): Promise<Employee[]> {
    return db.query.employees.findMany({
      where: eq(employees.managerId, managerId),
      orderBy: asc(employees.lastName),
    });
  },

  async findActiveByTenant(tenantId: string): Promise<Employee[]> {
    return db.query.employees.findMany({
      where: and(eq(employees.tenantId, tenantId), eq(employees.status, 'active')),
      orderBy: asc(employees.lastName),
    });
  },

  async findMany(args?: { tenantId?: string; limit?: number; offset?: number; orderBy?: SQL }) {
    const { tenantId, limit = 50, offset = 0, orderBy = asc(employees.lastName) } = args ?? {};
    const where = tenantId ? eq(employees.tenantId, tenantId) : undefined;
    const data = await db.query.employees.findMany({
      where,
      limit,
      offset,
      orderBy,
    });
    const [{ count: total }] = await db.select({ count: count() }).from(employees).where(where);
    return { data, total, limit, offset };
  },

  async create(data: NewEmployee): Promise<Employee[]> {
    return db.insert(employees).values(data).returning();
  },

  async update(id: string, data: Partial<NewEmployee>): Promise<Employee[]> {
    return db.update(employees).set(data).where(eq(employees.id, id)).returning();
  },

  async softDelete(id: string): Promise<Employee[]> {
    return db
      .update(employees)
      .set({ deletedAt: new Date() })
      .where(eq(employees.id, id))
      .returning();
  },
};

// ─── Attendance ──────────────────────────────────────────────────────────────

export const attendanceRepo = {
  async findById(id: string): Promise<AttendanceRecord | undefined> {
    return db.query.attendance.findFirst({
      where: eq(attendance.id, id),
    });
  },

  async findByEmployeeAndDate(
    employeeId: string,
    date: string,
  ): Promise<AttendanceRecord | undefined> {
    return db.query.attendance.findFirst({
      where: and(eq(attendance.employeeId, employeeId), eq(attendance.date, date)),
    });
  },

  async findByEmployee(employeeId: string): Promise<AttendanceRecord[]> {
    return db.query.attendance.findMany({
      where: eq(attendance.employeeId, employeeId),
      orderBy: desc(attendance.date),
    });
  },

  async findMany(args?: { tenantId?: string; limit?: number; offset?: number; orderBy?: SQL }) {
    const { tenantId, limit = 50, offset = 0, orderBy = desc(attendance.date) } = args ?? {};
    const where = tenantId ? eq(attendance.tenantId, tenantId) : undefined;
    const data = await db.query.attendance.findMany({
      where,
      limit,
      offset,
      orderBy,
    });
    const [{ count: total }] = await db.select({ count: count() }).from(attendance).where(where);
    return { data, total, limit, offset };
  },

  async create(data: NewAttendanceRecord): Promise<AttendanceRecord[]> {
    return db.insert(attendance).values(data).returning();
  },

  async update(id: string, data: Partial<NewAttendanceRecord>): Promise<AttendanceRecord[]> {
    return db.update(attendance).set(data).where(eq(attendance.id, id)).returning();
  },

  async delete(id: string): Promise<void> {
    await db.delete(attendance).where(eq(attendance.id, id));
  },
};

// ─── Leave Types ─────────────────────────────────────────────────────────────

export const leaveTypeRepo = {
  async findById(id: string): Promise<LeaveType | undefined> {
    return db.query.leaveTypes.findFirst({
      where: eq(leaveTypes.id, id),
    });
  },

  async findByCode(tenantId: string, code: string): Promise<LeaveType | undefined> {
    return db.query.leaveTypes.findFirst({
      where: and(eq(leaveTypes.tenantId, tenantId), eq(leaveTypes.code, code)),
    });
  },

  async findActiveByTenant(tenantId: string): Promise<LeaveType[]> {
    return db.query.leaveTypes.findMany({
      where: and(eq(leaveTypes.tenantId, tenantId), eq(leaveTypes.isActive, true)),
      orderBy: asc(leaveTypes.name),
    });
  },

  async countRequestsByLeaveType(leaveTypeId: string): Promise<number> {
    const [{ cnt }] = await db
      .select({ cnt: count() })
      .from(leaveRequests)
      .where(eq(leaveRequests.leaveTypeId, leaveTypeId));
    return cnt;
  },

  async findMany(args?: { tenantId?: string; limit?: number; offset?: number; orderBy?: SQL }) {
    const { tenantId, limit = 50, offset = 0, orderBy = asc(leaveTypes.name) } = args ?? {};
    const where = tenantId ? eq(leaveTypes.tenantId, tenantId) : undefined;
    const data = await db.query.leaveTypes.findMany({
      where,
      limit,
      offset,
      orderBy,
    });
    const [{ count: total }] = await db.select({ count: count() }).from(leaveTypes).where(where);
    return { data, total, limit, offset };
  },

  async create(data: NewLeaveType): Promise<LeaveType[]> {
    return db.insert(leaveTypes).values(data).returning();
  },

  async update(id: string, data: Partial<NewLeaveType>): Promise<LeaveType[]> {
    return db.update(leaveTypes).set(data).where(eq(leaveTypes.id, id)).returning();
  },

  async softDelete(id: string): Promise<LeaveType[]> {
    return db
      .update(leaveTypes)
      .set({ deletedAt: new Date() })
      .where(eq(leaveTypes.id, id))
      .returning();
  },
};

// ─── Leave Requests ──────────────────────────────────────────────────────────

export const leaveRequestRepo = {
  async findById(id: string): Promise<LeaveRequest | undefined> {
    return db.query.leaveRequests.findFirst({
      where: eq(leaveRequests.id, id),
    });
  },

  async findByEmployee(employeeId: string): Promise<LeaveRequest[]> {
    return db.query.leaveRequests.findMany({
      where: eq(leaveRequests.employeeId, employeeId),
      orderBy: desc(leaveRequests.createdAt),
    });
  },

  async findPendingByTenant(tenantId: string): Promise<LeaveRequest[]> {
    return db.query.leaveRequests.findMany({
      where: and(eq(leaveRequests.tenantId, tenantId), eq(leaveRequests.status, 'pending')),
      orderBy: asc(leaveRequests.startDate),
    });
  },

  async findMany(args?: { tenantId?: string; limit?: number; offset?: number; orderBy?: SQL }) {
    const {
      tenantId,
      limit = 50,
      offset = 0,
      orderBy = desc(leaveRequests.createdAt),
    } = args ?? {};
    const where = tenantId ? eq(leaveRequests.tenantId, tenantId) : undefined;
    const data = await db.query.leaveRequests.findMany({
      where,
      limit,
      offset,
      orderBy,
    });
    const [{ count: total }] = await db.select({ count: count() }).from(leaveRequests).where(where);
    return { data, total, limit, offset };
  },

  async create(data: NewLeaveRequest): Promise<LeaveRequest[]> {
    return db.insert(leaveRequests).values(data).returning();
  },

  async update(id: string, data: Partial<NewLeaveRequest>): Promise<LeaveRequest[]> {
    return db.update(leaveRequests).set(data).where(eq(leaveRequests.id, id)).returning();
  },

  async softDelete(id: string): Promise<LeaveRequest[]> {
    return db
      .update(leaveRequests)
      .set({ deletedAt: new Date() })
      .where(eq(leaveRequests.id, id))
      .returning();
  },
};

// ─── Salaries ────────────────────────────────────────────────────────────────

export const salaryRepo = {
  async findById(id: string): Promise<Salary | undefined> {
    return db.query.salaries.findFirst({
      where: eq(salaries.id, id),
    });
  },

  async findByEmployee(employeeId: string): Promise<Salary | undefined> {
    return db.query.salaries.findFirst({
      where: and(eq(salaries.employeeId, employeeId), eq(salaries.isActive, true)),
    });
  },

  async findMany(args?: { tenantId?: string; limit?: number; offset?: number; orderBy?: SQL }) {
    const { tenantId, limit = 50, offset = 0, orderBy = desc(salaries.effectiveDate) } = args ?? {};
    const where = tenantId ? eq(salaries.tenantId, tenantId) : undefined;
    const data = await db.query.salaries.findMany({
      where,
      limit,
      offset,
      orderBy,
    });
    const [{ count: total }] = await db.select({ count: count() }).from(salaries).where(where);
    return { data, total, limit, offset };
  },

  async create(data: NewSalary): Promise<Salary[]> {
    return db.insert(salaries).values(data).returning();
  },

  async update(id: string, data: Partial<NewSalary>): Promise<Salary[]> {
    return db.update(salaries).set(data).where(eq(salaries.id, id)).returning();
  },

  async softDelete(id: string): Promise<Salary[]> {
    return db
      .update(salaries)
      .set({ deletedAt: new Date() })
      .where(eq(salaries.id, id))
      .returning();
  },
};

// ─── Payroll ─────────────────────────────────────────────────────────────────

export const payrollRepo = {
  async findById(id: string): Promise<PayrollRecord | undefined> {
    return db.query.payroll.findFirst({
      where: eq(payroll.id, id),
    });
  },

  async findByEmployeeAndPeriod(
    employeeId: string,
    payPeriodStart: string,
    payPeriodEnd: string,
  ): Promise<PayrollRecord | undefined> {
    return db.query.payroll.findFirst({
      where: and(
        eq(payroll.employeeId, employeeId),
        eq(payroll.payPeriodStart, payPeriodStart),
        eq(payroll.payPeriodEnd, payPeriodEnd),
      ),
    });
  },

  async findMany(args?: { tenantId?: string; limit?: number; offset?: number; orderBy?: SQL }) {
    const { tenantId, limit = 50, offset = 0, orderBy = desc(payroll.payPeriodEnd) } = args ?? {};
    const where = tenantId ? eq(payroll.tenantId, tenantId) : undefined;
    const data = await db.query.payroll.findMany({
      where,
      limit,
      offset,
      orderBy,
    });
    const [{ count: total }] = await db.select({ count: count() }).from(payroll).where(where);
    return { data, total, limit, offset };
  },

  async create(data: NewPayrollRecord): Promise<PayrollRecord[]> {
    return db.insert(payroll).values(data).returning();
  },

  async update(id: string, data: Partial<NewPayrollRecord>): Promise<PayrollRecord[]> {
    return db.update(payroll).set(data).where(eq(payroll.id, id)).returning();
  },

  async softDelete(id: string): Promise<PayrollRecord[]> {
    return db.update(payroll).set({ deletedAt: new Date() }).where(eq(payroll.id, id)).returning();
  },
};

// ─── Payslips ────────────────────────────────────────────────────────────────

export const payslipRepo = {
  async findById(id: string): Promise<Payslip | undefined> {
    return db.query.payslips.findFirst({
      where: eq(payslips.id, id),
    });
  },

  async findByEmployee(employeeId: string): Promise<Payslip[]> {
    return db.query.payslips.findMany({
      where: eq(payslips.employeeId, employeeId),
      orderBy: desc(payslips.generatedAt),
    });
  },

  async findByPayroll(payrollId: string): Promise<Payslip[]> {
    return db.query.payslips.findMany({
      where: eq(payslips.payrollId, payrollId),
      orderBy: desc(payslips.generatedAt),
    });
  },

  async findMany(args?: { tenantId?: string; limit?: number; offset?: number; orderBy?: SQL }) {
    const { tenantId, limit = 50, offset = 0, orderBy = desc(payslips.generatedAt) } = args ?? {};
    const where = tenantId ? eq(payslips.tenantId, tenantId) : undefined;
    const data = await db.query.payslips.findMany({
      where,
      limit,
      offset,
      orderBy,
    });
    const [{ count: total }] = await db.select({ count: count() }).from(payslips).where(where);
    return { data, total, limit, offset };
  },
};

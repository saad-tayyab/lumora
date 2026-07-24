import {
  boolean,
  date,
  decimal,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-orm/zod';
import { auditFields } from '../common/audit';

// ─── Enums ────────────────────────────────────────────────────────────────────

export const departmentStatusEnum = pgEnum('department_status', ['active', 'inactive']);

export const employmentTypeEnum = pgEnum('employment_type', [
  'full_time',
  'part_time',
  'contract',
  'intern',
]);

export const employeeStatusEnum = pgEnum('employee_status', ['active', 'on_leave', 'terminated']);

export const attendanceStatusEnum = pgEnum('attendance_status', [
  'present',
  'absent',
  'half_day',
  'work_from_home',
]);

export const leaveStatusEnum = pgEnum('leave_status', [
  'pending',
  'approved',
  'rejected',
  'cancelled',
]);

export const payFrequencyEnum = pgEnum('pay_frequency', ['monthly', 'bi_weekly', 'weekly']);

export const payrollStatusEnum = pgEnum('payroll_status', ['draft', 'processed', 'paid']);

// ─── Tables ───────────────────────────────────────────────────────────────────

export const departments = pgTable(
  'departments',
  {
    ...auditFields,
    name: varchar('name', { length: 100 }).notNull(),
    code: varchar('code', { length: 20 }).notNull().unique(),
    description: varchar('description', { length: 500 }),
    // biome-ignore lint/suspicious/noExplicitAny: Drizzle self-referencing FK requires any
    headId: uuid('head_id').references((): any => employees.id),
    // biome-ignore lint/suspicious/noExplicitAny: Drizzle self-referencing FK requires any
    parentId: uuid('parent_id').references((): any => departments.id),
    status: departmentStatusEnum('status').notNull().default('active'),
  },
  (table) => [
    index('idx_departments_parent_id').on(table.parentId),
    index('idx_departments_head_id').on(table.headId),
    index('idx_departments_status').on(table.status),
  ],
);

export const designations = pgTable(
  'designations',
  {
    ...auditFields,
    name: varchar('name', { length: 100 }).notNull(),
    code: varchar('code', { length: 20 }).notNull().unique(),
    description: varchar('description', { length: 500 }),
    level: integer('level').notNull().default(1),
    isActive: boolean('is_active').notNull().default(true),
  },
  (table) => [
    index('idx_designations_level').on(table.level),
    index('idx_designations_is_active').on(table.isActive),
  ],
);

export const employees = pgTable(
  'employees',
  {
    ...auditFields,
    userId: uuid('user_id').unique(),
    firstName: varchar('first_name', { length: 100 }).notNull(),
    lastName: varchar('last_name', { length: 100 }).notNull(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    phone: varchar('phone', { length: 20 }),
    hireDate: date('hire_date').notNull(),
    departmentId: uuid('department_id')
      .notNull()
      .references(() => departments.id),
    designationId: uuid('designation_id')
      .notNull()
      .references(() => designations.id),
    // biome-ignore lint/suspicious/noExplicitAny: Drizzle self-referencing FK requires any
    managerId: uuid('manager_id').references((): any => employees.id),
    employmentType: employmentTypeEnum('employment_type').notNull(),
    status: employeeStatusEnum('status').notNull().default('active'),
  },
  (table) => [
    index('idx_employees_department_id').on(table.departmentId),
    index('idx_employees_designation_id').on(table.designationId),
    index('idx_employees_manager_id').on(table.managerId),
    index('idx_employees_status').on(table.status),
    index('idx_employees_employment_type').on(table.employmentType),
  ],
);

export const attendance = pgTable(
  'attendance',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    employeeId: uuid('employee_id')
      .notNull()
      .references(() => employees.id),
    date: date('date').notNull(),
    clockIn: timestamp('clock_in'),
    clockOut: timestamp('clock_out'),
    status: attendanceStatusEnum('status').notNull(),
    hoursWorked: decimal('hours_worked', { precision: 5, scale: 2 }),
    overtimeHours: decimal('overtime_hours', { precision: 5, scale: 2 }),
    notes: text('notes'),
    createdAt: auditFields.createdAt,
    updatedAt: auditFields.updatedAt,
  },
  (table) => [
    index('idx_attendance_employee_id').on(table.employeeId),
    index('idx_attendance_date').on(table.date),
    index('idx_attendance_status').on(table.status),
    uniqueIndex('idx_attendance_employee_id_date').on(table.employeeId, table.date),
  ],
);

export const leaveTypes = pgTable(
  'leave_types',
  {
    ...auditFields,
    name: varchar('name', { length: 50 }).notNull(),
    code: varchar('code', { length: 20 }).notNull().unique(),
    daysPerYear: integer('days_per_year').notNull().default(0),
    isPaid: boolean('is_paid').notNull().default(true),
    isActive: boolean('is_active').notNull().default(true),
  },
  (table) => [index('idx_leave_types_is_active').on(table.isActive)],
);

export const leaveRequests = pgTable(
  'leave_requests',
  {
    ...auditFields,
    employeeId: uuid('employee_id')
      .notNull()
      .references(() => employees.id),
    leaveTypeId: uuid('leave_type_id')
      .notNull()
      .references(() => leaveTypes.id),
    startDate: date('start_date').notNull(),
    endDate: date('end_date').notNull(),
    reason: text('reason'),
    status: leaveStatusEnum('status').notNull().default('pending'),
    approvedBy: uuid('approved_by'),
    approvedAt: timestamp('approved_at'),
  },
  (table) => [
    index('idx_leave_requests_employee_id').on(table.employeeId),
    index('idx_leave_requests_leave_type_id').on(table.leaveTypeId),
    index('idx_leave_requests_status').on(table.status),
    index('idx_leave_requests_start_date').on(table.startDate),
    index('idx_leave_requests_end_date').on(table.endDate),
  ],
);

export const salaries = pgTable(
  'salaries',
  {
    ...auditFields,
    employeeId: uuid('employee_id')
      .notNull()
      .references(() => employees.id)
      .unique(),
    basicSalary: decimal('basic_salary', { precision: 19, scale: 4 }).notNull().default('0'),
    currency: varchar('currency', { length: 3 }).notNull().default('USD'),
    payFrequency: payFrequencyEnum('pay_frequency').notNull().default('monthly'),
    effectiveDate: date('effective_date').notNull(),
    isActive: boolean('is_active').notNull().default(true),
  },
  (table) => [
    index('idx_salaries_is_active').on(table.isActive),
    index('idx_salaries_effective_date').on(table.effectiveDate),
  ],
);

export const payroll = pgTable(
  'payroll',
  {
    ...auditFields,
    employeeId: uuid('employee_id')
      .notNull()
      .references(() => employees.id),
    payPeriodStart: date('pay_period_start').notNull(),
    payPeriodEnd: date('pay_period_end').notNull(),
    basicSalary: decimal('basic_salary', { precision: 19, scale: 4 }).notNull().default('0'),
    allowances: decimal('allowances', { precision: 19, scale: 4 }).notNull().default('0'),
    deductions: decimal('deductions', { precision: 19, scale: 4 }).notNull().default('0'),
    netPay: decimal('net_pay', { precision: 19, scale: 4 }).notNull().default('0'),
    status: payrollStatusEnum('status').notNull().default('draft'),
    processedAt: timestamp('processed_at'),
    paidAt: timestamp('paid_at'),
  },
  (table) => [
    index('idx_payroll_employee_id').on(table.employeeId),
    index('idx_payroll_status').on(table.status),
    index('idx_payroll_pay_period_start').on(table.payPeriodStart),
    index('idx_payroll_pay_period_end').on(table.payPeriodEnd),
  ],
);

// ─── Zod Schemas ──────────────────────────────────────────────────────────────

export const insertDepartmentSchema = createInsertSchema(departments, {
  name: (schema) => schema.min(1).max(100),
  code: (schema) => schema.min(1).max(20),
});
export const selectDepartmentSchema = createSelectSchema(departments);

export const insertDesignationSchema = createInsertSchema(designations, {
  name: (schema) => schema.min(1).max(100),
  code: (schema) => schema.min(1).max(20),
});
export const selectDesignationSchema = createSelectSchema(designations);

export const insertEmployeeSchema = createInsertSchema(employees, {
  firstName: (schema) => schema.min(1).max(100),
  lastName: (schema) => schema.min(1).max(100),
  email: (schema) => schema.email(),
});
export const selectEmployeeSchema = createSelectSchema(employees);

export const insertAttendanceSchema = createInsertSchema(attendance);
export const selectAttendanceSchema = createSelectSchema(attendance);

export const insertLeaveTypeSchema = createInsertSchema(leaveTypes, {
  name: (schema) => schema.min(1).max(50),
  code: (schema) => schema.min(1).max(20),
});
export const selectLeaveTypeSchema = createSelectSchema(leaveTypes);

export const insertLeaveRequestSchema = createInsertSchema(leaveRequests);
export const selectLeaveRequestSchema = createSelectSchema(leaveRequests);

export const insertSalarySchema = createInsertSchema(salaries);
export const selectSalarySchema = createSelectSchema(salaries);

export const insertPayrollSchema = createInsertSchema(payroll);
export const selectPayrollSchema = createSelectSchema(payroll);

export const updateDepartmentSchema = createUpdateSchema(departments);
export const updateDesignationSchema = createUpdateSchema(designations);
export const updateEmployeeSchema = createUpdateSchema(employees);
export const updateAttendanceSchema = createUpdateSchema(attendance);
export const updateLeaveTypeSchema = createUpdateSchema(leaveTypes);
export const updateLeaveRequestSchema = createUpdateSchema(leaveRequests);
export const updateSalarySchema = createUpdateSchema(salaries);
export const updatePayrollSchema = createUpdateSchema(payroll);

// ─── Types ────────────────────────────────────────────────────────────────────

export type Department = typeof departments.$inferSelect;
export type NewDepartment = typeof departments.$inferInsert;

export type Designation = typeof designations.$inferSelect;
export type NewDesignation = typeof designations.$inferInsert;

export type Employee = typeof employees.$inferSelect;
export type NewEmployee = typeof employees.$inferInsert;

export type AttendanceRecord = typeof attendance.$inferSelect;
export type NewAttendanceRecord = typeof attendance.$inferInsert;

export type LeaveType = typeof leaveTypes.$inferSelect;
export type NewLeaveType = typeof leaveTypes.$inferInsert;

export type LeaveRequest = typeof leaveRequests.$inferSelect;
export type NewLeaveRequest = typeof leaveRequests.$inferInsert;

export type Salary = typeof salaries.$inferSelect;
export type NewSalary = typeof salaries.$inferInsert;

export type PayrollRecord = typeof payroll.$inferSelect;
export type NewPayrollRecord = typeof payroll.$inferInsert;

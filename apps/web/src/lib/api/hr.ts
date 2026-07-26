import { api, type PaginatedResponse } from '$lib/api';

export interface Department {
  id: string;
  name: string;
  code: string;
  description: string | null;
  managerId: string | null;
  managerName: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Designation {
  id: string;
  title: string;
  code: string;
  departmentId: string;
  departmentName: string;
  level: number;
  createdAt: string;
  updatedAt: string;
}

export interface Employee {
  id: string;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  departmentId: string;
  departmentName: string;
  designationId: string;
  designationTitle: string;
  status: string;
  employmentType: string;
  joiningDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface Attendance {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  status: string;
  clockIn: string | null;
  clockOut: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LeaveType {
  id: string;
  name: string;
  daysPerYear: number;
  isPaid: boolean;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  leaveTypeId: string;
  leaveTypeName: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: string;
  approvedBy: string | null;
  approvedAt: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Salary {
  id: string;
  employeeId: string;
  employeeName: string;
  basicSalary: string;
  allowances: string;
  deductions: string;
  effectiveFrom: string;
  effectiveTo: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Payroll {
  id: string;
  payrollNumber: string;
  period: string;
  status: string;
  totalGross: string;
  totalDeductions: string;
  totalNet: string;
  processedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Payslip {
  id: string;
  employeeId: string;
  employeeName: string;
  payrollId: string;
  payrollNumber: string;
  period: string;
  basicSalary: string;
  allowances: string;
  deductions: string;
  netPay: string;
  generatedAt: string;
  createdAt: string;
  updatedAt: string;
}

export const hrApi = {
  departments: {
    list: (params?: { limit?: number; offset?: number }) => {
      const qs = new URLSearchParams();
      if (params?.limit) qs.set('limit', String(params.limit));
      if (params?.offset) qs.set('offset', String(params.offset));
      const q = qs.toString();
      return api.get<PaginatedResponse<Department>>(`/hr/departments${q ? `?${q}` : ''}`);
    },
    get: (id: string) => api.get<Department>(`/hr/departments/${id}`),
    create: (data: Partial<Department>) => api.post<Department>('/hr/departments', data),
    update: (id: string, data: Partial<Department>) =>
      api.patch<Department>(`/hr/departments/${id}`, data),
    delete: (id: string) => api.del<void>(`/hr/departments/${id}`),
  },
  designations: {
    list: (params?: { departmentId?: string; limit?: number; offset?: number }) => {
      const qs = new URLSearchParams();
      if (params?.departmentId) qs.set('departmentId', params.departmentId);
      if (params?.limit) qs.set('limit', String(params.limit));
      if (params?.offset) qs.set('offset', String(params.offset));
      const q = qs.toString();
      return api.get<PaginatedResponse<Designation>>(`/hr/designations${q ? `?${q}` : ''}`);
    },
    get: (id: string) => api.get<Designation>(`/hr/designations/${id}`),
    create: (data: Partial<Designation>) => api.post<Designation>('/hr/designations', data),
    update: (id: string, data: Partial<Designation>) =>
      api.patch<Designation>(`/hr/designations/${id}`, data),
    delete: (id: string) => api.del<void>(`/hr/designations/${id}`),
  },
  employees: {
    list: (params?: {
      status?: string;
      departmentId?: string;
      limit?: number;
      offset?: number;
    }) => {
      const qs = new URLSearchParams();
      if (params?.status) qs.set('status', params.status);
      if (params?.departmentId) qs.set('departmentId', params.departmentId);
      if (params?.limit) qs.set('limit', String(params.limit));
      if (params?.offset) qs.set('offset', String(params.offset));
      const q = qs.toString();
      return api.get<PaginatedResponse<Employee>>(`/hr/employees${q ? `?${q}` : ''}`);
    },
    get: (id: string) => api.get<Employee>(`/hr/employees/${id}`),
    create: (data: Partial<Employee>) => api.post<Employee>('/hr/employees', data),
    update: (id: string, data: Partial<Employee>) =>
      api.patch<Employee>(`/hr/employees/${id}`, data),
    delete: (id: string) => api.del<void>(`/hr/employees/${id}`),
  },
  attendance: {
    list: (params?: { employeeId?: string; date?: string; limit?: number; offset?: number }) => {
      const qs = new URLSearchParams();
      if (params?.employeeId) qs.set('employeeId', params.employeeId);
      if (params?.date) qs.set('date', params.date);
      if (params?.limit) qs.set('limit', String(params.limit));
      if (params?.offset) qs.set('offset', String(params.offset));
      const q = qs.toString();
      return api.get<PaginatedResponse<Attendance>>(`/hr/attendance${q ? `?${q}` : ''}`);
    },
    get: (id: string) => api.get<Attendance>(`/hr/attendance/${id}`),
    create: (data: Partial<Attendance>) => api.post<Attendance>('/hr/attendance', data),
    update: (id: string, data: Partial<Attendance>) =>
      api.patch<Attendance>(`/hr/attendance/${id}`, data),
    delete: (id: string) => api.del<void>(`/hr/attendance/${id}`),
  },
  leaveTypes: {
    list: (params?: { limit?: number; offset?: number }) => {
      const qs = new URLSearchParams();
      if (params?.limit) qs.set('limit', String(params.limit));
      if (params?.offset) qs.set('offset', String(params.offset));
      const q = qs.toString();
      return api.get<PaginatedResponse<LeaveType>>(`/hr/leave-types${q ? `?${q}` : ''}`);
    },
    get: (id: string) => api.get<LeaveType>(`/hr/leave-types/${id}`),
    create: (data: Partial<LeaveType>) => api.post<LeaveType>('/hr/leave-types', data),
    update: (id: string, data: Partial<LeaveType>) =>
      api.patch<LeaveType>(`/hr/leave-types/${id}`, data),
    delete: (id: string) => api.del<void>(`/hr/leave-types/${id}`),
  },
  leaveRequests: {
    list: (params?: { status?: string; employeeId?: string; limit?: number; offset?: number }) => {
      const qs = new URLSearchParams();
      if (params?.status) qs.set('status', params.status);
      if (params?.employeeId) qs.set('employeeId', params.employeeId);
      if (params?.limit) qs.set('limit', String(params.limit));
      if (params?.offset) qs.set('offset', String(params.offset));
      const q = qs.toString();
      return api.get<PaginatedResponse<LeaveRequest>>(`/hr/leave-requests${q ? `?${q}` : ''}`);
    },
    get: (id: string) => api.get<LeaveRequest>(`/hr/leave-requests/${id}`),
    create: (data: Partial<LeaveRequest>) => api.post<LeaveRequest>('/hr/leave-requests', data),
    approve: (id: string) => api.patch<LeaveRequest>(`/hr/leave-requests/${id}/approve`, {}),
  },
  salaries: {
    list: (params?: { employeeId?: string; limit?: number; offset?: number }) => {
      const qs = new URLSearchParams();
      if (params?.employeeId) qs.set('employeeId', params.employeeId);
      if (params?.limit) qs.set('limit', String(params.limit));
      if (params?.offset) qs.set('offset', String(params.offset));
      const q = qs.toString();
      return api.get<PaginatedResponse<Salary>>(`/hr/salaries${q ? `?${q}` : ''}`);
    },
    get: (id: string) => api.get<Salary>(`/hr/salaries/${id}`),
    create: (data: Partial<Salary>) => api.post<Salary>('/hr/salaries', data),
    update: (id: string, data: Partial<Salary>) => api.patch<Salary>(`/hr/salaries/${id}`, data),
    delete: (id: string) => api.del<void>(`/hr/salaries/${id}`),
  },
  payroll: {
    list: (params?: { status?: string; period?: string; limit?: number; offset?: number }) => {
      const qs = new URLSearchParams();
      if (params?.status) qs.set('status', params.status);
      if (params?.period) qs.set('period', params.period);
      if (params?.limit) qs.set('limit', String(params.limit));
      if (params?.offset) qs.set('offset', String(params.offset));
      const q = qs.toString();
      return api.get<PaginatedResponse<Payroll>>(`/hr/payroll${q ? `?${q}` : ''}`);
    },
    get: (id: string) => api.get<Payroll>(`/hr/payroll/${id}`),
    create: (data: Partial<Payroll>) => api.post<Payroll>('/hr/payroll', data),
    update: (id: string, data: Partial<Payroll>) => api.patch<Payroll>(`/hr/payroll/${id}`, data),
    process: (id: string) => api.post<Payroll>(`/hr/payroll/${id}/process`, {}),
    delete: (id: string) => api.del<void>(`/hr/payroll/${id}`),
  },
  payslips: {
    list: (params?: {
      employeeId?: string;
      payrollId?: string;
      limit?: number;
      offset?: number;
    }) => {
      const qs = new URLSearchParams();
      if (params?.employeeId) qs.set('employeeId', params.employeeId);
      if (params?.payrollId) qs.set('payrollId', params.payrollId);
      if (params?.limit) qs.set('limit', String(params.limit));
      if (params?.offset) qs.set('offset', String(params.offset));
      const q = qs.toString();
      return api.get<PaginatedResponse<Payslip>>(`/hr/payslips${q ? `?${q}` : ''}`);
    },
    get: (id: string) => api.get<Payslip>(`/hr/payslips/${id}`),
  },
};

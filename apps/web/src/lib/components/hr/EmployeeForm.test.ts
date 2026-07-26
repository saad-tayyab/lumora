import { render, screen } from '@testing-library/svelte';
import { expect, test, describe } from 'vitest';
import EmployeeForm from './EmployeeForm.svelte';

const departments = [
  { id: 'dept1', name: 'Engineering' },
  { id: 'dept2', name: 'Sales' },
  { id: 'dept3', name: 'HR' },
];

const designations = [
  { id: 'des1', title: 'Software Engineer' },
  { id: 'des2', title: 'Manager' },
  { id: 'des3', title: 'Director' },
];

describe('EmployeeForm', () => {
  test('renders all form fields', () => {
    render(EmployeeForm, { props: { departments, designations } });
    expect(screen.getByLabelText('First Name *')).toBeInTheDocument();
    expect(screen.getByLabelText('Last Name *')).toBeInTheDocument();
    expect(screen.getByLabelText('Email *')).toBeInTheDocument();
    expect(screen.getByLabelText('Phone')).toBeInTheDocument();
    expect(screen.getByLabelText('Department *')).toBeInTheDocument();
    expect(screen.getByLabelText('Designation *')).toBeInTheDocument();
    expect(screen.getByLabelText('Joining Date *')).toBeInTheDocument();
    expect(screen.getByLabelText('Employment Type')).toBeInTheDocument();
    expect(screen.getByLabelText('Status')).toBeInTheDocument();
  });

  test('department select renders department options', () => {
    render(EmployeeForm, { props: { departments, designations } });
    expect(screen.getByText('Engineering')).toBeInTheDocument();
    expect(screen.getByText('Sales')).toBeInTheDocument();
    expect(screen.getByText('HR')).toBeInTheDocument();
  });

  test('department select has default placeholder option', () => {
    render(EmployeeForm, { props: { departments, designations } });
    expect(screen.getByText('Select department')).toBeInTheDocument();
  });

  test('designation select renders designation options', () => {
    render(EmployeeForm, { props: { departments, designations } });
    expect(screen.getByText('Software Engineer')).toBeInTheDocument();
    expect(screen.getByText('Manager')).toBeInTheDocument();
    expect(screen.getByText('Director')).toBeInTheDocument();
  });

  test('designation select has default placeholder option', () => {
    render(EmployeeForm, { props: { departments, designations } });
    expect(screen.getByText('Select designation')).toBeInTheDocument();
  });

  test('employment type select has correct options', () => {
    render(EmployeeForm, { props: { departments, designations } });
    expect(screen.getByText('Full Time')).toBeInTheDocument();
    expect(screen.getByText('Part Time')).toBeInTheDocument();
    expect(screen.getByText('Contract')).toBeInTheDocument();
    expect(screen.getByText('Intern')).toBeInTheDocument();
  });

  test('status select has correct options', () => {
    render(EmployeeForm, { props: { departments, designations } });
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('Inactive')).toBeInTheDocument();
    expect(screen.getByText('Terminated')).toBeInTheDocument();
  });

  test('renders Create Employee button for new employee', () => {
    render(EmployeeForm, { props: { departments, designations } });
    expect(screen.getByText('Create Employee')).toBeInTheDocument();
  });

  test('renders Update Employee button when editing', () => {
    const employee = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '123456',
      departmentId: 'dept1',
      designationId: 'des1',
      joiningDate: '2026-01-01',
      employmentType: 'full_time',
      status: 'active',
    };
    render(EmployeeForm, { props: { employee, departments, designations } });
    expect(screen.getByText('Update Employee')).toBeInTheDocument();
  });

  test('populates fields when editing existing employee', () => {
    const employee = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '123456',
      departmentId: 'dept1',
      designationId: 'des1',
      joiningDate: '2026-01-01',
      employmentType: 'part_time',
      status: 'inactive',
    };
    render(EmployeeForm, { props: { employee, departments, designations } });
    expect(screen.getByDisplayValue('John')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Doe')).toBeInTheDocument();
    expect(screen.getByDisplayValue('john@example.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('123456')).toBeInTheDocument();
  });

  test('renders cancel link', () => {
    render(EmployeeForm, { props: { departments, designations } });
    const cancelLink = screen.getByText('Cancel');
    expect(cancelLink).toBeInTheDocument();
    expect(cancelLink.closest('a')).toHaveAttribute('href', '/hr/employees');
  });
});

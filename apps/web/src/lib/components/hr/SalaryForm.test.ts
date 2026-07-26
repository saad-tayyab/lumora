import { render, screen } from '@testing-library/svelte';
import { userEvent } from '@testing-library/user-event';
import { expect, test, describe } from 'vitest';
import SalaryForm from './SalaryForm.svelte';

const mockEmployees = [
	{ id: 'emp-1', firstName: 'John', lastName: 'Doe' },
	{ id: 'emp-2', firstName: 'Jane', lastName: 'Smith' },
];

describe('SalaryForm', () => {
	test('renders employee select with options', () => {
		render(SalaryForm, { props: { employees: mockEmployees } });

		const select = screen.getByLabelText('Employee *');
		expect(select).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'Select employee' })).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'John Doe' })).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'Jane Smith' })).toBeInTheDocument();
	});

	test('renders effective date field', () => {
		render(SalaryForm, { props: { employees: mockEmployees } });
		expect(screen.getByLabelText('Effective Date *')).toBeInTheDocument();
	});

	test('renders basic salary field', () => {
		render(SalaryForm, { props: { employees: mockEmployees } });
		expect(screen.getByLabelText('Basic Salary *')).toBeInTheDocument();
	});

	test('renders allowances field', () => {
		render(SalaryForm, { props: { employees: mockEmployees } });
		expect(screen.getByLabelText('Allowances')).toBeInTheDocument();
	});

	test('renders deductions field', () => {
		render(SalaryForm, { props: { employees: mockEmployees } });
		expect(screen.getByLabelText('Deductions')).toBeInTheDocument();
	});

	test('renders net salary display', () => {
		render(SalaryForm, { props: { employees: mockEmployees } });
		expect(screen.getByText('Net Salary')).toBeInTheDocument();
	});

	test('renders submit button with Set Salary text', () => {
		render(SalaryForm, { props: { employees: mockEmployees } });
		expect(screen.getByRole('button', { name: 'Set Salary' })).toBeInTheDocument();
	});

	test('renders cancel link', () => {
		render(SalaryForm, { props: { employees: mockEmployees } });
		const cancelLink = screen.getByRole('link', { name: 'Cancel' });
		expect(cancelLink).toHaveAttribute('href', '/hr/salaries');
	});

	test('form has POST method', () => {
		const { container } = render(SalaryForm, { props: { employees: mockEmployees } });
		expect(container.querySelector('form')).toHaveAttribute('method', 'POST');
	});

	test('required fields are marked required', () => {
		render(SalaryForm, { props: { employees: mockEmployees } });
		expect(screen.getByLabelText('Employee *')).toBeRequired();
		expect(screen.getByLabelText('Effective Date *')).toBeRequired();
		expect(screen.getByLabelText('Basic Salary *')).toBeRequired();
	});

	test('net salary shows $0.00 by default', () => {
		render(SalaryForm, { props: { employees: mockEmployees } });
		expect(screen.getByText('$0.00')).toBeInTheDocument();
	});

	test('prefills fields from salary prop', () => {
		render(SalaryForm, {
			props: {
				salary: {
					employeeId: 'emp-1',
					basicSalary: '5000',
					allowances: '1000',
					deductions: '500',
					effectiveDate: '2026-01-01',
				},
				employees: mockEmployees,
			},
		});
		expect(screen.getByLabelText('Employee *')).toHaveValue('emp-1');
		expect(screen.getByLabelText('Basic Salary *')).toHaveValue(5000);
		expect(screen.getByLabelText('Allowances')).toHaveValue(1000);
		expect(screen.getByLabelText('Deductions')).toHaveValue(500);
		expect(screen.getByLabelText('Effective Date *')).toHaveValue('2026-01-01');
	});
});

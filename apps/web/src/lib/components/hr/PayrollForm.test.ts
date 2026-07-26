import { render, screen } from '@testing-library/svelte';
import { userEvent } from '@testing-library/user-event';
import { expect, test, describe } from 'vitest';
import PayrollForm from './PayrollForm.svelte';

const mockEmployees = [
	{ id: 'emp-1', firstName: 'John', lastName: 'Doe' },
	{ id: 'emp-2', firstName: 'Jane', lastName: 'Smith' },
];

describe('PayrollForm', () => {
	test('renders employee select with options', () => {
		render(PayrollForm, { props: { employees: mockEmployees } });

		const select = screen.getByLabelText('Employee *');
		expect(select).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'Select employee' })).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'John Doe' })).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'Jane Smith' })).toBeInTheDocument();
	});

	test('renders pay period start and end date fields', () => {
		render(PayrollForm, { props: { employees: mockEmployees } });
		expect(screen.getByLabelText('Period Start *')).toBeInTheDocument();
		expect(screen.getByLabelText('Period End *')).toBeInTheDocument();
	});

	test('renders salary fields', () => {
		render(PayrollForm, { props: { employees: mockEmployees } });
		expect(screen.getByLabelText('Basic Salary')).toBeInTheDocument();
		expect(screen.getByLabelText('Allowances')).toBeInTheDocument();
		expect(screen.getByLabelText('Deductions')).toBeInTheDocument();
	});

	test('renders net pay display', () => {
		render(PayrollForm, { props: { employees: mockEmployees } });
		expect(screen.getByText('Net Pay')).toBeInTheDocument();
	});

	test('renders notes textarea', () => {
		render(PayrollForm, { props: { employees: mockEmployees } });
		expect(screen.getByLabelText('Notes')).toBeInTheDocument();
	});

	test('renders submit button with Process Payroll text', () => {
		render(PayrollForm, { props: { employees: mockEmployees } });
		expect(screen.getByRole('button', { name: 'Process Payroll' })).toBeInTheDocument();
	});

	test('renders cancel link', () => {
		render(PayrollForm, { props: { employees: mockEmployees } });
		const cancelLink = screen.getByRole('link', { name: 'Cancel' });
		expect(cancelLink).toHaveAttribute('href', '/hr/payroll');
	});

	test('form has POST method', () => {
		const { container } = render(PayrollForm, { props: { employees: mockEmployees } });
		expect(container.querySelector('form')).toHaveAttribute('method', 'POST');
	});

	test('employee select and period dates are required', () => {
		render(PayrollForm, { props: { employees: mockEmployees } });
		expect(screen.getByLabelText('Employee *')).toBeRequired();
		expect(screen.getByLabelText('Period Start *')).toBeRequired();
		expect(screen.getByLabelText('Period End *')).toBeRequired();
	});

	test('net pay shows $0.00 by default', () => {
		render(PayrollForm, { props: { employees: mockEmployees } });
		expect(screen.getByText('$0.00')).toBeInTheDocument();
	});
});

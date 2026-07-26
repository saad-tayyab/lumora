import { render, screen } from '@testing-library/svelte';
import { userEvent } from '@testing-library/user-event';
import { expect, test, describe } from 'vitest';
import LeaveRequestForm from './LeaveRequestForm.svelte';

const mockEmployees = [
	{ id: 'emp-1', firstName: 'John', lastName: 'Doe' },
	{ id: 'emp-2', firstName: 'Jane', lastName: 'Smith' },
];

describe('LeaveRequestForm', () => {
	test('renders employee select with options', () => {
		render(LeaveRequestForm, { props: { employees: mockEmployees } });

		const select = screen.getByLabelText('Employee *');
		expect(select).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'Select employee' })).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'John Doe' })).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'Jane Smith' })).toBeInTheDocument();
	});

	test('renders leave type select with correct options', () => {
		render(LeaveRequestForm, { props: { employees: mockEmployees } });

		const select = screen.getByLabelText('Leave Type *');
		expect(select).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'Annual' })).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'Sick' })).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'Personal' })).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'Maternity' })).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'Paternity' })).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'Unpaid' })).toBeInTheDocument();
	});

	test('renders start date and end date fields', () => {
		render(LeaveRequestForm, { props: { employees: mockEmployees } });
		expect(screen.getByLabelText('Start Date *')).toBeInTheDocument();
		expect(screen.getByLabelText('End Date *')).toBeInTheDocument();
	});

	test('renders reason textarea', () => {
		render(LeaveRequestForm, { props: { employees: mockEmployees } });
		expect(screen.getByLabelText('Reason')).toBeInTheDocument();
	});

	test('renders submit button with Submit Request text', () => {
		render(LeaveRequestForm, { props: { employees: mockEmployees } });
		expect(screen.getByRole('button', { name: 'Submit Request' })).toBeInTheDocument();
	});

	test('renders cancel link', () => {
		render(LeaveRequestForm, { props: { employees: mockEmployees } });
		const cancelLink = screen.getByRole('link', { name: 'Cancel' });
		expect(cancelLink).toHaveAttribute('href', '/hr/leave-requests');
	});

	test('form has POST method', () => {
		const { container } = render(LeaveRequestForm, { props: { employees: mockEmployees } });
		expect(container.querySelector('form')).toHaveAttribute('method', 'POST');
	});

	test('employee select is required', () => {
		render(LeaveRequestForm, { props: { employees: mockEmployees } });
		expect(screen.getByLabelText('Employee *')).toBeRequired();
	});

	test('start date and end date are required', () => {
		render(LeaveRequestForm, { props: { employees: mockEmployees } });
		expect(screen.getByLabelText('Start Date *')).toBeRequired();
		expect(screen.getByLabelText('End Date *')).toBeRequired();
	});

	test('leave type defaults to annual', () => {
		render(LeaveRequestForm, { props: { employees: mockEmployees } });
		expect(screen.getByLabelText('Leave Type *')).toHaveValue('annual');
	});
});

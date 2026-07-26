import { render, screen } from '@testing-library/svelte';
import { userEvent } from '@testing-library/user-event';
import { expect, test, describe } from 'vitest';
import AttendanceForm from './AttendanceForm.svelte';

const mockEmployees = [
	{ id: 'emp-1', firstName: 'John', lastName: 'Doe' },
	{ id: 'emp-2', firstName: 'Jane', lastName: 'Smith' },
];

describe('AttendanceForm', () => {
	test('renders employee select with options', () => {
		render(AttendanceForm, { props: { employees: mockEmployees } });

		const select = screen.getByLabelText('Employee *');
		expect(select).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'Select employee' })).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'John Doe' })).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'Jane Smith' })).toBeInTheDocument();
	});

	test('renders date field', () => {
		render(AttendanceForm, { props: { employees: mockEmployees } });
		expect(screen.getByLabelText('Date *')).toBeInTheDocument();
	});

	test('renders status select with correct options', () => {
		render(AttendanceForm, { props: { employees: mockEmployees } });

		const select = screen.getByLabelText('Status *');
		expect(select).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'Present' })).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'Absent' })).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'Late' })).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'Half Day' })).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'On Leave' })).toBeInTheDocument();
	});

	test('renders check in and check out fields', () => {
		render(AttendanceForm, { props: { employees: mockEmployees } });
		expect(screen.getByLabelText('Check In')).toBeInTheDocument();
		expect(screen.getByLabelText('Check Out')).toBeInTheDocument();
	});

	test('renders notes textarea', () => {
		render(AttendanceForm, { props: { employees: mockEmployees } });
		expect(screen.getByLabelText('Notes')).toBeInTheDocument();
	});

	test('renders submit button with Record Attendance text', () => {
		render(AttendanceForm, { props: { employees: mockEmployees } });
		expect(screen.getByRole('button', { name: 'Record Attendance' })).toBeInTheDocument();
	});

	test('renders cancel link', () => {
		render(AttendanceForm, { props: { employees: mockEmployees } });
		const cancelLink = screen.getByRole('link', { name: 'Cancel' });
		expect(cancelLink).toHaveAttribute('href', '/hr/attendance');
	});

	test('form has POST method', () => {
		const { container } = render(AttendanceForm, { props: { employees: mockEmployees } });
		expect(container.querySelector('form')).toHaveAttribute('method', 'POST');
	});

	test('employee select is required', () => {
		render(AttendanceForm, { props: { employees: mockEmployees } });
		expect(screen.getByLabelText('Employee *')).toBeRequired();
	});

	test('date field is required', () => {
		render(AttendanceForm, { props: { employees: mockEmployees } });
		expect(screen.getByLabelText('Date *')).toBeRequired();
	});

	test('status defaults to present', () => {
		render(AttendanceForm, { props: { employees: mockEmployees } });
		expect(screen.getByLabelText('Status *')).toHaveValue('present');
	});
});

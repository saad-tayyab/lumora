import { render, screen } from '@testing-library/svelte';
import { userEvent } from '@testing-library/user-event';
import { expect, test, describe } from 'vitest';
import DesignationForm from './DesignationForm.svelte';

const mockDepartments = [
	{ id: 'dept-1', name: 'Engineering' },
	{ id: 'dept-2', name: 'Marketing' },
];

describe('DesignationForm', () => {
	test('renders name (title) field', () => {
		render(DesignationForm, { props: { departments: mockDepartments } });
		expect(screen.getByLabelText('Title *')).toBeInTheDocument();
	});

	test('renders code field', () => {
		render(DesignationForm, { props: { departments: mockDepartments } });
		expect(screen.getByLabelText('Code *')).toBeInTheDocument();
	});

	test('renders department select with options', () => {
		render(DesignationForm, { props: { departments: mockDepartments } });

		const select = screen.getByLabelText('Department *');
		expect(select).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'Select department' })).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'Engineering' })).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'Marketing' })).toBeInTheDocument();
	});

	test('renders level field', () => {
		render(DesignationForm, { props: { departments: mockDepartments } });
		expect(screen.getByLabelText('Level')).toBeInTheDocument();
	});

	test('renders submit button with Create Designation text', () => {
		render(DesignationForm, { props: { departments: mockDepartments } });
		expect(screen.getByRole('button', { name: 'Create Designation' })).toBeInTheDocument();
	});

	test('renders cancel link', () => {
		render(DesignationForm, { props: { departments: mockDepartments } });
		const cancelLink = screen.getByRole('link', { name: 'Cancel' });
		expect(cancelLink).toHaveAttribute('href', '/hr/designations');
	});

	test('form has POST method', () => {
		const { container } = render(DesignationForm, { props: { departments: mockDepartments } });
		expect(container.querySelector('form')).toHaveAttribute('method', 'POST');
	});

	test('required fields are marked required', () => {
		render(DesignationForm, { props: { departments: mockDepartments } });
		expect(screen.getByLabelText('Title *')).toBeRequired();
		expect(screen.getByLabelText('Code *')).toBeRequired();
		expect(screen.getByLabelText('Department *')).toBeRequired();
	});

	test('level field is a number input', () => {
		render(DesignationForm, { props: { departments: mockDepartments } });
		expect(screen.getByLabelText('Level')).toHaveAttribute('type', 'number');
	});

	test('level defaults to 1', () => {
		render(DesignationForm, { props: { departments: mockDepartments } });
		expect(screen.getByLabelText('Level')).toHaveValue(1);
	});

	test('prefills fields from designation prop', () => {
		render(DesignationForm, {
			props: {
				designation: { title: 'Senior Engineer', code: 'SE', departmentId: 'dept-1', level: 3 },
				departments: mockDepartments,
			},
		});
		expect(screen.getByLabelText('Title *')).toHaveValue('Senior Engineer');
		expect(screen.getByLabelText('Code *')).toHaveValue('SE');
		expect(screen.getByLabelText('Department *')).toHaveValue('dept-1');
		expect(screen.getByLabelText('Level')).toHaveValue(3);
	});
});

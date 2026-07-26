import { render, screen } from '@testing-library/svelte';
import { userEvent } from '@testing-library/user-event';
import { expect, test, describe } from 'vitest';
import DepartmentForm from './DepartmentForm.svelte';

describe('DepartmentForm', () => {
	test('renders name field', () => {
		render(DepartmentForm);
		expect(screen.getByLabelText('Name *')).toBeInTheDocument();
	});

	test('renders code field', () => {
		render(DepartmentForm);
		expect(screen.getByLabelText('Code *')).toBeInTheDocument();
	});

	test('renders description textarea', () => {
		render(DepartmentForm);
		expect(screen.getByLabelText('Description')).toBeInTheDocument();
	});

	test('renders manager ID field', () => {
		render(DepartmentForm);
		expect(screen.getByLabelText('Manager ID')).toBeInTheDocument();
	});

	test('renders active checkbox', () => {
		render(DepartmentForm);
		expect(screen.getByLabelText('Active')).toBeInTheDocument();
	});

	test('renders submit button with Create Department text', () => {
		render(DepartmentForm);
		expect(screen.getByRole('button', { name: 'Create Department' })).toBeInTheDocument();
	});

	test('renders cancel link', () => {
		render(DepartmentForm);
		const cancelLink = screen.getByRole('link', { name: 'Cancel' });
		expect(cancelLink).toHaveAttribute('href', '/hr/departments');
	});

	test('form has POST method', () => {
		const { container } = render(DepartmentForm);
		expect(container.querySelector('form')).toHaveAttribute('method', 'POST');
	});

	test('name and code are required', () => {
		render(DepartmentForm);
		expect(screen.getByLabelText('Name *')).toBeRequired();
		expect(screen.getByLabelText('Code *')).toBeRequired();
	});

	test('active checkbox is checked by default', () => {
		render(DepartmentForm);
		expect(screen.getByLabelText('Active')).toBeChecked();
	});

	test('code field has maxlength of 20', () => {
		render(DepartmentForm);
		expect(screen.getByLabelText('Code *')).toHaveAttribute('maxlength', '20');
	});

	test('prefills fields from department prop', () => {
		render(DepartmentForm, {
			props: {
				department: {
					name: 'Engineering',
					code: 'ENG',
					description: 'Software engineering team',
					managerId: 'user-1',
					isActive: false,
				},
			},
		});
		expect(screen.getByLabelText('Name *')).toHaveValue('Engineering');
		expect(screen.getByLabelText('Code *')).toHaveValue('ENG');
		expect(screen.getByLabelText('Description')).toHaveValue('Software engineering team');
		expect(screen.getByLabelText('Manager ID')).toHaveValue('user-1');
		expect(screen.getByLabelText('Active')).not.toBeChecked();
	});
});

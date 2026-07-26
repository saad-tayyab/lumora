import { render, screen } from '@testing-library/svelte';
import { userEvent } from '@testing-library/user-event';
import { expect, test, describe } from 'vitest';
import RoleForm from './RoleForm.svelte';

describe('RoleForm', () => {
	test('renders name field', () => {
		render(RoleForm);
		expect(screen.getByLabelText('Name *')).toBeInTheDocument();
	});

	test('renders description field', () => {
		render(RoleForm);
		expect(screen.getByLabelText('Description')).toBeInTheDocument();
	});

	test('renders submit button with Create Role text', () => {
		render(RoleForm);
		expect(screen.getByRole('button', { name: 'Create Role' })).toBeInTheDocument();
	});

	test('renders cancel link', () => {
		render(RoleForm);
		const cancelLink = screen.getByRole('link', { name: 'Cancel' });
		expect(cancelLink).toHaveAttribute('href', '/settings/roles');
	});

	test('form has POST method', () => {
		const { container } = render(RoleForm);
		expect(container.querySelector('form')).toHaveAttribute('method', 'POST');
	});

	test('name field is required', () => {
		render(RoleForm);
		expect(screen.getByLabelText('Name *')).toBeRequired();
	});

	test('name field has maxlength of 50', () => {
		render(RoleForm);
		expect(screen.getByLabelText('Name *')).toHaveAttribute('maxlength', '50');
	});

	test('description field has maxlength of 255', () => {
		render(RoleForm);
		expect(screen.getByLabelText('Description')).toHaveAttribute('maxlength', '255');
	});

	test('description field is a text input', () => {
		render(RoleForm);
		expect(screen.getByLabelText('Description')).toHaveAttribute('type', 'text');
	});

	test('prefills fields from role prop', () => {
		render(RoleForm, {
			props: {
				role: {
					name: 'Admin',
					description: 'Full system access',
				},
			},
		});
		expect(screen.getByLabelText('Name *')).toHaveValue('Admin');
		expect(screen.getByLabelText('Description')).toHaveValue('Full system access');
	});

	test('shows Update Role button in edit mode', () => {
		render(RoleForm, {
			props: {
				role: { name: 'Admin', description: 'Full access' },
			},
		});
		expect(screen.getByRole('button', { name: 'Update Role' })).toBeInTheDocument();
	});
});

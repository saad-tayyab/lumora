import { render, screen } from '@testing-library/svelte';
import { userEvent } from '@testing-library/user-event';
import { expect, test, describe } from 'vitest';
import UserForm from './UserForm.svelte';

describe('UserForm', () => {
	test('renders name field', () => {
		render(UserForm);
		expect(screen.getByLabelText('Name *')).toBeInTheDocument();
	});

	test('renders email field', () => {
		render(UserForm);
		expect(screen.getByLabelText('Email *')).toBeInTheDocument();
	});

	test('renders username field', () => {
		render(UserForm);
		expect(screen.getByLabelText('Username *')).toBeInTheDocument();
	});

	test('renders status select with correct options', () => {
		render(UserForm);

		expect(screen.getByRole('option', { name: 'Active' })).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'Suspended' })).toBeInTheDocument();
	});

	test('renders submit button with Create User text', () => {
		render(UserForm);
		expect(screen.getByRole('button', { name: 'Create User' })).toBeInTheDocument();
	});

	test('renders cancel link', () => {
		render(UserForm);
		const cancelLink = screen.getByRole('link', { name: 'Cancel' });
		expect(cancelLink).toHaveAttribute('href', '/settings/users');
	});

	test('form has POST method', () => {
		const { container } = render(UserForm);
		expect(container.querySelector('form')).toHaveAttribute('method', 'POST');
	});

	test('required fields are marked required', () => {
		render(UserForm);
		expect(screen.getByLabelText('Name *')).toBeRequired();
		expect(screen.getByLabelText('Email *')).toBeRequired();
		expect(screen.getByLabelText('Username *')).toBeRequired();
	});

	test('email input has email type', () => {
		render(UserForm);
		expect(screen.getByLabelText('Email *')).toHaveAttribute('type', 'email');
	});

	test('name field has maxlength of 100', () => {
		render(UserForm);
		expect(screen.getByLabelText('Name *')).toHaveAttribute('maxlength', '100');
	});

	test('username field has maxlength of 50', () => {
		render(UserForm);
		expect(screen.getByLabelText('Username *')).toHaveAttribute('maxlength', '50');
	});

	test('status defaults to active', () => {
		render(UserForm);
		expect(screen.getByLabelText('Status')).toHaveValue('active');
	});

	test('prefills fields from user prop', () => {
		render(UserForm, {
			props: {
				user: {
					name: 'John Doe',
					email: 'john@example.com',
					username: 'johndoe',
					status: 'suspended',
				},
			},
		});
		expect(screen.getByLabelText('Name *')).toHaveValue('John Doe');
		expect(screen.getByLabelText('Email *')).toHaveValue('john@example.com');
		expect(screen.getByLabelText('Username *')).toHaveValue('johndoe');
		expect(screen.getByLabelText('Status')).toHaveValue('suspended');
	});
});

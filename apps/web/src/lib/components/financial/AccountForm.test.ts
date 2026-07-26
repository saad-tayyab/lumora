import { render, screen } from '@testing-library/svelte';
import { userEvent } from '@testing-library/user-event';
import { expect, test, describe } from 'vitest';
import AccountForm from './AccountForm.svelte';

describe('AccountForm', () => {
	test('renders code field', () => {
		render(AccountForm);
		const code = screen.getByLabelText('Code *');
		expect(code).toBeInTheDocument();
		expect(code).toBeRequired();
	});

	test('renders name field', () => {
		render(AccountForm);
		const name = screen.getByLabelText('Name *');
		expect(name).toBeInTheDocument();
		expect(name).toBeRequired();
	});

	test('renders account type select with options', () => {
		render(AccountForm);
		const select = screen.getByLabelText('Type *');
		expect(select).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'Asset' })).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'Liability' })).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'Equity' })).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'Revenue' })).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'Expense' })).toBeInTheDocument();
	});

	test('renders description textarea', () => {
		render(AccountForm);
		expect(screen.getByLabelText('Description')).toBeInTheDocument();
	});

	test('renders active checkbox', () => {
		render(AccountForm);
		expect(screen.getByLabelText('Active')).toBeInTheDocument();
	});

	test('form has POST method', () => {
		const { container } = render(AccountForm);
		expect(container.querySelector('form')).toHaveAttribute('method', 'POST');
	});

	test('submit button shows Create Account for new account', () => {
		render(AccountForm);
		expect(screen.getByRole('button', { name: 'Create Account' })).toBeInTheDocument();
	});

	test('submit button shows Update Account in edit mode', () => {
		render(AccountForm, { props: { account: { code: '1000', name: 'Cash', type: 'asset' } as any } });
		expect(screen.getByRole('button', { name: 'Update Account' })).toBeInTheDocument();
	});

	test('cancel link points to accounts list', () => {
		render(AccountForm);
		expect(screen.getByRole('link', { name: 'Cancel' })).toHaveAttribute('href', '/financial/accounts');
	});

	test('prefills fields from account prop', () => {
		render(AccountForm, {
			props: { account: { code: '2000', name: 'Accounts Payable', type: 'liability' } as any },
		});
		expect(screen.getByLabelText('Code *')).toHaveValue('2000');
		expect(screen.getByLabelText('Name *')).toHaveValue('Accounts Payable');
		expect(screen.getByLabelText('Type *')).toHaveValue('liability');
	});

	test('displays error messages', () => {
		render(AccountForm, {
			props: { errors: { code: ['Code is required'], name: ['Name is required'] } },
		});
		expect(screen.getByText('Code is required')).toBeInTheDocument();
		expect(screen.getByText('Name is required')).toBeInTheDocument();
	});
});

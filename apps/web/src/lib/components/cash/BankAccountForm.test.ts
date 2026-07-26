import { render, screen } from '@testing-library/svelte';
import { userEvent } from '@testing-library/user-event';
import { expect, test, describe } from 'vitest';
import BankAccountForm from './BankAccountForm.svelte';

describe('BankAccountForm', () => {
	test('renders all bank account fields', () => {
		render(BankAccountForm);

		expect(screen.getByLabelText('Bank Name *')).toBeInTheDocument();
		expect(screen.getByLabelText('Account Name *')).toBeInTheDocument();
		expect(screen.getByLabelText('Account Number *')).toBeInTheDocument();
		expect(screen.getByLabelText('Routing Number')).toBeInTheDocument();
		expect(screen.getByLabelText('Account Type *')).toBeInTheDocument();
		expect(screen.getByLabelText('Currency')).toBeInTheDocument();
		expect(screen.getByLabelText('Current Balance')).toBeInTheDocument();
		expect(screen.getByLabelText('Available Balance')).toBeInTheDocument();
		expect(screen.getByLabelText('Set as default account')).toBeInTheDocument();
	});

	test('account type select has correct options', () => {
		render(BankAccountForm);

		expect(screen.getByRole('option', { name: 'Checking' })).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'Savings' })).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'Money Market' })).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'Credit Line' })).toBeInTheDocument();
	});

	test('currency select has correct options', () => {
		render(BankAccountForm);

		expect(screen.getByRole('option', { name: 'USD' })).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'EUR' })).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'GBP' })).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'PKR' })).toBeInTheDocument();
	});

	test('renders submit button with Create Account text', () => {
		render(BankAccountForm);
		expect(screen.getByRole('button', { name: 'Create Account' })).toBeInTheDocument();
	});

	test('renders cancel link', () => {
		render(BankAccountForm);
		const cancelLink = screen.getByRole('link', { name: 'Cancel' });
		expect(cancelLink).toHaveAttribute('href', '/cash/bank-accounts');
	});

	test('form has POST method', () => {
		const { container } = render(BankAccountForm);
		expect(container.querySelector('form')).toHaveAttribute('method', 'POST');
	});

	test('required fields are marked required', () => {
		render(BankAccountForm);
		expect(screen.getByLabelText('Bank Name *')).toBeRequired();
		expect(screen.getByLabelText('Account Name *')).toBeRequired();
		expect(screen.getByLabelText('Account Number *')).toBeRequired();
		expect(screen.getByLabelText('Account Type *')).toBeRequired();
	});

	test('account type defaults to checking', () => {
		render(BankAccountForm);
		expect(screen.getByLabelText('Account Type *')).toHaveValue('checking');
	});

	test('currency defaults to USD', () => {
		render(BankAccountForm);
		expect(screen.getByLabelText('Currency')).toHaveValue('USD');
	});

	test('default checkbox is unchecked by default', () => {
		render(BankAccountForm);
		expect(screen.getByLabelText('Set as default account')).not.toBeChecked();
	});

	test('displays error messages', () => {
		render(BankAccountForm, {
			props: { errors: { bankName: ['Bank name is required'], accountNumber: ['Invalid number'] } },
		});
		expect(screen.getByText('Bank name is required')).toBeInTheDocument();
		expect(screen.getByText('Invalid number')).toBeInTheDocument();
	});
});

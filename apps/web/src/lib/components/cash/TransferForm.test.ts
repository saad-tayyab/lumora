import { render, screen } from '@testing-library/svelte';
import { userEvent } from '@testing-library/user-event';
import { expect, test, describe } from 'vitest';
import TransferForm from './TransferForm.svelte';

const mockBankAccounts = [
	{ id: 'acc-1', name: 'Operating', bankName: 'Chase', currency: 'USD' },
	{ id: 'acc-2', name: 'Savings', bankName: 'Chase', currency: 'USD' },
];

describe('TransferForm', () => {
	test('renders source account select', () => {
		const { container } = render(TransferForm, { props: { bankAccounts: mockBankAccounts } });

		const select = screen.getByLabelText('Source Account *');
		expect(select).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'Select source account' })).toBeInTheDocument();
		const sourceOptions = container.querySelectorAll('#sourceAccountId option');
		expect(sourceOptions.length).toBe(3);
	});

	test('renders destination account select', () => {
		const { container } = render(TransferForm, { props: { bankAccounts: mockBankAccounts } });

		const select = screen.getByLabelText('Destination Account *');
		expect(select).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'Select destination account' })).toBeInTheDocument();
		const destOptions = container.querySelectorAll('#destinationAccountId option');
		expect(destOptions.length).toBe(3);
	});

	test('renders amount field', () => {
		render(TransferForm, { props: { bankAccounts: mockBankAccounts } });
		expect(screen.getByLabelText('Amount *')).toBeInTheDocument();
	});

	test('renders currency select', () => {
		render(TransferForm, { props: { bankAccounts: mockBankAccounts } });
		const select = screen.getByLabelText('Currency');
		expect(select).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'USD' })).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'EUR' })).toBeInTheDocument();
	});

	test('renders transfer type select', () => {
		render(TransferForm, { props: { bankAccounts: mockBankAccounts } });

		expect(screen.getByRole('option', { name: 'Internal' })).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'External' })).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'Wire' })).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'ACH' })).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'Check' })).toBeInTheDocument();
	});

	test('renders scheduled date field', () => {
		render(TransferForm, { props: { bankAccounts: mockBankAccounts } });
		expect(screen.getByLabelText('Scheduled Date')).toBeInTheDocument();
	});

	test('renders reference number field', () => {
		render(TransferForm, { props: { bankAccounts: mockBankAccounts } });
		expect(screen.getByLabelText('Reference Number')).toBeInTheDocument();
	});

	test('renders description textarea', () => {
		render(TransferForm, { props: { bankAccounts: mockBankAccounts } });
		expect(screen.getByLabelText('Description')).toBeInTheDocument();
	});

	test('renders submit button with Create Transfer text', () => {
		render(TransferForm, { props: { bankAccounts: mockBankAccounts } });
		expect(screen.getByRole('button', { name: 'Create Transfer' })).toBeInTheDocument();
	});

	test('renders cancel link', () => {
		render(TransferForm, { props: { bankAccounts: mockBankAccounts } });
		const cancelLink = screen.getByRole('link', { name: 'Cancel' });
		expect(cancelLink).toHaveAttribute('href', '/cash/transfers');
	});

	test('form has POST method', () => {
		const { container } = render(TransferForm, { props: { bankAccounts: mockBankAccounts } });
		expect(container.querySelector('form')).toHaveAttribute('method', 'POST');
	});

	test('required fields are marked required', () => {
		render(TransferForm, { props: { bankAccounts: mockBankAccounts } });
		expect(screen.getByLabelText('Source Account *')).toBeRequired();
		expect(screen.getByLabelText('Destination Account *')).toBeRequired();
		expect(screen.getByLabelText('Amount *')).toBeRequired();
	});

	test('transfer type defaults to internal', () => {
		render(TransferForm, { props: { bankAccounts: mockBankAccounts } });
		expect(screen.getByLabelText('Transfer Type *')).toHaveValue('internal');
	});

	test('displays error messages', () => {
		render(TransferForm, {
			props: {
				bankAccounts: mockBankAccounts,
				errors: { amount: ['Amount must be greater than 0'] },
			},
		});
		expect(screen.getByText('Amount must be greater than 0')).toBeInTheDocument();
	});
});

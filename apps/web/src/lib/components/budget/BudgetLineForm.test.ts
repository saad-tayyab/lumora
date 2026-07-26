import { render, screen } from '@testing-library/svelte';
import { userEvent } from '@testing-library/user-event';
import { expect, test, describe } from 'vitest';
import BudgetLineForm from './BudgetLineForm.svelte';

const mockAccounts = [
	{ id: 'acc-1', code: '6100', name: 'Office Supplies' },
	{ id: 'acc-2', code: '6200', name: 'Travel Expenses' },
];

describe('BudgetLineForm', () => {
	test('renders GL account select with options', () => {
		render(BudgetLineForm, { props: { accounts: mockAccounts } });

		const select = screen.getByLabelText('GL Account *');
		expect(select).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'Select account' })).toBeInTheDocument();
		expect(screen.getByRole('option', { name: '6100 - Office Supplies' })).toBeInTheDocument();
		expect(screen.getByRole('option', { name: '6200 - Travel Expenses' })).toBeInTheDocument();
	});

	test('renders budget amount field', () => {
		render(BudgetLineForm, { props: { accounts: mockAccounts } });
		expect(screen.getByLabelText('Budget Amount *')).toBeInTheDocument();
	});

	test('renders description textarea', () => {
		render(BudgetLineForm, { props: { accounts: mockAccounts } });
		expect(screen.getByLabelText('Description')).toBeInTheDocument();
	});

	test('renders submit button with Add Line text', () => {
		render(BudgetLineForm, { props: { accounts: mockAccounts } });
		expect(screen.getByRole('button', { name: 'Add Line' })).toBeInTheDocument();
	});

	test('renders cancel link', () => {
		render(BudgetLineForm, { props: { accounts: mockAccounts } });
		const cancelLink = screen.getByRole('link', { name: 'Cancel' });
		expect(cancelLink).toHaveAttribute('href', '/budgets');
	});

	test('form has POST method', () => {
		const { container } = render(BudgetLineForm, { props: { accounts: mockAccounts } });
		expect(container.querySelector('form')).toHaveAttribute('method', 'POST');
	});

	test('required fields are marked required', () => {
		render(BudgetLineForm, { props: { accounts: mockAccounts } });
		expect(screen.getByLabelText('GL Account *')).toBeRequired();
		expect(screen.getByLabelText('Budget Amount *')).toBeRequired();
	});

	test('prefills fields from line prop', () => {
		render(BudgetLineForm, {
			props: {
				line: { glAccountId: 'acc-1', description: 'Monthly supplies', budgetAmount: '5000' },
				accounts: mockAccounts,
			},
		});
		expect(screen.getByLabelText('GL Account *')).toHaveValue('acc-1');
		expect(screen.getByLabelText('Description')).toHaveValue('Monthly supplies');
		expect(screen.getByLabelText('Budget Amount *')).toHaveValue(5000);
	});

	test('shows Update Line button in edit mode', () => {
		render(BudgetLineForm, {
			props: {
				line: { glAccountId: 'acc-1', description: 'Test', budgetAmount: '1000' },
				accounts: mockAccounts,
			},
		});
		expect(screen.getByRole('button', { name: 'Update Line' })).toBeInTheDocument();
	});
});

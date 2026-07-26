import { render, screen } from '@testing-library/svelte';
import { userEvent } from '@testing-library/user-event';
import { expect, test, describe } from 'vitest';
import BudgetHeaderForm from './BudgetHeaderForm.svelte';

describe('BudgetHeaderForm', () => {
	test('renders name field', () => {
		render(BudgetHeaderForm);
		expect(screen.getByLabelText('Name *')).toBeInTheDocument();
	});

	test('renders description textarea', () => {
		render(BudgetHeaderForm);
		expect(screen.getByLabelText('Description')).toBeInTheDocument();
	});

	test('renders period start date', () => {
		render(BudgetHeaderForm);
		expect(screen.getByLabelText('Period Start *')).toBeInTheDocument();
	});

	test('renders period end date', () => {
		render(BudgetHeaderForm);
		expect(screen.getByLabelText('Period End *')).toBeInTheDocument();
	});

	test('renders total amount field', () => {
		render(BudgetHeaderForm);
		expect(screen.getByLabelText('Total Amount')).toBeInTheDocument();
	});

	test('renders submit button with Create Budget text', () => {
		render(BudgetHeaderForm);
		expect(screen.getByRole('button', { name: 'Create Budget' })).toBeInTheDocument();
	});

	test('renders cancel link', () => {
		render(BudgetHeaderForm);
		const cancelLink = screen.getByRole('link', { name: 'Cancel' });
		expect(cancelLink).toHaveAttribute('href', '/budgets');
	});

	test('form has POST method', () => {
		const { container } = render(BudgetHeaderForm);
		expect(container.querySelector('form')).toHaveAttribute('method', 'POST');
	});

	test('required fields are marked required', () => {
		render(BudgetHeaderForm);
		expect(screen.getByLabelText('Name *')).toBeRequired();
		expect(screen.getByLabelText('Period Start *')).toBeRequired();
		expect(screen.getByLabelText('Period End *')).toBeRequired();
	});

	test('name field has maxlength of 100', () => {
		render(BudgetHeaderForm);
		expect(screen.getByLabelText('Name *')).toHaveAttribute('maxlength', '100');
	});

	test('prefills fields from budget prop', () => {
		render(BudgetHeaderForm, {
			props: {
				budget: {
					name: 'Q3 2026 Budget',
					description: 'Third quarter budget',
					periodStart: '2026-07-01',
					periodEnd: '2026-09-30',
					totalAmount: '100000',
				},
			},
		});
		expect(screen.getByLabelText('Name *')).toHaveValue('Q3 2026 Budget');
		expect(screen.getByLabelText('Description')).toHaveValue('Third quarter budget');
		expect(screen.getByLabelText('Period Start *')).toHaveValue('2026-07-01');
		expect(screen.getByLabelText('Period End *')).toHaveValue('2026-09-30');
		expect(screen.getByLabelText('Total Amount')).toHaveValue(100000);
	});
});

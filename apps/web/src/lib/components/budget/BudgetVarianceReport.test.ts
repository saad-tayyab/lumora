import { render, screen } from '@testing-library/svelte';
import { expect, test, describe } from 'vitest';
import BudgetVarianceReport from './BudgetVarianceReport.svelte';
import type { BudgetVariance } from '$lib/types';

const mockVariances: BudgetVariance[] = [
	{
		budgetLineId: 'bl-1',
		glAccountId: 'acc-1',
		budgetAmount: '10000',
		consumedAmount: '8500',
		varianceAmount: '1500',
	},
	{
		budgetLineId: 'bl-2',
		glAccountId: 'acc-2',
		budgetAmount: '5000',
		consumedAmount: '6000',
		varianceAmount: '-1000',
	},
];

describe('BudgetVarianceReport', () => {
	test('renders variance cards for each item', () => {
		render(BudgetVarianceReport, { props: { variances: mockVariances } });

		expect(screen.getByText('Account: acc-1')).toBeInTheDocument();
		expect(screen.getByText('Account: acc-2')).toBeInTheDocument();
	});

	test('displays consumed percentage', () => {
		render(BudgetVarianceReport, { props: { variances: mockVariances } });

		expect(screen.getByText('85.0% consumed')).toBeInTheDocument();
		expect(screen.getByText('120.0% consumed')).toBeInTheDocument();
	});

	test('displays budget and consumed amounts', () => {
		render(BudgetVarianceReport, { props: { variances: mockVariances } });

		const budgetLabels = screen.getAllByText(/Budget:/);
		expect(budgetLabels.length).toBe(2);

		const consumedLabels = screen.getAllByText(/Consumed:/);
		expect(consumedLabels.length).toBe(2);
	});

	test('displays remaining amount', () => {
		render(BudgetVarianceReport, { props: { variances: mockVariances } });

		const remainingLabels = screen.getAllByText(/Remaining:/);
		expect(remainingLabels.length).toBe(2);
	});

	test('shows empty state when no variances', () => {
		render(BudgetVarianceReport, { props: { variances: [] } });
		expect(screen.getByText('No budget variance data')).toBeInTheDocument();
	});
});

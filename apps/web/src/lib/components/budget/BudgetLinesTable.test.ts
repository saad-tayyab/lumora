import { render, screen } from '@testing-library/svelte';
import { expect, test, describe } from 'vitest';
import BudgetLinesTable from './BudgetLinesTable.svelte';
import type { BudgetLine } from '$lib/types';

const mockLines: BudgetLine[] = [
	{
		id: 'line-1',
		budgetHeaderId: 'bh-1',
		glAccountId: 'acc-1',
		description: 'Office Supplies',
		budgetAmount: '5000',
		consumedAmount: '3000',
		varianceAmount: '2000',
		isActive: true,
		tenantId: 't-1',
		createdAt: '2026-01-01T00:00:00Z',
		updatedAt: '2026-01-01T00:00:00Z',
	},
	{
		id: 'line-2',
		budgetHeaderId: 'bh-1',
		glAccountId: 'acc-2',
		description: '',
		budgetAmount: '10000',
		consumedAmount: '12000',
		varianceAmount: '-2000',
		isActive: true,
		tenantId: 't-1',
		createdAt: '2026-01-01T00:00:00Z',
		updatedAt: '2026-01-01T00:00:00Z',
	},
];

describe('BudgetLinesTable', () => {
	test('renders table headers', () => {
		render(BudgetLinesTable, { props: { lines: mockLines } });

		expect(screen.getByText('Account')).toBeInTheDocument();
		expect(screen.getByText('Description')).toBeInTheDocument();
		expect(screen.getByText('Budget')).toBeInTheDocument();
		expect(screen.getByText('Consumed')).toBeInTheDocument();
		expect(screen.getByText('Variance')).toBeInTheDocument();
	});

	test('renders line items', () => {
		render(BudgetLinesTable, { props: { lines: mockLines } });

		expect(screen.getByText('acc-1')).toBeInTheDocument();
		expect(screen.getByText('Office Supplies')).toBeInTheDocument();
		expect(screen.getByText('acc-2')).toBeInTheDocument();
	});

	test('shows dash for empty description', () => {
		render(BudgetLinesTable, { props: { lines: mockLines } });

		expect(screen.getByText('—')).toBeInTheDocument();
	});

	test('shows empty state when no lines', () => {
		render(BudgetLinesTable, { props: { lines: [] } });
		expect(screen.getByText('No budget lines')).toBeInTheDocument();
	});
});

import { render, screen } from '@testing-library/svelte';
import { userEvent } from '@testing-library/user-event';
import { expect, test, describe, vi } from 'vitest';
import QuotationLineItems from './QuotationLineItems.svelte';

const defaultLineItems = [
	{ itemId: 'item-1', description: 'Widget', quantity: '2', unitPrice: '25.00', discount: '0' },
];

describe('QuotationLineItems', () => {
	test('renders line item inputs', () => {
		render(QuotationLineItems, {
			props: { lineItems: defaultLineItems, onChange: vi.fn() },
		});

		expect(screen.getByText('Item *')).toBeInTheDocument();
		expect(screen.getByText('Description')).toBeInTheDocument();
		expect(screen.getByText('Qty *')).toBeInTheDocument();
		expect(screen.getByText('Unit Price *')).toBeInTheDocument();
		expect(screen.getByText('Discount')).toBeInTheDocument();
	});

	test('renders Add Line button', () => {
		render(QuotationLineItems, {
			props: { lineItems: defaultLineItems, onChange: vi.fn() },
		});
		expect(screen.getByRole('button', { name: '+ Add Line' })).toBeInTheDocument();
	});

	test('calls onChange when adding a line', async () => {
		const user = userEvent.setup();
		const onChange = vi.fn();
		render(QuotationLineItems, {
			props: { lineItems: defaultLineItems, onChange },
		});

		await user.click(screen.getByRole('button', { name: '+ Add Line' }));
		expect(onChange).toHaveBeenCalledTimes(1);
		expect(onChange).toHaveBeenCalledWith(
			expect.arrayContaining([
				expect.objectContaining({ itemId: 'item-1' }),
				expect.objectContaining({ itemId: '' }),
			]),
		);
	});

	test('shows remove button when multiple lines', () => {
		const lines = [
			{ itemId: 'item-1', description: 'A', quantity: '1', unitPrice: '10', discount: '0' },
			{ itemId: 'item-2', description: 'B', quantity: '2', unitPrice: '20', discount: '0' },
		];
		render(QuotationLineItems, {
			props: { lineItems: lines, onChange: vi.fn() },
		});

		const removeButtons = screen.getAllByText('×');
		expect(removeButtons.length).toBe(2);
	});

	test('calls onChange when removing a line', async () => {
		const user = userEvent.setup();
		const onChange = vi.fn();
		const lines = [
			{ itemId: 'item-1', description: 'A', quantity: '1', unitPrice: '10', discount: '0' },
			{ itemId: 'item-2', description: 'B', quantity: '2', unitPrice: '20', discount: '0' },
		];
		render(QuotationLineItems, {
			props: { lineItems: lines, onChange },
		});

		const removeButtons = screen.getAllByText('×');
		await user.click(removeButtons[0]);
		expect(onChange).toHaveBeenCalledTimes(1);
		expect(onChange).toHaveBeenCalledWith([
			expect.objectContaining({ itemId: 'item-2' }),
		]);
	});

	test('does not show remove button with single line', () => {
		render(QuotationLineItems, {
			props: { lineItems: defaultLineItems, onChange: vi.fn() },
		});

		expect(screen.queryByText('×')).not.toBeInTheDocument();
	});

	test('populates input values from lineItems prop', () => {
		const { container } = render(QuotationLineItems, {
			props: { lineItems: defaultLineItems, onChange: vi.fn() },
		});

		const textInputs = container.querySelectorAll('input[type="text"]');
		expect(textInputs[0]).toHaveValue('item-1');

		const numberInputs = container.querySelectorAll('input[type="number"]');
		expect(numberInputs.length).toBeGreaterThan(0);
	});
});

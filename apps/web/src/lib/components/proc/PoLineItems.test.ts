import { render, screen } from '@testing-library/svelte';
import { userEvent } from '@testing-library/user-event';
import { expect, test, describe, vi } from 'vitest';
import PoLineItems from './PoLineItems.svelte';

const defaultLineItems = [
	{ itemId: '', description: '', quantity: '1', unitPrice: '0' },
];

describe('PoLineItems', () => {
	test('renders line item inputs', () => {
		render(PoLineItems, { props: { lineItems: defaultLineItems, onChange: vi.fn() } });

		expect(screen.getByPlaceholderText('Item ID')).toBeInTheDocument();
		expect(screen.getByPlaceholderText('Description')).toBeInTheDocument();
	});

	test('renders add line button', () => {
		render(PoLineItems, { props: { lineItems: defaultLineItems, onChange: vi.fn() } });
		expect(screen.getByRole('button', { name: '+ Add Line' })).toBeInTheDocument();
	});

	test('add button calls onChange with new line item', async () => {
		const user = userEvent.setup();
		const onChange = vi.fn();
		render(PoLineItems, { props: { lineItems: defaultLineItems, onChange } });

		await user.click(screen.getByRole('button', { name: '+ Add Line' }));

		expect(onChange).toHaveBeenCalledWith([
			{ itemId: '', description: '', quantity: '1', unitPrice: '0' },
			{ itemId: '', description: '', quantity: '1', unitPrice: '0' },
		]);
	});

	test('remove button calls onChange with item removed', async () => {
		const user = userEvent.setup();
		const onChange = vi.fn();
		const twoItems = [
			{ itemId: 'i1', description: 'First', quantity: '1', unitPrice: '10' },
			{ itemId: 'i2', description: 'Second', quantity: '2', unitPrice: '20' },
		];
		render(PoLineItems, { props: { lineItems: twoItems, onChange } });

		const removeButtons = screen.getAllByText('×');
		await user.click(removeButtons[0]);

		expect(onChange).toHaveBeenCalledWith([
			{ itemId: 'i2', description: 'Second', quantity: '2', unitPrice: '20' },
		]);
	});

	test('does not show remove button when only one line item', () => {
		render(PoLineItems, { props: { lineItems: defaultLineItems, onChange: vi.fn() } });
		expect(screen.queryByText('×')).not.toBeInTheDocument();
	});

	test('shows remove button when more than one line item', () => {
		const twoItems = [
			{ itemId: 'i1', description: 'First', quantity: '1', unitPrice: '10' },
			{ itemId: 'i2', description: 'Second', quantity: '2', unitPrice: '20' },
		];
		render(PoLineItems, { props: { lineItems: twoItems, onChange: vi.fn() } });
		expect(screen.getAllByText('×')).toHaveLength(2);
	});

	test('renders line item labels on first row', () => {
		render(PoLineItems, { props: { lineItems: defaultLineItems, onChange: vi.fn() } });
		expect(screen.getByText('Item ID *')).toBeInTheDocument();
		expect(screen.getByText('Description')).toBeInTheDocument();
		expect(screen.getByText('Quantity *')).toBeInTheDocument();
		expect(screen.getByText('Unit Price *')).toBeInTheDocument();
	});
});

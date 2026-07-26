import { render, screen, fireEvent } from '@testing-library/svelte';
import { expect, test, describe, vi } from 'vitest';
import InvoiceLineItems from './InvoiceLineItems.svelte';

const emptyItem = {
  id: '',
  invoiceId: '',
  description: '',
  quantity: '1',
  unitPrice: '0',
  amount: '0',
  taxRate: null,
  taxAmount: null,
  sortOrder: 0,
  createdAt: '',
  updatedAt: '',
};

describe('InvoiceLineItems', () => {
  test('renders empty state with one default line item', () => {
    render(InvoiceLineItems, {
      props: { lineItems: [emptyItem], onChange: vi.fn() },
    });
    expect(screen.getByPlaceholderText('Item description')).toBeInTheDocument();
  });

  test('renders existing line items', () => {
    const items = [
      { ...emptyItem, description: 'Widget', quantity: '2', unitPrice: '25.00', amount: '50.00' },
    ];
    render(InvoiceLineItems, { props: { lineItems: items, onChange: vi.fn() } });
    expect(screen.getByDisplayValue('Widget')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2')).toBeInTheDocument();
  });

  test('calls onChange with new item when Add Line is clicked', async () => {
    const onChange = vi.fn();
    render(InvoiceLineItems, {
      props: { lineItems: [emptyItem], onChange },
    });

    const addBtn = screen.getByText('+ Add Line');
    await fireEvent.click(addBtn);

    expect(onChange).toHaveBeenCalledTimes(1);
    const newItems = onChange.mock.calls[0][0];
    expect(newItems).toHaveLength(2);
    expect(newItems[1].description).toBe('');
    expect(newItems[1].quantity).toBe('1');
  });

  test('calls onChange without removed item when remove is clicked', async () => {
    const onChange = vi.fn();
    const items = [
      { ...emptyItem, description: 'Item A', sortOrder: 0 },
      { ...emptyItem, description: 'Item B', sortOrder: 1 },
    ];
    render(InvoiceLineItems, { props: { lineItems: items, onChange } });

    const removeBtn = screen.getAllByLabelText('Remove line')[0];
    await fireEvent.click(removeBtn);

    expect(onChange).toHaveBeenCalledTimes(1);
    const remaining = onChange.mock.calls[0][0];
    expect(remaining).toHaveLength(1);
    expect(remaining[0].description).toBe('Item B');
  });

  test('does not show remove button when only one line item', () => {
    render(InvoiceLineItems, {
      props: { lineItems: [emptyItem], onChange: vi.fn() },
    });
    expect(screen.queryByLabelText('Remove line')).not.toBeInTheDocument();
  });

  test('calculates amount correctly when quantity and unitPrice change', async () => {
    const onChange = vi.fn();
    const items = [{ ...emptyItem, quantity: '3', unitPrice: '10.00', amount: '30.00' }];
    render(InvoiceLineItems, { props: { lineItems: items, onChange } });

    const qtyInput = screen.getByDisplayValue('3');
    await fireEvent.input(qtyInput, { target: { value: '5' } });

    expect(onChange).toHaveBeenCalled();
    const updated = onChange.mock.calls[0][0][0];
    expect(updated.amount).toBe('50.00');
  });
});

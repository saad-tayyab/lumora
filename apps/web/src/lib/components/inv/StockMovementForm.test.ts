import { render, screen, within } from '@testing-library/svelte';
import { userEvent } from '@testing-library/user-event';
import { expect, test, describe } from 'vitest';
import StockMovementForm from './StockMovementForm.svelte';

const mockWarehouses = [
	{ id: 'wh1', name: 'Main Warehouse' },
	{ id: 'wh2', name: 'Backup Warehouse' },
];

const mockItems = [
	{ id: 'item1', name: 'Widget', sku: 'W-001' },
	{ id: 'item2', name: 'Gadget', sku: 'G-001' },
];

describe('StockMovementForm', () => {
	test('renders item select with all items', () => {
		render(StockMovementForm, { props: { warehouses: mockWarehouses, items: mockItems } });

		const select = screen.getByLabelText('Item *');
		expect(select).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'Select item' })).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'W-001 - Widget' })).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'G-001 - Gadget' })).toBeInTheDocument();
	});

	test('renders from warehouse select', () => {
		render(StockMovementForm, { props: { warehouses: mockWarehouses, items: mockItems } });

		const select = screen.getByLabelText('From Warehouse');
		expect(select).toBeInTheDocument();
		expect(within(select).getByRole('option', { name: 'Main Warehouse' })).toBeInTheDocument();
		expect(within(select).getByRole('option', { name: 'Backup Warehouse' })).toBeInTheDocument();
	});

	test('renders to warehouse select', () => {
		render(StockMovementForm, { props: { warehouses: mockWarehouses, items: mockItems } });

		const select = screen.getByLabelText('To Warehouse');
		expect(select).toBeInTheDocument();
		expect(within(select).getByRole('option', { name: 'Main Warehouse' })).toBeInTheDocument();
		expect(within(select).getByRole('option', { name: 'Backup Warehouse' })).toBeInTheDocument();
	});

	test('renders quantity field', () => {
		render(StockMovementForm, { props: { warehouses: mockWarehouses, items: mockItems } });
		const quantity = screen.getByLabelText('Quantity *');
		expect(quantity).toBeInTheDocument();
		expect(quantity).toHaveAttribute('type', 'number');
		expect(quantity).toBeRequired();
	});

	test('renders movement type select with options', () => {
		render(StockMovementForm, { props: { warehouses: mockWarehouses, items: mockItems } });
		const select = screen.getByLabelText('Type *');
		expect(select).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'Transfer' })).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'Receipt' })).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'Issue' })).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'Adjustment' })).toBeInTheDocument();
	});

	test('renders reference number and notes fields', () => {
		render(StockMovementForm, { props: { warehouses: mockWarehouses, items: mockItems } });
		expect(screen.getByLabelText('Reference #')).toBeInTheDocument();
		expect(screen.getByLabelText('Notes')).toBeInTheDocument();
	});

	test('form has POST method', () => {
		const { container } = render(StockMovementForm, { props: { warehouses: mockWarehouses, items: mockItems } });
		expect(container.querySelector('form')).toHaveAttribute('method', 'POST');
	});

	test('submit button shows Record Movement', () => {
		render(StockMovementForm, { props: { warehouses: mockWarehouses, items: mockItems } });
		expect(screen.getByRole('button', { name: 'Record Movement' })).toBeInTheDocument();
	});

	test('cancel link points to stock movements list', () => {
		render(StockMovementForm, { props: { warehouses: mockWarehouses, items: mockItems } });
		expect(screen.getByRole('link', { name: 'Cancel' })).toHaveAttribute('href', '/inv/stock-movements');
	});
});

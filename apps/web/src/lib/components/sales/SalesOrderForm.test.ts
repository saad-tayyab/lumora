import { render, screen } from '@testing-library/svelte';
import { userEvent } from '@testing-library/user-event';
import { expect, test, describe } from 'vitest';
import SalesOrderForm from './SalesOrderForm.svelte';

const mockCustomers = [
	{ id: 'cust-1', name: 'Acme Corp' },
	{ id: 'cust-2', name: 'Globex Inc' },
];

describe('SalesOrderForm', () => {
	test('renders customer select', () => {
		render(SalesOrderForm, { props: { customers: mockCustomers } });
		const select = screen.getByLabelText('Customer *');
		expect(select).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'Select customer' })).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'Acme Corp' })).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'Globex Inc' })).toBeInTheDocument();
	});

	test('renders expected delivery date field', () => {
		render(SalesOrderForm, { props: { customers: mockCustomers } });
		expect(screen.getByLabelText('Expected Delivery')).toBeInTheDocument();
	});

	test('renders line items section with add button', () => {
		render(SalesOrderForm, { props: { customers: mockCustomers } });
		expect(screen.getByText('Line Items')).toBeInTheDocument();
		expect(screen.getByRole('button', { name: '+ Add Line' })).toBeInTheDocument();
	});

	test('renders notes textarea', () => {
		render(SalesOrderForm, { props: { customers: mockCustomers } });
		expect(screen.getByLabelText('Notes')).toBeInTheDocument();
	});

	test('renders submit button with Create Sales Order text', () => {
		render(SalesOrderForm, { props: { customers: mockCustomers } });
		expect(screen.getByRole('button', { name: 'Create Sales Order' })).toBeInTheDocument();
	});

	test('renders cancel link', () => {
		render(SalesOrderForm, { props: { customers: mockCustomers } });
		const cancelLink = screen.getByRole('link', { name: 'Cancel' });
		expect(cancelLink).toHaveAttribute('href', '/sales/orders');
	});

	test('form has POST method', () => {
		const { container } = render(SalesOrderForm, { props: { customers: mockCustomers } });
		expect(container.querySelector('form')).toHaveAttribute('method', 'POST');
	});

	test('adds a new line item when clicking Add Line', async () => {
		const user = userEvent.setup();
		render(SalesOrderForm, { props: { customers: mockCustomers } });

		const addBtn = screen.getByRole('button', { name: '+ Add Line' });
		await user.click(addBtn);

		const itemInputs = screen.getAllByRole('textbox');
		expect(itemInputs.length).toBeGreaterThan(1);
	});

	test('customer select is required', () => {
		render(SalesOrderForm, { props: { customers: mockCustomers } });
		expect(screen.getByLabelText('Customer *')).toBeRequired();
	});

	test('prefills fields from salesOrder prop', () => {
		render(SalesOrderForm, {
			props: {
				customers: mockCustomers,
				salesOrder: {
					customerId: 'cust-1',
					expectedDeliveryDate: '2026-08-15',
					notes: 'Rush order',
				},
			},
		});
		expect(screen.getByLabelText('Customer *')).toHaveValue('cust-1');
		expect(screen.getByLabelText('Expected Delivery')).toHaveValue('2026-08-15');
		expect(screen.getByLabelText('Notes')).toHaveValue('Rush order');
	});
});

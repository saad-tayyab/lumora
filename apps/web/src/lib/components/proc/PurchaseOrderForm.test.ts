import { render, screen } from '@testing-library/svelte';
import { userEvent } from '@testing-library/user-event';
import { expect, test, describe } from 'vitest';
import PurchaseOrderForm from './PurchaseOrderForm.svelte';

const mockVendors = [
	{ id: 'v1', name: 'Acme Supplies' },
	{ id: 'v2', name: 'Global Parts' },
];

describe('PurchaseOrderForm', () => {
	test('renders vendor select with all vendors', () => {
		render(PurchaseOrderForm, { props: { vendors: mockVendors } });

		const select = screen.getByLabelText('Vendor *');
		expect(select).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'Select vendor' })).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'Acme Supplies' })).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'Global Parts' })).toBeInTheDocument();
	});

	test('vendor select is required', () => {
		render(PurchaseOrderForm, { props: { vendors: mockVendors } });
		expect(screen.getByLabelText('Vendor *')).toBeRequired();
	});

	test('renders expected delivery date field', () => {
		render(PurchaseOrderForm, { props: { vendors: mockVendors } });
		const date = screen.getByLabelText('Expected Delivery');
		expect(date).toBeInTheDocument();
		expect(date).toHaveAttribute('type', 'date');
	});

	test('renders line items section with add button', () => {
		render(PurchaseOrderForm, { props: { vendors: mockVendors } });
		expect(screen.getByText('Line Items')).toBeInTheDocument();
		expect(screen.getByRole('button', { name: '+ Add Line' })).toBeInTheDocument();
	});

	test('renders subtotal display', () => {
		render(PurchaseOrderForm, { props: { vendors: mockVendors } });
		expect(screen.getByText('Subtotal: $0.00')).toBeInTheDocument();
	});

	test('renders notes textarea', () => {
		render(PurchaseOrderForm, { props: { vendors: mockVendors } });
		expect(screen.getByLabelText('Notes')).toBeInTheDocument();
	});

	test('form has POST method', () => {
		const { container } = render(PurchaseOrderForm, { props: { vendors: mockVendors } });
		expect(container.querySelector('form')).toHaveAttribute('method', 'POST');
	});

	test('submit button shows Create Purchase Order', () => {
		render(PurchaseOrderForm, { props: { vendors: mockVendors } });
		expect(screen.getByRole('button', { name: 'Create Purchase Order' })).toBeInTheDocument();
	});

	test('cancel link points to purchase orders list', () => {
		render(PurchaseOrderForm, { props: { vendors: mockVendors } });
		expect(screen.getByRole('link', { name: 'Cancel' })).toHaveAttribute('href', '/proc/purchase-orders');
	});

	test('displays error messages', () => {
		render(PurchaseOrderForm, {
			props: { vendors: mockVendors, errors: { vendorId: ['Vendor is required'] } },
		});
		expect(screen.getByText('Vendor is required')).toBeInTheDocument();
	});
});

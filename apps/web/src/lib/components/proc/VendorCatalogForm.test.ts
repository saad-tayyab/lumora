import { render, screen } from '@testing-library/svelte';
import { userEvent } from '@testing-library/user-event';
import { expect, test, describe } from 'vitest';
import VendorCatalogForm from './VendorCatalogForm.svelte';

describe('VendorCatalogForm', () => {
	test('renders vendor ID field', () => {
		render(VendorCatalogForm);
		const vendorId = screen.getByLabelText('Vendor ID *');
		expect(vendorId).toBeInTheDocument();
		expect(vendorId).toBeRequired();
	});

	test('renders item ID field', () => {
		render(VendorCatalogForm);
		const itemId = screen.getByLabelText('Item ID *');
		expect(itemId).toBeInTheDocument();
		expect(itemId).toBeRequired();
	});

	test('renders vendor part number field', () => {
		render(VendorCatalogForm);
		expect(screen.getByLabelText('Vendor Part #')).toBeInTheDocument();
	});

	test('renders unit price field', () => {
		render(VendorCatalogForm);
		const unitPrice = screen.getByLabelText('Unit Price *');
		expect(unitPrice).toBeInTheDocument();
		expect(unitPrice).toHaveAttribute('type', 'number');
		expect(unitPrice).toBeRequired();
	});

	test('renders lead time days field', () => {
		render(VendorCatalogForm);
		const leadTime = screen.getByLabelText('Lead Time (days)');
		expect(leadTime).toBeInTheDocument();
		expect(leadTime).toHaveAttribute('type', 'number');
	});

	test('renders minimum order qty field', () => {
		render(VendorCatalogForm);
		const minQty = screen.getByLabelText('Min Order Qty');
		expect(minQty).toBeInTheDocument();
		expect(minQty).toHaveAttribute('type', 'number');
	});

	test('form has POST method', () => {
		const { container } = render(VendorCatalogForm);
		expect(container.querySelector('form')).toHaveAttribute('method', 'POST');
	});

	test('submit button shows Create Catalog Item for new item', () => {
		render(VendorCatalogForm);
		expect(screen.getByRole('button', { name: 'Create Catalog Item' })).toBeInTheDocument();
	});

	test('submit button shows Update Catalog Item in edit mode', () => {
		render(VendorCatalogForm, {
			props: {
				catalogItem: { vendorId: 'v1', itemId: 'i1', vendorPartNumber: 'VP-001', unitPrice: '10', leadTimeDays: '7', minimumOrderQty: '5' },
			},
		});
		expect(screen.getByRole('button', { name: 'Update Catalog Item' })).toBeInTheDocument();
	});

	test('cancel link points to vendor catalog list', () => {
		render(VendorCatalogForm);
		expect(screen.getByRole('link', { name: 'Cancel' })).toHaveAttribute('href', '/proc/vendor-catalog');
	});

	test('prefills fields from catalogItem prop', () => {
		render(VendorCatalogForm, {
			props: {
				catalogItem: { vendorId: 'v1', itemId: 'i1', vendorPartNumber: 'VP-001', unitPrice: '25.50', leadTimeDays: '14', minimumOrderQty: '10' },
			},
		});
		expect(screen.getByLabelText('Vendor ID *')).toHaveValue('v1');
		expect(screen.getByLabelText('Item ID *')).toHaveValue('i1');
		expect(screen.getByLabelText('Vendor Part #')).toHaveValue('VP-001');
		expect(screen.getByLabelText('Unit Price *')).toHaveValue(25.5);
		expect(screen.getByLabelText('Lead Time (days)')).toHaveValue(14);
		expect(screen.getByLabelText('Min Order Qty')).toHaveValue(10);
	});

	test('displays error messages', () => {
		render(VendorCatalogForm, {
			props: { errors: { vendorId: ['Vendor is required'], unitPrice: ['Price is required'] } },
		});
		expect(screen.getByText('Vendor is required')).toBeInTheDocument();
		expect(screen.getByText('Price is required')).toBeInTheDocument();
	});
});

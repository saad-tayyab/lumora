import { render, screen } from '@testing-library/svelte';
import { userEvent } from '@testing-library/user-event';
import { expect, test, describe } from 'vitest';
import VendorPaymentForm from './VendorPaymentForm.svelte';

const mockVendors = [
	{ id: 'v1', name: 'Acme Supplies' },
	{ id: 'v2', name: 'Global Parts' },
];

describe('VendorPaymentForm', () => {
	test('renders vendor select with all vendors', () => {
		render(VendorPaymentForm, { props: { vendors: mockVendors } });

		const select = screen.getByLabelText('Vendor *');
		expect(select).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'Select vendor' })).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'Acme Supplies' })).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'Global Parts' })).toBeInTheDocument();
	});

	test('vendor select is required', () => {
		render(VendorPaymentForm, { props: { vendors: mockVendors } });
		expect(screen.getByLabelText('Vendor *')).toBeRequired();
	});

	test('renders amount field', () => {
		render(VendorPaymentForm, { props: { vendors: mockVendors } });
		const amount = screen.getByLabelText('Amount *');
		expect(amount).toBeInTheDocument();
		expect(amount).toHaveAttribute('type', 'number');
		expect(amount).toBeRequired();
	});

	test('renders payment method select with options', () => {
		render(VendorPaymentForm, { props: { vendors: mockVendors } });
		const select = screen.getByLabelText('Payment Method *');
		expect(select).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'Bank Transfer' })).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'Check' })).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'Cash' })).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'Credit Card' })).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'Online' })).toBeInTheDocument();
	});

	test('renders payment number, date, reference, currency, and notes fields', () => {
		render(VendorPaymentForm, { props: { vendors: mockVendors } });
		expect(screen.getByLabelText('Payment Number *')).toBeInTheDocument();
		expect(screen.getByLabelText('Payment Date *')).toBeInTheDocument();
		expect(screen.getByLabelText('Reference Number')).toBeInTheDocument();
		expect(screen.getByLabelText('Currency')).toBeInTheDocument();
		expect(screen.getByLabelText('Notes')).toBeInTheDocument();
	});

	test('form has POST method', () => {
		const { container } = render(VendorPaymentForm, { props: { vendors: mockVendors } });
		expect(container.querySelector('form')).toHaveAttribute('method', 'POST');
	});

	test('submit button shows Record Payment', () => {
		render(VendorPaymentForm, { props: { vendors: mockVendors } });
		expect(screen.getByRole('button', { name: 'Record Payment' })).toBeInTheDocument();
	});

	test('cancel link points to payments list', () => {
		render(VendorPaymentForm, { props: { vendors: mockVendors } });
		expect(screen.getByRole('link', { name: 'Cancel' })).toHaveAttribute('href', '/ap/payments');
	});

	test('displays error messages', () => {
		render(VendorPaymentForm, {
			props: { vendors: mockVendors, errors: { vendorId: ['Vendor is required'] } },
		});
		expect(screen.getByText('Vendor is required')).toBeInTheDocument();
	});
});

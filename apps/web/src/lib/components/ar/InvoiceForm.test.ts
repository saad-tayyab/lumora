import { render, screen } from '@testing-library/svelte';
import { userEvent } from '@testing-library/user-event';
import { expect, test, describe } from 'vitest';
import InvoiceForm from './InvoiceForm.svelte';

const mockCustomers = [
	{ id: 'c1', name: 'Acme Corp' },
	{ id: 'c2', name: 'Globex Inc' },
] as any;

describe('InvoiceForm', () => {
	test('renders customer select with all customers', () => {
		render(InvoiceForm, { props: { customers: mockCustomers } });

		const select = screen.getByLabelText('Customer *');
		expect(select).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'Select a customer' })).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'Acme Corp' })).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'Globex Inc' })).toBeInTheDocument();
	});

	test('customer select is required', () => {
		render(InvoiceForm, { props: { customers: mockCustomers } });
		expect(screen.getByLabelText('Customer *')).toBeRequired();
	});

	test('renders invoice number, issue date, and due date fields', () => {
		render(InvoiceForm, { props: { customers: mockCustomers } });

		expect(screen.getByLabelText('Invoice Number *')).toBeInTheDocument();
		expect(screen.getByLabelText('Issue Date *')).toBeInTheDocument();
		expect(screen.getByLabelText('Due Date *')).toBeInTheDocument();
	});

	test('renders currency select', () => {
		render(InvoiceForm, { props: { customers: mockCustomers } });
		const currency = screen.getByLabelText('Currency');
		expect(currency).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'USD' })).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'EUR' })).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'GBP' })).toBeInTheDocument();
	});

	test('renders line items section', () => {
		render(InvoiceForm, { props: { customers: mockCustomers } });
		expect(screen.getByText('Line Items')).toBeInTheDocument();
	});

	test('renders subtotal display', () => {
		render(InvoiceForm, { props: { customers: mockCustomers } });
		expect(screen.getByText('Subtotal: $0.00')).toBeInTheDocument();
	});

	test('renders notes textarea', () => {
		render(InvoiceForm, { props: { customers: mockCustomers } });
		expect(screen.getByLabelText('Notes')).toBeInTheDocument();
	});

	test('form has POST method', () => {
		const { container } = render(InvoiceForm, { props: { customers: mockCustomers } });
		expect(container.querySelector('form')).toHaveAttribute('method', 'POST');
	});

	test('submit button shows Create Invoice for new invoice', () => {
		render(InvoiceForm, { props: { customers: mockCustomers } });
		expect(screen.getByRole('button', { name: 'Create Invoice' })).toBeInTheDocument();
	});

	test('submit button shows Update Invoice in edit mode', () => {
		render(InvoiceForm, {
			props: {
				customers: mockCustomers,
				invoice: { id: 'inv1', customerId: 'c1', invoiceNumber: 'INV-001' } as any,
			},
		});
		expect(screen.getByRole('button', { name: 'Update Invoice' })).toBeInTheDocument();
	});

	test('cancel link points to invoices list', () => {
		render(InvoiceForm, { props: { customers: mockCustomers } });
		expect(screen.getByRole('link', { name: 'Cancel' })).toHaveAttribute('href', '/ar/invoices');
	});

	test('displays error messages', () => {
		render(InvoiceForm, {
			props: { customers: mockCustomers, errors: { customerId: ['Customer is required'] } },
		});
		expect(screen.getByText('Customer is required')).toBeInTheDocument();
	});
});

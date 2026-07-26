import { render, screen } from '@testing-library/svelte';
import { userEvent } from '@testing-library/user-event';
import { expect, test, describe } from 'vitest';
import BillForm from './BillForm.svelte';

const mockVendors = [
	{ id: 'v1', name: 'Acme Supplies' },
	{ id: 'v2', name: 'Global Parts' },
];

describe('BillForm', () => {
	test('renders vendor select with all vendors', () => {
		render(BillForm, { props: { vendors: mockVendors } });

		const select = screen.getByLabelText('Vendor *');
		expect(select).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'Select vendor' })).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'Acme Supplies' })).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'Global Parts' })).toBeInTheDocument();
	});

	test('vendor select is required', () => {
		render(BillForm, { props: { vendors: mockVendors } });
		expect(screen.getByLabelText('Vendor *')).toBeRequired();
	});

	test('renders bill number, issue date, and due date fields', () => {
		render(BillForm, { props: { vendors: mockVendors } });
		expect(screen.getByLabelText('Bill Number *')).toBeInTheDocument();
		expect(screen.getByLabelText('Issue Date *')).toBeInTheDocument();
		expect(screen.getByLabelText('Due Date *')).toBeInTheDocument();
	});

	test('renders line items section with add button', () => {
		render(BillForm, { props: { vendors: mockVendors } });
		expect(screen.getByText('Line Items')).toBeInTheDocument();
		expect(screen.getByRole('button', { name: '+ Add Line' })).toBeInTheDocument();
	});

	test('renders subtotal display', () => {
		render(BillForm, { props: { vendors: mockVendors } });
		expect(screen.getByText('Subtotal: $0.00')).toBeInTheDocument();
	});

	test('renders notes textarea', () => {
		render(BillForm, { props: { vendors: mockVendors } });
		expect(screen.getByLabelText('Notes')).toBeInTheDocument();
	});

	test('form has POST method', () => {
		const { container } = render(BillForm, { props: { vendors: mockVendors } });
		expect(container.querySelector('form')).toHaveAttribute('method', 'POST');
	});

	test('submit button shows Create Bill for new bill', () => {
		render(BillForm, { props: { vendors: mockVendors } });
		expect(screen.getByRole('button', { name: 'Create Bill' })).toBeInTheDocument();
	});

	test('submit button shows Update Bill in edit mode', () => {
		render(BillForm, {
			props: {
				vendors: mockVendors,
				bill: { vendorId: 'v1', billNumber: 'BILL-001', issueDate: '2026-01-01', dueDate: '2026-02-01', notes: null },
			},
		});
		expect(screen.getByRole('button', { name: 'Update Bill' })).toBeInTheDocument();
	});

	test('cancel link points to bills list', () => {
		render(BillForm, { props: { vendors: mockVendors } });
		expect(screen.getByRole('link', { name: 'Cancel' })).toHaveAttribute('href', '/ap/bills');
	});

	test('displays error messages', () => {
		render(BillForm, {
			props: { vendors: mockVendors, errors: { vendorId: ['Vendor is required'] } },
		});
		expect(screen.getByText('Vendor is required')).toBeInTheDocument();
	});
});

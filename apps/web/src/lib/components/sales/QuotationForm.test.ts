import { render, screen } from '@testing-library/svelte';
import { userEvent } from '@testing-library/user-event';
import { expect, test, describe } from 'vitest';
import QuotationForm from './QuotationForm.svelte';

const mockCustomers = [
	{ id: 'cust-1', name: 'Acme Corp' },
	{ id: 'cust-2', name: 'Globex Inc' },
];

describe('QuotationForm', () => {
	test('renders customer select', () => {
		render(QuotationForm, { props: { customers: mockCustomers } });
		const select = screen.getByLabelText('Customer *');
		expect(select).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'Select customer' })).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'Acme Corp' })).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'Globex Inc' })).toBeInTheDocument();
	});

	test('renders expiry date field (Valid Until)', () => {
		render(QuotationForm, { props: { customers: mockCustomers } });
		expect(screen.getByLabelText('Valid Until')).toBeInTheDocument();
	});

	test('renders line items section with add button', () => {
		render(QuotationForm, { props: { customers: mockCustomers } });
		expect(screen.getByText('Line Items')).toBeInTheDocument();
		expect(screen.getByRole('button', { name: '+ Add Line' })).toBeInTheDocument();
	});

	test('renders notes textarea', () => {
		render(QuotationForm, { props: { customers: mockCustomers } });
		expect(screen.getByLabelText('Notes')).toBeInTheDocument();
	});

	test('renders submit button with Create Quotation text', () => {
		render(QuotationForm, { props: { customers: mockCustomers } });
		expect(screen.getByRole('button', { name: 'Create Quotation' })).toBeInTheDocument();
	});

	test('renders cancel link', () => {
		render(QuotationForm, { props: { customers: mockCustomers } });
		const cancelLink = screen.getByRole('link', { name: 'Cancel' });
		expect(cancelLink).toHaveAttribute('href', '/sales/quotations');
	});

	test('form has POST method', () => {
		const { container } = render(QuotationForm, { props: { customers: mockCustomers } });
		expect(container.querySelector('form')).toHaveAttribute('method', 'POST');
	});

	test('adds a new line item when clicking Add Line', async () => {
		const user = userEvent.setup();
		render(QuotationForm, { props: { customers: mockCustomers } });

		const addBtn = screen.getByRole('button', { name: '+ Add Line' });
		await user.click(addBtn);

		const itemInputs = screen.getAllByRole('textbox');
		expect(itemInputs.length).toBeGreaterThan(1);
	});

	test('customer select is required', () => {
		render(QuotationForm, { props: { customers: mockCustomers } });
		expect(screen.getByLabelText('Customer *')).toBeRequired();
	});

	test('prefills fields from quotation prop', () => {
		render(QuotationForm, {
			props: {
				customers: mockCustomers,
				quotation: {
					customerId: 'cust-2',
					validUntil: '2026-09-30',
					notes: 'Valid for 30 days',
				},
			},
		});
		expect(screen.getByLabelText('Customer *')).toHaveValue('cust-2');
		expect(screen.getByLabelText('Valid Until')).toHaveValue('2026-09-30');
		expect(screen.getByLabelText('Notes')).toHaveValue('Valid for 30 days');
	});
});

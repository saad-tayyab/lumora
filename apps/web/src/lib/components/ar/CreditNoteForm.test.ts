import { render, screen } from '@testing-library/svelte';
import { userEvent } from '@testing-library/user-event';
import { expect, test, describe } from 'vitest';
import CreditNoteForm from './CreditNoteForm.svelte';

const mockCustomers = [
	{ id: 'c1', name: 'Acme Corp' },
	{ id: 'c2', name: 'Globex Inc' },
];

describe('CreditNoteForm', () => {
	test('renders customer select with all customers', () => {
		render(CreditNoteForm, { props: { customers: mockCustomers as any } });

		const select = screen.getByLabelText('Customer *');
		expect(select).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'Select a customer' })).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'Acme Corp' })).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'Globex Inc' })).toBeInTheDocument();
	});

	test('customer select is required', () => {
		render(CreditNoteForm, { props: { customers: mockCustomers as any } });
		expect(screen.getByLabelText('Customer *')).toBeRequired();
	});

	test('renders amount field as number input', () => {
		render(CreditNoteForm, { props: { customers: mockCustomers as any } });
		const amount = screen.getByLabelText('Amount *');
		expect(amount).toBeInTheDocument();
		expect(amount).toHaveAttribute('type', 'number');
		expect(amount).toBeRequired();
	});

	test('renders credit note number field', () => {
		render(CreditNoteForm, { props: { customers: mockCustomers as any } });
		const numField = screen.getByLabelText('Credit Note Number *');
		expect(numField).toBeInTheDocument();
		expect(numField).toBeRequired();
	});

	test('renders issue date field', () => {
		render(CreditNoteForm, { props: { customers: mockCustomers as any } });
		const dateField = screen.getByLabelText('Issue Date *');
		expect(dateField).toBeInTheDocument();
		expect(dateField).toHaveAttribute('type', 'date');
	});

	test('renders reason field', () => {
		render(CreditNoteForm, { props: { customers: mockCustomers as any } });
		const reason = screen.getByLabelText('Reason *');
		expect(reason).toBeInTheDocument();
		expect(reason).toBeRequired();
	});

	test('renders notes textarea', () => {
		render(CreditNoteForm, { props: { customers: mockCustomers as any } });
		expect(screen.getByLabelText('Notes')).toBeInTheDocument();
	});

	test('renders currency select with options', () => {
		render(CreditNoteForm, { props: { customers: mockCustomers as any } });
		expect(screen.getByRole('option', { name: 'USD' })).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'EUR' })).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'GBP' })).toBeInTheDocument();
	});

	test('form has POST method', () => {
		const { container } = render(CreditNoteForm, { props: { customers: mockCustomers as any } });
		expect(container.querySelector('form')).toHaveAttribute('method', 'POST');
	});

	test('submit button shows Create Credit Note', () => {
		render(CreditNoteForm, { props: { customers: mockCustomers as any } });
		expect(screen.getByRole('button', { name: 'Create Credit Note' })).toBeInTheDocument();
	});

	test('cancel link points to credit notes list', () => {
		render(CreditNoteForm, { props: { customers: mockCustomers as any } });
		expect(screen.getByRole('link', { name: 'Cancel' })).toHaveAttribute('href', '/ar/credit-notes');
	});

	test('displays error messages', () => {
		render(CreditNoteForm, {
			props: { customers: mockCustomers as any, errors: { customerId: ['Customer is required'] } },
		});
		expect(screen.getByText('Customer is required')).toBeInTheDocument();
	});
});

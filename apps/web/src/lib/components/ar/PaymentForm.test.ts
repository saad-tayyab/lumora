import { render, screen } from '@testing-library/svelte';
import { userEvent } from '@testing-library/user-event';
import { expect, test, describe } from 'vitest';
import PaymentForm from './PaymentForm.svelte';

const mockCustomers = [
	{ id: 'c1', name: 'Acme Corp' },
	{ id: 'c2', name: 'Globex Inc' },
] as any;

describe('PaymentForm', () => {
	test('renders customer select with all customers', () => {
		render(PaymentForm, { props: { customers: mockCustomers } });

		const select = screen.getByLabelText('Customer *');
		expect(select).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'Select a customer' })).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'Acme Corp' })).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'Globex Inc' })).toBeInTheDocument();
	});

	test('customer select is required', () => {
		render(PaymentForm, { props: { customers: mockCustomers } });
		expect(screen.getByLabelText('Customer *')).toBeRequired();
	});

	test('renders amount field', () => {
		render(PaymentForm, { props: { customers: mockCustomers } });
		const amount = screen.getByLabelText('Amount *');
		expect(amount).toBeInTheDocument();
		expect(amount).toHaveAttribute('type', 'number');
		expect(amount).toBeRequired();
	});

	test('renders payment method select with options', () => {
		render(PaymentForm, { props: { customers: mockCustomers } });
		const select = screen.getByLabelText('Payment Method *');
		expect(select).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'Cash' })).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'Check' })).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'Bank Transfer' })).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'Credit Card' })).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'Online' })).toBeInTheDocument();
	});

	test('renders payment number, date, reference, currency, and notes fields', () => {
		render(PaymentForm, { props: { customers: mockCustomers } });
		expect(screen.getByLabelText('Payment Number *')).toBeInTheDocument();
		expect(screen.getByLabelText('Payment Date *')).toBeInTheDocument();
		expect(screen.getByLabelText('Reference Number')).toBeInTheDocument();
		expect(screen.getByLabelText('Currency')).toBeInTheDocument();
		expect(screen.getByLabelText('Notes')).toBeInTheDocument();
	});

	test('form has POST method', () => {
		const { container } = render(PaymentForm, { props: { customers: mockCustomers } });
		expect(container.querySelector('form')).toHaveAttribute('method', 'POST');
	});

	test('submit button shows Record Payment', () => {
		render(PaymentForm, { props: { customers: mockCustomers } });
		expect(screen.getByRole('button', { name: 'Record Payment' })).toBeInTheDocument();
	});

	test('cancel link points to payments list', () => {
		render(PaymentForm, { props: { customers: mockCustomers } });
		expect(screen.getByRole('link', { name: 'Cancel' })).toHaveAttribute('href', '/ar/payments');
	});

	test('displays error messages', () => {
		render(PaymentForm, {
			props: { customers: mockCustomers, errors: { customerId: ['Customer is required'] } },
		});
		expect(screen.getByText('Customer is required')).toBeInTheDocument();
	});
});

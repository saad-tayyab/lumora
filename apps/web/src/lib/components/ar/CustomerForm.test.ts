import { render, screen } from '@testing-library/svelte';
import { userEvent } from '@testing-library/user-event';
import { expect, test, describe } from 'vitest';
import CustomerForm from './CustomerForm.svelte';

describe('CustomerForm', () => {
	test('renders all form fields', () => {
		render(CustomerForm);

		expect(screen.getByLabelText('Name *')).toBeInTheDocument();
		expect(screen.getByLabelText('Email')).toBeInTheDocument();
		expect(screen.getByLabelText('Phone')).toBeInTheDocument();
		expect(screen.getByLabelText('Payment Terms')).toBeInTheDocument();
		expect(screen.getByLabelText('Credit Limit')).toBeInTheDocument();
		expect(screen.getByLabelText('Address Line 1')).toBeInTheDocument();
		expect(screen.getByLabelText('Address Line 2')).toBeInTheDocument();
		expect(screen.getByLabelText('City')).toBeInTheDocument();
		expect(screen.getByLabelText('State')).toBeInTheDocument();
		expect(screen.getByLabelText('Postal Code')).toBeInTheDocument();
		expect(screen.getByLabelText('Country (3-letter code)')).toBeInTheDocument();
		expect(screen.getByLabelText('Active')).toBeInTheDocument();
	});

	test('name input is required', () => {
		render(CustomerForm);
		const nameInput = screen.getByLabelText('Name *');
		expect(nameInput).toBeRequired();
	});

	test('email input has email type', () => {
		render(CustomerForm);
		const emailInput = screen.getByLabelText('Email');
		expect(emailInput).toHaveAttribute('type', 'email');
	});

	test('phone input is a text field', () => {
		render(CustomerForm);
		const phoneInput = screen.getByLabelText('Phone');
		expect(phoneInput).toHaveAttribute('type', 'text');
	});

	test('payment terms select has correct options', () => {
		render(CustomerForm);
		const select = screen.getByLabelText('Payment Terms');
		expect(select).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'Net 15' })).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'Net 30' })).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'Net 45' })).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'Net 60' })).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'Due on Receipt' })).toBeInTheDocument();
	});

	test('submit button shows Create Customer for new customer', () => {
		render(CustomerForm);
		expect(screen.getByRole('button', { name: 'Create Customer' })).toBeInTheDocument();
	});

	test('submit button shows Update Customer in edit mode', () => {
		render(CustomerForm, { props: { isEdit: true } });
		expect(screen.getByRole('button', { name: 'Update Customer' })).toBeInTheDocument();
	});

	test('form has POST method', () => {
		const { container } = render(CustomerForm);
		expect(container.querySelector('form')).toHaveAttribute('method', 'POST');
	});

	test('cancel link points to customer list', () => {
		render(CustomerForm);
		const cancelLink = screen.getByRole('link', { name: 'Cancel' });
		expect(cancelLink).toHaveAttribute('href', '/ar/customers');
	});

	test('prefills fields from customer prop', () => {
		render(CustomerForm, {
			props: {
				customer: {
					name: 'Acme Corp',
					email: 'acme@example.com',
					phone: '+1 555 1234',
					paymentTerms: 'Net 60',
					creditLimit: '5000',
					addressLine1: '123 Main St',
					city: 'Springfield',
					state: 'IL',
					postalCode: '62704',
					country: 'USA',
					isActive: true,
				} as any,
			},
		});

		expect(screen.getByLabelText('Name *')).toHaveValue('Acme Corp');
		expect(screen.getByLabelText('Email')).toHaveValue('acme@example.com');
		expect(screen.getByLabelText('Phone')).toHaveValue('+1 555 1234');
		expect(screen.getByLabelText('Payment Terms')).toHaveValue('Net 60');
		expect(screen.getByLabelText('Credit Limit')).toHaveValue(5000);
	});

	test('displays error messages', () => {
		render(CustomerForm, {
			props: { errors: { name: ['Name is required'], email: ['Invalid email'] } },
		});
		expect(screen.getByText('Name is required')).toBeInTheDocument();
		expect(screen.getByText('Invalid email')).toBeInTheDocument();
	});
});

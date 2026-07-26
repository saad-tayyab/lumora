import { render, screen } from '@testing-library/svelte';
import { userEvent } from '@testing-library/user-event';
import { expect, test, describe } from 'vitest';
import VendorForm from './VendorForm.svelte';

describe('VendorForm', () => {
	test('renders name field', () => {
		render(VendorForm);
		const name = screen.getByLabelText('Name *');
		expect(name).toBeInTheDocument();
		expect(name).toBeRequired();
	});

	test('renders email field', () => {
		render(VendorForm);
		const email = screen.getByLabelText('Email');
		expect(email).toBeInTheDocument();
		expect(email).toHaveAttribute('type', 'email');
	});

	test('renders phone field', () => {
		render(VendorForm);
		const phone = screen.getByLabelText('Phone');
		expect(phone).toBeInTheDocument();
		expect(phone).toHaveAttribute('type', 'text');
	});

	test('renders payment terms select with options', () => {
		render(VendorForm);
		const select = screen.getByLabelText('Payment Terms');
		expect(select).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'Net 15' })).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'Net 30' })).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'Net 45' })).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'Net 60' })).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'Due on Receipt' })).toBeInTheDocument();
	});

	test('renders address fields', () => {
		render(VendorForm);
		expect(screen.getByLabelText('Address')).toBeInTheDocument();
		expect(screen.getByLabelText('City')).toBeInTheDocument();
		expect(screen.getByLabelText('State')).toBeInTheDocument();
		expect(screen.getByLabelText('Country')).toBeInTheDocument();
	});

	test('renders active checkbox', () => {
		render(VendorForm);
		expect(screen.getByLabelText('Active')).toBeInTheDocument();
	});

	test('form has POST method', () => {
		const { container } = render(VendorForm);
		expect(container.querySelector('form')).toHaveAttribute('method', 'POST');
	});

	test('submit button shows Create Vendor for new vendor', () => {
		render(VendorForm);
		expect(screen.getByRole('button', { name: 'Create Vendor' })).toBeInTheDocument();
	});

	test('submit button shows Update Vendor in edit mode', () => {
		render(VendorForm, {
			props: { vendor: { id: 'v1', name: 'Acme Supplies', email: null, phone: null, addressLine1: null, city: null, state: null, country: null, paymentTerms: 'Net 30', isActive: true } },
		});
		expect(screen.getByRole('button', { name: 'Update Vendor' })).toBeInTheDocument();
	});

	test('cancel link points to vendors list', () => {
		render(VendorForm);
		expect(screen.getByRole('link', { name: 'Cancel' })).toHaveAttribute('href', '/ap/vendors');
	});

	test('prefills fields from vendor prop', () => {
		render(VendorForm, {
			props: {
				vendor: {
					id: 'v1',
					name: 'Acme Supplies',
					email: 'sales@acme.com',
					phone: '+1 555 9999',
					addressLine1: '456 Industrial Blvd',
					city: 'Chicago',
					state: 'IL',
					country: 'USA',
					paymentTerms: 'Net 60',
					isActive: true,
				},
			},
		});
		expect(screen.getByLabelText('Name *')).toHaveValue('Acme Supplies');
		expect(screen.getByLabelText('Email')).toHaveValue('sales@acme.com');
		expect(screen.getByLabelText('Phone')).toHaveValue('+1 555 9999');
		expect(screen.getByLabelText('Address')).toHaveValue('456 Industrial Blvd');
		expect(screen.getByLabelText('City')).toHaveValue('Chicago');
		expect(screen.getByLabelText('State')).toHaveValue('IL');
		expect(screen.getByLabelText('Country')).toHaveValue('USA');
	});

	test('displays error messages', () => {
		render(VendorForm, {
			props: { errors: { name: ['Name is required'] } },
		});
		expect(screen.getByText('Name is required')).toBeInTheDocument();
	});
});

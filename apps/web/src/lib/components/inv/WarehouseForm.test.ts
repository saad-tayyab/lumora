import { render, screen } from '@testing-library/svelte';
import { userEvent } from '@testing-library/user-event';
import { expect, test, describe } from 'vitest';
import WarehouseForm from './WarehouseForm.svelte';

describe('WarehouseForm', () => {
	test('renders code field', () => {
		render(WarehouseForm);
		const code = screen.getByLabelText('Code *');
		expect(code).toBeInTheDocument();
		expect(code).toBeRequired();
	});

	test('renders name field', () => {
		render(WarehouseForm);
		const name = screen.getByLabelText('Name *');
		expect(name).toBeInTheDocument();
		expect(name).toBeRequired();
	});

	test('renders address field', () => {
		render(WarehouseForm);
		const address = screen.getByLabelText('Address');
		expect(address).toBeInTheDocument();
	});

	test('renders city field', () => {
		render(WarehouseForm);
		const city = screen.getByLabelText('City');
		expect(city).toBeInTheDocument();
	});

	test('renders country field', () => {
		render(WarehouseForm);
		const country = screen.getByLabelText('Country');
		expect(country).toBeInTheDocument();
	});

	test('renders active checkbox', () => {
		render(WarehouseForm);
		expect(screen.getByLabelText('Active')).toBeInTheDocument();
	});

	test('form has POST method', () => {
		const { container } = render(WarehouseForm);
		expect(container.querySelector('form')).toHaveAttribute('method', 'POST');
	});

	test('submit button shows Create Warehouse for new warehouse', () => {
		render(WarehouseForm);
		expect(screen.getByRole('button', { name: 'Create Warehouse' })).toBeInTheDocument();
	});

	test('submit button shows Update Warehouse in edit mode', () => {
		render(WarehouseForm, {
			props: { warehouse: { name: 'Main WH', code: 'WH-01', address: '123 St', city: 'NYC', country: 'USA', status: 'active' as const } },
		});
		expect(screen.getByRole('button', { name: 'Update Warehouse' })).toBeInTheDocument();
	});

	test('cancel link points to warehouses list', () => {
		render(WarehouseForm);
		expect(screen.getByRole('link', { name: 'Cancel' })).toHaveAttribute('href', '/inv/warehouses');
	});

	test('prefills fields from warehouse prop', () => {
		render(WarehouseForm, {
			props: { warehouse: { name: 'Main WH', code: 'WH-01', address: '123 Industrial Blvd', city: 'Chicago', country: 'USA', status: 'active' as const } },
		});
		expect(screen.getByLabelText('Name *')).toHaveValue('Main WH');
		expect(screen.getByLabelText('Code *')).toHaveValue('WH-01');
		expect(screen.getByLabelText('Address')).toHaveValue('123 Industrial Blvd');
		expect(screen.getByLabelText('City')).toHaveValue('Chicago');
		expect(screen.getByLabelText('Country')).toHaveValue('USA');
	});

	test('displays error messages', () => {
		render(WarehouseForm, {
			props: { errors: { name: ['Name is required'], code: ['Code is required'] } },
		});
		expect(screen.getByText('Name is required')).toBeInTheDocument();
		expect(screen.getByText('Code is required')).toBeInTheDocument();
	});
});

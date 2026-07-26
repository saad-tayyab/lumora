import { render, screen } from '@testing-library/svelte';
import { userEvent } from '@testing-library/user-event';
import { expect, test, describe } from 'vitest';
import ItemForm from './ItemForm.svelte';

describe('ItemForm', () => {
	test('renders SKU field', () => {
		render(ItemForm);
		const sku = screen.getByLabelText('SKU *');
		expect(sku).toBeInTheDocument();
		expect(sku).toBeRequired();
	});

	test('renders name field', () => {
		render(ItemForm);
		const name = screen.getByLabelText('Name *');
		expect(name).toBeInTheDocument();
		expect(name).toBeRequired();
	});

	test('renders category ID field', () => {
		render(ItemForm);
		const categoryId = screen.getByLabelText('Category ID');
		expect(categoryId).toBeInTheDocument();
	});

	test('renders unit price field', () => {
		render(ItemForm);
		const unitPrice = screen.getByLabelText('Unit Price');
		expect(unitPrice).toBeInTheDocument();
		expect(unitPrice).toHaveAttribute('type', 'number');
	});

	test('renders cost price field', () => {
		render(ItemForm);
		const costPrice = screen.getByLabelText('Cost Price');
		expect(costPrice).toBeInTheDocument();
		expect(costPrice).toHaveAttribute('type', 'number');
	});

	test('renders reorder point field', () => {
		render(ItemForm);
		const reorderPoint = screen.getByLabelText('Reorder Point');
		expect(reorderPoint).toBeInTheDocument();
		expect(reorderPoint).toHaveAttribute('type', 'number');
	});

	test('renders description textarea', () => {
		render(ItemForm);
		expect(screen.getByLabelText('Description')).toBeInTheDocument();
	});

	test('renders active checkbox', () => {
		render(ItemForm);
		expect(screen.getByLabelText('Active')).toBeInTheDocument();
	});

	test('form has POST method', () => {
		const { container } = render(ItemForm);
		expect(container.querySelector('form')).toHaveAttribute('method', 'POST');
	});

	test('submit button shows Create Item for new item', () => {
		render(ItemForm);
		expect(screen.getByRole('button', { name: 'Create Item' })).toBeInTheDocument();
	});

	test('submit button shows Update Item in edit mode', () => {
		render(ItemForm, {
			props: { item: { name: 'Widget', sku: 'W-001', description: null, categoryId: 'cat1', unitPrice: '10', costPrice: '5', reorderPoint: '100', isActive: true } },
		});
		expect(screen.getByRole('button', { name: 'Update Item' })).toBeInTheDocument();
	});

	test('cancel link points to items list', () => {
		render(ItemForm);
		expect(screen.getByRole('link', { name: 'Cancel' })).toHaveAttribute('href', '/inv/items');
	});

	test('prefills fields from item prop', () => {
		render(ItemForm, {
			props: {
				item: { name: 'Widget', sku: 'W-001', description: 'A widget', categoryId: 'cat1', unitPrice: '19.99', costPrice: '9.50', reorderPoint: '50', isActive: true },
			},
		});
		expect(screen.getByLabelText('Name *')).toHaveValue('Widget');
		expect(screen.getByLabelText('SKU *')).toHaveValue('W-001');
		expect(screen.getByLabelText('Category ID')).toHaveValue('cat1');
		expect(screen.getByLabelText('Unit Price')).toHaveValue(19.99);
		expect(screen.getByLabelText('Cost Price')).toHaveValue(9.5);
		expect(screen.getByLabelText('Reorder Point')).toHaveValue(50);
	});

	test('displays error messages', () => {
		render(ItemForm, {
			props: { errors: { name: ['Name is required'], sku: ['SKU is required'] } },
		});
		expect(screen.getByText('Name is required')).toBeInTheDocument();
		expect(screen.getByText('SKU is required')).toBeInTheDocument();
	});
});

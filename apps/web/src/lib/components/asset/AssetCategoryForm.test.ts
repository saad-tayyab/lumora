import { render, screen } from '@testing-library/svelte';
import { userEvent } from '@testing-library/user-event';
import { expect, test, describe } from 'vitest';
import AssetCategoryForm from './AssetCategoryForm.svelte';

describe('AssetCategoryForm', () => {
	test('renders name field', () => {
		render(AssetCategoryForm);
		expect(screen.getByLabelText('Name *')).toBeInTheDocument();
	});

	test('renders code field', () => {
		render(AssetCategoryForm);
		expect(screen.getByLabelText('Code *')).toBeInTheDocument();
	});

	test('renders description textarea', () => {
		render(AssetCategoryForm);
		expect(screen.getByLabelText('Description')).toBeInTheDocument();
	});

	test('renders depreciation method select with correct options', () => {
		render(AssetCategoryForm);

		expect(screen.getByRole('option', { name: 'Straight Line' })).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'Declining Balance' })).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'Sum of Years Digits' })).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'Units of Production' })).toBeInTheDocument();
	});

	test('renders useful life field', () => {
		render(AssetCategoryForm);
		expect(screen.getByLabelText('Useful Life (months)')).toBeInTheDocument();
	});

	test('renders salvage value percent field', () => {
		render(AssetCategoryForm);
		expect(screen.getByLabelText('Salvage Value %')).toBeInTheDocument();
	});

	test('renders is depreciable checkbox', () => {
		render(AssetCategoryForm);
		expect(screen.getByLabelText('Is Depreciable')).toBeInTheDocument();
	});

	test('renders submit button with Create Category text', () => {
		render(AssetCategoryForm);
		expect(screen.getByRole('button', { name: 'Create Category' })).toBeInTheDocument();
	});

	test('renders cancel link', () => {
		render(AssetCategoryForm);
		const cancelLink = screen.getByRole('link', { name: 'Cancel' });
		expect(cancelLink).toHaveAttribute('href', '/assets/categories');
	});

	test('form has POST method', () => {
		const { container } = render(AssetCategoryForm);
		expect(container.querySelector('form')).toHaveAttribute('method', 'POST');
	});

	test('required fields are marked required', () => {
		render(AssetCategoryForm);
		expect(screen.getByLabelText('Name *')).toBeRequired();
		expect(screen.getByLabelText('Code *')).toBeRequired();
	});

	test('depreciation method defaults to straight_line', () => {
		render(AssetCategoryForm);
		expect(screen.getByLabelText('Depreciation Method')).toHaveValue('straight_line');
	});

	test('useful life defaults to 60 months', () => {
		render(AssetCategoryForm);
		expect(screen.getByLabelText('Useful Life (months)')).toHaveValue(60);
	});

	test('is depreciable checkbox is checked by default', () => {
		render(AssetCategoryForm);
		expect(screen.getByLabelText('Is Depreciable')).toBeChecked();
	});

	test('code field has maxlength of 20', () => {
		render(AssetCategoryForm);
		expect(screen.getByLabelText('Code *')).toHaveAttribute('maxlength', '20');
	});

	test('prefills fields from category prop', () => {
		render(AssetCategoryForm, {
			props: {
				category: {
					name: 'Office Equipment',
					code: 'OE',
					description: 'Office equipment and furniture',
					defaultDepreciationMethod: 'declining_balance',
					defaultUsefulLifeMonths: 36,
					defaultSalvageValuePercent: '10',
					isDepreciable: false,
				},
			},
		});
		expect(screen.getByLabelText('Name *')).toHaveValue('Office Equipment');
		expect(screen.getByLabelText('Code *')).toHaveValue('OE');
		expect(screen.getByLabelText('Description')).toHaveValue('Office equipment and furniture');
		expect(screen.getByLabelText('Depreciation Method')).toHaveValue('declining_balance');
		expect(screen.getByLabelText('Useful Life (months)')).toHaveValue(36);
		expect(screen.getByLabelText('Salvage Value %')).toHaveValue(10);
		expect(screen.getByLabelText('Is Depreciable')).not.toBeChecked();
	});
});

import { render, screen } from '@testing-library/svelte';
import { userEvent } from '@testing-library/user-event';
import { expect, test, describe } from 'vitest';
import FixedAssetForm from './FixedAssetForm.svelte';

const mockCategories = [
	{ id: 'cat-1', name: 'Office Equipment' },
	{ id: 'cat-2', name: 'Vehicles' },
];

describe('FixedAssetForm', () => {
	test('renders name field', () => {
		render(FixedAssetForm, { props: { categories: mockCategories } });
		expect(screen.getByLabelText('Name *')).toBeInTheDocument();
	});

	test('renders asset number field', () => {
		render(FixedAssetForm, { props: { categories: mockCategories } });
		expect(screen.getByLabelText('Asset Number *')).toBeInTheDocument();
	});

	test('renders category select with options', () => {
		render(FixedAssetForm, { props: { categories: mockCategories } });

		const select = screen.getByLabelText('Category *');
		expect(select).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'Select category' })).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'Office Equipment' })).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'Vehicles' })).toBeInTheDocument();
	});

	test('renders acquisition date field', () => {
		render(FixedAssetForm, { props: { categories: mockCategories } });
		expect(screen.getByLabelText('Acquisition Date *')).toBeInTheDocument();
	});

	test('renders acquisition cost field', () => {
		render(FixedAssetForm, { props: { categories: mockCategories } });
		expect(screen.getByLabelText('Acquisition Cost *')).toBeInTheDocument();
	});

	test('renders salvage value field', () => {
		render(FixedAssetForm, { props: { categories: mockCategories } });
		expect(screen.getByLabelText('Salvage Value')).toBeInTheDocument();
	});

	test('renders useful life months field', () => {
		render(FixedAssetForm, { props: { categories: mockCategories } });
		expect(screen.getByLabelText('Useful Life (months)')).toBeInTheDocument();
	});

	test('renders depreciation method select with correct options', () => {
		render(FixedAssetForm, { props: { categories: mockCategories } });

		expect(screen.getByRole('option', { name: 'Straight Line' })).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'Declining Balance' })).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'Sum of Years' })).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'Units of Production' })).toBeInTheDocument();
	});

	test('renders description textarea', () => {
		render(FixedAssetForm, { props: { categories: mockCategories } });
		expect(screen.getByLabelText('Description')).toBeInTheDocument();
	});

	test('renders submit button with Create Asset text', () => {
		render(FixedAssetForm, { props: { categories: mockCategories } });
		expect(screen.getByRole('button', { name: 'Create Asset' })).toBeInTheDocument();
	});

	test('renders cancel link', () => {
		render(FixedAssetForm, { props: { categories: mockCategories } });
		const cancelLink = screen.getByRole('link', { name: 'Cancel' });
		expect(cancelLink).toHaveAttribute('href', '/assets');
	});

	test('form has POST method', () => {
		const { container } = render(FixedAssetForm, { props: { categories: mockCategories } });
		expect(container.querySelector('form')).toHaveAttribute('method', 'POST');
	});

	test('required fields are marked required', () => {
		render(FixedAssetForm, { props: { categories: mockCategories } });
		expect(screen.getByLabelText('Name *')).toBeRequired();
		expect(screen.getByLabelText('Asset Number *')).toBeRequired();
		expect(screen.getByLabelText('Category *')).toBeRequired();
		expect(screen.getByLabelText('Acquisition Date *')).toBeRequired();
		expect(screen.getByLabelText('Acquisition Cost *')).toBeRequired();
	});

	test('depreciation method defaults to straight_line', () => {
		render(FixedAssetForm, { props: { categories: mockCategories } });
		expect(screen.getByLabelText('Depreciation Method')).toHaveValue('straight_line');
	});

	test('useful life defaults to 60 months', () => {
		render(FixedAssetForm, { props: { categories: mockCategories } });
		expect(screen.getByLabelText('Useful Life (months)')).toHaveValue(60);
	});

	test('prefills fields from asset prop', () => {
		render(FixedAssetForm, {
			props: {
				asset: {
					name: 'Dell Laptop',
					assetNumber: 'AST-001',
					description: 'Development laptop',
					categoryId: 'cat-1',
					acquisitionDate: '2026-01-15',
					acquisitionCost: '1500',
					salvageValue: '100',
					usefulLifeMonths: 36,
					depreciationMethod: 'declining_balance',
				},
				categories: mockCategories,
			},
		});
		expect(screen.getByLabelText('Name *')).toHaveValue('Dell Laptop');
		expect(screen.getByLabelText('Asset Number *')).toHaveValue('AST-001');
		expect(screen.getByLabelText('Description')).toHaveValue('Development laptop');
		expect(screen.getByLabelText('Category *')).toHaveValue('cat-1');
		expect(screen.getByLabelText('Acquisition Date *')).toHaveValue('2026-01-15');
		expect(screen.getByLabelText('Acquisition Cost *')).toHaveValue(1500);
		expect(screen.getByLabelText('Salvage Value')).toHaveValue(100);
		expect(screen.getByLabelText('Useful Life (months)')).toHaveValue(36);
		expect(screen.getByLabelText('Depreciation Method')).toHaveValue('declining_balance');
	});
});

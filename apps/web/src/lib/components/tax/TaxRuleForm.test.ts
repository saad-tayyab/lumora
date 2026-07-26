import { render, screen } from '@testing-library/svelte';
import { userEvent } from '@testing-library/user-event';
import { expect, test, describe } from 'vitest';
import TaxRuleForm from './TaxRuleForm.svelte';

const mockTaxCodes = [
	{ id: 'tc-1', code: 'VAT', name: 'Value Added Tax' },
	{ id: 'tc-2', code: 'GST', name: 'Goods & Services Tax' },
];

describe('TaxRuleForm', () => {
	test('renders name field', () => {
		render(TaxRuleForm, { props: { taxCodes: mockTaxCodes } });
		expect(screen.getByLabelText('Name *')).toBeInTheDocument();
	});

	test('renders priority field', () => {
		render(TaxRuleForm, { props: { taxCodes: mockTaxCodes } });
		expect(screen.getByLabelText('Priority')).toBeInTheDocument();
	});

	test('renders tax code select with options', () => {
		render(TaxRuleForm, { props: { taxCodes: mockTaxCodes } });

		const select = screen.getByLabelText('Tax Code *');
		expect(select).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'Select tax code' })).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'VAT - Value Added Tax' })).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'GST - Goods & Services Tax' })).toBeInTheDocument();
	});

	test('renders entity type select with correct options', () => {
		render(TaxRuleForm, { props: { taxCodes: mockTaxCodes } });

		expect(screen.getByRole('option', { name: 'Item' })).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'Customer' })).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'Vendor' })).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'Category' })).toBeInTheDocument();
	});

	test('renders description textarea', () => {
		render(TaxRuleForm, { props: { taxCodes: mockTaxCodes } });
		expect(screen.getByLabelText('Description')).toBeInTheDocument();
	});

	test('renders active checkbox', () => {
		render(TaxRuleForm, { props: { taxCodes: mockTaxCodes } });
		expect(screen.getByLabelText('Active')).toBeInTheDocument();
	});

	test('renders submit button with Create Rule text', () => {
		render(TaxRuleForm, { props: { taxCodes: mockTaxCodes } });
		expect(screen.getByRole('button', { name: 'Create Rule' })).toBeInTheDocument();
	});

	test('renders cancel link', () => {
		render(TaxRuleForm, { props: { taxCodes: mockTaxCodes } });
		const cancelLink = screen.getByRole('link', { name: 'Cancel' });
		expect(cancelLink).toHaveAttribute('href', '/tax/rules');
	});

	test('form has POST method', () => {
		const { container } = render(TaxRuleForm, { props: { taxCodes: mockTaxCodes } });
		expect(container.querySelector('form')).toHaveAttribute('method', 'POST');
	});

	test('required fields are marked required', () => {
		render(TaxRuleForm, { props: { taxCodes: mockTaxCodes } });
		expect(screen.getByLabelText('Name *')).toBeRequired();
		expect(screen.getByLabelText('Tax Code *')).toBeRequired();
	});

	test('entity type defaults to item', () => {
		render(TaxRuleForm, { props: { taxCodes: mockTaxCodes } });
		expect(screen.getByLabelText('Entity Type')).toHaveValue('item');
	});

	test('priority defaults to 1', () => {
		render(TaxRuleForm, { props: { taxCodes: mockTaxCodes } });
		expect(screen.getByLabelText('Priority')).toHaveValue(1);
	});

	test('active checkbox is checked by default', () => {
		render(TaxRuleForm, { props: { taxCodes: mockTaxCodes } });
		expect(screen.getByLabelText('Active')).toBeChecked();
	});

	test('prefills fields from rule prop', () => {
		render(TaxRuleForm, {
			props: {
				rule: {
					name: 'Standard VAT Rule',
					description: 'Applies to all items',
					priority: 5,
					taxCodeId: 'tc-1',
					entityType: 'customer',
					isActive: false,
				},
				taxCodes: mockTaxCodes,
			},
		});
		expect(screen.getByLabelText('Name *')).toHaveValue('Standard VAT Rule');
		expect(screen.getByLabelText('Description')).toHaveValue('Applies to all items');
		expect(screen.getByLabelText('Priority')).toHaveValue(5);
		expect(screen.getByLabelText('Tax Code *')).toHaveValue('tc-1');
		expect(screen.getByLabelText('Entity Type')).toHaveValue('customer');
		expect(screen.getByLabelText('Active')).not.toBeChecked();
	});
});

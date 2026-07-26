import { render, screen } from '@testing-library/svelte';
import { userEvent } from '@testing-library/user-event';
import { expect, test, describe } from 'vitest';
import TaxRateForm from './TaxRateForm.svelte';

const mockTaxCodes = [
	{ id: 'tc-1', code: 'VAT', name: 'Value Added Tax' },
	{ id: 'tc-2', code: 'GST', name: 'Goods & Services Tax' },
];

describe('TaxRateForm', () => {
	test('renders tax code select with options', () => {
		render(TaxRateForm, { props: { taxCodes: mockTaxCodes } });

		const select = screen.getByLabelText('Tax Code *');
		expect(select).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'Select tax code' })).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'VAT - Value Added Tax' })).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'GST - Goods & Services Tax' })).toBeInTheDocument();
	});

	test('renders rate field', () => {
		render(TaxRateForm, { props: { taxCodes: mockTaxCodes } });
		expect(screen.getByLabelText('Rate *')).toBeInTheDocument();
	});

	test('renders effective date field', () => {
		render(TaxRateForm, { props: { taxCodes: mockTaxCodes } });
		expect(screen.getByLabelText('Effective Date *')).toBeInTheDocument();
	});

	test('renders expiry date field', () => {
		render(TaxRateForm, { props: { taxCodes: mockTaxCodes } });
		expect(screen.getByLabelText('Expiry Date')).toBeInTheDocument();
	});

	test('renders description textarea', () => {
		render(TaxRateForm, { props: { taxCodes: mockTaxCodes } });
		expect(screen.getByLabelText('Description')).toBeInTheDocument();
	});

	test('renders submit button with Create Tax Rate text', () => {
		render(TaxRateForm, { props: { taxCodes: mockTaxCodes } });
		expect(screen.getByRole('button', { name: 'Create Tax Rate' })).toBeInTheDocument();
	});

	test('renders cancel link', () => {
		render(TaxRateForm, { props: { taxCodes: mockTaxCodes } });
		const cancelLink = screen.getByRole('link', { name: 'Cancel' });
		expect(cancelLink).toHaveAttribute('href', '/tax/rates');
	});

	test('form has POST method', () => {
		const { container } = render(TaxRateForm, { props: { taxCodes: mockTaxCodes } });
		expect(container.querySelector('form')).toHaveAttribute('method', 'POST');
	});

	test('required fields are marked required', () => {
		render(TaxRateForm, { props: { taxCodes: mockTaxCodes } });
		expect(screen.getByLabelText('Tax Code *')).toBeRequired();
		expect(screen.getByLabelText('Rate *')).toBeRequired();
		expect(screen.getByLabelText('Effective Date *')).toBeRequired();
	});

	test('rate field has step of 0.0001', () => {
		render(TaxRateForm, { props: { taxCodes: mockTaxCodes } });
		expect(screen.getByLabelText('Rate *')).toHaveAttribute('step', '0.0001');
	});

	test('prefills fields from taxRate prop', () => {
		render(TaxRateForm, {
			props: {
				taxRate: {
					taxCodeId: 'tc-1',
					rate: '0.15',
					effectiveDate: '2026-01-01',
					expiryDate: '2026-12-31',
					description: 'Standard VAT rate',
				},
				taxCodes: mockTaxCodes,
			},
		});
		expect(screen.getByLabelText('Tax Code *')).toHaveValue('tc-1');
		expect(screen.getByLabelText('Rate *')).toHaveValue(0.15);
		expect(screen.getByLabelText('Effective Date *')).toHaveValue('2026-01-01');
		expect(screen.getByLabelText('Expiry Date')).toHaveValue('2026-12-31');
		expect(screen.getByLabelText('Description')).toHaveValue('Standard VAT rate');
	});
});

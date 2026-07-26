import { render, screen } from '@testing-library/svelte';
import { userEvent } from '@testing-library/user-event';
import { expect, test, describe } from 'vitest';
import TaxCodeForm from './TaxCodeForm.svelte';

describe('TaxCodeForm', () => {
	test('renders code field', () => {
		render(TaxCodeForm);
		expect(screen.getByLabelText('Code *')).toBeInTheDocument();
	});

	test('renders name field', () => {
		render(TaxCodeForm);
		expect(screen.getByLabelText('Name *')).toBeInTheDocument();
	});

	test('renders type select with correct options', () => {
		render(TaxCodeForm);

		expect(screen.getByRole('option', { name: 'Sales Tax' })).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'VAT' })).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'GST' })).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'Excise' })).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'Withholding' })).toBeInTheDocument();
	});

	test('renders posting rule select with correct options', () => {
		render(TaxCodeForm);

		expect(screen.getByRole('option', { name: 'Output Liability' })).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'Input Asset' })).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'Expense' })).toBeInTheDocument();
	});

	test('renders GL Account ID field', () => {
		render(TaxCodeForm);
		expect(screen.getByLabelText('GL Account ID *')).toBeInTheDocument();
	});

	test('renders description textarea', () => {
		render(TaxCodeForm);
		expect(screen.getByLabelText('Description')).toBeInTheDocument();
	});

	test('renders is claimable checkbox', () => {
		render(TaxCodeForm);
		expect(screen.getByLabelText('Is Claimable')).toBeInTheDocument();
	});

	test('renders submit button with Create Tax Code text', () => {
		render(TaxCodeForm);
		expect(screen.getByRole('button', { name: 'Create Tax Code' })).toBeInTheDocument();
	});

	test('renders cancel link', () => {
		render(TaxCodeForm);
		const cancelLink = screen.getByRole('link', { name: 'Cancel' });
		expect(cancelLink).toHaveAttribute('href', '/tax/codes');
	});

	test('form has POST method', () => {
		const { container } = render(TaxCodeForm);
		expect(container.querySelector('form')).toHaveAttribute('method', 'POST');
	});

	test('required fields are marked required', () => {
		render(TaxCodeForm);
		expect(screen.getByLabelText('Code *')).toBeRequired();
		expect(screen.getByLabelText('Name *')).toBeRequired();
		expect(screen.getByLabelText('GL Account ID *')).toBeRequired();
	});

	test('type defaults to sales_tax', () => {
		render(TaxCodeForm);
		expect(screen.getByLabelText('Type *')).toHaveValue('sales_tax');
	});

	test('posting rule defaults to output_liability', () => {
		render(TaxCodeForm);
		expect(screen.getByLabelText('Posting Rule')).toHaveValue('output_liability');
	});

	test('code field has maxlength of 20', () => {
		render(TaxCodeForm);
		expect(screen.getByLabelText('Code *')).toHaveAttribute('maxlength', '20');
	});

	test('name field has maxlength of 100', () => {
		render(TaxCodeForm);
		expect(screen.getByLabelText('Name *')).toHaveAttribute('maxlength', '100');
	});
});

import { render, screen } from '@testing-library/svelte';
import { userEvent } from '@testing-library/user-event';
import { expect, test, describe } from 'vitest';
import FiscalYearForm from './FiscalYearForm.svelte';

describe('FiscalYearForm', () => {
	test('renders year name field', () => {
		render(FiscalYearForm);
		const name = screen.getByLabelText('Year Name *');
		expect(name).toBeInTheDocument();
		expect(name).toBeRequired();
	});

	test('renders start date field', () => {
		render(FiscalYearForm);
		const startDate = screen.getByLabelText('Start Date *');
		expect(startDate).toBeInTheDocument();
		expect(startDate).toHaveAttribute('type', 'date');
		expect(startDate).toBeRequired();
	});

	test('renders end date field', () => {
		render(FiscalYearForm);
		const endDate = screen.getByLabelText('End Date *');
		expect(endDate).toBeInTheDocument();
		expect(endDate).toHaveAttribute('type', 'date');
		expect(endDate).toBeRequired();
	});

	test('form has POST method', () => {
		const { container } = render(FiscalYearForm);
		expect(container.querySelector('form')).toHaveAttribute('method', 'POST');
	});

	test('submit button shows Create Fiscal Year for new year', () => {
		render(FiscalYearForm);
		expect(screen.getByRole('button', { name: 'Create Fiscal Year' })).toBeInTheDocument();
	});

	test('submit button shows Update Fiscal Year in edit mode', () => {
		render(FiscalYearForm, {
			props: { fiscalYear: { name: 'FY 2026', startDate: '2026-01-01', endDate: '2026-12-31' } },
		});
		expect(screen.getByRole('button', { name: 'Update Fiscal Year' })).toBeInTheDocument();
	});

	test('cancel link points to fiscal years list', () => {
		render(FiscalYearForm);
		expect(screen.getByRole('link', { name: 'Cancel' })).toHaveAttribute('href', '/financial/fiscal-years');
	});

	test('prefills fields from fiscalYear prop', () => {
		render(FiscalYearForm, {
			props: { fiscalYear: { name: 'FY 2026', startDate: '2026-01-01', endDate: '2026-12-31' } },
		});
		expect(screen.getByLabelText('Year Name *')).toHaveValue('FY 2026');
		expect(screen.getByLabelText('Start Date *')).toHaveValue('2026-01-01');
		expect(screen.getByLabelText('End Date *')).toHaveValue('2026-12-31');
	});

	test('displays error messages', () => {
		render(FiscalYearForm, {
			props: { errors: { name: ['Name is required'] } },
		});
		expect(screen.getByText('Name is required')).toBeInTheDocument();
	});
});

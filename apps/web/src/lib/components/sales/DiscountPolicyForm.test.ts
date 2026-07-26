import { render, screen } from '@testing-library/svelte';
import { userEvent } from '@testing-library/user-event';
import { expect, test, describe } from 'vitest';
import DiscountPolicyForm from './DiscountPolicyForm.svelte';

describe('DiscountPolicyForm', () => {
	test('renders name field', () => {
		render(DiscountPolicyForm);
		expect(screen.getByLabelText('Name *')).toBeInTheDocument();
	});

	test('renders type select with correct options', () => {
		render(DiscountPolicyForm);
		const select = screen.getByLabelText('Type *');
		expect(select).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'Percentage' })).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'Fixed Amount' })).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'Tiered' })).toBeInTheDocument();
	});

	test('renders value field', () => {
		render(DiscountPolicyForm);
		expect(screen.getByLabelText('Value *')).toBeInTheDocument();
	});

	test('renders start date field', () => {
		render(DiscountPolicyForm);
		expect(screen.getByLabelText('Start Date *')).toBeInTheDocument();
	});

	test('renders end date field', () => {
		render(DiscountPolicyForm);
		expect(screen.getByLabelText('End Date')).toBeInTheDocument();
	});

	test('renders active checkbox', () => {
		render(DiscountPolicyForm);
		expect(screen.getByLabelText('Active')).toBeInTheDocument();
	});

	test('renders submit button with Create Policy text', () => {
		render(DiscountPolicyForm);
		expect(screen.getByRole('button', { name: 'Create Policy' })).toBeInTheDocument();
	});

	test('renders cancel link', () => {
		render(DiscountPolicyForm);
		const cancelLink = screen.getByRole('link', { name: 'Cancel' });
		expect(cancelLink).toHaveAttribute('href', '/sales/discount-policies');
	});

	test('form has POST method', () => {
		const { container } = render(DiscountPolicyForm);
		expect(container.querySelector('form')).toHaveAttribute('method', 'POST');
	});

	test('type select defaults to percentage', () => {
		render(DiscountPolicyForm);
		expect(screen.getByLabelText('Type *')).toHaveValue('percentage');
	});

	test('active checkbox is checked by default', () => {
		render(DiscountPolicyForm);
		expect(screen.getByLabelText('Active')).toBeChecked();
	});

	test('prefills fields from policy prop', () => {
		render(DiscountPolicyForm, {
			props: {
				policy: {
					name: 'Summer Sale',
					type: 'fixed_amount',
					value: '50',
					startDate: '2026-06-01',
					endDate: '2026-08-31',
					isActive: false,
				},
			},
		});
		expect(screen.getByLabelText('Name *')).toHaveValue('Summer Sale');
		expect(screen.getByLabelText('Type *')).toHaveValue('fixed_amount');
		expect(screen.getByLabelText('Value *')).toHaveValue(50);
		expect(screen.getByLabelText('Start Date *')).toHaveValue('2026-06-01');
		expect(screen.getByLabelText('End Date')).toHaveValue('2026-08-31');
		expect(screen.getByLabelText('Active')).not.toBeChecked();
	});

	test('name field is required', () => {
		render(DiscountPolicyForm);
		expect(screen.getByLabelText('Name *')).toBeRequired();
	});

	test('value field is required', () => {
		render(DiscountPolicyForm);
		expect(screen.getByLabelText('Value *')).toBeRequired();
	});

	test('start date field is required', () => {
		render(DiscountPolicyForm);
		expect(screen.getByLabelText('Start Date *')).toBeRequired();
	});
});

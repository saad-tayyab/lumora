import { render, screen } from '@testing-library/svelte';
import { userEvent } from '@testing-library/user-event';
import { expect, test, describe } from 'vitest';
import AdjustmentForm from './AdjustmentForm.svelte';

const mockAssets = [
	{ id: 'asset-1', name: 'Dell Laptop', assetNumber: 'AST-001' },
	{ id: 'asset-2', name: 'Office Desk', assetNumber: 'AST-002' },
];

describe('AdjustmentForm', () => {
	test('renders asset select with options', () => {
		render(AdjustmentForm, { props: { assets: mockAssets } });

		const select = screen.getByLabelText('Asset *');
		expect(select).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'Select asset' })).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'AST-001 - Dell Laptop' })).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'AST-002 - Office Desk' })).toBeInTheDocument();
	});

	test('renders adjustment type select with correct options', () => {
		render(AdjustmentForm, { props: { assets: mockAssets } });

		expect(screen.getByRole('option', { name: 'Revaluation' })).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'Impairment' })).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'Restoration' })).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'Transfer' })).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'Reclassification' })).toBeInTheDocument();
	});

	test('renders adjustment date field', () => {
		render(AdjustmentForm, { props: { assets: mockAssets } });
		expect(screen.getByLabelText('Date *')).toBeInTheDocument();
	});

	test('renders direction select with correct options', () => {
		render(AdjustmentForm, { props: { assets: mockAssets } });

		expect(screen.getByRole('option', { name: 'Increase' })).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'Decrease' })).toBeInTheDocument();
	});

	test('renders adjustment amount field', () => {
		render(AdjustmentForm, { props: { assets: mockAssets } });
		expect(screen.getByLabelText('Amount *')).toBeInTheDocument();
	});

	test('renders revised salvage value field', () => {
		render(AdjustmentForm, { props: { assets: mockAssets } });
		expect(screen.getByLabelText('Revised Salvage Value')).toBeInTheDocument();
	});

	test('renders revised useful life field', () => {
		render(AdjustmentForm, { props: { assets: mockAssets } });
		expect(screen.getByLabelText('Revised Useful Life (mo)')).toBeInTheDocument();
	});

	test('renders description textarea', () => {
		render(AdjustmentForm, { props: { assets: mockAssets } });
		expect(screen.getByLabelText('Description *')).toBeInTheDocument();
	});

	test('renders submit button with Create Adjustment text', () => {
		render(AdjustmentForm, { props: { assets: mockAssets } });
		expect(screen.getByRole('button', { name: 'Create Adjustment' })).toBeInTheDocument();
	});

	test('renders cancel link', () => {
		render(AdjustmentForm, { props: { assets: mockAssets } });
		const cancelLink = screen.getByRole('link', { name: 'Cancel' });
		expect(cancelLink).toHaveAttribute('href', '/assets');
	});

	test('form has POST method', () => {
		const { container } = render(AdjustmentForm, { props: { assets: mockAssets } });
		expect(container.querySelector('form')).toHaveAttribute('method', 'POST');
	});

	test('required fields are marked required', () => {
		render(AdjustmentForm, { props: { assets: mockAssets } });
		expect(screen.getByLabelText('Asset *')).toBeRequired();
		expect(screen.getByLabelText('Date *')).toBeRequired();
		expect(screen.getByLabelText('Amount *')).toBeRequired();
		expect(screen.getByLabelText('Description *')).toBeRequired();
	});

	test('adjustment type defaults to revaluation', () => {
		render(AdjustmentForm, { props: { assets: mockAssets } });
		expect(screen.getByLabelText('Type *')).toHaveValue('revaluation');
	});

	test('direction defaults to increase', () => {
		render(AdjustmentForm, { props: { assets: mockAssets } });
		expect(screen.getByLabelText('Direction *')).toHaveValue('increase');
	});

	test('prefills fields from adjustment prop', () => {
		render(AdjustmentForm, {
			props: {
				adjustment: {
					assetId: 'asset-1',
					adjustmentType: 'impairment',
					adjustmentDate: '2026-06-01',
					adjustmentAmount: '500',
					direction: 'decrease',
					description: 'Value impairment',
					revisedUsefulLifeMonths: 24,
					revisedSalvageValue: '50',
				},
				assets: mockAssets,
			},
		});
		expect(screen.getByLabelText('Asset *')).toHaveValue('asset-1');
		expect(screen.getByLabelText('Type *')).toHaveValue('impairment');
		expect(screen.getByLabelText('Date *')).toHaveValue('2026-06-01');
		expect(screen.getByLabelText('Direction *')).toHaveValue('decrease');
		expect(screen.getByLabelText('Amount *')).toHaveValue(500);
		expect(screen.getByLabelText('Revised Salvage Value')).toHaveValue(50);
		expect(screen.getByLabelText('Revised Useful Life (mo)')).toHaveValue(24);
		expect(screen.getByLabelText('Description *')).toHaveValue('Value impairment');
	});
});

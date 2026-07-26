import { render, screen } from '@testing-library/svelte';
import { userEvent } from '@testing-library/user-event';
import { expect, test, describe } from 'vitest';
import ReceivingReportForm from './ReceivingReportForm.svelte';

const mockVendors = [
	{ id: 'v1', name: 'Acme Supplies' },
	{ id: 'v2', name: 'Global Parts' },
];

const mockItems = [
	{ id: 'item1', name: 'Widget', sku: 'W-001' },
	{ id: 'item2', name: 'Gadget', sku: 'G-001' },
];

describe('ReceivingReportForm', () => {
	test('renders vendor select with all vendors', () => {
		render(ReceivingReportForm, { props: { vendors: mockVendors, items: mockItems } });

		const select = screen.getByLabelText('Vendor *');
		expect(select).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'Select vendor' })).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'Acme Supplies' })).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'Global Parts' })).toBeInTheDocument();
	});

	test('vendor select is required', () => {
		render(ReceivingReportForm, { props: { vendors: mockVendors, items: mockItems } });
		expect(screen.getByLabelText('Vendor *')).toBeRequired();
	});

	test('renders PO reference field', () => {
		render(ReceivingReportForm, { props: { vendors: mockVendors, items: mockItems } });
		expect(screen.getByLabelText('PO Reference')).toBeInTheDocument();
	});

	test('renders received date field', () => {
		render(ReceivingReportForm, { props: { vendors: mockVendors, items: mockItems } });
		const date = screen.getByLabelText('Received Date *');
		expect(date).toBeInTheDocument();
		expect(date).toHaveAttribute('type', 'date');
	});

	test('renders received items section with add button', () => {
		render(ReceivingReportForm, { props: { vendors: mockVendors, items: mockItems } });
		expect(screen.getByText('Received Items')).toBeInTheDocument();
		expect(screen.getByRole('button', { name: '+ Add Item' })).toBeInTheDocument();
	});

	test('renders item select in received items', () => {
		render(ReceivingReportForm, { props: { vendors: mockVendors, items: mockItems } });
		expect(screen.getByRole('option', { name: 'W-001 - Widget' })).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'G-001 - Gadget' })).toBeInTheDocument();
	});

	test('renders condition select with options', () => {
		render(ReceivingReportForm, { props: { vendors: mockVendors, items: mockItems } });
		expect(screen.getByRole('option', { name: 'Good' })).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'Damaged' })).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'Partial' })).toBeInTheDocument();
	});

	test('renders notes textarea', () => {
		render(ReceivingReportForm, { props: { vendors: mockVendors, items: mockItems } });
		expect(screen.getByLabelText('Notes')).toBeInTheDocument();
	});

	test('form has POST method', () => {
		const { container } = render(ReceivingReportForm, { props: { vendors: mockVendors, items: mockItems } });
		expect(container.querySelector('form')).toHaveAttribute('method', 'POST');
	});

	test('submit button shows Create Receiving Report', () => {
		render(ReceivingReportForm, { props: { vendors: mockVendors, items: mockItems } });
		expect(screen.getByRole('button', { name: 'Create Receiving Report' })).toBeInTheDocument();
	});

	test('cancel link points to receiving reports list', () => {
		render(ReceivingReportForm, { props: { vendors: mockVendors, items: mockItems } });
		expect(screen.getByRole('link', { name: 'Cancel' })).toHaveAttribute('href', '/proc/receiving-reports');
	});
});

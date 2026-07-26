import { render, screen } from '@testing-library/svelte';
import { expect, test, describe } from 'vitest';
import AuditLogDetail from './AuditLogDetail.svelte';
import type { AuditLogEntry } from '$lib/types';

const mockEntry: AuditLogEntry = {
	id: 'audit-1',
	createdAt: '2026-07-25T10:30:00Z',
	userId: 'user-1',
	tenantId: 't-1',
	action: 'update',
	resource: 'invoice',
	resourceId: 'inv-1',
	oldValues: { status: 'draft', totalAmount: '1000' },
	newValues: { status: 'sent', totalAmount: '1500' },
	ipAddress: '127.0.0.1',
	userAgent: 'Mozilla/5.0',
	metadata: { reason: 'Updated amount' },
};

describe('AuditLogDetail', () => {
	test('renders Values Diff heading', () => {
		render(AuditLogDetail, { props: { entry: mockEntry } });
		expect(screen.getByText('Values Diff')).toBeInTheDocument();
	});

	test('renders diff table headers', () => {
		render(AuditLogDetail, { props: { entry: mockEntry } });
		expect(screen.getByText('Field')).toBeInTheDocument();
		expect(screen.getByText('Old Value')).toBeInTheDocument();
		expect(screen.getByText('New Value')).toBeInTheDocument();
	});

	test('renders all fields from old and new values', () => {
		render(AuditLogDetail, { props: { entry: mockEntry } });
		expect(screen.getByText('status')).toBeInTheDocument();
		expect(screen.getByText('totalAmount')).toBeInTheDocument();
	});

	test('renders old values correctly', () => {
		render(AuditLogDetail, { props: { entry: mockEntry } });
		expect(screen.getByText('draft')).toBeInTheDocument();
		expect(screen.getByText('1000')).toBeInTheDocument();
	});

	test('renders new values correctly', () => {
		render(AuditLogDetail, { props: { entry: mockEntry } });
		expect(screen.getByText('sent')).toBeInTheDocument();
		expect(screen.getByText('1500')).toBeInTheDocument();
	});

	test('renders metadata section when metadata exists', () => {
		render(AuditLogDetail, { props: { entry: mockEntry } });
		expect(screen.getByText('Metadata')).toBeInTheDocument();
		expect(screen.getByText(/Updated amount/)).toBeInTheDocument();
	});

	test('shows no values message when old and new values are empty', () => {
		const emptyEntry: AuditLogEntry = {
			...mockEntry,
			oldValues: null,
			newValues: null,
		};
		render(AuditLogDetail, { props: { entry: emptyEntry } });
		expect(screen.getByText('No old or new values recorded')).toBeInTheDocument();
	});

	test('handles empty object values', () => {
		const emptyObjEntry: AuditLogEntry = {
			...mockEntry,
			oldValues: {},
			newValues: {},
		};
		render(AuditLogDetail, { props: { entry: emptyObjEntry } });
		expect(screen.getByText('No old or new values recorded')).toBeInTheDocument();
	});

	test('handles object values in diff', () => {
		const objEntry: AuditLogEntry = {
			...mockEntry,
			oldValues: { metadata: { key: 'value' } },
			newValues: { metadata: { key: 'new-value' } },
		};
		render(AuditLogDetail, { props: { entry: objEntry } });
		expect(screen.getByText('metadata')).toBeInTheDocument();
	});

	test('does not render metadata section when metadata is null', () => {
		const noMetaEntry: AuditLogEntry = {
			...mockEntry,
			metadata: null,
		};
		render(AuditLogDetail, { props: { entry: noMetaEntry } });
		expect(screen.queryByText('Metadata')).not.toBeInTheDocument();
	});
});

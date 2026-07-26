import { render, screen } from '@testing-library/svelte';
import { expect, test, describe } from 'vitest';
import InvoiceStatusBadge from './InvoiceStatusBadge.svelte';

describe('InvoiceStatusBadge', () => {
  test('renders draft status with gray styling', () => {
    render(InvoiceStatusBadge, { props: { status: 'draft' } });
    const badge = screen.getByText('draft');
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain('bg-gray-100');
    expect(badge.className).toContain('text-gray-800');
  });

  test('renders sent status with blue styling', () => {
    render(InvoiceStatusBadge, { props: { status: 'sent' } });
    const badge = screen.getByText('sent');
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain('bg-blue-100');
    expect(badge.className).toContain('text-blue-800');
  });

  test('renders paid status with green styling', () => {
    render(InvoiceStatusBadge, { props: { status: 'paid' } });
    const badge = screen.getByText('paid');
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain('bg-green-100');
    expect(badge.className).toContain('text-green-800');
  });

  test('renders overdue status with red styling', () => {
    render(InvoiceStatusBadge, { props: { status: 'overdue' } });
    const badge = screen.getByText('overdue');
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain('bg-red-100');
    expect(badge.className).toContain('text-red-800');
  });

  test('renders voided status with gray styling', () => {
    render(InvoiceStatusBadge, { props: { status: 'voided' } });
    const badge = screen.getByText('voided');
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain('bg-gray-100');
    expect(badge.className).toContain('text-gray-800');
  });
});

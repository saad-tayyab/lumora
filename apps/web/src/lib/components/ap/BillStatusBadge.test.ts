import { render, screen } from '@testing-library/svelte';
import { expect, test, describe } from 'vitest';
import BillStatusBadge from './BillStatusBadge.svelte';

describe('BillStatusBadge', () => {
  test('renders draft status with gray styling', () => {
    render(BillStatusBadge, { props: { status: 'draft' } });
    const badge = screen.getByText('draft');
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain('bg-gray-100');
    expect(badge.className).toContain('text-gray-800');
  });

  test('renders pending approval status with yellow styling', () => {
    render(BillStatusBadge, { props: { status: 'pending_approval' } });
    const badge = screen.getByText('pending approval');
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain('bg-yellow-100');
    expect(badge.className).toContain('text-yellow-800');
  });

  test('renders approved status with blue styling', () => {
    render(BillStatusBadge, { props: { status: 'approved' } });
    const badge = screen.getByText('approved');
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain('bg-blue-100');
    expect(badge.className).toContain('text-blue-800');
  });

  test('renders partially paid status with orange styling', () => {
    render(BillStatusBadge, { props: { status: 'partially_paid' } });
    const badge = screen.getByText('partially paid');
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain('bg-orange-100');
    expect(badge.className).toContain('text-orange-800');
  });

  test('renders paid status with green styling', () => {
    render(BillStatusBadge, { props: { status: 'paid' } });
    const badge = screen.getByText('paid');
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain('bg-green-100');
    expect(badge.className).toContain('text-green-800');
  });

  test('renders voided status with gray styling', () => {
    render(BillStatusBadge, { props: { status: 'voided' } });
    const badge = screen.getByText('voided');
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain('bg-gray-100');
    expect(badge.className).toContain('text-gray-800');
  });
});

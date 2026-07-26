import { render, screen, fireEvent } from '@testing-library/svelte';
import { expect, test, describe, vi } from 'vitest';
import JournalEntryLines from './JournalEntryLines.svelte';

const accounts = [
  { id: 'acc1', code: '1000', name: 'Cash', type: 'asset', parentId: null, balance: '0', isActive: true, description: null, tenantId: 't1', createdAt: '', updatedAt: '' },
  { id: 'acc2', code: '2000', name: 'Revenue', type: 'revenue', parentId: null, balance: '0', isActive: true, description: null, tenantId: 't1', createdAt: '', updatedAt: '' },
] as any;

const emptyLine = {
  id: '',
  journalEntryId: '',
  accountId: '',
  description: '',
  debit: '0',
  credit: '0',
  sortOrder: 0,
  createdAt: '',
  updatedAt: '',
};

describe('JournalEntryLines', () => {
  test('renders empty state with two default lines', () => {
    render(JournalEntryLines, {
      props: { lines: [emptyLine, emptyLine], accounts, onChange: vi.fn() },
    });
    expect(screen.getAllByDisplayValue('0')).toHaveLength(4);
  });

  test('renders account select with account options', () => {
    render(JournalEntryLines, {
      props: { lines: [emptyLine, emptyLine], accounts, onChange: vi.fn() },
    });
    expect(screen.getAllByText('1000 - Cash').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('2000 - Revenue').length).toBeGreaterThanOrEqual(1);
  });

  test('calls onChange with new line when Add Line is clicked', async () => {
    const onChange = vi.fn();
    render(JournalEntryLines, {
      props: { lines: [emptyLine, emptyLine], accounts, onChange },
    });

    const addBtn = screen.getByText('+ Add Line');
    await fireEvent.click(addBtn);

    expect(onChange).toHaveBeenCalledTimes(1);
    const newLines = onChange.mock.calls[0][0];
    expect(newLines).toHaveLength(3);
  });

  test('calls onChange without removed line when remove is clicked', async () => {
    const onChange = vi.fn();
    const lines = [
      { ...emptyLine, accountId: 'acc1', sortOrder: 0 },
      { ...emptyLine, accountId: 'acc2', sortOrder: 1 },
      { ...emptyLine, accountId: 'acc1', sortOrder: 2 },
    ];
    render(JournalEntryLines, { props: { lines, accounts, onChange } });

    const removeBtn = screen.getAllByLabelText('Remove line')[0];
    await fireEvent.click(removeBtn);

    expect(onChange).toHaveBeenCalledTimes(1);
    const remaining = onChange.mock.calls[0][0];
    expect(remaining).toHaveLength(2);
  });

  test('does not show remove button when only two lines', () => {
    render(JournalEntryLines, {
      props: { lines: [emptyLine, emptyLine], accounts, onChange: vi.fn() },
    });
    expect(screen.queryByLabelText('Remove line')).not.toBeInTheDocument();
  });

  test('renders debit and credit input fields for each line', () => {
    render(JournalEntryLines, {
      props: { lines: [emptyLine, emptyLine], accounts, onChange: vi.fn() },
    });
    expect(screen.getByText('Debit')).toBeInTheDocument();
    expect(screen.getByText('Credit')).toBeInTheDocument();
  });

  test('renders description field for each line', () => {
    render(JournalEntryLines, {
      props: { lines: [emptyLine, emptyLine], accounts, onChange: vi.fn() },
    });
    const descriptionInputs = screen.getAllByDisplayValue('');
    expect(descriptionInputs.length).toBeGreaterThanOrEqual(2);
  });
});

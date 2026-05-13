import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PageSizeSelector from '@/components/PageSizeSelector';

describe('PageSizeSelector', () => {
  it('reflects the current page size as the selected option', () => {
    render(<PageSizeSelector pageSize={100} onChange={() => {}} />);
    expect((screen.getByRole('combobox') as HTMLSelectElement).value).toBe('100');
  });

  it('calls onChange with a number for numeric options', async () => {
    const onChange = vi.fn();
    render(<PageSizeSelector pageSize={50} onChange={onChange} />);
    const user = userEvent.setup();
    await user.selectOptions(screen.getByRole('combobox'), '200');
    expect(onChange).toHaveBeenCalledWith(200);
  });

  it('calls onChange with Infinity for the ALL option', async () => {
    const onChange = vi.fn();
    render(<PageSizeSelector pageSize={50} onChange={onChange} />);
    const user = userEvent.setup();
    await user.selectOptions(screen.getByRole('combobox'), 'all');
    expect(onChange).toHaveBeenCalledWith(Infinity);
  });
});

import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ViewModeToggle from '@/components/ViewModeToggle';

describe('ViewModeToggle', () => {
  it('advertises switching to list when in grid view', () => {
    render(<ViewModeToggle view="grid" onToggle={() => {}} />);
    expect(screen.getByRole('button')).toHaveAccessibleName(/switch to list view/i);
  });

  it('advertises switching to grid when in list view', () => {
    render(<ViewModeToggle view="list" onToggle={() => {}} />);
    expect(screen.getByRole('button')).toHaveAccessibleName(/switch to grid view/i);
  });

  it('calls onToggle when clicked', async () => {
    const onToggle = vi.fn();
    render(<ViewModeToggle view="grid" onToggle={onToggle} />);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button'));
    expect(onToggle).toHaveBeenCalledOnce();
  });
});

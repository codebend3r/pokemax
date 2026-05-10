import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ShinyToggle from '../components/ShinyToggle';

describe('ShinyToggle', () => {
  it('marks NORMAL pressed when value is false', () => {
    render(<ShinyToggle value={false} onChange={() => {}} />);
    expect(screen.getByRole('button', { name: /normal/i })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: /shiny/i })).toHaveAttribute('aria-pressed', 'false');
  });

  it('calls onChange(true) when SHINY is clicked', async () => {
    const onChange = vi.fn();
    render(<ShinyToggle value={false} onChange={onChange} />);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /shiny/i }));
    expect(onChange).toHaveBeenCalledWith(true);
  });
});

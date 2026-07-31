import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import Section from '@/components/Section';

describe('Section onToggle', () => {
  it('reports open state changes', async () => {
    const spy = vi.fn();
    render(
      <Section label="HOW TO OBTAIN" defaultOpen={false} onToggle={spy}>
        <div>body</div>
      </Section>,
    );
    await userEvent.click(screen.getByText('HOW TO OBTAIN'));
    expect(spy).toHaveBeenCalledWith(true);
  });
});

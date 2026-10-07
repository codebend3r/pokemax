import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import StatusLine from '@/components/StatusLine';

describe('StatusLine', () => {
  it('keeps an empty live region while ready', () => {
    render(<StatusLine state="ready" />);
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
  });

  it('puts scanning and error text in the same live region', () => {
    const { rerender } = render(<StatusLine state="scanning" />);
    const status = screen.getByRole('status');
    expect(status).toHaveTextContent('SCANNING');
    rerender(<StatusLine state="err-api" />);
    expect(screen.getByRole('status')).toBe(status);
    expect(status).toHaveTextContent('ERR: TRANSMISSION LOST');
  });
});

import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ShareButton from '@/components/ShareButton';

describe('ShareButton', () => {
  it('starts with a quiet status region', () => {
    render(<ShareButton selected={null} />);
    expect(screen.getByRole('button', { name: 'SHARE' })).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
  });

  it('announces the copied link', async () => {
    render(<ShareButton selected="pikachu" />);
    // `setup()` installs a clipboard stub; jsdom has no `navigator.share`.
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'SHARE' }));
    expect(screen.getByRole('status')).toHaveTextContent('Link copied');
    expect(screen.getByRole('button', { name: 'COPIED' })).toBeInTheDocument();
  });
});

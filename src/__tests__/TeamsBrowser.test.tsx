import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TeamsBrowser from '@/components/TeamsBrowser';

describe('TeamsBrowser', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('renders every region collapsed by default', () => {
    render(<TeamsBrowser onSelectPokemon={() => {}} />);
    expect(screen.getByRole('button', { name: /^[▼▶]KANTO$/ })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
    expect(screen.queryByText('Red / Blue')).not.toBeInTheDocument();
  });

  it('expands and re-collapses a region via its heading', async () => {
    render(<TeamsBrowser onSelectPokemon={() => {}} />);
    const user = userEvent.setup();
    const kanto = screen.getByRole('button', { name: /^[▼▶]KANTO$/ });
    await user.click(kanto);
    expect(kanto).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Red / Blue')).toBeInTheDocument();
    await user.click(kanto);
    expect(screen.queryByText('Red / Blue')).not.toBeInTheDocument();
  });

  it('expand all shows every roster; collapse all hides them again', async () => {
    render(<TeamsBrowser onSelectPokemon={() => {}} />);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /expand all/i }));
    expect(screen.getByText('Red / Blue')).toBeInTheDocument();
    expect(screen.getByText('Scarlet / Violet')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /collapse all/i }));
    expect(screen.queryByText('Red / Blue')).not.toBeInTheDocument();
    expect(screen.queryByText('Scarlet / Violet')).not.toBeInTheDocument();
  });

  it('remembers expanded regions across remounts via localStorage', async () => {
    const { unmount } = render(<TeamsBrowser onSelectPokemon={() => {}} />);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /^[▼▶]KANTO$/ }));
    unmount();
    render(<TeamsBrowser onSelectPokemon={() => {}} />);
    expect(screen.getByRole('button', { name: /^[▼▶]KANTO$/ })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    expect(screen.getByText('Red / Blue')).toBeInTheDocument();
    expect(screen.queryByText('Gold / Silver')).not.toBeInTheDocument();
  });

  it('an active search shows matches inside collapsed regions', async () => {
    render(<TeamsBrowser onSelectPokemon={() => {}} />);
    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/search game or species/i), 'charizard');
    expect(screen.getByText('Red / Blue')).toBeInTheDocument();
  });
});

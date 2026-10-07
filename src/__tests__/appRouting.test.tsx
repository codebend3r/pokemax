import { render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Router } from 'wouter';
import { memoryLocation } from 'wouter/memory-location';
import App from '@/App';

function renderAt(path: string) {
  const location = memoryLocation({ path, record: true });
  render(
    <Router hook={location.hook} searchHook={location.searchHook}>
      <App />
    </Router>,
  );
  return location;
}

const last = (history: string[]) => history[history.length - 1];

describe('App routing', () => {
  beforeEach(() => {
    // Keep every data fetch pending — these tests are about routing only.
    vi.stubGlobal(
      'fetch',
      vi.fn(() => new Promise(() => {})),
    );
    vi.stubGlobal('matchMedia', () => ({ matches: false }));
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('sends `/` to the Pokédex', async () => {
    const location = renderAt('/');
    await waitFor(() => expect(last(location.history)).toBe('/pokedex'));
  });

  it('honours pre-routing `/?p=` links', async () => {
    const location = renderAt('/?p=Charizard');
    await waitFor(() => expect(last(location.history)).toBe('/pokedex/charizard'));
  });

  it('marks the link for the current section, including detail routes', () => {
    renderAt('/trainers/rb-brock');
    const nav = screen.getByRole('navigation', { name: 'Sections' });
    expect(within(nav).getByRole('link', { name: 'TRAINERS' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(within(nav).getByRole('link', { name: 'POKÉDEX' })).not.toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('gives each page a single level-1 heading', async () => {
    renderAt('/teams');
    expect(await screen.findByRole('heading', { level: 1, name: 'Teams' })).toBeInTheDocument();
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
  });
});

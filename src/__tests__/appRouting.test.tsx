import { render, screen, waitFor } from '@testing-library/react';
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

  it('marks the tab for the current mode, including detail routes', () => {
    renderAt('/trainers/rb-brock');
    expect(screen.getByRole('tab', { name: 'TRAINERS' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: 'POKÉDEX' })).toHaveAttribute('aria-selected', 'false');
  });
});

import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchBar from '@/components/SearchBar';

const NAMES = ['scorbunny', 'cinderace', 'dragapult', 'grookey'];

function Harness({ onSearch }: { onSearch: (name: string) => void }) {
  const [v, setV] = useState('');
  return <SearchBar names={NAMES} value={v} onValueChange={setV} onSearch={onSearch} />;
}

describe('SearchBar', () => {
  it('passes typed value to onValueChange', async () => {
    let last = '';
    function Capture() {
      const [v, setV] = useState('');
      last = v;
      return <SearchBar names={NAMES} value={v} onValueChange={setV} onSearch={() => {}} />;
    }
    render(<Capture />);
    const user = userEvent.setup();
    await user.type(screen.getByRole('textbox'), 'sc');
    expect(last).toBe('sc');
  });

  it('calls onSearch with the typed name on Enter', async () => {
    const onSearch = vi.fn();
    render(<Harness onSearch={onSearch} />);
    const user = userEvent.setup();
    await user.type(screen.getByRole('textbox'), 'dragapult{Enter}');
    expect(onSearch).toHaveBeenCalledWith('dragapult');
  });

  it('clears the input on Escape', async () => {
    function Capture() {
      const [v, setV] = useState('cinderace');
      return (
        <>
          <SearchBar names={NAMES} value={v} onValueChange={setV} onSearch={() => {}} />
          <output data-testid="value">{v}</output>
        </>
      );
    }
    render(<Capture />);
    const user = userEvent.setup();
    await user.click(screen.getByRole('textbox'));
    await user.keyboard('{Escape}');
    expect(screen.getByTestId('value')).toHaveTextContent('');
  });
});

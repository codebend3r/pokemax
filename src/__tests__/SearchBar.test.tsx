import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchBar from '../components/SearchBar';

const NAMES = ['scorbunny', 'cinderace', 'dragapult', 'grookey'];

describe('SearchBar', () => {
  it('shows autocomplete suggestions filtered by input', async () => {
    render(<SearchBar names={NAMES} onSearch={() => {}} />);
    const user = userEvent.setup();
    const input = screen.getByRole('textbox');
    await user.type(input, 'sc');
    expect(screen.getByText('scorbunny')).toBeInTheDocument();
    expect(screen.queryByText('dragapult')).not.toBeInTheDocument();
  });

  it('calls onSearch with the typed name on Enter', async () => {
    const onSearch = vi.fn();
    render(<SearchBar names={NAMES} onSearch={onSearch} />);
    const user = userEvent.setup();
    await user.type(screen.getByRole('textbox'), 'dragapult{Enter}');
    expect(onSearch).toHaveBeenCalledWith('dragapult');
  });

  it('clicking a suggestion submits it', async () => {
    const onSearch = vi.fn();
    render(<SearchBar names={NAMES} onSearch={onSearch} />);
    const user = userEvent.setup();
    await user.type(screen.getByRole('textbox'), 'cin');
    await user.click(screen.getByText('cinderace'));
    expect(onSearch).toHaveBeenCalledWith('cinderace');
  });

  it('lowercases and trims the submitted value', async () => {
    const onSearch = vi.fn();
    render(<SearchBar names={NAMES} onSearch={onSearch} />);
    const user = userEvent.setup();
    await user.type(screen.getByRole('textbox'), '  Dragapult  {Enter}');
    expect(onSearch).toHaveBeenCalledWith('dragapult');
  });
});

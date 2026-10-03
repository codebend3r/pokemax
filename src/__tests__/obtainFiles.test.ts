import { afterEach, describe, expect, it, vi } from 'vitest';
import { obtainFiles } from '@/obtain/files';

const FILE = { pokemonId: 25, name: 'pikachu', breeding: null, games: [] };

describe('obtainFiles', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('fetches public/obtain/{id}.json once per id', async () => {
    const spy = vi.fn().mockResolvedValue(new Response(JSON.stringify(FILE), { status: 200 }));
    vi.stubGlobal('fetch', spy);
    expect((await obtainFiles.get(25)).name).toBe('pikachu');
    await obtainFiles.get(25);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(String(spy.mock.calls[0][0])).toContain('obtain/25.json');
  });

  it('rejects a 404 with the status in the message', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('', { status: 404 })));
    await expect(obtainFiles.get(31337)).rejects.toThrow('404');
  });

  it('rejects a malformed file', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{"nope":1}', { status: 200 })));
    await expect(obtainFiles.get(4242)).rejects.toThrow('Malformed');
  });
});

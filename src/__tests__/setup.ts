import '@testing-library/jest-dom/vitest';

// Node 22+ ships an experimental localStorage that's empty without a
// --localstorage-file flag; that stub shadows jsdom's implementation here,
// so tests see {} instead of a working Storage. Replace it once for the
// whole suite with a tiny in-memory shim that implements the Web API.
class InMemoryStorage implements Storage {
  private store = new Map<string, string>();
  get length() {
    return this.store.size;
  }
  clear() {
    this.store.clear();
  }
  getItem(key: string) {
    return this.store.get(key) ?? null;
  }
  key(index: number) {
    return [...this.store.keys()][index] ?? null;
  }
  removeItem(key: string) {
    this.store.delete(key);
  }
  setItem(key: string, value: string) {
    this.store.set(key, String(value));
  }
}

Object.defineProperty(window, 'localStorage', {
  value: new InMemoryStorage(),
  configurable: true,
});

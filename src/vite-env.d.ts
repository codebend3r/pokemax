/// <reference types="vite/client" />

export {};

declare global {
  const __APP_VERSION__: string;

  interface Window {
    // Safari <14.1 exposes the constructor only under the vendor prefix.
    webkitAudioContext?: typeof AudioContext;
  }
}

declare module 'react' {
  interface CSSProperties {
    /** Custom properties (`--x`) that `crt.css` reads off inline styles. */
    [property: `--${string}`]: string | number | undefined;
  }
}

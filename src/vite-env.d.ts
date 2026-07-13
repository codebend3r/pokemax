/// <reference types="vite/client" />

declare const __APP_VERSION__: string;

interface Window {
  // Safari <14.1 exposes the constructor only under the vendor prefix.
  webkitAudioContext?: typeof AudioContext;
}

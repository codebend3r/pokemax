import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Router } from 'wouter';
import App from '@/App';
import './styles/crt.css';

// Strip the trailing slash so wouter's pattern matching works on `/pokedex`.
const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router base={BASE}>
      <App />
    </Router>
  </StrictMode>,
);

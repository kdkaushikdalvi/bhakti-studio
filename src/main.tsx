import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { enablePersistentStorage } from './utils/vaultPersistence';

// Prevent iOS Safari gesture/pinch zoom and accidental zoom on double taps
if (typeof window !== 'undefined') {
  document.addEventListener(
    'gesturestart',
    (e) => {
      e.preventDefault();
    },
    { passive: false }
  );

  document.addEventListener(
    'gesturechange',
    (e) => {
      e.preventDefault();
    },
    { passive: false }
  );

  document.addEventListener(
    'gestureend',
    (e) => {
      e.preventDefault();
    },
    { passive: false }
  );

  // Request durable persistent storage to protect against browser data clearing
  enablePersistentStorage().catch(() => {});

  // Register PWA Service Worker for offline capability & standalone support
  if ('serviceWorker' in navigator && !window.location.host.includes('localhost:5173')) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then((reg) => {
          console.info('[Bhakti PWA] Service Worker registered:', reg.scope);
        })
        .catch((err) => {
          console.warn('[Bhakti PWA] Service Worker registration failed:', err);
        });
    });
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);



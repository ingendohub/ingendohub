import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import './index.css';
import './styles/style.css';

import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

// ✅ Register Service Worker for PWA (offline support + installability)
serviceWorkerRegistration.register({
  onSuccess: () => console.log('✅ Ingendohub is now available offline.'),
  onUpdate: (registration) => {
    console.log('✨ New version available. Please refresh.');
    // Optionally auto-refresh: window.location.reload();
  },
});

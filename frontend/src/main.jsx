import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { notificationService } from './services/notificationService';

// Initialize Service Worker for mobile push notifications
if (typeof window !== 'undefined') {
  notificationService.registerServiceWorker();
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

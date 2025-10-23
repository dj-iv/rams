import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './print.css';
import App from './App';
import PrintView from './components/PrintView';
import reportWebVitals from './reportWebVitals';
import { signInWithCustomToken } from 'firebase/auth';
import { auth } from './firebase';

const PORTAL_BASE_URL = process.env.REACT_APP_PORTAL_URL || 'http://localhost:3000';

const buildPortalLaunchUrl = (redirectTarget) => {
  try {
    const base = new URL(PORTAL_BASE_URL);
    const launchUrl = new URL('/launch/rams', base);
    if (redirectTarget) {
      launchUrl.searchParams.set('redirect', redirectTarget);
    }
    return launchUrl.toString();
  } catch (error) {
    if (redirectTarget) {
      return `${PORTAL_BASE_URL}/launch/rams?redirect=${encodeURIComponent(redirectTarget)}`;
    }
    return `${PORTAL_BASE_URL}/launch/rams`;
  }
};

const showPortalSessionError = (title, message, suggestion) => {
  const existing = document.getElementById('portal-session-error');
  if (existing) {
    const messageNode = existing.querySelector('[data-message]');
    if (messageNode) {
      messageNode.textContent = message;
    }
    const titleNode = existing.querySelector('[data-title]');
    if (titleNode) {
      titleNode.textContent = title;
    }
    const hintNode = existing.querySelector('[data-suggestion]');
    if (hintNode) {
      hintNode.textContent = suggestion || '';
      hintNode.style.display = suggestion ? 'block' : 'none';
    } else if (suggestion) {
      const newHint = document.createElement('p');
      newHint.setAttribute('data-suggestion', '');
      newHint.textContent = suggestion;
      newHint.style.margin = '0';
      newHint.style.fontSize = '0.95rem';
      newHint.style.color = '#4b5563';
      existing.appendChild(newHint);
    }
    return;
  }

  const container = document.createElement('div');
  container.id = 'portal-session-error';
  container.setAttribute('role', 'alert');
  container.style.maxWidth = '640px';
  container.style.margin = '48px auto';
  container.style.padding = '24px';
  container.style.borderRadius = '12px';
  container.style.background = '#fff7ed';
  container.style.border = '1px solid #fed7aa';
  container.style.fontFamily = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  container.style.color = '#1f2937';
  container.style.boxShadow = '0 4px 24px rgba(15, 23, 42, 0.12)';

  const heading = document.createElement('h1');
  heading.setAttribute('data-title', '');
  heading.textContent = title;
  heading.style.margin = '0 0 12px 0';
  heading.style.fontSize = '1.5rem';
  heading.style.fontWeight = '600';

  const body = document.createElement('p');
  body.setAttribute('data-message', '');
  body.textContent = message;
  body.style.margin = '0 0 12px 0';
  body.style.lineHeight = '1.6';

  const hint = document.createElement('p');
  hint.setAttribute('data-suggestion', '');
  hint.textContent = suggestion || '';
  hint.style.margin = '0';
  hint.style.fontSize = '0.95rem';
  hint.style.color = '#4b5563';

  container.appendChild(heading);
  container.appendChild(body);
  if (suggestion) {
    container.appendChild(hint);
  }

  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = '';
  }

  document.body.appendChild(container);
};

async function ensurePortalSession() {
  const redirectTarget = window.location.href;
  try {
    const response = await fetch('/api/session', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ redirect: redirectTarget }),
    });
    const payload = await response.json().catch(() => ({}));

    if (response.status === 401) {
      const launchUrl = typeof payload.launch === 'string' ? payload.launch : buildPortalLaunchUrl(redirectTarget);
      window.location.assign(launchUrl);
      return false;
    }

    if (response.status === 404) {
      showPortalSessionError(
        'Portal session endpoint unavailable',
        'The RAMS dev API did not respond on /api/session.',
        'Start the local API with "npm run serve-api" (or "npm run dev" to start both the client and API together).',
      );
      return false;
    }

    if (!response.ok) {
      const redirectUrl = typeof payload.redirect === 'string' ? payload.redirect : buildPortalLaunchUrl(redirectTarget);
      window.location.assign(redirectUrl);
      return false;
    }

    const token = typeof payload.token === 'string' ? payload.token : null;
    if (!token) {
      throw new Error('Portal session did not return a token');
    }

    if (auth.currentUser && payload.uid && auth.currentUser.uid === payload.uid) {
      return true;
    }

    await signInWithCustomToken(auth, token);
    return true;
  } catch (error) {
    console.error('Failed to establish portal session', error);

    if (error?.name === 'TypeError' || error?.message === 'Failed to fetch') {
      showPortalSessionError(
        'Portal session request failed',
        'The browser could not reach the RAMS dev API.',
        'Ensure the dev API is running (npm run serve-api) and that the proxy target matches its port.',
      );
      return false;
    }

    window.location.assign(buildPortalLaunchUrl(redirectTarget));
    return false;
  }
}

// Expose print view renderer for the print window
window.renderPrintView = (data, allTasks) => {
  ReactDOM.createRoot(document.getElementById('print-root')).render(
    <React.StrictMode>
      <PrintView data={data} allTasks={allTasks} />
    </React.StrictMode>
  );
};

const startApp = () => {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    return;
  }

  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );

  reportWebVitals();
};

ensurePortalSession().then((hasSession) => {
  if (hasSession) {
    startApp();
  }
});

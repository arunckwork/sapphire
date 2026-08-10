'use client';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * global-error.tsx — catches errors thrown inside the root layout.
 *
 * IMPORTANT: This component must include its own <html> and <body> tags
 * because it replaces the entire root layout when active.
 * Keep this minimal — do NOT import Providers or any complex dependencies.
 */
export default function GlobalError({ error: _error, reset }: GlobalErrorProps) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          display: 'flex',
          minHeight: '100vh',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, sans-serif',
          backgroundColor: '#0f172a',
          color: '#f8fafc',
          textAlign: 'center',
          padding: '1.5rem',
        }}
      >
        <div>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🚨</div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            Critical application error
          </h1>
          <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>
            The application encountered a critical error and cannot continue.
          </p>
          <button
            onClick={reset}
            style={{
              backgroundColor: '#3b82f6',
              color: '#fff',
              border: 'none',
              borderRadius: '0.375rem',
              padding: '0.5rem 1.25rem',
              fontSize: '0.875rem',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Reload application
          </button>
        </div>
      </body>
    </html>
  );
}

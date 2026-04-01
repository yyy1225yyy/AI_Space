import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';

const AppLayout: React.FC = () => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-base)' }}>
      <Header />
      <main
        style={{
          flex: 1,
          maxWidth: 'var(--content-max-width)',
          width: '100%',
          margin: '0 auto',
          padding: '32px 40px',
        }}
      >
        <Outlet />
      </main>
      {/* Footer */}
      <footer
        style={{
          background: 'var(--bg-surface)',
          borderTop: '1px solid var(--border)',
          padding: '24px 40px',
          textAlign: 'center',
        }}
      >
        <p style={{ color: 'var(--text-tertiary)', fontSize: 13 }}>
          &copy; 2026 AI广场 — ERP行业AI知识分享社区
        </p>
      </footer>
    </div>
  );
};

export default AppLayout;

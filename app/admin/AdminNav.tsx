'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navLinkStyle = {
  display: 'block',
  padding: '10px 12px',
  color: '#0b0c0c',
  textDecoration: 'none',
  fontSize: '14px',
  borderRadius: '3px',
  marginBottom: '2px',
};

const activeStyle = {
  ...navLinkStyle,
  backgroundColor: '#f3f2f1',
  borderLeft: '3px solid #1d70b8',
  fontWeight: '500',
};

interface AdminNavProps {
  // can pass if needed
}

export default function AdminNav({}: AdminNavProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin' || pathname === '/admin/';
    }
    return pathname.startsWith(href);
  };

  return (
    <nav
      style={{
        width: '220px',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        paddingTop: '8px',
      }}
      aria-label="Admin navigation"
    >
      <div style={{ fontSize: '11px', fontWeight: '600', color: '#505a5f', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', paddingLeft: '8px' }}>
        Menu
      </div>

      <Link
        href="/admin"
        style={isActive('/admin') ? activeStyle : navLinkStyle}
      >
        Dashboard
      </Link>
      <Link
        href="/admin/institutions"
        style={isActive('/admin/institutions') ? activeStyle : navLinkStyle}
      >
        Institutions
      </Link>
      <Link
        href="/admin/officials"
        style={isActive('/admin/officials') ? activeStyle : navLinkStyle}
      >
        Officials
      </Link>
      <Link
        href="/admin/feedback"
        style={isActive('/admin/feedback') ? activeStyle : navLinkStyle}
      >
        Feedback
      </Link>
      <Link
        href="/admin/bug-reports"
        style={isActive('/admin/bug-reports') ? activeStyle : navLinkStyle}
      >
        Bug Reports
      </Link>
      <Link
        href="/admin/polling-stations/upload"
        style={isActive('/admin/polling-stations') ? activeStyle : navLinkStyle}
      >
        Polling Upload
      </Link>

      {/* NEW: Hansard Management */}
      <Link
        href="/admin/hansard"
        style={isActive('/admin/hansard') ? activeStyle : navLinkStyle}
      >
        Hansard
      </Link>

      <Link
        href="/admin/analytics"
        style={isActive('/admin/analytics') ? activeStyle : navLinkStyle}
      >
        Analytics
      </Link>
    </nav>
  );
}
'use client';
import { signOut } from 'next-auth/react';

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/login' })}
      style={{
        fontSize: 13,
        color: 'var(--muted-foreground)',
        background: 'none',
        border: '1px solid var(--border)',
        borderRadius: 8,
        padding: '5px 12px',
        cursor: 'pointer',
      }}
    >
      Sign out
    </button>
  );
}
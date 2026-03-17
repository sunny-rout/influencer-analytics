'use client';
import { trpc } from '@/lib/trpc/client';
import { useState } from 'react';

export default function TestSync() {
  const [result, setResult] = useState<any>(null);
  const [error,  setError]  = useState<string>('');

  const sync = trpc.influencer.syncFromInstagram.useMutation({
    onSuccess: (data) => setResult(data),
    onError:   (err)  => setError(err.message),
  });

  return (
    <div style={{ padding: 40 }}>
      <h1>Instagram Sync Test</h1>

      <button
        onClick={() => sync.mutate({
          userId: process.env.NEXT_PUBLIC_INSTAGRAM_USER_ID || 'YOUR_USER_ID',
        })}
        disabled={sync.isPending}
        style={{ padding: '10px 20px', marginTop: 20 }}
      >
        {sync.isPending ? 'Syncing...' : 'Sync My Instagram'}
      </button>

      {result && (
        <pre style={{ marginTop: 20, background: '#f0f0f0', padding: 20 }}>
          {JSON.stringify(result, null, 2)}
        </pre>
      )}

      {error && (
        <p style={{ color: 'red', marginTop: 20 }}>{error}</p>
      )}
    </div>
  );
}
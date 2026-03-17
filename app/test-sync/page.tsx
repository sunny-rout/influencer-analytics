'use client';
import { trpc } from '@/lib/trpc/client';
import { useState } from 'react';

export default function TestSync() {
  const [result,  setResult]  = useState<any>(null);
  const [error,   setError]   = useState<string>('');
  const [country, setCountry] = useState('');
  const [useBusinessDiscovery, setUseBusinessDiscovery] = useState(false);
  const [targetUsername, setTargetUsername] = useState('');

  const sync = trpc.influencer.syncFromInstagram.useMutation({
    onSuccess: (data) => { setResult(data); setError(''); },
    onError:   (err)  => { setError(err.message); setResult(null); },
  });

  const handleSync = () => {
    sync.mutate({
      // If business discovery — use the target username
      // If basic — use your own user ID from env
      userId: useBusinessDiscovery
        ? targetUsername
        : process.env.NEXT_PUBLIC_INSTAGRAM_USER_ID!,
      country:              country || undefined,
      useBusinessDiscovery,
    });
  };

  return (
    <div style={{ padding: 40, fontFamily: 'sans-serif', maxWidth: 600 }}>
      <h1>Instagram Sync Test</h1>

      {/* Toggle API type */}
      <div style={{ marginTop: 20 }}>
        <label>
          <input
            type="checkbox"
            checked={useBusinessDiscovery}
            onChange={(e) => setUseBusinessDiscovery(e.target.checked)}
            style={{ marginRight: 8 }}
          />
          Use Business Discovery API (fetch other accounts)
        </label>
      </div>

      {/* Target username — only shown for Business Discovery */}
      {useBusinessDiscovery && (
        <div style={{ marginTop: 12 }}>
          <label>Target Instagram Username: </label>
          <input
            value={targetUsername}
            onChange={(e) => setTargetUsername(e.target.value)}
            placeholder="e.g. cristiano"
            style={{ padding: '6px 10px', marginLeft: 8, width: 200 }}
          />
        </div>
      )}

      {/* Manual country override */}
      <div style={{ marginTop: 12 }}>
        <label>
          Country Code (optional override):
        </label>
        <input
          value={country}
          onChange={(e) => setCountry(e.target.value.toUpperCase())}
          maxLength={2}
          placeholder="e.g. IN"
          style={{ padding: '6px 10px', marginLeft: 8, width: 80 }}
        />
        <span style={{ marginLeft: 8, color: '#888', fontSize: 12 }}>
          {useBusinessDiscovery
            ? 'Leave blank to use API value'
            : 'Required for personal accounts'}
        </span>
      </div>

      <button
        onClick={handleSync}
        disabled={sync.isPending}
        style={{
          padding:    '10px 24px',
          marginTop:  20,
          background: '#0070f3',
          color:      '#fff',
          border:     'none',
          borderRadius: 6,
          cursor:     sync.isPending ? 'not-allowed' : 'pointer',
        }}
      >
        {sync.isPending ? 'Syncing...' : 'Sync Instagram'}
      </button>

      {result && (
        <div style={{ marginTop: 20 }}>
          <h3 style={{ color: 'green' }}>✅ Success</h3>
          <pre style={{ background: '#f0f0f0', padding: 20, borderRadius: 6 }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      {error && (
        <div style={{ marginTop: 20 }}>
          <h3 style={{ color: 'red' }}>❌ Error</h3>
          <p style={{ color: 'red' }}>{error}</p>
        </div>
      )}
    </div>
  );
}

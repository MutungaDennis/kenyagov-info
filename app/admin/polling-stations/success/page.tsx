'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';

function SuccessDashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const fileName = searchParams.get('file') || 'Unknown Document Resource';
  const recordsCount = searchParams.get('count') || '0';

  return (
    <div style={{ maxWidth: '600px', margin: '60px auto', padding: '32px', fontFamily: 'sans-serif', textAlign: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
      <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', backgroundColor: '#c6f6d5', color: '#22543d', borderRadius: '50%', fontSize: '32px', marginBottom: '16px' }}>
        ✓
      </div>
      
      <h1 style={{ fontSize: '26px', fontWeight: 'bold', color: '#1a202c', margin: '0 0 12px 0' }}>
        Batch Import Successful
      </h1>
      
      <p style={{ color: '#4a5568', fontSize: '15px', lineHeight: '1.6', margin: '0 0 24px 0' }}>
        The uploaded IEBC data engine safely completed line execution blocks. Dynamic record dependencies inside your schema are correctly linked.
      </p>

      <div style={{ backgroundColor: '#f7fafc', borderRadius: '8px', padding: '16px', textAlign: 'left', marginBottom: '32px', border: '1px solid #edf2f7' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
          <span style={{ color: '#718096' }}>Processed Chunk Name:</span>
          <span style={{ fontWeight: '600', color: '#2d3748', wordBreak: 'break-all', maxWidth: '60%' }}>{fileName}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
          <span style={{ color: '#718096' }}>Committed Station Entities:</span>
          <span style={{ fontWeight: '700', color: '#38a169' }}>{parseInt(recordsCount, 10).toLocaleString()} Rows</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px' }}>
        <button
          onClick={() => router.push('/admin/polling-stations/upload')}
          style={{ flex: 1, padding: '12px', backgroundColor: '#3182ce', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}
        >
          Process Next PDF Chunk
        </button>
      </div>
    </div>
  );
}

// Named fallback component to make types strictly transparent to Next.js build workers
function SuccessFallback() {
  return (
    <div style={{ textAlign: 'center', marginTop: '100px', fontFamily: 'sans-serif', color: '#666' }}>
      Rendering success confirmation analytics...
    </div>
  );
}

// Clear, unambiguous default export declaration 
export default function SuccessDashboardPage() {
  return (
    <Suspense fallback={<SuccessFallback />}>
      <SuccessDashboardContent />
    </Suspense>
  );
}

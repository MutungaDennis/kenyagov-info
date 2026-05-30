'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function UploadPollingStationsPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type !== 'application/pdf') {
        setErrorMessage('Invalid file type. Please select a valid PDF document.');
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setErrorMessage(null);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setIsUploading(true);
    setErrorMessage(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload-iebc', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.details || result.error || 'Server processing failed.');
      }

      // Route the user to the success screen, appending filename and entry totals
      router.push(
        `/admin/polling-stations/success?file=${encodeURIComponent(file.name)}&count=${result.totalParsedRecords}`
      );
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected connection error occurred.');
      setIsUploading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '24px', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>
        Upload 2022 Polling Stations
      </h1>
      <p style={{ color: '#666', marginBottom: '24px', fontSize: '14px' }}>
        Select your split IEBC PDF data chunk. The database function dynamically processes unique mappings and skips duplicates automatically.
      </p>

      <form onSubmit={handleUploadSubmit}>
        <div 
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: '2px dashed #ccc',
            borderRadius: '8px',
            padding: '40px 20px',
            textAlign: 'center',
            cursor: 'pointer',
            backgroundColor: '#fafafa',
            marginBottom: '16px',
            transition: 'border-color 0.2s'
          }}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept=".pdf"
            style={{ display: 'none' }}
          />
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>📄</div>
          <p style={{ margin: '0 0 4px 0', fontWeight: 500 }}>
            {file ? file.name : 'Click to browse files'}
          </p>
          <p style={{ margin: 0, fontSize: '12px', color: '#888' }}>
            {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : 'PDF data files only'}
          </p>
        </div>

        {errorMessage && (
          <div style={{ padding: '12px', backgroundColor: '#fff5f5', color: '#c53030', borderRadius: '6px', fontSize: '14px', marginBottom: '16px', border: '1px solid #fed7d7' }}>
            <strong>Upload Error:</strong> {errorMessage}
          </div>
        )}

        <button
          type="submit"
          disabled={!file || isUploading}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: !file || isUploading ? '#cbd5e0' : '#3182ce',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 'bold',
            fontSize: '16px',
            cursor: !file || isUploading ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.2s'
          }}
        >
          {isUploading ? 'Parsing & Transmitting to Supabase...' : 'Begin Batch Processing'}
        </button>
      </form>
    </div>
  );
}

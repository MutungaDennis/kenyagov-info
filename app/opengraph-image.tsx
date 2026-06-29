// app/opengraph-image.tsx
import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Citizen Guide Kenya - Civic Information Platform';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/webp';

export default async function Image() {
  // FIXED: Changed from the homepage HTML domain to the explicit static image path
  const logoUrl = 'https://www.citizenguide.ke';

  return new ImageResponse(
    (
      <div
        style={{
          background: '#f3f2f1', 
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '80px',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Top Accent Strip Line */}
        <div style={{ background: '#003078', height: '12px', width: '1200px', position: 'absolute', top: 0, left: 0 }} />

        {/* Brand Header */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={logoUrl} 
            alt="Logo" 
            width="80" 
            height="80" 
            style={{ borderRadius: '8px', marginRight: '20px' }} 
          />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '32px', color: '#003078', fontWeight: 'bold', letterSpacing: '1px' }}>
              CITIZEN GUIDE KENYA
            </span>
            <span style={{ fontSize: '18px', color: '#505a5f', marginTop: '3px' }}>
              Independent Civic Information Directory Portal
            </span>
          </div>
        </div>

        {/* Main Central Title */}
        <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '40px' }}>
          <span style={{ fontSize: '52px', fontWeight: 'bold', color: '#0b0c0c', lineHeight: 1.2 }}>
            Your Comprehensive Informational Guide to Kenyan Governance
          </span>
          <span style={{ fontSize: '22px', color: '#505a5f', marginTop: '15px' }}>
            Access the Kenyan Constitution, County records, Parliamentary Acts, and step-by-step public service guides seamlessly.
          </span>
        </div>

        {/* Footer Identity Row */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: '2px solid #b1b4b6',
            paddingTop: '20px',
          }}
        >
          <span style={{ fontSize: '16px', color: '#505a5f' }}>
            An Independent Democratic Literacy Initiative
          </span>
          <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#0b0c0c' }}>
            www.citizenguide.ke
          </span>
        </div>
      </div>
    ),
    { ...size }
  );
}

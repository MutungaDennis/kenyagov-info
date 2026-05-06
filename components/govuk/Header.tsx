'use client';

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

interface GovUKHeaderProps {
  isHomePage?: boolean;
}

export default function GovUKHeader({ isHomePage = false }: GovUKHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      {/* Top Navigation Bar - Appears on all pages */}
      <header 
        className="govuk-header" 
        role="banner" 
        style={{ backgroundColor: '#1d70b8' }}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between py-2 min-h-[60px]">
            
            {/* Left: Logo + Brand Name */}
            <div className="flex items-center gap-3">
              <Image 
                src="/logo.png" 
                alt="KenyaGovInfo Logo" 
                width={48} 
                height={48}
                className="flex-shrink-0"
                priority
              />
              <Link href="/" className="text-white font-bold text-[22px] hover:opacity-90 transition-opacity">
                KenyaGovInfo.KE
              </Link>
            </div>

            {/* Right: Menu + Search */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className={`flex items-center gap-2 px-4 py-2 text-white font-bold text-[16px] transition-colors border-b-4 ${menuOpen ? 'border-white bg-[#003087]' : 'border-transparent hover:bg-[#0a5ba8]'}`}
                aria-expanded={menuOpen}
              >
                <span className={`transition-transform inline-block ${menuOpen ? 'rotate-180' : ''}`}>
                  ▼
                </span>
                Menu
              </button>

              <Link href="/search" className="p-3 text-white hover:bg-[#0a5ba8] transition-colors rounded">
                <span className="text-xl">🔍</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Dropdown Menu - Full width */}
        {menuOpen && (
          <div className="bg-white border-t-2 border-[#1d70b8]" style={{ backgroundColor: '#f3f2f1' }}>
            <div className="max-w-7xl mx-auto px-4 py-12">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
                
                {/* Services Column */}
                <div className="md:col-span-2">
                  <h2 className="text-2xl font-bold mb-6 text-black pb-3 border-b-4 border-black inline-block">
                    Services and information
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 mt-6">
                    <Link href="/services/business" className="text-[#1d70b8] font-bold hover:underline text-base">Starting a business</Link>
                    <Link href="/services/national-id" className="text-[#1d70b8] font-bold hover:underline text-base">National ID and certificates</Link>
                    <Link href="/services/driving" className="text-[#1d70b8] font-bold hover:underline text-base">Driving and transport</Link>
                    <Link href="/services/passport" className="text-[#1d70b8] font-bold hover:underline text-base">Passport and travel</Link>
                    <Link href="/services/tax" className="text-[#1d70b8] font-bold hover:underline text-base">Taxes and KRA</Link>
                    <Link href="/services/housing" className="text-[#1d70b8] font-bold hover:underline text-base">Housing and property</Link>
                  </div>
                </div>

                {/* Government Activity Column */}
                <div>
                  <h2 className="text-2xl font-bold mb-6 text-black pb-3 border-b-4 border-black inline-block">
                    Government activity
                  </h2>
                  <div className="space-y-6 mt-6">
                    <div>
                      <Link href="/executive" className="font-bold text-[#1d70b8] hover:underline text-base">Departments</Link>
                      <p className="text-gray-700 text-sm mt-1">Ministries and agencies</p>
                    </div>
                    <div>
                      <Link href="/legislature" className="font-bold text-[#1d70b8] hover:underline text-base">Legislature</Link>
                      <p className="text-gray-700 text-sm mt-1">Parliament and Senate</p>
                    </div>
                    <div>
                      <Link href="/counties" className="font-bold text-[#1d70b8] hover:underline text-base">County governments</Link>
                      <p className="text-gray-700 text-sm mt-1">All 47 counties</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}
      </header>


    </>
  );
}

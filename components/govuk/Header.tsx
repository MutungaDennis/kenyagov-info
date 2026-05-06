'use client';

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

export default function GovUKHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header 
      className="govuk-header border-b-8 border-[#003087]" 
      role="banner" 
      style={{ backgroundColor: '#003087' }}
    >
      <div className="govuk-width-container mx-auto max-w-7xl px-4">
        
        {/* Main Bar: Adjusted to push items apart */}
        <div className="flex items-center justify-between py-2 min-h-[80px]">
          
          {/* Left: Logo + Scaled Brand Name */}
          <div className="flex items-center gap-3">
            <Image 
              src="/logo.png" 
              alt="Logo" 
              width={60} 
              height={60}
              className="flex-shrink-0"
              priority
            />
            {/* Increased text size to 40px to match GOV.UK style scale */}
            <span className="text-[38px] md:text-[44px] font-bold text-white tracking-tighter leading-none">
              KenyaGovInfo.KE
            </span>
          </div>

          {/* Right Side: Menu + Search pushed to extreme right */}
          <div className="flex items-center">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className={`flex items-center gap-3 px-4 py-2 text-white font-bold text-[19px] transition-colors ${menuOpen ? 'bg-white text-[#003087]' : 'hover:bg-[#00266b]'}`}
              aria-expanded={menuOpen}
            >
              <span className={`text-xs transition-transform ${menuOpen ? 'rotate-180' : ''}`}>
                {menuOpen ? '▲' : '▼'}
              </span>
              Menu
            </button>

            <Link href="/search" className="p-3 text-white hover:bg-[#00266b] transition-colors">
              <span className="text-2xl">🔍</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Full-width Dropdown: Moves outside the container to span full width if needed */}
      {menuOpen && (
        <div className="bg-[#f3f2f1] border-t border-[#bfc1c3] shadow-inner">
          <div className="govuk-width-container mx-auto max-w-7xl px-4 py-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              
              {/* Column 1: Services */}
              <div className="md:col-span-2">
                <h2 className="text-3xl font-bold mb-8 text-black border-b-4 border-black pb-2 inline-block">
                  Services and information
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                  <Link href="/services/id" className="text-[#1d70b8] font-bold underline text-lg hover:text-[#003087]">Births, death, marriages and care</Link>
                  <Link href="/services/passport" className="text-[#1d70b8] font-bold underline text-lg hover:text-[#003087]">Passports, travel and living abroad</Link>
                  <Link href="/services/tax" className="text-[#1d70b8] font-bold underline text-lg hover:text-[#003087]">Money and tax</Link>
                  <Link href="/services/driving" className="text-[#1d70b8] font-bold underline text-lg hover:text-[#003087]">Driving and transport</Link>
                  <Link href="/services/housing" className="text-[#1d70b8] font-bold underline text-lg hover:text-[#003087]">Housing and local services</Link>
                  <Link href="/counties" className="text-[#1d70b8] font-bold underline text-lg hover:text-[#003087]">County services</Link>
                </div>
              </div>

              {/* Column 2: Government Activity */}
              <div className="bg-white/50 p-6 rounded-sm">
                <h2 className="text-2xl font-bold mb-6 text-black">Government activity</h2>
                <div className="space-y-6">
                  <div>
                    <Link href="/executive" className="font-bold text-[#1d70b8] hover:underline text-lg">Departments</Link>
                    <p className="text-gray-700 text-sm">Ministries, agencies and public bodies</p>
                  </div>
                  <div>
                    <Link href="/news" className="font-bold text-[#1d70b8] hover:underline text-lg">News</Link>
                    <p className="text-gray-700 text-sm">News stories, speeches and notices</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </header>
  );
}

'use client';

import React from 'react';
import { Language } from '@/lib/types';
import { translations } from '@/lib/i18n';
import { DISTRICTS, DIVISIONS } from '@/lib/mockData';
import { MapPin, Globe, ShieldCheck, Sparkles, HelpCircle, Activity } from 'lucide-react';

interface HeaderProps {
  lang: Language;
  onLanguageChange: (newLang: Language) => void;
  selectedDistrict: string;
  onDistrictChange: (district: string) => void;
  onOpenTransparency: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  lang,
  onLanguageChange,
  selectedDistrict,
  onDistrictChange,
  onOpenTransparency,
}) => {
  const t = translations[lang];

  return (
    <header className="sticky top-0 z-40 bg-[#14532D] text-white shadow-md border-b border-[#15803D]/40 backdrop-blur-md">
      {/* Top micro-bar: Verified status & trust */}
      <div className="bg-[#052e16] text-emerald-300 text-xs px-4 py-1.5 flex items-center justify-between border-b border-emerald-900/50">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-medium text-[11px] sm:text-xs tracking-wide">
              {t.officialVerified}
            </span>
          </div>

          <button
            onClick={onOpenTransparency}
            className="flex items-center space-x-1 text-emerald-200 hover:text-white transition-colors text-[11px] sm:text-xs underline-offset-2 hover:underline cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>{t.transparencyBtn}</span>
          </button>
        </div>
      </div>

      {/* Main App Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Tagline */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-green-500 flex items-center justify-center shadow-lg shadow-green-950/40 border border-emerald-400/30">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-1.5">
                DaamBD
                <span className="text-emerald-300 text-sm font-semibold tracking-normal px-1.5 py-0.5 rounded bg-emerald-900/60 border border-emerald-600/40">
                  {lang === 'bn' ? 'দামবিডি' : 'Live'}
                </span>
              </h1>
            </div>
            <p className="text-[11px] sm:text-xs text-emerald-200/90 font-medium hidden sm:block">
              {t.brandTagline}
            </p>
          </div>
        </div>

        {/* Action Controls: District Selector & Language Toggle */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* District Selector */}
          <div className="relative flex items-center bg-[#15803D]/60 hover:bg-[#15803D] rounded-lg px-2.5 py-1.5 border border-emerald-400/30 transition-all shadow-inner">
            <MapPin className="w-4 h-4 text-emerald-200 mr-1.5 shrink-0" />
            <select
              value={selectedDistrict}
              onChange={(e) => onDistrictChange(e.target.value)}
              className="bg-transparent text-white text-xs sm:text-sm font-semibold focus:outline-none cursor-pointer pr-1"
              aria-label={t.districtSelect}
            >
              {DIVISIONS.map((div) => {
                const subItems = DISTRICTS.filter((d) => d.divisionEn === div.en);
                return (
                  <optgroup
                    key={div.en}
                    label={lang === 'bn' ? div.bn : `${div.en} Division`}
                    className="bg-[#052e16] text-emerald-300 font-bold"
                  >
                    {subItems.map((d) => (
                      <option
                        key={d.en}
                        value={d.en}
                        className="bg-[#14532D] text-white py-1 font-medium"
                      >
                        {lang === 'bn' ? d.bn : `${d.en} (${d.divisionEn})`}
                      </option>
                    ))}
                  </optgroup>
                );
              })}
            </select>
          </div>

          {/* Language Switch Toggle */}
          <div className="flex items-center bg-black/30 p-1 rounded-lg border border-emerald-600/40">
            <button
              onClick={() => onLanguageChange('bn')}
              className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all ${
                lang === 'bn'
                  ? 'bg-white text-[#14532D] shadow-md scale-100'
                  : 'text-emerald-200 hover:text-white'
              }`}
            >
              বাংলা
            </button>
            <button
              onClick={() => onLanguageChange('en')}
              className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all ${
                lang === 'en'
                  ? 'bg-white text-[#14532D] shadow-md scale-100'
                  : 'text-emerald-200 hover:text-white'
              }`}
            >
              EN
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

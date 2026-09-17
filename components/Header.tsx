'use client';

import React, { useMemo } from 'react';
import { Language } from '@/lib/types';
import { translations } from '@/lib/i18n';
import { MapPin, HelpCircle, Activity } from 'lucide-react';
import { DIVISIONS, DISTRICTS } from '@/lib/mockData';

interface HeaderLocation {
  id: number;
  en: string;
  bn: string;
  divisionId: number;
  divisionEn: string;
  divisionBn: string;
}

interface HeaderDivision {
  id: number;
  en: string;
  bn: string;
}

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

  const divisions = useMemo<HeaderDivision[]>(
    () =>
      DIVISIONS.map((division, index) => ({
        id: index + 1,
        en: division.en,
        bn: division.bn,
      })),
    []
  );

  const districts = useMemo<HeaderLocation[]>(
    () =>
      DISTRICTS.map((district, index) => {
        const divisionIndex = DIVISIONS.findIndex(
          division => division.en === district.divisionEn
        );

        return {
          id: index + 1,
          en: district.en,
          bn: district.bn,
          divisionId: divisionIndex >= 0 ? divisionIndex + 1 : 0,
          divisionEn: district.divisionEn,
          divisionBn: district.divisionBn,
        };
      }),
    []
  );

  const groupedDistricts = useMemo(
    () =>
      divisions.map(division => ({
        division,
        districts: districts.filter(
          district => district.divisionId === division.id
        ),
      })),
    [divisions, districts]
  );

  const fallbackGroups =
    groupedDistricts.length > 0
      ? groupedDistricts
      : [
          {
            division: { id: 0, en: '', bn: '' },
            districts,
          },
        ];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#14532D] text-white shadow-md border-b border-[#15803D]/40 backdrop-blur-md">
      <div className="bg-[#052e16] text-emerald-300 border-b border-emerald-900/50">
        <div className="max-w-7xl mx-auto w-full px-3 sm:px-4 lg:px-8">
          <div className="min-h-[30px] py-1.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="font-medium text-[10px] sm:text-xs tracking-wide truncate">
                {lang === 'bn'
                  ? 'সরকারি DAM-এর তথ্যসূত্রে'
                  : 'Sourced from official DAM data'}
              </span>
            </div>

            <button
              onClick={onOpenTransparency}
              className="shrink-0 flex items-center gap-1 text-emerald-200 hover:text-white transition-colors text-[10px] sm:text-xs underline-offset-2 hover:underline cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>{t.transparencyBtn}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto w-full px-3 sm:px-6 lg:px-8">
        <div className="min-h-16 py-2.5 sm:py-0 sm:h-16 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 sm:gap-0">
          <div className="flex items-center min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-xl bg-gradient-to-tr from-emerald-600 to-green-500 flex items-center justify-center shadow-lg shadow-green-950/40 border border-emerald-400/30">
              <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>

            <div className="ml-2.5 sm:ml-3 min-w-0">
              <div className="flex items-center min-w-0 gap-1.5">
                <h1 className="text-lg sm:text-2xl font-black tracking-tight text-white leading-none whitespace-nowrap">
                  DaamBD
                </h1>
                <span className="text-emerald-300 text-[10px] sm:text-sm font-semibold tracking-normal px-1.5 sm:px-2 py-0.5 rounded bg-emerald-900/60 border border-emerald-600/40 whitespace-nowrap">
                  {lang === 'bn' ? 'দামবিডি' : 'Live'}
                </span>
              </div>

              <p className="hidden sm:block text-[11px] sm:text-xs text-emerald-200/90 font-medium mt-1 truncate">
                {t.brandTagline}
              </p>
            </div>
          </div>

          <div className="w-full sm:w-auto flex items-center gap-2">
            <div className="relative flex-1 sm:flex-none min-w-0 flex items-center bg-[#15803D]/60 hover:bg-[#15803D] rounded-lg px-2 sm:px-2.5 py-1.5 border border-emerald-400/30 transition-all shadow-inner">
              <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-200 mr-1.5 shrink-0" />

              <select
                value={selectedDistrict}
                onChange={e => onDistrictChange(e.target.value)}
                disabled={districts.length === 0}
                className="w-full sm:w-auto min-w-0 bg-transparent text-white text-[11px] sm:text-sm font-semibold focus:outline-none cursor-pointer pr-1 truncate disabled:opacity-60"
                aria-label={t.districtSelect}
              >
                {districts.length === 0 ? (
                  <option value="" className="bg-[#14532D] text-white">
                    {lang === 'bn'
                      ? 'কোনো এলাকা পাওয়া যায়নি'
                      : 'No locations found'}
                  </option>
                ) : (
                  fallbackGroups.map(({ division, districts: divisionDistricts }) => (
                    <optgroup
                      key={division.id || division.en || 'locations'}
                      label={
                        division.id
                          ? lang === 'bn'
                            ? division.bn
                            : `${division.en} Division`
                          : lang === 'bn'
                            ? 'এলাকা'
                            : 'Locations'
                      }
                      className="bg-[#052e16] text-emerald-300 font-bold"
                    >
                      {divisionDistricts.map(district => (
                        <option
                          key={district.en}
                          value={district.en}
                          className="bg-[#14532D] text-white font-medium"
                        >
                          {lang === 'bn' ? district.bn : district.en}
                        </option>
                      ))}
                    </optgroup>
                  ))
                )}
              </select>
            </div>

            <div className="shrink-0 flex items-center bg-black/30 p-1 rounded-lg border border-emerald-600/40">
              <button
                onClick={() => onLanguageChange('bn')}
                className={`px-2 sm:px-2.5 py-1 rounded-md text-[10px] sm:text-xs font-bold transition-all ${
                  lang === 'bn'
                    ? 'bg-white text-[#14532D] shadow-md'
                    : 'text-emerald-200 hover:text-white'
                }`}
              >
                বাংলা
              </button>

              <button
                onClick={() => onLanguageChange('en')}
                className={`px-2 sm:px-2.5 py-1 rounded-md text-[10px] sm:text-xs font-bold transition-all ${
                  lang === 'en'
                    ? 'bg-white text-[#14532D] shadow-md'
                    : 'text-emerald-200 hover:text-white'
                }`}
              >
                EN
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
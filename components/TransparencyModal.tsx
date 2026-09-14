'use client';

import React from 'react';
import { Language } from '@/lib/types';
import { translations } from '@/lib/i18n';
import { ShieldCheck, Database, CheckCircle2, Lock, X, ExternalLink, Cpu } from 'lucide-react';

interface TransparencyModalProps {
  lang: Language;
  isOpen: boolean;
  onClose: () => void;
}

export const TransparencyModal: React.FC<TransparencyModalProps> = ({
  lang,
  isOpen,
  onClose,
}) => {
  const t = translations[lang];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-surface-border animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-[#14532D] text-white p-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg">
                {t.transparencyTitle}
              </h3>
              <p className="text-xs text-emerald-200">
                {lang === 'bn' ? 'স্বচ্ছতা ও নির্ভরযোগ্যতা অঙ্গীকার' : 'Integrity & Data Authenticity'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 space-y-5 overflow-y-auto text-xs sm:text-sm text-content-main leading-relaxed">
          
          {/* Core Ethos Banner */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start space-x-3">
            <CheckCircle2 className="w-5 h-5 text-brand-700 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-brand-900 text-sm">
                {t.zeroFakeGuarantee}
              </h4>
              <p className="text-emerald-900/90 text-xs mt-1">
                {t.zeroFakeDesc}
              </p>
            </div>
          </div>

          {/* Section 1: Official Sources */}
          <div>
            <h4 className="font-black text-content-main text-sm uppercase tracking-wide text-brand-800 mb-2 flex items-center gap-1.5">
              <Database className="w-4 h-4 text-brand-700" />
              <span>{lang === 'bn' ? '১. নির্ভরযোগ্য ডেটা সোর্স' : '1. Official Data Ingestion'}</span>
            </h4>
            <div className="space-y-2">
              <div className="bg-surface-bg p-3 rounded-xl border border-surface-border">
                <div className="font-bold text-content-main">
                  {t.sourceDAM}
                </div>
                <div className="text-xs text-content-muted mt-0.5">
                  Endpoint: <code className="bg-gray-100 px-1.5 py-0.5 rounded text-[11px]">/agri-service/reports/price-report/</code>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Validation Engine */}
          <div>
            <h4 className="font-black text-content-main text-sm uppercase tracking-wide text-brand-800 mb-2 flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-brand-700" />
              <span>{lang === 'bn' ? '২. স্বয়ংক্রিয় এনোমালি ফিল্টারিং' : '2. Anomaly Detection Engine'}</span>
            </h4>
            <ul className="space-y-1.5 list-disc list-inside text-content-muted text-xs">
              <li>
                <strong>Bounds Checker:</strong> {lang === 'bn' ? 'সর্বনিম্ন দর সবসময় সর্বোচ্চ দরের সমান বা কম হতে হবে।' : 'Ensures min_price <= max_price and excludes negative numbers.'}
              </li>
              <li>
                <strong>Spike Guard (2.5x Rule):</strong> {lang === 'bn' ? 'ঐতিহাসিক গড় দরের চেয়ে ২.৫ গুণের বেশি আকস্মিক বৃদ্ধি পেলে স্বয়ংক্রিয় ওয়ার্নিং ফ্ল্যাগ করা হয়।' : 'Flags warnings if today’s price spikes > 2.5x historical average.'}
              </li>
              <li>
                <strong>Unit Consistency:</strong> {lang === 'bn' ? 'কেজি, গ্রাম, পাল্লা এবং হালির রূপান্তর স্ট্যান্ডার্ড এসআই গুণিতক অনুযায়ী যাচাই করা হয়।' : 'Standard metric and count conversions verified.'}
              </li>
            </ul>
          </div>

          {/* Non-profit disclaimer */}
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-3.5 text-xs text-content-muted">
            <p>{t.transparencyP1}</p>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-surface-bg p-4 border-t border-surface-border flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-bold text-xs sm:text-sm transition-all shadow-md active:scale-95"
          >
            {t.closeBtn}
          </button>
        </div>

      </div>
    </div>
  );
};

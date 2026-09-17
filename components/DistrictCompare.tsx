"use client";

import React from "react";
import { Info } from "lucide-react";
import { Language } from "@/lib/types";

interface DistrictCompareProps {
  lang: Language;
}

export function DistrictCompare({
  lang,
}: DistrictCompareProps) {
  return (
    <section className="w-full rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100">
          <Info className="h-5 w-5 text-slate-600" />
        </div>

        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            {lang === "bn"
              ? "জেলা ভিত্তিক তুলনা"
              : "District Comparison"}
          </h2>

          <p className="mt-1 text-sm leading-6 text-slate-600">
            {lang === "bn"
              ? "সরকারি DAM-এর একই পণ্যের একাধিক জেলার সরাসরি তুলনা করার জন্য প্রয়োজনীয় অফিসিয়াল ডেটা সংযুক্ত করা হলে এই অংশে তথ্য দেখানো হবে।"
              : "District-level comparison will appear here when the required official DAM data is available for direct comparison."}
          </p>

          <p className="mt-2 text-xs text-slate-500">
            {lang === "bn"
              ? "এই মুহূর্তে কোনো অনুমান বা ডেমো দাম দেখানো হচ্ছে না।"
              : "No estimated or demonstration prices are shown here."}
          </p>
        </div>
      </div>
    </section>
  );
}
"use client";

import React from "react";
import Image from "next/image";

interface ProviderItem {
  provider_id: number | string;
  provider_name: string;
  logo_path: string;
  display_priority?: number;
}

interface ProvidersGroup {
  flatrate?: ProviderItem[];
  rent?: ProviderItem[];
  buy?: ProviderItem[];
}

interface StreamingAvailabilityProps {
  providers: ProvidersGroup | null;
  countryCode: string;
}

export default function StreamingAvailability({ providers, countryCode }: StreamingAvailabilityProps) {
  if (!providers || (!providers.flatrate?.length && !providers.rent?.length && !providers.buy?.length)) {
    return (
      <div className="text-gray/50 font-mono text-xs">
        Not currently streaming in {countryCode}.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {providers.flatrate && providers.flatrate.length > 0 && (
        <div className="space-y-1.5">
          <span className="font-mono text-[10px] text-gray/40 uppercase">Stream</span>
          <div className="flex flex-wrap gap-2">
            {providers.flatrate.map((p) => (
              <div key={p.provider_id} className="flex items-center gap-1.5 bg-white/5 border border-white/8 rounded-lg px-2.5 py-1">
                {p.logo_path && (
                  <Image src={p.logo_path} alt={p.provider_name} width={18} height={18} className="rounded" />
                )}
                <span className="text-white text-xs font-medium">{p.provider_name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {providers.rent && providers.rent.length > 0 && (
        <div className="space-y-1.5">
          <span className="font-mono text-[10px] text-gray/40 uppercase">Rent</span>
          <div className="flex flex-wrap gap-2">
            {providers.rent.map((p) => (
              <div key={p.provider_id} className="flex items-center gap-1.5 bg-white/5 border border-white/8 rounded-lg px-2.5 py-1">
                {p.logo_path && (
                  <Image src={p.logo_path} alt={p.provider_name} width={18} height={18} className="rounded" />
                )}
                <span className="text-white text-xs font-medium">{p.provider_name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {providers.buy && providers.buy.length > 0 && (
        <div className="space-y-1.5">
          <span className="font-mono text-[10px] text-gray/40 uppercase">Buy</span>
          <div className="flex flex-wrap gap-2">
            {providers.buy.map((p) => (
              <div key={p.provider_id} className="flex items-center gap-1.5 bg-white/5 border border-white/8 rounded-lg px-2.5 py-1">
                {p.logo_path && (
                  <Image src={p.logo_path} alt={p.provider_name} width={18} height={18} className="rounded" />
                )}
                <span className="text-white text-xs font-medium">{p.provider_name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

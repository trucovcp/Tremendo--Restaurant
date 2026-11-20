import { ArrowDown, Clock, MapPin, Phone } from 'lucide-react';
import { buildWhatsAppUrl } from '../lib/utils';
import { BRAND_ASSETS, type EstablishmentSettings } from '../types/menu';

interface HeroSectionProps {
  settings: EstablishmentSettings;
}

export function HeroSection({ settings }: HeroSectionProps) {
  const whatsappHref = buildWhatsAppUrl(
    settings.whatsappNumber,
    `Hola ${settings.name}, quiero consultar por el menú.`
  );

  return (
    <section
      id="inicio"
      className="tremendo-splatter-bg border-b border-zinc-800/80 pt-5 pb-5 sm:pt-12 sm:pb-10"
    >
      <div className="max-w-6xl mx-auto px-3 sm:px-6">
        {/* Side-by-side split preserved proportionally across mobile and desktop */}
        <div className="grid grid-cols-12 gap-3 sm:gap-10 items-center">
          <div className="col-span-7 space-y-2 sm:space-y-4">
            <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.16em] text-amber-400">
              Villa Carlos Paz · Córdoba
            </p>

            <h1
              className="font-display font-bold uppercase tracking-tight text-white leading-[1.02] text-[1.45rem] sm:text-4xl lg:text-6xl"
              style={{ textWrap: 'balance' }}
            >
              {settings.slogan || 'Mucho más que un sandwich'}
            </h1>

            <p className="text-[11px] sm:text-base text-zinc-300 leading-snug sm:leading-relaxed max-w-xl">
              Lomos, pizzas, empanadas, sandwich de milanesa, hamburguesas, papas fritas,
              cervezas, partidos en vivo y eventos en{' '}
              <span className="text-zinc-100 font-medium">{settings.address}</span>.
            </p>

            <div className="flex flex-wrap items-center gap-2 sm:gap-4 pt-1 sm:pt-2">
              <a
                href="#menu"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-6 sm:py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold text-[11px] sm:text-sm transition-colors whitespace-nowrap shrink-0"
              >
                <span>Ver Menú Digital</span>
                <ArrowDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" aria-hidden="true" />
              </a>
              <a
                href={settings.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] sm:text-sm font-medium text-zinc-200 hover:text-amber-400 underline underline-offset-4 decoration-amber-500/50 transition-colors whitespace-nowrap shrink-0 py-1.5"
              >
                Cómo llegar
              </a>
            </div>
          </div>

          <div className="col-span-5 flex justify-center">
            <div className="relative w-full max-w-[140px] sm:max-w-[280px] lg:max-w-[330px] aspect-square rounded-2xl bg-black border border-amber-500/30 p-1.5 sm:p-3 flex items-center justify-center shadow-[0_0_40px_-15px_rgba(245,158,11,0.35)]">
              <img
                src={BRAND_ASSETS.logo}
                alt="Tremendo — Mucho más que un sandwich, Villa Carlos Paz"
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain rounded-xl"
              />
            </div>
          </div>
        </div>

        {/* Full-width 3-column info strip anchored below hero split */}
        <div className="mt-4 sm:mt-9 pt-3 sm:pt-5 border-t border-zinc-800/80 grid grid-cols-3 gap-2 sm:gap-6">
          <div className="min-w-0">
            <div className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-amber-400">
              <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" aria-hidden="true" />
              <span className="truncate">Horarios</span>
            </div>
            <p className="mt-0.5 text-[10px] sm:text-sm text-zinc-200 tabular-nums leading-tight truncate">
              {settings.hoursWeekdays}
            </p>
            <p className="text-[10px] sm:text-xs text-zinc-400 tabular-nums leading-tight truncate">
              {settings.hoursWeekend}
            </p>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-amber-400">
              <Phone className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" aria-hidden="true" />
              <span className="truncate">WhatsApp</span>
            </div>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-0.5 block text-[10px] sm:text-sm text-zinc-100 hover:text-amber-400 font-medium tabular-nums truncate transition-colors"
            >
              {settings.phone}
            </a>
            <span className="text-[10px] sm:text-xs text-zinc-400 block truncate">
              Consultas directas
            </span>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-amber-400">
              <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" aria-hidden="true" />
              <span className="truncate">Ubicación</span>
            </div>
            <p className="mt-0.5 text-[10px] sm:text-sm text-zinc-200 leading-tight truncate">
              Paris, Av. Perito Moreno
            </p>
            <span className="text-[10px] sm:text-xs text-zinc-400 block truncate">
              Villa Carlos Paz, Córdoba
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

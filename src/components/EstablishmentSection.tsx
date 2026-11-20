import { Clock, ExternalLink, MapPin, MessageCircle, Tv } from 'lucide-react';
import { buildWhatsAppUrl } from '../lib/utils';
import { BRAND_ASSETS, type EstablishmentSettings } from '../types/menu';

interface EstablishmentSectionProps {
  settings: EstablishmentSettings;
}

export function EstablishmentSection({ settings }: EstablishmentSectionProps) {
  const whatsappHref = buildWhatsAppUrl(
    settings.whatsappNumber,
    `Hola ${settings.name}, quería consultar por reservas / eventos / horarios.`
  );

  return (
    <section id="local" className="py-6 sm:py-12 border-b border-zinc-800/80">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 space-y-6 sm:space-y-10">
        {/* Experience + Official Flyer Split (proportional on mobile and desktop) */}
        <div className="grid grid-cols-12 gap-3 sm:gap-8 items-center">
          <div className="col-span-5">
            <div className="rounded-xl overflow-hidden border border-amber-500/30 bg-black">
              <img
                src={BRAND_ASSETS.flyer}
                alt="Flyer oficial de Tremendo: Lomos, Pizzas, Empanadas, Sandwich de Milanesa, Hamburguesas, Papas Fritas, Cervezas, Partidos en vivo y Eventos"
                loading="lazy"
                referrerPolicy="no-referrer"
                className="w-full h-auto object-cover"
              />
            </div>
          </div>

          <div className="col-span-7 space-y-2.5 sm:space-y-4">
            <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.16em] text-amber-400">
              El Establecimiento
            </p>
            <h2
              className="font-display text-lg sm:text-3xl font-bold uppercase tracking-tight text-white leading-tight"
              style={{ textWrap: 'balance' }}
            >
              Comida al paso, partidos en vivo y encuentros en Villa Carlos Paz
            </h2>
            <p className="text-[11px] sm:text-sm text-zinc-300 leading-snug sm:leading-relaxed">
              En <span className="text-white font-semibold">{settings.name}</span> combinamos
              lomos, pizzas, empanadas, sandwich de milanesa, hamburguesas y papas fritas con
              cervezas y gaseosas bien frías.
            </p>

            {settings.highlights.length > 0 && (
              <div className="pt-1 sm:pt-2 space-y-1.5 border-t border-zinc-800/80">
                <div className="flex items-center gap-1.5 text-[10px] sm:text-xs uppercase tracking-wider text-zinc-400 font-semibold">
                  <Tv className="w-3.5 h-3.5 text-amber-400 shrink-0" aria-hidden="true" />
                  <span>Propuestas del local</span>
                </div>
                <p className="text-[11px] sm:text-sm text-zinc-100 font-medium">
                  {settings.highlights.join(' · ')}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Location, Hours, Contact & Social Grid */}
        <div id="ubicacion" className="grid grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-5">
          {/* Location */}
          <div className="rounded-xl bg-[#141417] border border-zinc-800 p-3 sm:p-5 space-y-2">
            <div className="flex items-center gap-1.5 text-amber-400">
              <MapPin className="w-4 h-4 shrink-0" aria-hidden="true" />
              <h3 className="font-display text-sm sm:text-lg font-semibold uppercase tracking-wide">
                Ubicación
              </h3>
            </div>
            <p className="text-[11px] sm:text-sm text-zinc-200 leading-snug">
              {settings.address}
            </p>
            {settings.mapsUrl && (
              <a
                href={settings.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-semibold text-amber-400 hover:text-amber-300 underline underline-offset-4"
              >
                <span>Ver en Google Maps</span>
                <ExternalLink className="w-3 h-3" aria-hidden="true" />
              </a>
            )}
          </div>

          {/* Hours */}
          <div className="rounded-xl bg-[#141417] border border-zinc-800 p-3 sm:p-5 space-y-2">
            <div className="flex items-center gap-1.5 text-amber-400">
              <Clock className="w-4 h-4 shrink-0" aria-hidden="true" />
              <h3 className="font-display text-sm sm:text-lg font-semibold uppercase tracking-wide">
                Horarios
              </h3>
            </div>
            <div className="space-y-1 text-[11px] sm:text-sm text-zinc-200 tabular-nums">
              <p>{settings.hoursWeekdays}</p>
              <p>{settings.hoursWeekend}</p>
            </div>
          </div>

          {/* WhatsApp & Social */}
          <div className="col-span-2 md:col-span-1 rounded-xl bg-[#141417] border border-zinc-800 p-3 sm:p-5 space-y-2">
            <div className="flex items-center gap-1.5 text-amber-400">
              <MessageCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
              <h3 className="font-display text-sm sm:text-lg font-semibold uppercase tracking-wide">
                Contacto y Redes
              </h3>
            </div>
            <div className="space-y-1.5 text-[11px] sm:text-sm">
              <p className="text-zinc-200">
                Tel / WhatsApp:{' '}
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-400 hover:text-amber-300 font-semibold tabular-nums underline underline-offset-2"
                >
                  {settings.phone}
                </a>
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
                {settings.instagramUrl ? (
                  <a
                    href={settings.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-zinc-200 hover:text-amber-400 underline underline-offset-2"
                  >
                    Instagram
                  </a>
                ) : (
                  <span className="text-zinc-500">Instagram (por configurar)</span>
                )}
                <span aria-hidden="true" className="text-zinc-700">
                  ·
                </span>
                {settings.facebookUrl ? (
                  <a
                    href={settings.facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-zinc-200 hover:text-amber-400 underline underline-offset-2"
                  >
                    Facebook
                  </a>
                ) : (
                  <span className="text-zinc-500">Facebook (por configurar)</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

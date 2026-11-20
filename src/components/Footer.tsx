import { Lock } from 'lucide-react';
import { BRAND_ASSETS, type EstablishmentSettings } from '../types/menu';

interface FooterProps {
  settings: EstablishmentSettings;
  onOpenLegal: (tab: 'terms' | 'privacy') => void;
  onOpenCookiePrefs: () => void;
  onOpenAdmin: () => void;
}

export function Footer({
  settings,
  onOpenLegal,
  onOpenCookiePrefs,
  onOpenAdmin,
}: FooterProps) {
  return (
    <footer className="bg-[#070709] py-6 sm:py-10 text-zinc-400 no-print">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <img
                src={BRAND_ASSETS.logo}
                alt="Tremendo"
                referrerPolicy="no-referrer"
                className="w-7 h-7 rounded-full object-cover border border-amber-500/30"
              />
              <span className="font-display text-base sm:text-lg font-bold uppercase text-white">
                {settings.name}
              </span>
            </div>
            <p className="text-[11px] sm:text-xs leading-relaxed text-zinc-400">
              {settings.slogan}
            </p>
            <p className="text-[11px] sm:text-xs text-zinc-500">{settings.address}</p>
          </div>

          <div className="space-y-2">
            <h3 className="font-display text-xs sm:text-sm uppercase tracking-wider text-zinc-200">
              Navegación
            </h3>
            <ul className="space-y-1 text-[11px] sm:text-xs">
              <li>
                <a href="#menu" className="hover:text-amber-400 transition-colors">
                  Menú Digital
                </a>
              </li>
              <li>
                <a href="#promociones" className="hover:text-amber-400 transition-colors">
                  Promociones
                </a>
              </li>
              <li>
                <a href="#local" className="hover:text-amber-400 transition-colors">
                  El Local y Eventos
                </a>
              </li>
              <li>
                <a href="#ubicacion" className="hover:text-amber-400 transition-colors">
                  Horarios y Ubicación
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="font-display text-xs sm:text-sm uppercase tracking-wider text-zinc-200">
              Legal y Privacidad
            </h3>
            <ul className="space-y-1 text-[11px] sm:text-xs">
              <li>
                <button
                  type="button"
                  onClick={() => onOpenLegal('terms')}
                  className="hover:text-amber-400 transition-colors cursor-pointer text-left"
                >
                  Términos y Condiciones
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenLegal('privacy')}
                  className="hover:text-amber-400 transition-colors cursor-pointer text-left"
                >
                  Política de Privacidad
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenCookiePrefs}
                  className="hover:text-amber-400 transition-colors cursor-pointer text-left"
                >
                  Preferencias de Cookies
                </button>
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="font-display text-xs sm:text-sm uppercase tracking-wider text-zinc-200">
              Gestión
            </h3>
            <p className="text-[11px] sm:text-xs text-zinc-500">
              Acceso exclusivo para personal autorizado.
            </p>
            <button
              type="button"
              onClick={onOpenAdmin}
              className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs text-zinc-300 hover:text-amber-400 transition-colors cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Panel de Administración</span>
            </button>
          </div>
        </div>

        <div className="pt-4 border-t border-zinc-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px] text-zinc-500">
          <span>
            © {new Date().getFullYear()} {settings.name} · Villa Carlos Paz, Córdoba, Argentina.
          </span>
          <span>Tel / WhatsApp: {settings.phone}</span>
        </div>
      </div>
    </footer>
  );
}

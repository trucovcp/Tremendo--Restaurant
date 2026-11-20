import { ShoppingBag } from 'lucide-react';
import { BRAND_ASSETS, type EstablishmentSettings } from '../types/menu';

interface HeaderProps {
  settings: EstablishmentSettings;
  cartCount: number;
  onOpenCart: () => void;
  onNavigateHome: () => void;
}

export function Header({
  settings,
  cartCount,
  onOpenCart,
  onNavigateHome,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-[#09090B]/92 backdrop-blur-md border-b border-zinc-800/80 no-print">
      <div className="max-w-6xl mx-auto px-2.5 sm:px-6 h-12 sm:h-16 flex items-center justify-between gap-1.5 sm:gap-8">
        {/* Zone 1: Single-line Brand Wordmark */}
        <a
          href="#inicio"
          onClick={(e) => {
            e.preventDefault();
            onNavigateHome();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex items-center gap-1.5 sm:gap-2.5 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded"
        >
          <img
            src={BRAND_ASSETS.logo}
            alt="Logo de Tremendo"
            referrerPolicy="no-referrer"
            className="w-6 h-6 sm:w-9 sm:h-9 rounded-full object-cover border border-amber-500/40 shrink-0"
          />
          <span className="font-display text-sm sm:text-xl font-bold tracking-wide uppercase text-white">
            {settings.name}
          </span>
        </a>

        {/* Zone 2: Concise single-line nav links (kept proportional on mobile) */}
        <nav
          aria-label="Navegación principal"
          className="flex items-center gap-1.5 sm:gap-7 text-[10px] sm:text-sm font-medium text-zinc-300"
        >
          <a
            href="#menu"
            onClick={onNavigateHome}
            className="hover:text-amber-400 transition-colors whitespace-nowrap shrink-0 py-1"
          >
            Menú
          </a>
          <a
            href="#promociones"
            onClick={onNavigateHome}
            className="hover:text-amber-400 transition-colors whitespace-nowrap shrink-0 py-1"
          >
            Promos
          </a>
          <a
            href="#local"
            onClick={onNavigateHome}
            className="hover:text-amber-400 transition-colors whitespace-nowrap shrink-0 py-1"
          >
            Local
          </a>
          <a
            href="#ubicacion"
            onClick={onNavigateHome}
            className="hover:text-amber-400 transition-colors whitespace-nowrap shrink-0 py-1"
          >
            Ubicación
          </a>
        </nav>

        {/* Zone 3: Single primary Cart CTA */}
        <button
          type="button"
          onClick={onOpenCart}
          aria-label={`Abrir carrito (${cartCount} productos)`}
          className="inline-flex items-center gap-1 sm:gap-1.5 px-2 py-1 sm:px-4 sm:py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold text-[10px] sm:text-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
        >
          <ShoppingBag className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" aria-hidden="true" />
          <span>Carrito</span>
          <span className="tabular-nums font-bold">({cartCount})</span>
        </button>
      </div>
    </header>
  );
}

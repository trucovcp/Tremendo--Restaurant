import { useMemo } from 'react';
import { CalendarDays, Minus, Plus } from 'lucide-react';
import { buildWhatsAppUrl } from '../lib/utils';
import {
  BRAND_ASSETS,
  type CartItem,
  type EstablishmentSettings,
  type MenuPromotion,
} from '../types/menu';

interface PromotionsSectionProps {
  settings: EstablishmentSettings;
  promotions: MenuPromotion[];
  cartItems: CartItem[];
  onAddPromoToCart: (promo: MenuPromotion) => void;
  onUpdateCartQuantity: (id: string, delta: number) => void;
}

export function PromotionsSection({
  settings,
  promotions,
  cartItems,
  onAddPromoToCart,
  onUpdateCartQuantity,
}: PromotionsSectionProps) {
  const activePromos = promotions.filter((p) => p.active);

  const promoQtyMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const item of cartItems) {
      if (item.kind === 'promotion') {
        map.set(item.id, item.quantity);
      }
    }
    return map;
  }, [cartItems]);

  return (
    <section id="promociones" className="py-6 sm:py-12 border-b border-zinc-800/80 bg-[#0C0C0F]">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 space-y-4 sm:space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.16em] text-amber-400">
              Beneficios y Combos
            </p>
            <h2 className="font-display text-xl sm:text-3xl font-bold uppercase tracking-tight text-white">
              Promociones
            </h2>
          </div>
          <div className="gold-rule flex-1 max-w-xs hidden sm:block" />
        </div>

        {activePromos.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-5">
            {activePromos.map((promo) => {
              const cartId = `promo_${promo.id}`;
              const qty = promoQtyMap.get(cartId) || 0;

              return (
                <article
                  key={promo.id}
                  className="rounded-xl bg-[#141417] border border-amber-500/30 overflow-hidden flex flex-col justify-between"
                >
                  {promo.imageUrl ? (
                    <div className="aspect-[16/9] w-full bg-[#0E0E11] overflow-hidden">
                      <img
                        src={promo.imageUrl}
                        alt={promo.title}
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-1.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400" />
                  )}

                  <div className="p-2.5 sm:p-4 flex-1 flex flex-col justify-between gap-2.5">
                    <div className="space-y-1">
                      {promo.validDays && (
                        <div className="flex items-center gap-1 text-[10px] sm:text-xs text-amber-400">
                          <CalendarDays className="w-3 h-3 shrink-0" aria-hidden="true" />
                          <span className="truncate">{promo.validDays}</span>
                        </div>
                      )}
                      <h3 className="font-display text-sm sm:text-xl font-bold uppercase tracking-wide text-white leading-tight">
                        {promo.title}
                      </h3>
                      {promo.description && (
                        <p className="text-[11px] sm:text-sm text-zinc-300 leading-snug">
                          {promo.description}
                        </p>
                      )}
                    </div>

                    <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between gap-2">
                      <span className="font-display text-sm sm:text-lg font-bold text-amber-400 tabular-nums">
                        {promo.priceLabel || 'Consultar'}
                      </span>

                      {qty > 0 ? (
                        <div className="flex items-center gap-1 bg-zinc-900 border border-amber-500/40 rounded-lg p-0.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => onUpdateCartQuantity(cartId, -1)}
                            aria-label={`Quitar ${promo.title}`}
                            className="w-6 h-6 sm:w-7 sm:h-7 rounded-md hover:bg-zinc-800 text-zinc-200 flex items-center justify-center cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-1 text-[11px] sm:text-xs font-bold tabular-nums text-amber-400">
                            {qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => onUpdateCartQuantity(cartId, 1)}
                            aria-label={`Agregar otro ${promo.title}`}
                            className="w-6 h-6 sm:w-7 sm:h-7 rounded-md hover:bg-zinc-800 text-zinc-200 flex items-center justify-center cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onAddPromoToCart(promo)}
                          className="px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold text-[10.5px] sm:text-xs whitespace-nowrap shrink-0 transition-colors cursor-pointer"
                        >
                          Pedir
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="rounded-xl bg-[#141417] border border-zinc-800 p-3.5 sm:p-5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <img
                src={BRAND_ASSETS.logo}
                alt=""
                aria-hidden="true"
                referrerPolicy="no-referrer"
                className="w-9 h-9 sm:w-11 sm:h-11 rounded-full object-cover border border-amber-500/30 shrink-0"
              />
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-semibold text-zinc-100">
                  Promociones gestionables desde administración
                </p>
                <p className="text-[11px] sm:text-xs text-zinc-400 truncate sm:whitespace-normal">
                  Actualmente no hay promociones cargadas. Escribinos por WhatsApp para conocer
                  combos del día.
                </p>
              </div>
            </div>
            <a
              href={buildWhatsAppUrl(
                settings.whatsappNumber,
                `Hola ${settings.name}, ¿tienen promociones vigentes hoy?`
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-amber-400 text-[11px] sm:text-xs font-semibold whitespace-nowrap shrink-0 transition-colors"
            >
              Consultar hoy
            </a>
          </div>
        )}
      </div>
    </section>
  );
}

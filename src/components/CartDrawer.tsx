import { useMemo, useRef, useState } from 'react';
import {
  MapPin,
  MessageCircle,
  Minus,
  Plus,
  ShoppingBag,
  Store,
  Trash2,
  Truck,
  X,
} from 'lucide-react';
import { buildWhatsAppUrl, formatPriceARS } from '../lib/utils';
import {
  BRAND_ASSETS,
  type CartItem,
  type DeliveryMethod,
  type EstablishmentSettings,
} from '../types/menu';

interface CartDrawerProps {
  isOpen: boolean;
  items: CartItem[];
  settings: EstablishmentSettings;
  onClose: () => void;
  onUpdateQuantity: (id: string, delta: number) => void;
  onUpdateNote: (id: string, note: string) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
}

export function CartDrawer({
  isOpen,
  items,
  settings,
  onClose,
  onUpdateQuantity,
  onUpdateNote,
  onRemoveItem,
  onClearCart,
}: CartDrawerProps) {
  const [customerName, setCustomerName] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('retiro');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [generalNote, setGeneralNote] = useState('');
  const [validationError, setValidationError] = useState('');

  const nameInputRef = useRef<HTMLInputElement>(null);
  const addressInputRef = useRef<HTMLInputElement>(null);

  const totalCount = useMemo(
    () => items.reduce((acc, item) => acc + item.quantity, 0),
    [items]
  );

  const totalAmount = useMemo(
    () => items.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0),
    [items]
  );

  const hasNonNumericPromo = useMemo(
    () => items.some((item) => item.unitPrice <= 0 && Boolean(item.priceLabel)),
    [items]
  );

  const whatsappOrderUrl = useMemo(() => {
    const lines: string[] = [
      `¡Hola ${settings.name}! Quiero realizar el siguiente pedido:`,
      '',
      `*Nombre:* ${customerName.trim() || '-'}`,
      deliveryMethod === 'delivery'
        ? `*Modalidad:* Delivery (${deliveryAddress.trim() || 'Dirección a confirmar'})`
        : '*Modalidad:* Retiro por el local',
      '',
      '*Pedido:*',
    ];

    for (const item of items) {
      const priceText =
        item.unitPrice > 0
          ? `${formatPriceARS(item.unitPrice * item.quantity)}`
          : item.priceLabel || 'Consultar';
      lines.push(`• ${item.quantity}x ${item.name} — ${priceText}`);
      if (item.note.trim()) {
        lines.push(`  Aclaración: ${item.note.trim()}`);
      }
    }

    if (generalNote.trim()) {
      lines.push('', `*Aclaración general:* ${generalNote.trim()}`);
    }

    if (totalAmount > 0) {
      lines.push(
        '',
        `*Total${hasNonNumericPromo ? ' parcial' : ''}:* ${formatPriceARS(totalAmount)}`
      );
    }

    return buildWhatsAppUrl(settings.whatsappNumber, lines.join('\n'));
  }, [
    settings.name,
    settings.whatsappNumber,
    customerName,
    deliveryMethod,
    deliveryAddress,
    items,
    generalNote,
    totalAmount,
    hasNonNumericPromo,
  ]);

  if (!isOpen) return null;

  const handleWhatsAppClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (items.length === 0) {
      e.preventDefault();
      return;
    }
    if (!customerName.trim()) {
      e.preventDefault();
      setValidationError('Por favor ingresá tu nombre para enviar el pedido.');
      nameInputRef.current?.focus();
      return;
    }
    if (deliveryMethod === 'delivery' && !deliveryAddress.trim()) {
      e.preventDefault();
      setValidationError('Ingresá la dirección de entrega para el delivery.');
      addressInputRef.current?.focus();
      return;
    }
    setValidationError('');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="cart-drawer-title"
      className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-sm no-print"
    >
      {/* Backdrop click to close */}
      <div className="flex-1" onClick={onClose} aria-hidden="true" />

      <div className="w-full max-w-md bg-[#111114] border-l border-zinc-800 h-full flex flex-col shadow-2xl">
        {/* Drawer Header */}
        <div className="px-4 py-3.5 border-b border-zinc-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-amber-400 shrink-0" aria-hidden="true" />
            <h2
              id="cart-drawer-title"
              className="font-display text-lg sm:text-xl font-bold uppercase tracking-wide text-white"
            >
              Tu Pedido ({totalCount})
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {items.length > 0 && (
              <button
                type="button"
                onClick={onClearCart}
                className="text-[11px] sm:text-xs text-zinc-400 hover:text-red-400 transition-colors cursor-pointer"
              >
                Vaciar
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar carrito"
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {items.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <img
                src={BRAND_ASSETS.logo}
                alt=""
                aria-hidden="true"
                referrerPolicy="no-referrer"
                className="w-16 h-16 rounded-full mx-auto object-contain opacity-65 border border-amber-500/30"
              />
              <p className="font-display text-lg uppercase text-white">
                Tu carrito está vacío
              </p>
              <p className="text-xs sm:text-sm text-zinc-400 max-w-xs mx-auto">
                Tocá el botón <strong className="text-amber-400">Pedir</strong> en cualquier
                producto o promoción del menú para armar tu pedido y enviarlo por WhatsApp.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-2 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold text-xs sm:text-sm cursor-pointer"
              >
                Explorar el menú
              </button>
            </div>
          ) : (
            <>
              {/* Itemized List */}
              <div className="space-y-2.5">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl bg-[#18181C] border border-zinc-800 p-3 space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-2.5">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            referrerPolicy="no-referrer"
                            className="w-12 h-10 rounded-lg object-cover shrink-0 border border-zinc-800"
                          />
                        ) : (
                          <div className="w-12 h-10 rounded-lg bg-[#0E0E11] border border-zinc-800 flex items-center justify-center shrink-0">
                            <img
                              src={BRAND_ASSETS.logo}
                              alt=""
                              aria-hidden="true"
                              referrerPolicy="no-referrer"
                              className="w-7 h-7 rounded-full object-contain opacity-70"
                            />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-semibold text-white leading-tight truncate">
                            {item.name}
                          </p>
                          <p className="text-xs text-amber-400 font-semibold tabular-nums mt-0.5">
                            {item.unitPrice > 0
                              ? formatPriceARS(item.unitPrice * item.quantity)
                              : item.priceLabel || 'Consultar'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(item.id, -1)}
                          aria-label={`Restar ${item.name}`}
                          className="w-7 h-7 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 flex items-center justify-center cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-6 text-center text-xs font-semibold tabular-nums text-white">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(item.id, 1)}
                          aria-label={`Sumar ${item.name}`}
                          className="w-7 h-7 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 flex items-center justify-center cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onRemoveItem(item.id)}
                          aria-label={`Quitar ${item.name}`}
                          className="w-7 h-7 rounded-lg hover:bg-red-900/50 text-zinc-400 hover:text-red-400 flex items-center justify-center ml-0.5 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Per-product clarification */}
                    <input
                      type="text"
                      maxLength={140}
                      value={item.note}
                      onChange={(e) => onUpdateNote(item.id, e.target.value)}
                      placeholder="Aclaración del producto (ej: sin salsa, sin cebolla)"
                      aria-label={`Aclaración para ${item.name}`}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-[#0E0E11] border border-zinc-800 text-[11px] sm:text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                ))}
              </div>

              {/* Order Details Form */}
              <div className="pt-3 border-t border-zinc-800 space-y-3">
                <h3 className="font-display text-sm uppercase tracking-wider text-amber-400">
                  Datos para enviar por WhatsApp
                </h3>

                {/* Customer Name */}
                <div className="space-y-1">
                  <label htmlFor="cart-customer-name" className="block text-xs text-zinc-300">
                    Nombre <span className="text-amber-400">*</span>
                  </label>
                  <input
                    ref={nameInputRef}
                    id="cart-customer-name"
                    type="text"
                    maxLength={80}
                    value={customerName}
                    onChange={(e) => {
                      setCustomerName(e.target.value);
                      if (validationError) setValidationError('');
                    }}
                    placeholder="Tu nombre"
                    className="w-full px-3 py-2 rounded-lg bg-[#0E0E11] border border-zinc-800 text-xs sm:text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Pickup vs Delivery */}
                <div className="space-y-1.5">
                  <span className="block text-xs text-zinc-300">
                    Modalidad <span className="text-amber-400">*</span>
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setDeliveryMethod('retiro');
                        if (validationError) setValidationError('');
                      }}
                      className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 border transition-colors cursor-pointer ${
                        deliveryMethod === 'retiro'
                          ? 'bg-amber-500 text-zinc-950 border-amber-500'
                          : 'bg-[#0E0E11] text-zinc-300 border-zinc-800 hover:border-zinc-600'
                      }`}
                    >
                      <Store className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                      <span>Retiro por el local</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setDeliveryMethod('delivery');
                        if (validationError) setValidationError('');
                      }}
                      className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 border transition-colors cursor-pointer ${
                        deliveryMethod === 'delivery'
                          ? 'bg-amber-500 text-zinc-950 border-amber-500'
                          : 'bg-[#0E0E11] text-zinc-300 border-zinc-800 hover:border-zinc-600'
                      }`}
                    >
                      <Truck className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                      <span>Delivery</span>
                    </button>
                  </div>
                </div>

                {/* Delivery Address when Delivery is chosen */}
                {deliveryMethod === 'delivery' && (
                  <div className="space-y-1">
                    <label
                      htmlFor="cart-delivery-address"
                      className="flex items-center gap-1 text-xs text-zinc-300"
                    >
                      <MapPin className="w-3 h-3 text-amber-400" aria-hidden="true" />
                      <span>
                        Dirección de entrega <span className="text-amber-400">*</span>
                      </span>
                    </label>
                    <input
                      ref={addressInputRef}
                      id="cart-delivery-address"
                      type="text"
                      maxLength={160}
                      value={deliveryAddress}
                      onChange={(e) => {
                        setDeliveryAddress(e.target.value);
                        if (validationError) setValidationError('');
                      }}
                      placeholder="Calle, altura y referencias (Villa Carlos Paz)"
                      className="w-full px-3 py-2 rounded-lg bg-[#0E0E11] border border-zinc-800 text-xs sm:text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                )}

                {/* General Clarification */}
                <div className="space-y-1">
                  <label htmlFor="cart-general-note" className="block text-xs text-zinc-300">
                    Aclaración general (opcional)
                  </label>
                  <textarea
                    id="cart-general-note"
                    rows={2}
                    maxLength={240}
                    value={generalNote}
                    onChange={(e) => setGeneralNote(e.target.value)}
                    placeholder="Ej: Sin aderezos aparte, abono con transferencia..."
                    className="w-full px-3 py-2 rounded-lg bg-[#0E0E11] border border-zinc-800 text-xs sm:text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                {validationError && (
                  <p role="alert" className="text-xs text-red-400 font-medium">
                    {validationError}
                  </p>
                )}
              </div>
            </>
          )}
        </div>

        {/* Sticky Footer Summary & WhatsApp CTA */}
        {items.length > 0 && (
          <div className="p-4 border-t border-zinc-800 bg-[#141417] space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-300 font-medium">
                Total{hasNonNumericPromo ? ' parcial' : ''}
              </span>
              <span className="font-display text-xl font-bold text-amber-400 tabular-nums">
                {totalAmount > 0 ? formatPriceARS(totalAmount) : 'A confirmar'}
              </span>
            </div>

            <a
              href={whatsappOrderUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleWhatsAppClick}
              className="w-full py-2.5 px-4 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors"
            >
              <MessageCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>Enviar pedido por WhatsApp</span>
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

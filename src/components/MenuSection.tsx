import { useMemo, useState } from 'react';
import {
  MessageCircle,
  Minus,
  Plus,
  Search,
  ShoppingBag,
  UtensilsCrossed,
} from 'lucide-react';
import { buildWhatsAppUrl, formatPriceARS } from '../lib/utils';
import {
  BRAND_ASSETS,
  type CartItem,
  type EstablishmentSettings,
  type MenuCategory,
  type MenuProduct,
} from '../types/menu';

interface MenuSectionProps {
  settings: EstablishmentSettings;
  categories: MenuCategory[];
  products: MenuProduct[];
  loading: boolean;
  cartItems: CartItem[];
  onAddToCart: (product: MenuProduct) => void;
  onUpdateCartQuantity: (id: string, delta: number) => void;
  onOpenCart: () => void;
}

function ProductImage({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className="w-full h-full bg-[#111114] flex flex-col items-center justify-center p-3 text-center border-b border-zinc-800/70">
        <img
          src={BRAND_ASSETS.logo}
          alt=""
          aria-hidden="true"
          referrerPolicy="no-referrer"
          className="w-10 h-10 sm:w-14 sm:h-14 rounded-full object-contain opacity-65"
        />
        <span className="mt-1.5 text-[9px] sm:text-[11px] text-zinc-500 uppercase tracking-wider">
          Imagen por cargar
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-[1.03]"
    />
  );
}

export function MenuSection({
  settings,
  categories,
  products,
  loading,
  cartItems,
  onAddToCart,
  onUpdateCartQuantity,
  onOpenCart,
}: MenuSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const activeCategories = useMemo(
    () => categories.filter((c) => c.active),
    [categories]
  );

  const categoryMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of activeCategories) {
      map.set(c.id, c.name);
    }
    return map;
  }, [activeCategories]);

  const cartQtyMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const item of cartItems) {
      if (item.kind === 'product') {
        map.set(item.id, item.quantity);
      }
    }
    return map;
  }, [cartItems]);

  const totalCartCount = useMemo(
    () => cartItems.reduce((acc, item) => acc + item.quantity, 0),
    [cartItems]
  );

  const activeProducts = useMemo(
    () =>
      products.filter((p) => {
        if (!p.active) return false;
        if (selectedCategory !== 'all' && p.categoryId !== selectedCategory) return false;
        if (searchTerm.trim()) {
          const q = searchTerm.trim().toLowerCase();
          return (
            p.name.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q) ||
            (categoryMap.get(p.categoryId) || '').toLowerCase().includes(q)
          );
        }
        return true;
      }),
    [products, selectedCategory, searchTerm, categoryMap]
  );

  const featuredProducts = useMemo(
    () => activeProducts.filter((p) => p.featured),
    [activeProducts]
  );

  const groupedByCategory = useMemo(() => {
    const groups: { category: MenuCategory; items: MenuProduct[] }[] = [];
    const targetCategories =
      selectedCategory === 'all'
        ? activeCategories
        : activeCategories.filter((c) => c.id === selectedCategory);

    for (const cat of targetCategories) {
      const items = activeProducts.filter((p) => p.categoryId === cat.id);
      if (items.length > 0 || !searchTerm.trim()) {
        groups.push({ category: cat, items });
      }
    }
    return groups;
  }, [activeCategories, activeProducts, selectedCategory, searchTerm]);

  return (
    <section id="menu" className="py-6 sm:py-12 border-b border-zinc-800/80">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 space-y-4 sm:space-y-6">
        {/* Section Heading + Compact Search Row */}
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          <div>
            <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.16em] text-amber-400">
              Carta Oficial
            </p>
            <h2 className="font-display text-xl sm:text-3xl font-bold uppercase tracking-tight text-white">
              Menú Digital
            </h2>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {totalCartCount > 0 && (
              <button
                type="button"
                onClick={onOpenCart}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-amber-500/40 text-xs font-semibold text-amber-400 whitespace-nowrap cursor-pointer transition-colors"
              >
                <ShoppingBag className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Ver pedido ({totalCartCount})</span>
              </button>
            )}

            <div className="relative w-36 sm:w-64 shrink-0">
              <Search
                className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-zinc-400 absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              />
              <input
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar..."
                aria-label="Buscar producto en el menú"
                className="w-full pl-8 sm:pl-9 pr-2.5 py-1.5 sm:py-2 rounded-lg bg-[#141417] border border-zinc-800 text-[11px] sm:text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div
          role="tablist"
          aria-label="Categorías del menú"
          className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar pb-1"
        >
          <button
            type="button"
            role="tab"
            aria-selected={selectedCategory === 'all'}
            onClick={() => setSelectedCategory('all')}
            className={`px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-lg text-[11px] sm:text-xs font-semibold uppercase tracking-wide whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-amber-500 text-zinc-950'
                : 'bg-[#141417] text-zinc-300 border border-zinc-800 hover:border-amber-500/40 hover:text-white'
            }`}
          >
            Todas
          </button>

          {activeCategories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              role="tab"
              aria-selected={selectedCategory === cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-lg text-[11px] sm:text-xs font-semibold uppercase tracking-wide whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-amber-500 text-zinc-950'
                  : 'bg-[#141417] text-zinc-300 border border-zinc-800 hover:border-amber-500/40 hover:text-white'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl bg-[#141417] border border-zinc-800 overflow-hidden animate-pulse"
              >
                <div className="aspect-[4/3] bg-zinc-800/60" />
                <div className="p-2.5 sm:p-4 space-y-2">
                  <div className="h-3 w-1/2 bg-zinc-800 rounded" />
                  <div className="h-4 w-3/4 bg-zinc-800 rounded" />
                  <div className="h-3 w-1/3 bg-zinc-800 rounded" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Featured Products Strip */}
        {!loading && featuredProducts.length > 0 && selectedCategory === 'all' && !searchTerm && (
          <div className="space-y-2.5 sm:space-y-3">
            <div className="flex items-center gap-3">
              <h3 className="font-display text-sm sm:text-lg font-semibold uppercase tracking-wider text-amber-400 whitespace-nowrap">
                Destacados de la casa
              </h3>
              <div className="gold-rule flex-1" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-5">
              {featuredProducts.map((product) => (
                <ProductCard
                  key={`feat-${product.id}`}
                  product={product}
                  categoryName={categoryMap.get(product.categoryId) || ''}
                  quantityInCart={cartQtyMap.get(`prod_${product.id}`) || 0}
                  onAddToCart={() => onAddToCart(product)}
                  onUpdateQuantity={(delta) =>
                    onUpdateCartQuantity(`prod_${product.id}`, delta)
                  }
                />
              ))}
            </div>
          </div>
        )}

        {/* Products Grouped by Category */}
        {!loading && activeProducts.length > 0 && (
          <div className="space-y-5 sm:space-y-8">
            {groupedByCategory
              .filter((g) => g.items.length > 0)
              .map(({ category, items }) => (
                <div key={category.id} className="space-y-2.5 sm:space-y-3.5">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-display text-base sm:text-2xl font-bold uppercase tracking-wide text-white">
                      {category.name}
                    </h3>
                    <div className="gold-rule flex-1" />
                    <span className="text-[10px] sm:text-xs text-zinc-400 tabular-nums shrink-0">
                      {items.length} {items.length === 1 ? 'opción' : 'opciones'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-5">
                    {items.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        categoryName={category.name}
                        quantityInCart={cartQtyMap.get(`prod_${product.id}`) || 0}
                        onAddToCart={() => onAddToCart(product)}
                        onUpdateQuantity={(delta) =>
                          onUpdateCartQuantity(`prod_${product.id}`, delta)
                        }
                      />
                    ))}
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* Honest Empty State */}
        {!loading && activeProducts.length === 0 && (
          <div className="rounded-xl bg-[#141417] border border-zinc-800 p-4 sm:p-8 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-amber-400">
                  <UtensilsCrossed className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span className="text-xs sm:text-sm font-semibold uppercase tracking-wider">
                    {searchTerm.trim()
                      ? 'Sin resultados para tu búsqueda'
                      : 'Carta digital en actualización'}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-zinc-300 max-w-2xl leading-relaxed">
                  {searchTerm.trim()
                    ? `No encontramos productos que coincidan con "${searchTerm}". Probá limpiando el filtro.`
                    : 'Las categorías oficiales ya están listas. Podés consultar las opciones y precios del día por WhatsApp o cargar los productos desde el Panel de Administración.'}
                </p>
              </div>

              {searchTerm.trim() ? (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-white shrink-0 cursor-pointer"
                >
                  Limpiar
                </button>
              ) : (
                <a
                  href={buildWhatsAppUrl(
                    settings.whatsappNumber,
                    `Hola ${settings.name}, quería consultar la carta y precios del día.`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold text-[11px] sm:text-xs whitespace-nowrap shrink-0 transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Consultar carta</span>
                </a>
              )}
            </div>

            {!searchTerm.trim() && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 pt-2 border-t border-zinc-800/80">
                {(selectedCategory === 'all'
                  ? activeCategories
                  : activeCategories.filter((c) => c.id === selectedCategory)
                ).map((cat) => (
                  <div
                    key={cat.id}
                    className="rounded-lg bg-[#0E0E11] border border-zinc-800/80 px-3 py-2.5 flex items-center justify-between gap-2"
                  >
                    <span className="font-display text-xs sm:text-sm uppercase tracking-wide text-zinc-100 truncate">
                      {cat.name}
                    </span>
                    <span className="text-[10px] text-amber-400/90 shrink-0">Disponible</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

function ProductCard({
  product,
  categoryName,
  quantityInCart,
  onAddToCart,
  onUpdateQuantity,
}: {
  product: MenuProduct;
  categoryName: string;
  quantityInCart: number;
  onAddToCart: () => void;
  onUpdateQuantity: (delta: number) => void;
}) {
  return (
    <article className="group rounded-xl bg-[#141417] border border-zinc-800/90 hover:border-amber-500/45 transition-all duration-200 hover:-translate-y-0.5 overflow-hidden flex flex-col">
      <div className="aspect-[4/3] w-full bg-[#0E0E11] overflow-hidden shrink-0">
        <ProductImage src={product.imageUrl} alt={product.name} />
      </div>

      <div className="p-2.5 sm:p-4 flex-1 flex flex-col justify-between gap-2">
        <div className="space-y-0.5 sm:space-y-1">
          <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-zinc-400">
            <span className="uppercase tracking-wider text-amber-400/90 font-medium truncate">
              {categoryName}
            </span>
            {product.featured && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-zinc-300 shrink-0">Destacado</span>
              </>
            )}
          </div>

          <h4 className="text-xs sm:text-base font-semibold text-white leading-snug line-clamp-2">
            {product.name}
          </h4>

          {product.description && (
            <p className="text-[11px] sm:text-xs text-zinc-400 leading-snug line-clamp-2">
              {product.description}
            </p>
          )}
        </div>

        <div className="pt-1.5 sm:pt-2 border-t border-zinc-800/70 flex items-center justify-between gap-1.5">
          <span className="font-display text-sm sm:text-lg font-bold text-amber-400 tabular-nums">
            {formatPriceARS(product.price)}
          </span>

          {quantityInCart > 0 ? (
            <div className="flex items-center gap-1 bg-zinc-900 border border-amber-500/40 rounded-lg p-0.5 shrink-0">
              <button
                type="button"
                onClick={() => onUpdateQuantity(-1)}
                aria-label={`Quitar una unidad de ${product.name}`}
                className="w-6 h-6 sm:w-7 sm:h-7 rounded-md hover:bg-zinc-800 text-zinc-200 flex items-center justify-center cursor-pointer"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="px-1 text-[11px] sm:text-xs font-bold tabular-nums text-amber-400">
                {quantityInCart}
              </span>
              <button
                type="button"
                onClick={() => onUpdateQuantity(1)}
                aria-label={`Agregar otra unidad de ${product.name}`}
                className="w-6 h-6 sm:w-7 sm:h-7 rounded-md hover:bg-zinc-800 text-zinc-200 flex items-center justify-center cursor-pointer"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onAddToCart}
              aria-label={`Agregar ${product.name} al carrito`}
              className="px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold text-[10.5px] sm:text-xs whitespace-nowrap shrink-0 transition-colors cursor-pointer"
            >
              Pedir
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

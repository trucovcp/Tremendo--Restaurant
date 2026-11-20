import { useCallback, useEffect, useMemo, useState } from 'react';
import { AdminPanel } from './components/AdminPanel';
import { CartDrawer } from './components/CartDrawer';
import { CookieBanner } from './components/CookieBanner';
import { ErrorBoundary } from './components/ErrorBoundary';
import { EstablishmentSection } from './components/EstablishmentSection';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { LegalModal } from './components/LegalModal';
import { MenuSection } from './components/MenuSection';
import { PromotionsSection } from './components/PromotionsSection';
import { useTremendoData } from './hooks/useTremendoData';
import type {
  CartItem,
  CookieConsentState,
  MenuProduct,
  MenuPromotion,
} from './types/menu';

const COOKIE_STORAGE_KEY = 'tremendo_cookie_consent_v1';
const CART_STORAGE_KEY = 'tremendo_cart_v1';

function loadCookieConsent(): CookieConsentState {
  try {
    const raw = localStorage.getItem(COOKIE_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<CookieConsentState>;
      if (typeof parsed.decided === 'boolean') {
        return {
          decided: parsed.decided,
          essential: true,
          preferences: Boolean(parsed.preferences),
          analytics: Boolean(parsed.analytics),
          updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : '',
        };
      }
    }
  } catch {
    // Ignore storage read errors in restricted contexts
  }
  return {
    decided: false,
    essential: true,
    preferences: false,
    analytics: false,
    updatedAt: '',
  };
}

function loadCartItems(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.filter(
          (item): item is CartItem =>
            typeof item?.id === 'string' &&
            typeof item?.name === 'string' &&
            typeof item?.quantity === 'number' &&
            item.quantity > 0
        );
      }
    }
  } catch {
    // Ignore storage read errors
  }
  return [];
}

function parsePromoPrice(priceLabel: string): number {
  const digits = priceLabel.replace(/[^0-9]/g, '');
  if (!digits) return 0;
  // Avoid accidentally treating "2x1" as $21
  if (/^\s*\d+\s*x\s*\d+/i.test(priceLabel)) return 0;
  const num = Number(digits);
  return Number.isFinite(num) ? num : 0;
}

function TremendoAppContent() {
  const {
    user,
    authReady,
    isAdmin,
    settings,
    hasSettingsDoc,
    categories,
    firestoreCategories,
    products,
    promotions,
    loading,
    dataError,
    loginWithGoogle,
    logout,
    seedInitialData,
    saveSettings,
    upsertCategory,
    deleteCategory,
    upsertProduct,
    deleteProduct,
    upsertPromotion,
    deletePromotion,
  } = useTremendoData();

  const [isAdminRoute, setIsAdminRoute] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.location.hash === '#admin' || window.location.search.includes('admin=1');
  });

  const [legalTab, setLegalTab] = useState<'terms' | 'privacy' | null>(null);
  const [showCookiePrefs, setShowCookiePrefs] = useState(false);
  const [cookieConsent, setCookieConsent] = useState<CookieConsentState>(loadCookieConsent);

  const [cartItems, setCartItems] = useState<CartItem[]>(loadCartItems);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [addedToast, setAddedToast] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    } catch {
      // Ignore storage write errors
    }
  }, [cartItems]);

  useEffect(() => {
    const syncRoute = () => {
      const hash = window.location.hash;
      const inAdmin = hash === '#admin' || window.location.search.includes('admin=1');
      setIsAdminRoute(inAdmin);

      if (!inAdmin && hash === '#menu') {
        requestAnimationFrame(() => {
          document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' });
        });
      }
    };

    syncRoute();
    window.addEventListener('hashchange', syncRoute);
    return () => window.removeEventListener('hashchange', syncRoute);
  }, []);

  const totalCartCount = useMemo(
    () => cartItems.reduce((acc, item) => acc + item.quantity, 0),
    [cartItems]
  );

  const triggerAddedToast = useCallback((itemName: string) => {
    setAddedToast(itemName);
    setTimeout(() => {
      setAddedToast((prev) => (prev === itemName ? null : prev));
    }, 2600);
  }, []);

  const handleAddProductToCart = useCallback(
    (product: MenuProduct) => {
      const cartId = `prod_${product.id}`;
      setCartItems((prev) => {
        const existing = prev.find((i) => i.id === cartId);
        if (existing) {
          return prev.map((i) =>
            i.id === cartId ? { ...i, quantity: i.quantity + 1 } : i
          );
        }
        return [
          ...prev,
          {
            id: cartId,
            kind: 'product',
            name: product.name,
            unitPrice: product.price,
            imageUrl: product.imageUrl,
            quantity: 1,
            note: '',
          },
        ];
      });
      triggerAddedToast(product.name);
    },
    [triggerAddedToast]
  );

  const handleAddPromoToCart = useCallback(
    (promo: MenuPromotion) => {
      const cartId = `promo_${promo.id}`;
      const numericPrice = parsePromoPrice(promo.priceLabel);
      setCartItems((prev) => {
        const existing = prev.find((i) => i.id === cartId);
        if (existing) {
          return prev.map((i) =>
            i.id === cartId ? { ...i, quantity: i.quantity + 1 } : i
          );
        }
        return [
          ...prev,
          {
            id: cartId,
            kind: 'promotion',
            name: promo.title,
            unitPrice: numericPrice,
            priceLabel: promo.priceLabel,
            imageUrl: promo.imageUrl,
            quantity: 1,
            note: '',
          },
        ];
      });
      triggerAddedToast(promo.title);
    },
    [triggerAddedToast]
  );

  const handleUpdateCartQuantity = useCallback((id: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) =>
          item.id === id ? { ...item, quantity: item.quantity + delta } : item
        )
        .filter((item) => item.quantity > 0)
    );
  }, []);

  const handleUpdateCartNote = useCallback((id: string, note: string) => {
    setCartItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, note } : item))
    );
  }, []);

  const handleRemoveCartItem = useCallback((id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const handleClearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const handleOpenAdmin = () => {
    window.location.hash = '#admin';
    setIsAdminRoute(true);
    window.scrollTo({ top: 0 });
  };

  const handleBackToMenu = () => {
    window.location.hash = '#menu';
    setIsAdminRoute(false);
  };

  const handleSaveCookieConsent = (
    next: Omit<CookieConsentState, 'decided' | 'updatedAt'>
  ) => {
    const record: CookieConsentState = {
      ...next,
      essential: true,
      decided: true,
      updatedAt: new Date().toISOString(),
    };
    setCookieConsent(record);
    try {
      localStorage.setItem(COOKIE_STORAGE_KEY, JSON.stringify(record));
    } catch {
      // Ignore storage write errors
    }
  };

  if (isAdminRoute) {
    return (
      <AdminPanel
        user={user}
        authReady={authReady}
        isAdmin={isAdmin}
        settings={settings}
        hasSettingsDoc={hasSettingsDoc}
        categories={categories}
        firestoreCategories={firestoreCategories}
        products={products}
        promotions={promotions}
        onLogin={loginWithGoogle}
        onLogout={logout}
        onSeedInitialData={seedInitialData}
        onSaveSettings={saveSettings}
        onUpsertCategory={upsertCategory}
        onDeleteCategory={deleteCategory}
        onUpsertProduct={upsertProduct}
        onDeleteProduct={deleteProduct}
        onUpsertPromotion={upsertPromotion}
        onDeletePromotion={deletePromotion}
        onBackToMenu={handleBackToMenu}
      />
    );
  }

  return (
    <div
      className={`min-h-screen bg-[#09090B] text-zinc-100 flex flex-col ${
        !cookieConsent.decided ? 'pb-14 sm:pb-12' : ''
      }`}
    >
      <Header
        settings={settings}
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        onNavigateHome={() => setIsAdminRoute(false)}
      />

      <main className="flex-1">
        {dataError && (
          <div
            role="alert"
            className="bg-red-950/70 border-b border-red-500/40 px-4 py-2 text-center text-xs text-red-200"
          >
            {dataError}
          </div>
        )}

        <HeroSection settings={settings} />
        <MenuSection
          settings={settings}
          categories={categories}
          products={products}
          loading={loading}
          cartItems={cartItems}
          onAddToCart={handleAddProductToCart}
          onUpdateCartQuantity={handleUpdateCartQuantity}
          onOpenCart={() => setIsCartOpen(true)}
        />
        <PromotionsSection
          settings={settings}
          promotions={promotions}
          cartItems={cartItems}
          onAddPromoToCart={handleAddPromoToCart}
          onUpdateCartQuantity={handleUpdateCartQuantity}
        />
        <EstablishmentSection settings={settings} />
      </main>

      <Footer
        settings={settings}
        onOpenLegal={(tab) => setLegalTab(tab)}
        onOpenCookiePrefs={() => setShowCookiePrefs(true)}
        onOpenAdmin={handleOpenAdmin}
      />

      {/* Non-blocking feedback toast when item is added to cart */}
      {addedToast && !isCartOpen && (
        <div
          role="status"
          className="fixed bottom-14 sm:bottom-5 right-3 sm:right-6 z-40 rounded-xl bg-[#18181C] border border-amber-500/50 px-3.5 py-2.5 shadow-xl flex items-center gap-3 max-w-[calc(100vw-24px)] no-print"
        >
          <span className="text-xs text-zinc-100 truncate">
            Agregado: <strong className="text-amber-400">{addedToast}</strong>
          </span>
          <button
            type="button"
            onClick={() => {
              setAddedToast(null);
              setIsCartOpen(true);
            }}
            className="text-xs font-semibold text-zinc-950 bg-amber-500 hover:bg-amber-400 px-2.5 py-1 rounded-md whitespace-nowrap shrink-0 cursor-pointer"
          >
            Ver carrito ({totalCartCount})
          </button>
        </div>
      )}

      <CartDrawer
        isOpen={isCartOpen}
        items={cartItems}
        settings={settings}
        onClose={() => setIsCartOpen(false)}
        onUpdateQuantity={handleUpdateCartQuantity}
        onUpdateNote={handleUpdateCartNote}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={handleClearCart}
      />

      <LegalModal
        activeTab={legalTab}
        settings={settings}
        onChangeTab={(tab) => setLegalTab(tab)}
        onClose={() => setLegalTab(null)}
        onOpenCookiePrefs={() => setShowCookiePrefs(true)}
      />

      <CookieBanner
        consent={cookieConsent}
        showPreferencesModal={showCookiePrefs}
        onOpenPreferences={() => setShowCookiePrefs(true)}
        onClosePreferences={() => setShowCookiePrefs(false)}
        onSaveConsent={handleSaveCookieConsent}
        onOpenPrivacy={() => setLegalTab('privacy')}
      />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <TremendoAppContent />
    </ErrorBoundary>
  );
}

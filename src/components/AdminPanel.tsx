import { useState, type ChangeEvent, type FormEvent } from 'react';
import {
  ArrowLeft,
  Check,
  Edit3,
  Eye,
  EyeOff,
  FolderPlus,
  ImagePlus,
  Lock,
  LogOut,
  Plus,
  QrCode,
  Save,
  ShieldAlert,
  Sparkles,
  Store,
  Trash2,
} from 'lucide-react';
import type { User } from 'firebase/auth';
import { compressImageToDataUrl, formatPriceARS } from '../lib/utils';
import {
  BRAND_ASSETS,
  type EstablishmentSettings,
  type MenuCategory,
  type MenuProduct,
  type MenuPromotion,
} from '../types/menu';
import { QrCodeSection } from './QrCodeSection';

type AdminTab = 'products' | 'categories' | 'promotions' | 'settings' | 'qr';

interface AdminPanelProps {
  user: User | null;
  authReady: boolean;
  isAdmin: boolean;
  settings: EstablishmentSettings;
  hasSettingsDoc: boolean;
  categories: MenuCategory[];
  firestoreCategories: MenuCategory[];
  products: MenuProduct[];
  promotions: MenuPromotion[];
  onLogin: () => Promise<void>;
  onLogout: () => Promise<void>;
  onSeedInitialData: () => Promise<void>;
  onSaveSettings: (next: EstablishmentSettings) => Promise<void>;
  onUpsertCategory: (
    input: Omit<MenuCategory, 'id' | 'slug'> & { id?: string; slug?: string }
  ) => Promise<string>;
  onDeleteCategory: (id: string) => Promise<void>;
  onUpsertProduct: (input: Omit<MenuProduct, 'id'> & { id?: string }) => Promise<string>;
  onDeleteProduct: (id: string) => Promise<void>;
  onUpsertPromotion: (input: Omit<MenuPromotion, 'id'> & { id?: string }) => Promise<string>;
  onDeletePromotion: (id: string) => Promise<void>;
  onBackToMenu: () => void;
}

export function AdminPanel({
  user,
  authReady,
  isAdmin,
  settings,
  hasSettingsDoc,
  categories,
  firestoreCategories,
  products,
  promotions,
  onLogin,
  onLogout,
  onSeedInitialData,
  onSaveSettings,
  onUpsertCategory,
  onDeleteCategory,
  onUpsertProduct,
  onDeleteProduct,
  onUpsertPromotion,
  onDeletePromotion,
  onBackToMenu,
}: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>('products');
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  // Product Form State
  const [editingProductId, setEditingProductId] = useState<string | undefined>(undefined);
  const [prodCategoryId, setProdCategoryId] = useState(categories[0]?.id || 'lomos');
  const [prodName, setProdName] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodImage, setProdImage] = useState('');
  const [prodFeatured, setProdFeatured] = useState(false);
  const [prodActive, setProdActive] = useState(true);
  const [prodOrder, setProdOrder] = useState('1');

  // Category Form State
  const [editingCategoryId, setEditingCategoryId] = useState<string | undefined>(undefined);
  const [catName, setCatName] = useState('');
  const [catOrder, setCatOrder] = useState(String(categories.length + 1));
  const [catActive, setCatActive] = useState(true);

  // Promotion Form State
  const [editingPromoId, setEditingPromoId] = useState<string | undefined>(undefined);
  const [promoTitle, setPromoTitle] = useState('');
  const [promoDesc, setPromoDesc] = useState('');
  const [promoPriceLabel, setPromoPriceLabel] = useState('');
  const [promoValidDays, setPromoValidDays] = useState('');
  const [promoImage, setPromoImage] = useState('');
  const [promoActive, setPromoActive] = useState(true);
  const [promoOrder, setPromoOrder] = useState('1');

  // Settings Form State
  const [formSettings, setFormSettings] = useState<EstablishmentSettings>(settings);
  const [highlightsText, setHighlightsText] = useState(settings.highlights.join(', '));

  const notify = (type: 'ok' | 'err', text: string) => {
    setFeedback({ type, text });
    setTimeout(() => setFeedback(null), 4500);
  };

  // Sync settings form when entering settings tab
  const openSettingsTab = () => {
    setFormSettings(settings);
    setHighlightsText(settings.highlights.join(', '));
    setActiveTab('settings');
  };

  const resetProductForm = () => {
    setEditingProductId(undefined);
    setProdCategoryId(categories[0]?.id || 'lomos');
    setProdName('');
    setProdDesc('');
    setProdPrice('');
    setProdImage('');
    setProdFeatured(false);
    setProdActive(true);
    setProdOrder(String(products.length + 1));
  };

  const startEditProduct = (p: MenuProduct) => {
    setEditingProductId(p.id);
    setProdCategoryId(p.categoryId);
    setProdName(p.name);
    setProdDesc(p.description);
    setProdPrice(String(p.price));
    setProdImage(p.imageUrl);
    setProdFeatured(p.featured);
    setProdActive(p.active);
    setProdOrder(String(p.order));
    setActiveTab('products');
  };

  const resetCategoryForm = () => {
    setEditingCategoryId(undefined);
    setCatName('');
    setCatOrder(String(categories.length + 1));
    setCatActive(true);
  };

  const startEditCategory = (c: MenuCategory) => {
    setEditingCategoryId(c.id);
    setCatName(c.name);
    setCatOrder(String(c.order));
    setCatActive(c.active);
  };

  const resetPromoForm = () => {
    setEditingPromoId(undefined);
    setPromoTitle('');
    setPromoDesc('');
    setPromoPriceLabel('');
    setPromoValidDays('');
    setPromoImage('');
    setPromoActive(true);
    setPromoOrder(String(promotions.length + 1));
  };

  const startEditPromo = (pr: MenuPromotion) => {
    setEditingPromoId(pr.id);
    setPromoTitle(pr.title);
    setPromoDesc(pr.description);
    setPromoPriceLabel(pr.priceLabel);
    setPromoValidDays(pr.validDays);
    setPromoImage(pr.imageUrl);
    setPromoActive(pr.active);
    setPromoOrder(String(pr.order));
  };

  const handleImageUpload = async (
    e: ChangeEvent<HTMLInputElement>,
    setter: (val: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setBusy(true);
      const dataUrl = await compressImageToDataUrl(file);
      setter(dataUrl);
      notify('ok', 'Imagen optimizada y lista para guardar.');
    } catch (err) {
      notify('err', err instanceof Error ? err.message : 'Error al procesar imagen.');
    } finally {
      setBusy(false);
      e.target.value = '';
    }
  };

  const handleSaveProduct = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setBusy(true);
      await onUpsertProduct({
        id: editingProductId,
        categoryId: prodCategoryId,
        name: prodName,
        description: prodDesc,
        price: Number(prodPrice) || 0,
        imageUrl: prodImage,
        featured: prodFeatured,
        active: prodActive,
        order: Number(prodOrder) || 0,
      });
      notify('ok', editingProductId ? 'Producto actualizado en el menú.' : 'Producto creado en el menú.');
      resetProductForm();
    } catch (err) {
      notify('err', err instanceof Error ? err.message : 'No se pudo guardar el producto.');
    } finally {
      setBusy(false);
    }
  };

  const handleSaveCategory = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setBusy(true);
      await onUpsertCategory({
        id: editingCategoryId,
        name: catName,
        order: Number(catOrder) || 0,
        active: catActive,
      });
      notify('ok', editingCategoryId ? 'Categoría actualizada.' : 'Categoría creada.');
      resetCategoryForm();
    } catch (err) {
      notify('err', err instanceof Error ? err.message : 'No se pudo guardar la categoría.');
    } finally {
      setBusy(false);
    }
  };

  const handleSavePromo = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setBusy(true);
      await onUpsertPromotion({
        id: editingPromoId,
        title: promoTitle,
        description: promoDesc,
        priceLabel: promoPriceLabel,
        validDays: promoValidDays,
        imageUrl: promoImage,
        active: promoActive,
        order: Number(promoOrder) || 0,
      });
      notify('ok', editingPromoId ? 'Promoción actualizada.' : 'Promoción publicada.');
      resetPromoForm();
    } catch (err) {
      notify('err', err instanceof Error ? err.message : 'No se pudo guardar la promoción.');
    } finally {
      setBusy(false);
    }
  };

  const handleSaveSettingsSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setBusy(true);
      const parsedHighlights = highlightsText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      await onSaveSettings({ ...formSettings, highlights: parsedHighlights });
      notify('ok', 'Datos del establecimiento y horarios actualizados en tiempo real.');
    } catch (err) {
      notify('err', err instanceof Error ? err.message : 'No se pudo guardar la configuración.');
    } finally {
      setBusy(false);
    }
  };

  // --- AUTHENTICATION GATE (Visitors cannot access the Admin Panel) ---
  if (!authReady) {
    return (
      <div className="min-h-screen bg-[#09090B] flex items-center justify-center p-6">
        <p className="text-sm text-zinc-400">Verificando sesión...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#09090B] flex items-center justify-center p-4">
        <div className="max-w-md w-full rounded-2xl bg-[#141417] border border-zinc-800 p-6 sm:p-8 text-center space-y-5">
          <img
            src={BRAND_ASSETS.logo}
            alt="Tremendo"
            referrerPolicy="no-referrer"
            className="w-20 h-20 rounded-full mx-auto object-contain border border-amber-500/40"
          />
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 text-amber-400 text-xs font-semibold uppercase tracking-wider">
              <Lock className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Acceso Privado</span>
            </div>
            <h1 className="font-display text-2xl uppercase text-white">
              Administración Tremendo
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              Iniciá sesión con tu cuenta de Google autorizada para administrar productos, precios,
              categorías, promociones, horarios y códigos QR.
            </p>
          </div>

          <div className="space-y-3">
            <button
              type="button"
              onClick={async () => {
                try {
                  await onLogin();
                } catch {
                  notify('err', 'No se pudo completar el inicio de sesión con Google.');
                }
              }}
              className="w-full py-2.5 px-4 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold text-sm transition-colors cursor-pointer"
            >
              Ingresar con Google
            </button>

            <button
              type="button"
              onClick={onBackToMenu}
              className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Volver al menú público</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#09090B] flex items-center justify-center p-4">
        <div className="max-w-md w-full rounded-2xl bg-[#141417] border border-red-500/30 p-6 sm:p-8 text-center space-y-4">
          <ShieldAlert className="w-10 h-10 text-red-400 mx-auto" aria-hidden="true" />
          <h1 className="font-display text-2xl uppercase text-white">Acceso Restringido</h1>
          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
            La cuenta <strong className="text-white">{user.email}</strong> no tiene permisos de
            administración para {settings.name}.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={onLogout}
              className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-white cursor-pointer"
            >
              Cerrar sesión
            </button>
            <button
              type="button"
              onClick={onBackToMenu}
              className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-semibold cursor-pointer"
            >
              Ir al menú público
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- AUTHORIZED ADMIN WORKSPACE ---
  return (
    <div className="min-h-screen bg-[#09090B] text-zinc-100 pb-12">
      {/* Top Admin Bar */}
      <div className="bg-[#121215] border-b border-zinc-800 sticky top-0 z-40 no-print">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 h-14 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              type="button"
              onClick={onBackToMenu}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-zinc-100 cursor-pointer shrink-0"
            >
              <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Ver menú</span>
            </button>
            <span className="font-display text-lg uppercase tracking-wide text-amber-400 truncate">
              Panel Tremendo
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="hidden sm:inline text-xs text-zinc-400">{user.email}</span>
            <button
              type="button"
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-700 hover:border-zinc-500 text-xs text-zinc-200 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Salir</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-3 sm:px-6 pt-5 space-y-5">
        {/* Seed banner if Firestore not initialized yet */}
        {(!hasSettingsDoc || firestoreCategories.length === 0) && (
          <div className="rounded-xl bg-amber-500/10 border border-amber-500/35 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 no-print">
            <div className="space-y-0.5">
              <p className="text-sm font-semibold text-amber-300">
                Inicialización rápida de Tremendo
              </p>
              <p className="text-xs text-zinc-300">
                Guardá en la base de datos las 8 categorías del folleto oficial (Lomos, Pizzas,
                Empanadas, etc.) y los horarios/dirección de Villa Carlos Paz en un clic.
              </p>
            </div>
            <button
              type="button"
              disabled={busy}
              onClick={async () => {
                try {
                  setBusy(true);
                  await onSeedInitialData();
                  notify('ok', 'Datos base y categorías guardados en Firestore.');
                } catch {
                  notify('err', 'Error al inicializar los datos base.');
                } finally {
                  setBusy(false);
                }
              }}
              className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-semibold whitespace-nowrap cursor-pointer"
            >
              Inicializar categorías y local
            </button>
          </div>
        )}

        {/* Feedback alert */}
        {feedback && (
          <div
            role="status"
            className={`rounded-lg px-4 py-2.5 text-xs sm:text-sm font-medium border no-print ${
              feedback.type === 'ok'
                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200'
                : 'bg-red-950/60 border-red-500/40 text-red-200'
            }`}
          >
            {feedback.text}
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar pb-1 border-b border-zinc-800 no-print">
          {(
            [
              { id: 'products', label: `Productos (${products.length})`, icon: Plus },
              { id: 'categories', label: `Categorías (${categories.length})`, icon: FolderPlus },
              { id: 'promotions', label: `Promociones (${promotions.length})`, icon: Sparkles },
              { id: 'settings', label: 'Local y Horarios', icon: Store },
              { id: 'qr', label: 'Código QR', icon: QrCode },
            ] as const
          ).map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => (tab.id === 'settings' ? openSettingsTab() : setActiveTab(tab.id))}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-t-lg text-xs sm:text-sm font-semibold whitespace-nowrap shrink-0 border-b-2 transition-colors cursor-pointer ${
                  isActive
                    ? 'border-amber-500 text-amber-400 bg-[#141417]'
                    : 'border-transparent text-zinc-400 hover:text-zinc-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: PRODUCTS */}
        {activeTab === 'products' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <form
              onSubmit={handleSaveProduct}
              className="lg:col-span-5 rounded-xl bg-[#141417] border border-zinc-800 p-4 sm:p-5 space-y-3.5"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg uppercase text-white">
                  {editingProductId ? 'Editar Producto' : 'Nuevo Producto'}
                </h2>
                {editingProductId && (
                  <button
                    type="button"
                    onClick={resetProductForm}
                    className="text-xs text-zinc-400 hover:text-white cursor-pointer"
                  >
                    Cancelar edición
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 sm:col-span-1 space-y-1">
                  <label className="block text-xs text-zinc-400">Categoría</label>
                  <select
                    value={prodCategoryId}
                    onChange={(e) => setProdCategoryId(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-[#0E0E11] border border-zinc-800 text-sm text-white focus:outline-none focus:border-amber-500"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2 sm:col-span-1 space-y-1">
                  <label className="block text-xs text-zinc-400">Precio (ARS)</label>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={prodPrice}
                    onChange={(e) => setProdPrice(e.target.value)}
                    placeholder="Ej: 12500"
                    required
                    className="w-full px-3 py-2 rounded-lg bg-[#0E0E11] border border-zinc-800 text-sm text-white tabular-nums focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs text-zinc-400">Nombre del producto</label>
                <input
                  type="text"
                  maxLength={100}
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                  placeholder="Ej: Lomo Completo Tremendo"
                  required
                  className="w-full px-3 py-2 rounded-lg bg-[#0E0E11] border border-zinc-800 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs text-zinc-400">Descripción / Ingredientes</label>
                <textarea
                  rows={3}
                  maxLength={400}
                  value={prodDesc}
                  onChange={(e) => setProdDesc(e.target.value)}
                  placeholder="Detalle de ingredientes o presentación"
                  className="w-full px-3 py-2 rounded-lg bg-[#0E0E11] border border-zinc-800 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs text-zinc-400">Fotografía (subir o pegar URL)</label>
                <div className="flex items-center gap-2">
                  <label className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-white cursor-pointer shrink-0">
                    <ImagePlus className="w-4 h-4 text-amber-400" aria-hidden="true" />
                    <span>Subir foto</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => void handleImageUpload(e, setProdImage)}
                      className="hidden"
                    />
                  </label>
                  <input
                    type="text"
                    value={prodImage}
                    onChange={(e) => setProdImage(e.target.value)}
                    placeholder="O pegá el enlace https://..."
                    className="flex-1 min-w-0 px-3 py-2 rounded-lg bg-[#0E0E11] border border-zinc-800 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                {prodImage && (
                  <div className="flex items-center gap-3 pt-1">
                    <img
                      src={prodImage}
                      alt="Vista previa"
                      referrerPolicy="no-referrer"
                      className="w-16 h-12 rounded object-cover border border-zinc-700"
                    />
                    <button
                      type="button"
                      onClick={() => setProdImage('')}
                      className="text-xs text-red-400 hover:text-red-300 cursor-pointer"
                    >
                      Quitar foto
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1 text-xs">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={prodActive}
                    onChange={(e) => setProdActive(e.target.checked)}
                    className="accent-amber-500"
                  />
                  <span>Visible en menú</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={prodFeatured}
                    onChange={(e) => setProdFeatured(e.target.checked)}
                    className="accent-amber-500"
                  />
                  <span>Destacado</span>
                </label>

                <div className="flex items-center gap-1.5">
                  <span className="text-zinc-400">Orden:</span>
                  <input
                    type="number"
                    min="0"
                    max="10000"
                    value={prodOrder}
                    onChange={(e) => setProdOrder(e.target.value)}
                    className="w-16 px-2 py-1 rounded bg-[#0E0E11] border border-zinc-800 text-white tabular-nums"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={busy}
                className="w-full py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-zinc-950 font-semibold text-sm flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Save className="w-4 h-4" aria-hidden="true" />
                <span>{editingProductId ? 'Guardar cambios' : 'Agregar producto'}</span>
              </button>
            </form>

            <div className="lg:col-span-7 space-y-3">
              <h3 className="font-display text-lg uppercase text-white">
                Productos cargados ({products.length})
              </h3>
              {products.length === 0 ? (
                <div className="rounded-xl bg-[#141417] border border-zinc-800 p-6 text-center text-sm text-zinc-400">
                  Todavía no cargaste productos. Completá el formulario de la izquierda para
                  publicar el primero y aparecerá al instante en el menú QR.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {products.map((p) => {
                    const catName =
                      categories.find((c) => c.id === p.categoryId)?.name || p.categoryId;
                    return (
                      <div
                        key={p.id}
                        className={`rounded-xl bg-[#141417] border p-3 flex items-center justify-between gap-3 ${
                          p.active ? 'border-zinc-800' : 'border-zinc-800/50 opacity-65'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {p.imageUrl ? (
                            <img
                              src={p.imageUrl}
                              alt={p.name}
                              referrerPolicy="no-referrer"
                              className="w-14 h-11 rounded-lg object-cover shrink-0 border border-zinc-800"
                            />
                          ) : (
                            <div className="w-14 h-11 rounded-lg bg-[#0E0E11] border border-zinc-800 flex items-center justify-center text-[10px] text-zinc-500 shrink-0">
                              Sin foto
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-[11px] text-amber-400 font-medium">
                              {catName} {p.featured ? '· Destacado' : ''}{' '}
                              {!p.active ? '· Pausado' : ''}
                            </p>
                            <p className="text-sm font-semibold text-white truncate">{p.name}</p>
                            <p className="text-xs text-zinc-300 tabular-nums">
                              {formatPriceARS(p.price)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            title={p.active ? 'Pausar producto' : 'Activar producto'}
                            onClick={() =>
                              void onUpsertProduct({ ...p, active: !p.active })
                            }
                            className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 cursor-pointer"
                          >
                            {p.active ? (
                              <Eye className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <EyeOff className="w-4 h-4 text-zinc-400" />
                            )}
                          </button>
                          <button
                            type="button"
                            title="Editar"
                            onClick={() => startEditProduct(p)}
                            className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 cursor-pointer"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            title="Eliminar"
                            onClick={() => void onDeleteProduct(p.id)}
                            className="p-2 rounded-lg bg-zinc-800 hover:bg-red-900/60 text-red-400 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: CATEGORIES */}
        {activeTab === 'categories' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <form
              onSubmit={handleSaveCategory}
              className="lg:col-span-5 rounded-xl bg-[#141417] border border-zinc-800 p-4 sm:p-5 space-y-3.5"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg uppercase text-white">
                  {editingCategoryId ? 'Editar Categoría' : 'Nueva Categoría'}
                </h2>
                {editingCategoryId && (
                  <button
                    type="button"
                    onClick={resetCategoryForm}
                    className="text-xs text-zinc-400 hover:text-white cursor-pointer"
                  >
                    Cancelar
                  </button>
                )}
              </div>

              <div className="space-y-1">
                <label className="block text-xs text-zinc-400">Nombre de categoría</label>
                <input
                  type="text"
                  maxLength={60}
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  placeholder="Ej: Lomos, Pizzas, Postres"
                  required
                  className="w-full px-3 py-2 rounded-lg bg-[#0E0E11] border border-zinc-800 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <label className="block text-xs text-zinc-400">Orden de aparición</label>
                  <input
                    type="number"
                    min="0"
                    max="1000"
                    value={catOrder}
                    onChange={(e) => setCatOrder(e.target.value)}
                    className="w-24 px-3 py-2 rounded-lg bg-[#0E0E11] border border-zinc-800 text-sm text-white tabular-nums"
                  />
                </div>
                <label className="flex items-center gap-2 text-xs pt-4 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={catActive}
                    onChange={(e) => setCatActive(e.target.checked)}
                    className="accent-amber-500"
                  />
                  <span>Categoría activa</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={busy}
                className="w-full py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold text-sm cursor-pointer"
              >
                {editingCategoryId ? 'Guardar categoría' : 'Crear categoría'}
              </button>
            </form>

            <div className="lg:col-span-7 space-y-2.5">
              <h3 className="font-display text-lg uppercase text-white">
                Categorías del menú ({categories.length})
              </h3>
              {categories.map((c) => (
                <div
                  key={c.id}
                  className="rounded-xl bg-[#141417] border border-zinc-800 p-3 flex items-center justify-between gap-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-white">{c.name}</p>
                    <p className="text-xs text-zinc-400 tabular-nums">
                      Orden: {c.order} · {c.active ? 'Visible' : 'Oculta'}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => void onUpsertCategory({ ...c, active: !c.active })}
                      className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 cursor-pointer"
                      title={c.active ? 'Ocultar' : 'Activar'}
                    >
                      {c.active ? (
                        <Eye className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-zinc-400" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => startEditCategory(c)}
                      className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 cursor-pointer"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => void onDeleteCategory(c.id)}
                      className="p-2 rounded-lg bg-zinc-800 hover:bg-red-900/60 text-red-400 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: PROMOTIONS */}
        {activeTab === 'promotions' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <form
              onSubmit={handleSavePromo}
              className="lg:col-span-5 rounded-xl bg-[#141417] border border-zinc-800 p-4 sm:p-5 space-y-3.5"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg uppercase text-white">
                  {editingPromoId ? 'Editar Promoción' : 'Nueva Promoción'}
                </h2>
                {editingPromoId && (
                  <button
                    type="button"
                    onClick={resetPromoForm}
                    className="text-xs text-zinc-400 hover:text-white cursor-pointer"
                  >
                    Cancelar
                  </button>
                )}
              </div>

              <div className="space-y-1">
                <label className="block text-xs text-zinc-400">Título de la promo</label>
                <input
                  type="text"
                  maxLength={100}
                  value={promoTitle}
                  onChange={(e) => setPromoTitle(e.target.value)}
                  placeholder="Ej: Promo Lomo + Gaseosa"
                  required
                  className="w-full px-3 py-2 rounded-lg bg-[#0E0E11] border border-zinc-800 text-sm text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs text-zinc-400">Precio o beneficio</label>
                  <input
                    type="text"
                    maxLength={60}
                    value={promoPriceLabel}
                    onChange={(e) => setPromoPriceLabel(e.target.value)}
                    placeholder="Ej: $ 18.500 o 2x1"
                    className="w-full px-3 py-2 rounded-lg bg-[#0E0E11] border border-zinc-800 text-sm text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs text-zinc-400">Días / vigencia</label>
                  <input
                    type="text"
                    maxLength={100}
                    value={promoValidDays}
                    onChange={(e) => setPromoValidDays(e.target.value)}
                    placeholder="Ej: Lunes a jueves"
                    className="w-full px-3 py-2 rounded-lg bg-[#0E0E11] border border-zinc-800 text-sm text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs text-zinc-400">Descripción</label>
                <textarea
                  rows={3}
                  maxLength={400}
                  value={promoDesc}
                  onChange={(e) => setPromoDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#0E0E11] border border-zinc-800 text-sm text-white"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs text-zinc-400">Imagen opcional</label>
                <div className="flex items-center gap-2">
                  <label className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-white cursor-pointer shrink-0">
                    <ImagePlus className="w-4 h-4 text-amber-400" aria-hidden="true" />
                    <span>Subir foto</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => void handleImageUpload(e, setPromoImage)}
                      className="hidden"
                    />
                  </label>
                  <input
                    type="text"
                    value={promoImage}
                    onChange={(e) => setPromoImage(e.target.value)}
                    placeholder="O enlace https://..."
                    className="flex-1 min-w-0 px-3 py-2 rounded-lg bg-[#0E0E11] border border-zinc-800 text-xs text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={promoActive}
                    onChange={(e) => setPromoActive(e.target.checked)}
                    className="accent-amber-500"
                  />
                  <span>Promoción activa</span>
                </label>
                <div className="flex items-center gap-1.5">
                  <span className="text-zinc-400">Orden:</span>
                  <input
                    type="number"
                    min="0"
                    max="1000"
                    value={promoOrder}
                    onChange={(e) => setPromoOrder(e.target.value)}
                    className="w-16 px-2 py-1 rounded bg-[#0E0E11] border border-zinc-800 text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={busy}
                className="w-full py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold text-sm cursor-pointer"
              >
                {editingPromoId ? 'Guardar promoción' : 'Publicar promoción'}
              </button>
            </form>

            <div className="lg:col-span-7 space-y-2.5">
              <h3 className="font-display text-lg uppercase text-white">
                Promociones ({promotions.length})
              </h3>
              {promotions.length === 0 ? (
                <div className="rounded-xl bg-[#141417] border border-zinc-800 p-6 text-center text-sm text-zinc-400">
                  Sin promociones cargadas por el momento.
                </div>
              ) : (
                promotions.map((pr) => (
                  <div
                    key={pr.id}
                    className="rounded-xl bg-[#141417] border border-zinc-800 p-3 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="text-xs text-amber-400">
                        {pr.validDays || 'Vigente'} · {pr.active ? 'Activa' : 'Pausada'}
                      </p>
                      <p className="text-sm font-semibold text-white truncate">{pr.title}</p>
                      <p className="text-xs text-zinc-400 truncate">{pr.priceLabel}</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => void onUpsertPromotion({ ...pr, active: !pr.active })}
                        className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 cursor-pointer"
                      >
                        {pr.active ? (
                          <Eye className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <EyeOff className="w-4 h-4 text-zinc-400" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => startEditPromo(pr)}
                        className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 cursor-pointer"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => void onDeletePromotion(pr.id)}
                        className="p-2 rounded-lg bg-zinc-800 hover:bg-red-900/60 text-red-400 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 4: SETTINGS & HOURS */}
        {activeTab === 'settings' && (
          <form
            onSubmit={handleSaveSettingsSubmit}
            className="rounded-xl bg-[#141417] border border-zinc-800 p-4 sm:p-6 space-y-5"
          >
            <h2 className="font-display text-xl uppercase text-white">
              Datos del Establecimiento, Horarios y Legales
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs text-zinc-400">Nombre comercial</label>
                <input
                  type="text"
                  maxLength={80}
                  value={formSettings.name}
                  onChange={(e) => setFormSettings({ ...formSettings, name: e.target.value })}
                  required
                  className="w-full px-3 py-2 rounded-lg bg-[#0E0E11] border border-zinc-800 text-sm text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs text-zinc-400">Eslogan</label>
                <input
                  type="text"
                  maxLength={120}
                  value={formSettings.slogan}
                  onChange={(e) => setFormSettings({ ...formSettings, slogan: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#0E0E11] border border-zinc-800 text-sm text-white"
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="block text-xs text-zinc-400">Dirección completa</label>
                <input
                  type="text"
                  maxLength={200}
                  value={formSettings.address}
                  onChange={(e) => setFormSettings({ ...formSettings, address: e.target.value })}
                  required
                  className="w-full px-3 py-2 rounded-lg bg-[#0E0E11] border border-zinc-800 text-sm text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs text-zinc-400">Teléfono visible</label>
                <input
                  type="text"
                  maxLength={40}
                  value={formSettings.phone}
                  onChange={(e) => setFormSettings({ ...formSettings, phone: e.target.value })}
                  required
                  className="w-full px-3 py-2 rounded-lg bg-[#0E0E11] border border-zinc-800 text-sm text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs text-zinc-400">
                  Número WhatsApp (solo dígitos con código país, ej: 5493541641990)
                </label>
                <input
                  type="text"
                  maxLength={30}
                  value={formSettings.whatsappNumber}
                  onChange={(e) =>
                    setFormSettings({
                      ...formSettings,
                      whatsappNumber: e.target.value.replace(/[^0-9]/g, ''),
                    })
                  }
                  required
                  className="w-full px-3 py-2 rounded-lg bg-[#0E0E11] border border-zinc-800 text-sm text-white tabular-nums"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs text-zinc-400">Horario Lunes a Jueves</label>
                <input
                  type="text"
                  maxLength={100}
                  value={formSettings.hoursWeekdays}
                  onChange={(e) =>
                    setFormSettings({ ...formSettings, hoursWeekdays: e.target.value })
                  }
                  required
                  className="w-full px-3 py-2 rounded-lg bg-[#0E0E11] border border-zinc-800 text-sm text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs text-zinc-400">Horario Viernes a Domingo</label>
                <input
                  type="text"
                  maxLength={100}
                  value={formSettings.hoursWeekend}
                  onChange={(e) =>
                    setFormSettings({ ...formSettings, hoursWeekend: e.target.value })
                  }
                  required
                  className="w-full px-3 py-2 rounded-lg bg-[#0E0E11] border border-zinc-800 text-sm text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs text-zinc-400">URL Instagram (opcional)</label>
                <input
                  type="url"
                  maxLength={250}
                  value={formSettings.instagramUrl}
                  onChange={(e) =>
                    setFormSettings({ ...formSettings, instagramUrl: e.target.value })
                  }
                  placeholder="https://instagram.com/..."
                  className="w-full px-3 py-2 rounded-lg bg-[#0E0E11] border border-zinc-800 text-sm text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs text-zinc-400">URL Facebook (opcional)</label>
                <input
                  type="url"
                  maxLength={250}
                  value={formSettings.facebookUrl}
                  onChange={(e) =>
                    setFormSettings({ ...formSettings, facebookUrl: e.target.value })
                  }
                  placeholder="https://facebook.com/..."
                  className="w-full px-3 py-2 rounded-lg bg-[#0E0E11] border border-zinc-800 text-sm text-white"
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="block text-xs text-zinc-400">
                  Propuestas destacadas (separadas por coma)
                </label>
                <input
                  type="text"
                  value={highlightsText}
                  onChange={(e) => setHighlightsText(e.target.value)}
                  placeholder="Partidos en vivo, Eventos, Menú digital"
                  className="w-full px-3 py-2 rounded-lg bg-[#0E0E11] border border-zinc-800 text-sm text-white"
                />
              </div>

              <div className="sm:col-span-2 pt-3 border-t border-zinc-800">
                <h3 className="text-sm font-semibold text-amber-400 mb-3">
                  Datos del responsable legal (para Términos y Privacidad)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    maxLength={150}
                    value={formSettings.legalOwnerName}
                    onChange={(e) =>
                      setFormSettings({ ...formSettings, legalOwnerName: e.target.value })
                    }
                    placeholder="Razón social o titular"
                    className="px-3 py-2 rounded-lg bg-[#0E0E11] border border-zinc-800 text-sm text-white"
                  />
                  <input
                    type="text"
                    maxLength={40}
                    value={formSettings.legalCuit}
                    onChange={(e) =>
                      setFormSettings({ ...formSettings, legalCuit: e.target.value })
                    }
                    placeholder="CUIT"
                    className="px-3 py-2 rounded-lg bg-[#0E0E11] border border-zinc-800 text-sm text-white"
                  />
                  <input
                    type="email"
                    maxLength={150}
                    value={formSettings.legalEmail}
                    onChange={(e) =>
                      setFormSettings({ ...formSettings, legalEmail: e.target.value })
                    }
                    placeholder="Email de contacto legal"
                    className="px-3 py-2 rounded-lg bg-[#0E0E11] border border-zinc-800 text-sm text-white"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={busy}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold text-sm cursor-pointer"
            >
              <Check className="w-4 h-4" aria-hidden="true" />
              <span>Guardar configuración del local</span>
            </button>
          </form>
        )}

        {/* TAB 5: QR CODE */}
        {activeTab === 'qr' && <QrCodeSection settings={settings} />}
      </div>
    </div>
  );
}

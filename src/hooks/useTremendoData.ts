import { useCallback, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, type User } from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import {
  ADMIN_EMAIL,
  auth,
  db,
  googleProvider,
  handleFirestoreError,
  OperationType,
} from '../lib/firebase';
import { sanitizeDocId, slugify } from '../lib/utils';
import {
  DEFAULT_CATEGORIES,
  DEFAULT_SETTINGS,
  type EstablishmentSettings,
  type MenuCategory,
  type MenuProduct,
  type MenuPromotion,
} from '../types/menu';

export function useTremendoData() {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);

  const [settings, setSettings] = useState<EstablishmentSettings>(DEFAULT_SETTINGS);
  const [hasSettingsDoc, setHasSettingsDoc] = useState(false);

  const [firestoreCategories, setFirestoreCategories] = useState<MenuCategory[]>([]);
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);

  const [products, setProducts] = useState<MenuProduct[]>([]);
  const [productsLoaded, setProductsLoaded] = useState(false);

  const [promotions, setPromotions] = useState<MenuPromotion[]>([]);
  const [promotionsLoaded, setPromotionsLoaded] = useState(false);

  const [dataError, setDataError] = useState<string | null>(null);

  const isAdmin = Boolean(
    user && user.email === ADMIN_EMAIL && user.emailVerified === true
  );

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthReady(true);
    });
    return () => unsub();
  }, []);

  // Subscribe to public establishment settings
  useEffect(() => {
    const settingsRef = doc(db, 'settings', 'establishment');
    const unsub = onSnapshot(
      settingsRef,
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          setSettings({
            name: typeof data.name === 'string' ? data.name : DEFAULT_SETTINGS.name,
            slogan: typeof data.slogan === 'string' ? data.slogan : DEFAULT_SETTINGS.slogan,
            address: typeof data.address === 'string' ? data.address : DEFAULT_SETTINGS.address,
            phone: typeof data.phone === 'string' ? data.phone : DEFAULT_SETTINGS.phone,
            whatsappNumber:
              typeof data.whatsappNumber === 'string'
                ? data.whatsappNumber
                : DEFAULT_SETTINGS.whatsappNumber,
            hoursWeekdays:
              typeof data.hoursWeekdays === 'string'
                ? data.hoursWeekdays
                : DEFAULT_SETTINGS.hoursWeekdays,
            hoursWeekend:
              typeof data.hoursWeekend === 'string'
                ? data.hoursWeekend
                : DEFAULT_SETTINGS.hoursWeekend,
            instagramUrl: typeof data.instagramUrl === 'string' ? data.instagramUrl : '',
            facebookUrl: typeof data.facebookUrl === 'string' ? data.facebookUrl : '',
            mapsUrl:
              typeof data.mapsUrl === 'string' ? data.mapsUrl : DEFAULT_SETTINGS.mapsUrl,
            highlights: Array.isArray(data.highlights)
              ? data.highlights.filter((item): item is string => typeof item === 'string')
              : DEFAULT_SETTINGS.highlights,
            legalOwnerName:
              typeof data.legalOwnerName === 'string' ? data.legalOwnerName : '',
            legalCuit: typeof data.legalCuit === 'string' ? data.legalCuit : '',
            legalEmail: typeof data.legalEmail === 'string' ? data.legalEmail : '',
          });
          setHasSettingsDoc(true);
        } else {
          setSettings(DEFAULT_SETTINGS);
          setHasSettingsDoc(false);
        }
      },
      (error) => {
        setDataError('No pudimos sincronizar los datos del establecimiento.');
        handleFirestoreError(error, OperationType.GET, 'settings/establishment');
      }
    );
    return () => unsub();
  }, []);

  // Subscribe to categories, products, and promotions once auth state is known
  useEffect(() => {
    if (!authReady) return;

    const categoriesRef = collection(db, 'categories');
    const categoriesQuery = isAdmin
      ? categoriesRef
      : query(categoriesRef, where('active', '==', true));

    const unsubCategories = onSnapshot(
      categoriesQuery,
      (snap) => {
        const list: MenuCategory[] = snap.docs
          .map((d) => {
            const data = d.data();
            return {
              id: d.id,
              name: String(data.name || ''),
              slug: String(data.slug || d.id),
              order: Number(data.order ?? 0),
              active: Boolean(data.active),
            };
          })
          .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));
        setFirestoreCategories(list);
        setCategoriesLoaded(true);
      },
      (error) => {
        setCategoriesLoaded(true);
        setDataError('Error al cargar las categorías del menú.');
        handleFirestoreError(error, OperationType.LIST, 'categories');
      }
    );

    const productsRef = collection(db, 'products');
    const productsQuery = isAdmin
      ? productsRef
      : query(productsRef, where('active', '==', true));

    const unsubProducts = onSnapshot(
      productsQuery,
      (snap) => {
        const list: MenuProduct[] = snap.docs
          .map((d) => {
            const data = d.data();
            return {
              id: d.id,
              categoryId: String(data.categoryId || ''),
              name: String(data.name || ''),
              description: String(data.description || ''),
              price: Number(data.price ?? 0),
              imageUrl: String(data.imageUrl || ''),
              featured: Boolean(data.featured),
              active: Boolean(data.active),
              order: Number(data.order ?? 0),
            };
          })
          .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));
        setProducts(list);
        setProductsLoaded(true);
      },
      (error) => {
        setProductsLoaded(true);
        setDataError('Error al cargar los productos del menú.');
        handleFirestoreError(error, OperationType.LIST, 'products');
      }
    );

    const promotionsRef = collection(db, 'promotions');
    const promotionsQuery = isAdmin
      ? promotionsRef
      : query(promotionsRef, where('active', '==', true));

    const unsubPromotions = onSnapshot(
      promotionsQuery,
      (snap) => {
        const list: MenuPromotion[] = snap.docs
          .map((d) => {
            const data = d.data();
            return {
              id: d.id,
              title: String(data.title || ''),
              description: String(data.description || ''),
              priceLabel: String(data.priceLabel || ''),
              validDays: String(data.validDays || ''),
              imageUrl: String(data.imageUrl || ''),
              active: Boolean(data.active),
              order: Number(data.order ?? 0),
            };
          })
          .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
        setPromotions(list);
        setPromotionsLoaded(true);
      },
      (error) => {
        setPromotionsLoaded(true);
        setDataError('Error al cargar las promociones.');
        handleFirestoreError(error, OperationType.LIST, 'promotions');
      }
    );

    return () => {
      unsubCategories();
      unsubProducts();
      unsubPromotions();
    };
  }, [authReady, isAdmin]);

  // If Firestore has no categories yet and establishment doc hasn't been initialized,
  // display the official flyer categories on the public menu without inventing products.
  const categories =
    firestoreCategories.length > 0 || hasSettingsDoc
      ? firestoreCategories
      : DEFAULT_CATEGORIES;

  const loading = !(categoriesLoaded && productsLoaded && promotionsLoaded);

  const loginWithGoogle = useCallback(async () => {
    await signInWithPopup(auth, googleProvider);
  }, []);

  const logout = useCallback(async () => {
    await signOut(auth);
  }, []);

  const seedInitialData = useCallback(async () => {
    const batch = writeBatch(db);
    if (!hasSettingsDoc) {
      batch.set(doc(db, 'settings', 'establishment'), {
        name: DEFAULT_SETTINGS.name.slice(0, 80),
        slogan: DEFAULT_SETTINGS.slogan.slice(0, 120),
        address: DEFAULT_SETTINGS.address.slice(0, 200),
        phone: DEFAULT_SETTINGS.phone.slice(0, 40),
        whatsappNumber: DEFAULT_SETTINGS.whatsappNumber.replace(/[^0-9]/g, '').slice(0, 30),
        hoursWeekdays: DEFAULT_SETTINGS.hoursWeekdays.slice(0, 100),
        hoursWeekend: DEFAULT_SETTINGS.hoursWeekend.slice(0, 100),
        instagramUrl: '',
        facebookUrl: '',
        mapsUrl: DEFAULT_SETTINGS.mapsUrl.slice(0, 300),
        highlights: DEFAULT_SETTINGS.highlights.slice(0, 10),
        legalOwnerName: '',
        legalCuit: '',
        legalEmail: '',
        updatedAt: serverTimestamp(),
      });
    }

    if (firestoreCategories.length === 0) {
      for (const cat of DEFAULT_CATEGORIES) {
        batch.set(doc(db, 'categories', cat.id), {
          name: cat.name,
          slug: cat.slug,
          order: cat.order,
          active: cat.active,
          updatedAt: serverTimestamp(),
        });
      }
    }

    try {
      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'settings/categories');
    }
  }, [firestoreCategories.length, hasSettingsDoc]);

  const saveSettings = useCallback(async (next: EstablishmentSettings) => {
    const payload = {
      name: next.name.trim().slice(0, 80) || 'Tremendo',
      slogan: next.slogan.trim().slice(0, 120),
      address: next.address.trim().slice(0, 200) || DEFAULT_SETTINGS.address,
      phone: next.phone.trim().slice(0, 40) || DEFAULT_SETTINGS.phone,
      whatsappNumber:
        next.whatsappNumber.replace(/[^0-9]/g, '').slice(0, 30) ||
        DEFAULT_SETTINGS.whatsappNumber,
      hoursWeekdays:
        next.hoursWeekdays.trim().slice(0, 100) || DEFAULT_SETTINGS.hoursWeekdays,
      hoursWeekend:
        next.hoursWeekend.trim().slice(0, 100) || DEFAULT_SETTINGS.hoursWeekend,
      instagramUrl: next.instagramUrl.trim().slice(0, 250),
      facebookUrl: next.facebookUrl.trim().slice(0, 250),
      mapsUrl: next.mapsUrl.trim().slice(0, 300),
      highlights: next.highlights
        .map((h) => h.trim().slice(0, 60))
        .filter(Boolean)
        .slice(0, 10),
      legalOwnerName: next.legalOwnerName.trim().slice(0, 150),
      legalCuit: next.legalCuit.trim().slice(0, 40),
      legalEmail: next.legalEmail.trim().slice(0, 150),
      updatedAt: serverTimestamp(),
    };

    try {
      await setDoc(doc(db, 'settings', 'establishment'), payload);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'settings/establishment');
    }
  }, []);

  const upsertCategory = useCallback(
    async (input: Omit<MenuCategory, 'id' | 'slug'> & { id?: string; slug?: string }) => {
      const cleanName = input.name.trim().slice(0, 60);
      if (!cleanName) throw new Error('El nombre de la categoría es obligatorio.');
      const slug = slugify(input.slug || cleanName);
      const id = sanitizeDocId(input.id || slug);

      try {
        await setDoc(doc(db, 'categories', id), {
          name: cleanName,
          slug,
          order: Math.max(0, Math.min(1000, Math.round(Number(input.order) || 0))),
          active: Boolean(input.active),
          updatedAt: serverTimestamp(),
        });
        return id;
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `categories/${id}`);
      }
    },
    []
  );

  const deleteCategory = useCallback(async (categoryId: string) => {
    try {
      await deleteDoc(doc(db, 'categories', categoryId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `categories/${categoryId}`);
    }
  }, []);

  const upsertProduct = useCallback(
    async (input: Omit<MenuProduct, 'id'> & { id?: string }) => {
      const cleanName = input.name.trim().slice(0, 100);
      if (!cleanName) throw new Error('El nombre del producto es obligatorio.');
      const id = sanitizeDocId(input.id || `prod_${slugify(cleanName)}_${Date.now().toString(36)}`);

      // Ensure referenced category exists in Firestore before creating/updating product
      const categoryExistsInDb = firestoreCategories.some((c) => c.id === input.categoryId);
      if (!categoryExistsInDb) {
        const fallbackCat = DEFAULT_CATEGORIES.find((c) => c.id === input.categoryId);
        if (fallbackCat) {
          await setDoc(doc(db, 'categories', fallbackCat.id), {
            name: fallbackCat.name,
            slug: fallbackCat.slug,
            order: fallbackCat.order,
            active: fallbackCat.active,
            updatedAt: serverTimestamp(),
          });
        }
      }

      try {
        await setDoc(doc(db, 'products', id), {
          categoryId: sanitizeDocId(input.categoryId),
          name: cleanName,
          description: input.description.trim().slice(0, 400),
          price: Math.max(0, Math.min(10000000, Number(input.price) || 0)),
          imageUrl: input.imageUrl.trim().slice(0, 350000),
          featured: Boolean(input.featured),
          active: Boolean(input.active),
          order: Math.max(0, Math.min(10000, Math.round(Number(input.order) || 0))),
          updatedAt: serverTimestamp(),
        });
        return id;
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `products/${id}`);
      }
    },
    [firestoreCategories]
  );

  const deleteProduct = useCallback(async (productId: string) => {
    try {
      await deleteDoc(doc(db, 'products', productId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `products/${productId}`);
    }
  }, []);

  const upsertPromotion = useCallback(
    async (input: Omit<MenuPromotion, 'id'> & { id?: string }) => {
      const cleanTitle = input.title.trim().slice(0, 100);
      if (!cleanTitle) throw new Error('El título de la promoción es obligatorio.');
      const id = sanitizeDocId(input.id || `promo_${slugify(cleanTitle)}_${Date.now().toString(36)}`);

      try {
        await setDoc(doc(db, 'promotions', id), {
          title: cleanTitle,
          description: input.description.trim().slice(0, 400),
          priceLabel: input.priceLabel.trim().slice(0, 60),
          validDays: input.validDays.trim().slice(0, 100),
          imageUrl: input.imageUrl.trim().slice(0, 350000),
          active: Boolean(input.active),
          order: Math.max(0, Math.min(1000, Math.round(Number(input.order) || 0))),
          updatedAt: serverTimestamp(),
        });
        return id;
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `promotions/${id}`);
      }
    },
    []
  );

  const deletePromotion = useCallback(async (promoId: string) => {
    try {
      await deleteDoc(doc(db, 'promotions', promoId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `promotions/${promoId}`);
    }
  }, []);

  return {
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
  };
}

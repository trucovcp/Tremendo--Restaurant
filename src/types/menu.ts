export interface EstablishmentSettings {
  name: string;
  slogan: string;
  address: string;
  phone: string;
  whatsappNumber: string;
  hoursWeekdays: string;
  hoursWeekend: string;
  instagramUrl: string;
  facebookUrl: string;
  mapsUrl: string;
  highlights: string[];
  legalOwnerName: string;
  legalCuit: string;
  legalEmail: string;
}

export interface MenuCategory {
  id: string;
  name: string;
  slug: string;
  order: number;
  active: boolean;
}

export interface MenuProduct {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  featured: boolean;
  active: boolean;
  order: number;
}

export interface MenuPromotion {
  id: string;
  title: string;
  description: string;
  priceLabel: string;
  validDays: string;
  imageUrl: string;
  active: boolean;
  order: number;
}

export interface CookieConsentState {
  decided: boolean;
  essential: true;
  preferences: boolean;
  analytics: boolean;
  updatedAt: string;
}

export type DeliveryMethod = 'retiro' | 'delivery';

export interface CartItem {
  id: string;
  kind: 'product' | 'promotion';
  name: string;
  unitPrice: number;
  priceLabel?: string;
  imageUrl: string;
  quantity: number;
  note: string;
}

export const BRAND_ASSETS = {
  logo: '/assets/aistudio/Captura_de_pantalla_2026-11-19_200246_244ae62e.png',
  flyer: '/assets/aistudio/Captura_de_pantalla_2026-11-19_200237_ff3b3a98.png',
} as const;

export const DEFAULT_SETTINGS: EstablishmentSettings = {
  name: 'Tremendo',
  slogan: 'Mucho más que un sandwich',
  address: 'Paris, Av. Perito Moreno, Villa Carlos Paz, Córdoba, Argentina',
  phone: '03541 64-1990',
  whatsappNumber: '5493541641990',
  hoursWeekdays: 'Lunes a jueves: 11:00 a 01:00',
  hoursWeekend: 'Viernes a domingo: 11:00 a 01:00',
  instagramUrl: '',
  facebookUrl: '',
  mapsUrl:
    'https://www.google.com/maps/search/?api=1&query=Paris+Av.+Perito+Moreno,+Villa+Carlos+Paz,+Cordoba,+Argentina',
  highlights: ['Partidos en vivo', 'Eventos', 'Menú digital'],
  legalOwnerName: '',
  legalCuit: '',
  legalEmail: '',
};

export const DEFAULT_CATEGORIES: MenuCategory[] = [
  { id: 'lomos', name: 'Lomos', slug: 'lomos', order: 1, active: true },
  { id: 'pizzas', name: 'Pizzas', slug: 'pizzas', order: 2, active: true },
  { id: 'empanadas', name: 'Empanadas', slug: 'empanadas', order: 3, active: true },
  {
    id: 'sandwich-de-milanesa',
    name: 'Sandwich de Milanesa',
    slug: 'sandwich-de-milanesa',
    order: 4,
    active: true,
  },
  { id: 'hamburguesas', name: 'Hamburguesas', slug: 'hamburguesas', order: 5, active: true },
  { id: 'papas-fritas', name: 'Papas Fritas', slug: 'papas-fritas', order: 6, active: true },
  { id: 'cervezas', name: 'Cervezas', slug: 'cervezas', order: 7, active: true },
  { id: 'gaseosas', name: 'Gaseosas', slug: 'gaseosas', order: 8, active: true },
];

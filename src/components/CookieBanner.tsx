import { useState } from 'react';
import { Cookie, X } from 'lucide-react';
import type { CookieConsentState } from '../types/menu';

interface CookieBannerProps {
  consent: CookieConsentState;
  showPreferencesModal: boolean;
  onOpenPreferences: () => void;
  onClosePreferences: () => void;
  onSaveConsent: (next: Omit<CookieConsentState, 'decided' | 'updatedAt'>) => void;
  onOpenPrivacy: () => void;
}

export function CookieBanner({
  consent,
  showPreferencesModal,
  onOpenPreferences,
  onClosePreferences,
  onSaveConsent,
  onOpenPrivacy,
}: CookieBannerProps) {
  const [preferences, setPreferences] = useState(consent.preferences);
  const [analytics, setAnalytics] = useState(consent.analytics);

  return (
    <>
      {/* Compact bottom bar on initial visit (respects 15% mobile cap) */}
      {!consent.decided && !showPreferencesModal && (
        <aside
          aria-label="Aviso de cookies"
          className="fixed bottom-0 inset-x-0 z-50 bg-[#121215]/95 backdrop-blur-md border-t border-amber-500/30 px-3 py-2.5 sm:px-6 sm:py-3 no-print"
        >
          <div className="max-w-6xl mx-auto flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 sm:gap-6">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <Cookie
                className="w-4 h-4 text-amber-400 shrink-0 hidden sm:block"
                aria-hidden="true"
              />
              <p className="text-[11px] sm:text-xs text-zinc-200 leading-tight line-clamp-2">
                Usamos almacenamiento esencial para el funcionamiento del menú y cookies opcionales
                de preferencias.{' '}
                <button
                  type="button"
                  onClick={onOpenPrivacy}
                  className="text-amber-400 underline underline-offset-2 cursor-pointer"
                >
                  Política de Privacidad
                </button>
                .
              </p>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 ml-auto">
              <button
                type="button"
                onClick={() => {
                  setPreferences(false);
                  setAnalytics(false);
                  onOpenPreferences();
                }}
                className="px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg border border-zinc-700 text-[10px] sm:text-xs font-medium text-zinc-300 hover:text-white hover:border-zinc-500 whitespace-nowrap cursor-pointer"
              >
                Configurar
              </button>
              <button
                type="button"
                onClick={() =>
                  onSaveConsent({ essential: true, preferences: false, analytics: false })
                }
                className="px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-[10px] sm:text-xs font-medium text-zinc-100 whitespace-nowrap cursor-pointer"
              >
                Rechazar
              </button>
              <button
                type="button"
                onClick={() =>
                  onSaveConsent({ essential: true, preferences: true, analytics: true })
                }
                className="px-2.5 py-1 sm:px-4 sm:py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 text-[10px] sm:text-xs font-semibold whitespace-nowrap cursor-pointer"
              >
                Aceptar
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* Cookie Preferences Modal */}
      {showPreferencesModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="cookie-modal-title"
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 no-print"
        >
          <div className="max-w-lg w-full rounded-xl bg-[#141417] border border-zinc-800 p-5 sm:p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between gap-4">
              <h2
                id="cookie-modal-title"
                className="font-display text-xl uppercase tracking-wide text-white"
              >
                Preferencias de Cookies
              </h2>
              <button
                type="button"
                onClick={onClosePreferences}
                aria-label="Cerrar preferencias de cookies"
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              Podés elegir qué categorías de almacenamiento y cookies no esenciales autorizás.
              Tu elección se guarda localmente en tu navegador y podés modificarla cuando quieras.
            </p>

            <div className="space-y-3">
              <div className="rounded-lg bg-[#0E0E11] border border-zinc-800 p-3 flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-white">Esenciales (Siempre activas)</p>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Necesarias para recordar tu consentimiento, mostrar el menú y proteger la
                    sesión de administración.
                  </p>
                </div>
                <span className="text-xs font-medium text-amber-400 shrink-0">Activas</span>
              </div>

              <label className="rounded-lg bg-[#0E0E11] border border-zinc-800 p-3 flex items-start justify-between gap-3 cursor-pointer">
                <div>
                  <p className="text-sm font-semibold text-white">Preferencias de navegación</p>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Permite recordar tus categorías consultadas y preferencias visuales entre
                    visitas.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences}
                  onChange={(e) => setPreferences(e.target.checked)}
                  className="mt-1 h-4 w-4 accent-amber-500 cursor-pointer"
                />
              </label>

              <label className="rounded-lg bg-[#0E0E11] border border-zinc-800 p-3 flex items-start justify-between gap-3 cursor-pointer">
                <div>
                  <p className="text-sm font-semibold text-white">Medición y analítica</p>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Ayuda a entender qué secciones del menú digital son más consultadas de forma
                    agregada.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={analytics}
                  onChange={(e) => setAnalytics(e.target.checked)}
                  className="mt-1 h-4 w-4 accent-amber-500 cursor-pointer"
                />
              </label>
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  onSaveConsent({ essential: true, preferences: false, analytics: false });
                  onClosePreferences();
                }}
                className="px-3.5 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-zinc-100 cursor-pointer"
              >
                Rechazar no esenciales
              </button>
              <button
                type="button"
                onClick={() => {
                  onSaveConsent({ essential: true, preferences, analytics });
                  onClosePreferences();
                }}
                className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-semibold cursor-pointer"
              >
                Guardar preferencias
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

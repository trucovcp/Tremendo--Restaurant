import { X } from 'lucide-react';
import type { EstablishmentSettings } from '../types/menu';

interface LegalModalProps {
  activeTab: 'terms' | 'privacy' | null;
  settings: EstablishmentSettings;
  onChangeTab: (tab: 'terms' | 'privacy') => void;
  onClose: () => void;
  onOpenCookiePrefs: () => void;
}

export function LegalModal({
  activeTab,
  settings,
  onChangeTab,
  onClose,
  onOpenCookiePrefs,
}: LegalModalProps) {
  if (!activeTab) return null;

  const ownerName =
    settings.legalOwnerName.trim() || '[RAZÓN SOCIAL / TITULAR — PENDIENTE DE COMPLETAR]';
  const ownerCuit = settings.legalCuit.trim() || '[CUIT — PENDIENTE DE COMPLETAR]';
  const ownerEmail =
    settings.legalEmail.trim() || '[EMAIL DE CONTACTO LEGAL — PENDIENTE DE COMPLETAR]';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="legal-modal-title"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 no-print"
    >
      <div className="max-w-3xl w-full max-h-[88vh] rounded-xl bg-[#141417] border border-zinc-800 flex flex-col overflow-hidden shadow-2xl">
        <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-zinc-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onChangeTab('terms')}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                activeTab === 'terms'
                  ? 'bg-amber-500 text-zinc-950'
                  : 'text-zinc-300 hover:text-white bg-zinc-900'
              }`}
            >
              Términos y Condiciones
            </button>
            <button
              type="button"
              onClick={() => onChangeTab('privacy')}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                activeTab === 'privacy'
                  ? 'bg-amber-500 text-zinc-950'
                  : 'text-zinc-300 hover:text-white bg-zinc-900'
              }`}
            >
              Política de Privacidad
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar documento legal"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto text-xs sm:text-sm text-zinc-300 leading-relaxed space-y-4">
          {activeTab === 'terms' ? (
            <>
              <h2
                id="legal-modal-title"
                className="font-display text-xl sm:text-2xl uppercase text-white"
              >
                Términos y Condiciones de Uso — {settings.name}
              </h2>

              <div className="rounded-lg bg-[#0E0E11] border border-zinc-800 p-3 text-xs space-y-1">
                <p>
                  <strong className="text-zinc-100">Establecimiento:</strong> {settings.name}
                </p>
                <p>
                  <strong className="text-zinc-100">Titular / Razón Social:</strong> {ownerName}
                </p>
                <p>
                  <strong className="text-zinc-100">CUIT:</strong> {ownerCuit}
                </p>
                <p>
                  <strong className="text-zinc-100">Domicilio comercial:</strong> {settings.address}
                </p>
                <p>
                  <strong className="text-zinc-100">Teléfono / WhatsApp:</strong> {settings.phone}
                </p>
                <p>
                  <strong className="text-zinc-100">Correo legal:</strong> {ownerEmail}
                </p>
              </div>

              <section className="space-y-1.5">
                <h3 className="font-semibold text-white">1. Objeto del sitio y menú digital</h3>
                <p>
                  El presente sitio web tiene como finalidad poner a disposición del público el
                  menú digital, promociones vigentes, horarios de atención, ubicación y canales de
                  contacto de {settings.name}, ubicado en {settings.address}.
                </p>
              </section>

              <section className="space-y-1.5">
                <h3 className="font-semibold text-white">
                  2. Información de productos, precios y disponibilidad
                </h3>
                <p>
                  Los productos, descripciones, fotografías y precios exhibidos en el menú digital
                  son informativos y se expresan en pesos argentinos (ARS), salvo indicación en
                  contrario. La disponibilidad de los platos, ingredientes o promociones puede
                  variar según stock diario en el establecimiento. El sitio no procesa pagos
                  electrónicos en línea; cualquier pedido o consulta se canaliza de manera directa
                  en el local o mediante WhatsApp al {settings.phone}.
                </p>
              </section>

              <section className="space-y-1.5">
                <h3 className="font-semibold text-white">3. Uso mediante códigos QR</h3>
                <p>
                  El acceso mediante códigos QR redirige al menú digital oficial alojado en este
                  dominio sin requerir descargas adicionales. El usuario se compromete a utilizar
                  el sitio conforme a la buena fe y a la legislación vigente.
                </p>
              </section>

              <section className="space-y-1.5">
                <h3 className="font-semibold text-white">4. Propiedad intelectual</h3>
                <p>
                  El nombre comercial {settings.name}, su logotipo, piezas gráficas y contenidos
                  propios pertenecen a su respectivo titular y no pueden reproducirse con fines
                  comerciales sin autorización previa.
                </p>
              </section>

              <section className="space-y-1.5">
                <h3 className="font-semibold text-white">
                  5. Normativa aplicable y jurisdicción
                </h3>
                <p>
                  Estos términos se rigen por las leyes de la República Argentina, incluyendo la
                  Ley N° 24.240 de Defensa del Consumidor y normas complementarias. Ante cualquier
                  controversia será competente la jurisdicción de los Tribunales Ordinarios de
                  Villa Carlos Paz, Provincia de Córdoba, sin perjuicio del fuero que corresponda
                  al consumidor conforme la normativa aplicable.
                </p>
              </section>
            </>
          ) : (
            <>
              <h2
                id="legal-modal-title"
                className="font-display text-xl sm:text-2xl uppercase text-white"
              >
                Política de Privacidad — {settings.name}
              </h2>

              <div className="rounded-lg bg-[#0E0E11] border border-zinc-800 p-3 text-xs space-y-1">
                <p>
                  <strong className="text-zinc-100">Responsable del tratamiento:</strong>{' '}
                  {ownerName}
                </p>
                <p>
                  <strong className="text-zinc-100">CUIT:</strong> {ownerCuit}
                </p>
                <p>
                  <strong className="text-zinc-100">Domicilio:</strong> {settings.address}
                </p>
                <p>
                  <strong className="text-zinc-100">Contacto para derechos ARCO:</strong>{' '}
                  {ownerEmail} / WhatsApp {settings.phone}
                </p>
              </div>

              <section className="space-y-1.5">
                <h3 className="font-semibold text-white">
                  1. Datos tratados en el sitio web público
                </h3>
                <p>
                  Los visitantes que consultan el menú digital de {settings.name} no necesitan
                  registrarse ni ingresar datos personales para visualizar categorías, productos,
                  precios, promociones, horarios o ubicación.
                </p>
              </section>

              <section className="space-y-1.5">
                <h3 className="font-semibold text-white">
                  2. Cookies y almacenamiento local del navegador
                </h3>
                <p>
                  Utilizamos almacenamiento técnico esencial en tu navegador para conservar tu
                  elección sobre cookies. Las categorías opcionales (preferencias y medición) solo
                  se habilitan si prestás consentimiento explícito. Podés modificar tu decisión en
                  cualquier momento desde{' '}
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenCookiePrefs();
                    }}
                    className="text-amber-400 underline underline-offset-2 cursor-pointer"
                  >
                    Preferencias de Cookies
                  </button>
                  .
                </p>
              </section>

              <section className="space-y-1.5">
                <h3 className="font-semibold text-white">
                  3. Enlaces externos (WhatsApp, Google Maps y redes sociales)
                </h3>
                <p>
                  Al pulsar en los botones de WhatsApp, Google Maps o redes sociales, serás
                  redirigido a plataformas externas sujetas a sus propias políticas de privacidad.
                  Los mensajes enviados por WhatsApp se utilizan únicamente para responder tu
                  consulta o pedido.
                </p>
              </section>

              <section className="space-y-1.5">
                <h3 className="font-semibold text-white">
                  4. Panel de Administración y autenticación
                </h3>
                <p>
                  El acceso al Panel de Administración utiliza autenticación segura mediante
                  Google y verificación de identidad autorizada únicamente para el personal del
                  establecimiento. Los visitantes no tienen acceso a dicha sección.
                </p>
              </section>

              <section className="space-y-1.5">
                <h3 className="font-semibold text-white">
                  5. Derechos del titular de los datos (Ley N° 25.326)
                </h3>
                <p>
                  De conformidad con la Ley N° 25.326 de Protección de los Datos Personales de la
                  República Argentina, el titular de los datos personales tiene la facultad de
                  ejercer el derecho de acceso, rectificación, actualización o supresión de sus
                  datos en forma gratuita a intervalos no inferiores a seis meses, salvo que se
                  acredite un interés legítimo al efecto conforme lo establecido en el artículo 14,
                  inciso 3 de la citada ley. La Agencia de Acceso a la Información Pública (AAIP),
                  órgano de control de la Ley N° 25.326, tiene la atribución de atender las
                  denuncias y reclamos que se interpongan con relación al incumplimiento de las
                  normas sobre protección de datos personales.
                </p>
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

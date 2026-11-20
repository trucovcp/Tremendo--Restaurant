import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Check, Copy, Download, Printer, QrCode } from 'lucide-react';
import { BRAND_ASSETS, type EstablishmentSettings } from '../types/menu';

interface QrCodeSectionProps {
  settings: EstablishmentSettings;
}

export function QrCodeSection({ settings }: QrCodeSectionProps) {
  const [tableLabel, setTableLabel] = useState('');
  const [qrPngUrl, setQrPngUrl] = useState('');
  const [qrSvgMarkup, setQrSvgMarkup] = useState('');
  const [copied, setCopied] = useState(false);

  const stableMenuUrl =
    typeof window !== 'undefined' ? `${window.location.origin}/#menu` : '/#menu';

  useEffect(() => {
    let active = true;

    async function generate() {
      const png = await QRCode.toDataURL(stableMenuUrl, {
        width: 512,
        margin: 2,
        color: {
          dark: '#09090B',
          light: '#FFFFFF',
        },
        errorCorrectionLevel: 'H',
      });
      const svg = await QRCode.toString(stableMenuUrl, {
        type: 'svg',
        margin: 2,
        color: {
          dark: '#09090B',
          light: '#FFFFFF',
        },
        errorCorrectionLevel: 'H',
      });
      if (active) {
        setQrPngUrl(png);
        setQrSvgMarkup(svg);
      }
    }

    void generate();
    return () => {
      active = false;
    };
  }, [stableMenuUrl]);

  const handleCopyUrl = async () => {
    await navigator.clipboard.writeText(stableMenuUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPng = () => {
    if (!qrPngUrl) return;
    const link = document.createElement('a');
    link.href = qrPngUrl;
    link.download = `tremendo-menu-qr${tableLabel ? `-${tableLabel.toLowerCase().replace(/\s+/g, '-')}` : ''}.png`;
    link.click();
  };

  const handleDownloadSvg = () => {
    if (!qrSvgMarkup) return;
    const blob = new Blob([qrSvgMarkup], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tremendo-menu-qr${tableLabel ? `-${tableLabel.toLowerCase().replace(/\s+/g, '-')}` : ''}.svg`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <div className="lg:col-span-7 rounded-xl bg-[#141417] border border-zinc-800 p-5 space-y-4 no-print">
        <div className="flex items-center gap-2 text-amber-400">
          <QrCode className="w-5 h-5" aria-hidden="true" />
          <h3 className="font-display text-xl uppercase tracking-wide text-white">
            Código QR del Menú Digital
          </h3>
        </div>

        <p className="text-sm text-zinc-300 leading-relaxed">
          Este código QR apunta siempre a la dirección estable del menú digital de{' '}
          <strong className="text-white">{settings.name}</strong>. Aunque modifiques productos,
          precios, fotos o promociones, el QR sigue funcionando sin necesidad de reimprimirlo.
        </p>

        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-zinc-400">
            Dirección estable del menú
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={stableMenuUrl}
              className="flex-1 px-3 py-2 rounded-lg bg-[#0E0E11] border border-zinc-800 text-xs sm:text-sm text-zinc-200 font-mono"
            />
            <button
              type="button"
              onClick={handleCopyUrl}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-white cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-amber-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copiado' : 'Copiar'}</span>
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="qr-table-label" className="block text-xs font-medium text-zinc-400">
            Etiqueta opcional para imprimir (ej: Mesa 1, Barra, Salón)
          </label>
          <input
            id="qr-table-label"
            type="text"
            value={tableLabel}
            onChange={(e) => setTableLabel(e.target.value)}
            maxLength={40}
            placeholder="Ej: Mesa 4 o Salón Principal"
            className="w-full px-3 py-2 rounded-lg bg-[#0E0E11] border border-zinc-800 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 pt-2">
          <button
            type="button"
            onClick={handleDownloadPng}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs sm:text-sm font-semibold cursor-pointer"
          >
            <Download className="w-4 h-4" aria-hidden="true" />
            <span>Descargar PNG</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadSvg}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-xs sm:text-sm font-medium cursor-pointer"
          >
            <Download className="w-4 h-4" aria-hidden="true" />
            <span>Descargar SVG</span>
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-zinc-700 hover:border-amber-500/50 text-zinc-100 text-xs sm:text-sm font-medium cursor-pointer"
          >
            <Printer className="w-4 h-4" aria-hidden="true" />
            <span>Imprimir tarjeta de mesa</span>
          </button>
        </div>
      </div>

      {/* Printable Table Tent Preview */}
      <div className="lg:col-span-5 flex justify-center">
        <div className="w-full max-w-xs rounded-2xl bg-[#09090B] border-2 border-amber-500 p-6 text-center space-y-4 shadow-xl">
          <div className="flex flex-col items-center gap-2">
            <img
              src={BRAND_ASSETS.logo}
              alt="Tremendo"
              referrerPolicy="no-referrer"
              className="w-20 h-20 rounded-full object-contain border border-amber-500/40"
            />
            <p className="font-display text-2xl font-bold uppercase tracking-wider text-white">
              {settings.name}
            </p>
            <p className="text-[11px] uppercase tracking-[0.16em] text-amber-400 font-semibold">
              {settings.slogan}
            </p>
          </div>

          <div className="bg-white rounded-xl p-3 inline-block mx-auto">
            {qrPngUrl ? (
              <img
                src={qrPngUrl}
                alt="Código QR para ver el menú digital de Tremendo"
                className="w-44 h-44 object-contain"
              />
            ) : (
              <div className="w-44 h-44 bg-zinc-200 animate-pulse rounded" />
            )}
          </div>

          <div className="space-y-1">
            <p className="font-display text-base uppercase tracking-wide text-white">
              Escaneá y mirá el menú
            </p>
            {tableLabel.trim() && (
              <p className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                {tableLabel.trim()}
              </p>
            )}
            <p className="text-[11px] text-zinc-400">{settings.address}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

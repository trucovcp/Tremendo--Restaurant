import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      message: error.message || 'Ocurrió un error inesperado al cargar la aplicación.',
    };
  }

  componentDidCatch(error: Error) {
    console.error('ErrorBoundary capturó un error:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#09090B] text-zinc-100 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-[#141417] border border-amber-500/30 rounded-xl p-6 text-center space-y-4">
            <h2 className="font-display text-2xl uppercase tracking-wide text-amber-400">
              Algo salió mal
            </h2>
            <p className="text-sm text-zinc-300 leading-relaxed">
              No pudimos completar la operación solicitada. Podés recargar la página para intentar
              nuevamente.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 rounded-lg bg-amber-500 text-zinc-950 font-semibold text-sm hover:bg-amber-400 transition-colors cursor-pointer"
            >
              Recargar página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

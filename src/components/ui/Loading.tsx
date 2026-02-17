// ============================================================
// Componente: Loading (Spinner)
// ============================================================
// Exibe um spinner de carregamento no estilo Apple.
// ============================================================

export default function Loading({ texto = 'Carregando...' }: { texto?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12">
      <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-surface-200 border-t-brand-500" />
      <p className="text-sm text-surface-400">{texto}</p>
    </div>
  );
}

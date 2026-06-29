/**
 * loading.tsx — Skeleton d'inscription
 * Affiché instantanément par Next.js (Streaming SSR / React Suspense)
 * pendant que le bundle client de la page "use client" se charge.
 * Élimine le temps de blanc perçu → améliore le score FCP (First Contentful Paint).
 */
export default function InscriptionLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <div className="w-full max-w-md bg-white border border-slate-200 shadow-2xl rounded-2xl overflow-hidden animate-pulse">
        {/* Barre de gradient top */}
        <div className="h-[2px] bg-gradient-to-r from-transparent via-yellow-400 to-transparent" />

        {/* Header skeleton */}
        <div className="p-8 flex flex-col items-center space-y-4">
          <div className="w-24 h-24 rounded-3xl bg-slate-100" />
          <div className="h-6 w-40 bg-slate-100 rounded-lg" />
          <div className="h-4 w-52 bg-slate-100 rounded-md" />
        </div>

        {/* Stepper skeleton */}
        <div className="px-8 pb-4 flex items-center justify-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-200" />
          <div className="flex-1 h-1 bg-slate-100 rounded" />
          <div className="w-8 h-8 rounded-full bg-slate-100" />
          <div className="flex-1 h-1 bg-slate-100 rounded" />
          <div className="w-8 h-8 rounded-full bg-slate-100" />
        </div>

        {/* Form fields skeleton */}
        <div className="px-8 pb-8 space-y-4">
          <div className="h-10 bg-slate-100 rounded-lg" />
          <div className="h-10 bg-slate-100 rounded-lg" />
          <div className="h-10 bg-slate-100 rounded-lg" />
          <div className="h-10 bg-slate-100 rounded-lg" />
          <div className="h-11 bg-yellow-100 rounded-lg mt-6" />
        </div>

        {/* Footer skeleton */}
        <div className="px-8 py-5 border-t border-slate-100 flex justify-center">
          <div className="h-4 w-44 bg-slate-100 rounded" />
        </div>
      </div>
    </div>
  );
}

/**
 * loading.tsx — Skeleton de connexion
 * Affiché instantanément pendant le chargement du bundle "use client".
 */
export default function ConnexionLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <div className="w-full max-w-sm bg-white border border-slate-200 shadow-2xl rounded-2xl overflow-hidden animate-pulse">
        {/* Header skeleton */}
        <div className="p-8 flex flex-col items-center space-y-4">
          <div className="w-20 h-20 rounded-2xl bg-slate-100" />
          <div className="h-6 w-36 bg-slate-100 rounded-lg" />
          <div className="h-4 w-48 bg-slate-100 rounded-md" />
        </div>

        {/* Form skeleton */}
        <div className="px-8 pb-8 space-y-4">
          <div className="space-y-2">
            <div className="h-4 w-20 bg-slate-100 rounded" />
            <div className="h-10 bg-slate-100 rounded-lg" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-24 bg-slate-100 rounded" />
            <div className="h-10 bg-slate-100 rounded-lg" />
          </div>
          <div className="h-11 bg-yellow-100 rounded-lg mt-4" />
        </div>

        {/* Footer skeleton */}
        <div className="px-8 py-5 border-t border-slate-100 flex justify-center">
          <div className="h-4 w-52 bg-slate-100 rounded" />
        </div>
      </div>
    </div>
  );
}

/**
 * loading.tsx — Skeleton de la page d'accueil OGE Académie
 * Affiché instantanément par Next.js Streaming SSR pendant que le
 * serveur résout les 3 requêtes cachées (sections, témoignages, blog).
 * Élimine le blanc perçu sur les connexions lentes ou cold starts.
 */
export default function HomeLoading() {
  return (
    <div className="min-h-screen bg-[#0A0E17] animate-pulse">
      {/* Navbar skeleton */}
      <div className="h-16 bg-white/5 border-b border-white/10 flex items-center px-6 justify-between">
        <div className="w-32 h-8 bg-white/10 rounded-lg" />
        <div className="flex gap-4">
          <div className="w-20 h-8 bg-white/10 rounded-lg hidden md:block" />
          <div className="w-24 h-8 bg-orange-500/30 rounded-lg" />
        </div>
      </div>

      {/* Hero skeleton */}
      <section className="py-24 px-4 flex flex-col items-center gap-6 text-center">
        <div className="w-24 h-6 bg-orange-500/30 rounded-full" />
        <div className="w-72 h-12 bg-white/10 rounded-xl" />
        <div className="w-96 h-4 bg-white/5 rounded-lg" />
        <div className="w-80 h-4 bg-white/5 rounded-lg" />
        <div className="flex gap-4 mt-4">
          <div className="w-36 h-12 bg-orange-500/40 rounded-xl" />
          <div className="w-36 h-12 bg-white/10 rounded-xl" />
        </div>
      </section>

      {/* Stats bar skeleton */}
      <div className="bg-white/5 border-y border-white/10 py-8 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className="w-16 h-8 bg-orange-500/30 rounded-lg" />
              <div className="w-24 h-4 bg-white/10 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* Section cards skeleton */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="w-48 h-8 bg-white/10 rounded-xl mx-auto mb-10" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white/5 rounded-2xl p-6 space-y-4 border border-white/10">
                <div className="w-12 h-12 bg-orange-500/20 rounded-xl" />
                <div className="w-32 h-5 bg-white/10 rounded" />
                <div className="w-full h-4 bg-white/5 rounded" />
                <div className="w-4/5 h-4 bg-white/5 rounded" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

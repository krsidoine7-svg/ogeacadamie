"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ShieldCheck,
  Lock,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  BookOpen,
  Maximize2,
  AlertCircle,
  Loader2,
  Download
} from "lucide-react";
import { toast } from "sonner";

interface SecureViewerClientProps {
  pdfUrl: string;
  documentTitle: string;
  candidateEmail: string;
  enableSecurity?: boolean;
}

interface SecurePageProps {
  pdf: any;
  pageNum: number;
  scale: number;
  watermarkText: string;
  onVisible: () => void;
  enableSecurity?: boolean;
}

// Subcomponent for rendering a single secure page via HTML5 Canvas
const SecurePage: React.FC<SecurePageProps> = ({
  pdf,
  pageNum,
  scale,
  watermarkText,
  onVisible,
  enableSecurity = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);
  const [shouldRender, setShouldRender] = useState(false);
  const renderTaskRef = useRef<any>(null);

  // 1. Observer for viewport active page tracking (nav toolbar)
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.25) {
            onVisible();
          }
        });
      },
      {
        threshold: [0.25],
        rootMargin: "-15% 0px -15% 0px",
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [onVisible]);

  // 2. Observer for Lazy Rendering trigger (with large 800px vertical buffer)
  useEffect(() => {
    const renderObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShouldRender(true);
            renderObserver.disconnect(); // Once loaded, keep it rendered
          }
        });
      },
      {
        rootMargin: "800px 0px 800px 0px",
      }
    );

    if (containerRef.current) {
      renderObserver.observe(containerRef.current);
    }

    return () => {
      renderObserver.disconnect();
    };
  }, []);

  // 3. Load PDF Page metadata / dimensions on mount
  useEffect(() => {
    if (!pdf) return;
    let active = true;

    const loadPageDimensions = async () => {
      try {
        const page = await pdf.getPage(pageNum);
        if (!active) return;
        const viewport = page.getViewport({ scale });
        setDimensions({ width: viewport.width, height: viewport.height });
      } catch (err) {
        console.error(`Erreur de dimensions page ${pageNum}:`, err);
      }
    };

    loadPageDimensions();

    return () => {
      active = false;
    };
  }, [pdf, scale, pageNum]);

  // 4. Render content onto Canvas only when within scrolling range (shouldRender === true)
  useEffect(() => {
    if (!pdf || !shouldRender) return;

    let active = true;
    setLoading(true);

    const renderPage = async () => {
      try {
        const page = await pdf.getPage(pageNum);
        if (!active) return;

        // Cancel previous rendering task if any
        if (renderTaskRef.current) {
          renderTaskRef.current.cancel();
        }

        const canvas = canvasRef.current;
        if (!canvas) return;

        const viewport = page.getViewport({ scale });
        const pixelRatio = window.devicePixelRatio || 1;

        // Set dimensions optimized for High-DPI screens (Retina)
        canvas.width = viewport.width * pixelRatio;
        canvas.height = viewport.height * pixelRatio;
        canvas.style.width = "100%";
        canvas.style.height = "100%";

        const context = canvas.getContext("2d");
        if (!context) return;

        // Scale transform matrix to draw sharp pixels
        context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        const renderTask = page.render(renderContext);
        renderTaskRef.current = renderTask;

        await renderTask.promise;
        if (active) {
          setLoading(false);
        }
      } catch (err: any) {
        if (err.name !== "RenderingCancelledException") {
          console.error(`Erreur lors du rendu de la page ${pageNum}:`, err);
        }
      }
    };

    renderPage();

    return () => {
      active = false;
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }
    };
  }, [pdf, pageNum, scale, shouldRender]);

  // Repeated watermark items directly layered above the canvas page
  const watermarkItems = Array.from({ length: 16 });

  return (
    <div
      id={`secure-page-${pageNum}`}
      ref={containerRef}
      className="relative my-8 mx-auto bg-white rounded-xl shadow-2xl shadow-black/40 border border-slate-200/10 overflow-hidden flex-shrink-0 transition-transform duration-200 w-full"
      style={{
        maxWidth: dimensions ? `${dimensions.width}px` : "100%",
        aspectRatio: dimensions ? `${dimensions.width} / ${dimensions.height}` : "auto",
        minHeight: dimensions ? "auto" : "450px",
      }}
    >
      {loading && (
        <div className="absolute inset-0 bg-[#0E131F]/90 flex flex-col items-center justify-center text-slate-400 z-20">
          <Loader2 className="w-8 h-8 text-[#D4A017] animate-spin mb-2" />
          <span className="text-xs font-medium">Affichage de la page {pageNum}...</span>
        </div>
      )}

      {/* Render Canvas */}
      {shouldRender && <canvas ref={canvasRef} className="block mx-auto w-full h-full object-contain" />}

      {/* Secure repeating watermark covering the entire canvas element */}
      {enableSecurity && (
        <div className="absolute inset-0 grid grid-cols-2 gap-x-6 gap-y-16 pointer-events-none z-10 overflow-hidden py-14 px-8 select-none">
          {watermarkItems.map((_, i) => (
            <div
              key={i}
              className="text-[10px] sm:text-xs font-extrabold text-[#0B0F19] opacity-[0.06] tracking-widest whitespace-nowrap transform -rotate-30 text-center select-none"
            >
              {watermarkText}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default function SecureViewerClient({
  pdfUrl,
  documentTitle,
  candidateEmail,
  enableSecurity = true,
}: SecureViewerClientProps) {
  const [pdfjs, setPdfjs] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadingPercent, setLoadingPercent] = useState(0);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [pdf, setPdf] = useState<any>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [scale, setScale] = useState<number>(1.0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isBlurred, setIsBlurred] = useState(false);
  const [viewerBg, setViewerBg] = useState<"dark" | "light" | "sepia">("dark");

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // 1. Dynamic Script Loader for PDF.js CDN
  useEffect(() => {
    let active = true;

    const loadCdnFiles = async () => {
      try {
        if ((window as any).pdfjsLib) {
          if (active) {
            setPdfjs((window as any).pdfjsLib);
            return;
          }
        }

        const existingScript = document.getElementById("pdfjs-cdn-script");
        if (existingScript) {
          existingScript.addEventListener("load", () => {
            if (active) {
              const lib = (window as any).pdfjsLib;
              lib.GlobalWorkerOptions.workerSrc =
                "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
              setPdfjs(lib);
            }
          });
          return;
        }

        const script = document.createElement("script");
        script.id = "pdfjs-cdn-script";
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
        script.async = true;

        const loadPromise = new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = () =>
            reject(new Error("Impossible de charger la librairie de rendu PDF."));
        });

        document.body.appendChild(script);
        await loadPromise;

        if (active) {
          const lib = (window as any).pdfjsLib;
          if (lib) {
            lib.GlobalWorkerOptions.workerSrc =
              "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
            setPdfjs(lib);
          } else {
            throw new Error("Librairie PDF.js non initialisée.");
          }
        }
      } catch (err: any) {
        if (active) {
          setLoadError(err.message || "Erreur de chargement du visualiseur sécurisé.");
          setLoading(false);
        }
      }
    };

    loadCdnFiles();

    return () => {
      active = false;
    };
  }, []);

  // 2. Fetch and Load PDF Document when PDF.js is ready
  useEffect(() => {
    if (!pdfjs) return;

    let active = true;
    setLoading(true);
    setLoadError(null);

    const loadingTask = pdfjs.getDocument({
      url: pdfUrl,
      withCredentials: true,
    });

    loadingTask.onProgress = (progress: { loaded: number; total: number }) => {
      if (progress.total > 0 && active) {
        const percent = Math.round((progress.loaded / progress.total) * 100);
        setLoadingPercent(percent);
      }
    };

    loadingTask.promise
      .then((pdfDoc: any) => {
        if (active) {
          setPdf(pdfDoc);
          setNumPages(pdfDoc.numPages);
          setLoading(false);

          // Calculate initial auto scale based on screen size
          const screenWidth = window.innerWidth;
          if (screenWidth < 640) setScale(0.6);      // Phone
          else if (screenWidth < 1024) setScale(0.9); // Tablet
          else setScale(1.15);                        // Desktop
        }
      })
      .catch((err: any) => {
        console.error("Error loading PDF document:", err);
        if (active) {
          setLoadError(
            "Le document sécurisé n'a pas pu être décrypté ou téléchargé. Veuillez rafraîchir la page."
          );
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [pdfjs, pdfUrl]);

  // 3. Security Event Handlers (Right click, Print, Save, Window Blur)
  useEffect(() => {
    if (!enableSecurity) return;

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      toast.warning("Clic droit désactivé pour la sécurité du document.");
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      const isPrint = (isMac ? e.metaKey : e.ctrlKey) && e.key === "p";
      const isSave = (isMac ? e.metaKey : e.ctrlKey) && e.key === "s";
      const isInspect =
        e.key === "F12" ||
        ((isMac ? e.metaKey : e.ctrlKey) &&
          e.shiftKey &&
          (e.key === "I" || e.key === "i" || e.key === "C" || e.key === "c"));
      const isSource = (isMac ? e.metaKey : e.ctrlKey) && (e.key === "u" || e.key === "U");

      if (isPrint || isSave || isInspect || isSource) {
        e.preventDefault();
        e.stopPropagation();
        toast.error("Action bloquée : Ce document est protégé contre l'impression et l'enregistrement.");

        if (isPrint) {
          try {
            navigator.clipboard.writeText(
              "ACCÈS SÉCURISÉ — PROPRIÉTÉ DE OGE ACADÉMIE. IMPRESSION NON AUTORISÉE."
            );
          } catch (_) {}
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "PrintScreen") {
        e.preventDefault();
        try {
          navigator.clipboard.writeText("CAPTURE D'ÉCRAN NON AUTORISÉE.");
          toast.error("Les captures d'écran sont interdites.");
        } catch (_) {}
      }
    };

    const handleWindowBlur = () => {
      setIsBlurred(true);
    };

    const handleWindowFocus = () => {
      setIsBlurred(false);
    };

    window.addEventListener("contextmenu", handleContextMenu);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", handleWindowBlur);
    window.addEventListener("focus", handleWindowFocus);

    return () => {
      window.removeEventListener("contextmenu", handleContextMenu);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", handleWindowBlur);
      window.removeEventListener("focus", handleWindowFocus);
    };
  }, []);

  // 4. Scroll navigation helper
  const scrollToPage = (pageNum: number) => {
    if (pageNum < 1 || pageNum > numPages) return;
    const pageEl = document.getElementById(`secure-page-${pageNum}`);
    if (pageEl) {
      pageEl.scrollIntoView({ behavior: "smooth", block: "start" });
      setCurrentPage(pageNum);
    }
  };

  // 5. Fit to width calculations
  const handleFitWidth = async () => {
    if (!pdf || !scrollContainerRef.current) return;
    try {
      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale: 1.0 });
      // Calculate width minus padding (approx 48px)
      const containerWidth = scrollContainerRef.current.clientWidth - 48;
      const newScale = containerWidth / viewport.width;
      setScale(Math.max(Math.min(newScale, 2.0), 0.4));
      toast.success("Ajusté à la largeur");
    } catch (err) {
      console.error(err);
    }
  };

  // 6. Background cycles
  const cycleBackground = () => {
    if (viewerBg === "dark") setViewerBg("light");
    else if (viewerBg === "light") setViewerBg("sepia");
    else setViewerBg("dark");
  };

  const watermarkText = `${candidateEmail} • OGE ACADÉMIE • ACCÈS SÉCURISÉ`;

  // Dynamic theme styling classes
  const themeClasses = {
    dark: {
      bg: "bg-[#090D16]",
      text: "text-slate-100",
      toolbar: "bg-[#0E131F]/90 border-slate-800",
      btnHover: "hover:bg-slate-800/80 text-slate-300 hover:text-white",
      btnActive: "bg-slate-800 text-white",
      badge: "bg-slate-800/50 border-slate-750 text-slate-300",
    },
    light: {
      bg: "bg-slate-200",
      text: "text-slate-900",
      toolbar: "bg-white/95 border-slate-300 shadow-md",
      btnHover: "hover:bg-slate-300/80 text-slate-700 hover:text-slate-900",
      btnActive: "bg-slate-300 text-slate-900",
      badge: "bg-slate-100 border-slate-300 text-slate-700",
    },
    sepia: {
      bg: "bg-[#FAF4E8]",
      text: "text-[#433422]",
      toolbar: "bg-[#F3EAD3]/95 border-[#E2D5B5] shadow-md",
      btnHover: "hover:bg-[#E9DEBF] text-[#5A4832] hover:text-[#382B1B]",
      btnActive: "bg-[#E9DEBF] text-[#382B1B]",
      badge: "bg-[#FAF4E8] border-[#E2D5B5] text-[#5A4832]",
    },
  }[viewerBg];

  return (
    <div
      className={`fixed inset-0 z-[999] flex flex-col font-sans select-none overflow-hidden transition-colors duration-300 ${themeClasses.bg} ${themeClasses.text}`}
    >
      {/* Top Premium Toolbar */}
      <header
        className={`h-16 border-b backdrop-blur-md px-4 sm:px-6 flex items-center justify-between z-40 flex-shrink-0 transition-colors duration-300 ${themeClasses.toolbar}`}
      >
        {/* Left Side: Back & Title */}
        <div className="flex items-center gap-3 max-w-[40%] sm:max-w-[30%]">
          <Link
            href="/dashboard/documents"
            className={`p-2 rounded-xl border border-transparent transition-all duration-200 ${themeClasses.btnHover}`}
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="hidden sm:block truncate">
            <h1 className="font-bold text-xs sm:text-sm truncate">
              {documentTitle}
            </h1>
            <div className="flex items-center gap-1 mt-0.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-[10px] text-emerald-500 font-extrabold uppercase tracking-wider">
                Visualiseur Sécurisé
              </span>
            </div>
          </div>
        </div>

        {/* Center Side: Controls (Zoom & Navigation) */}
        <div className="flex items-center gap-1 sm:gap-3">
          {/* Page nav */}
          <div className="flex items-center gap-0.5 sm:gap-1 bg-black/10 rounded-lg p-0.5 border border-white/5">
            <button
              onClick={() => scrollToPage(currentPage - 1)}
              disabled={currentPage <= 1}
              className={`p-1.5 rounded-md disabled:opacity-40 transition ${themeClasses.btnHover}`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-semibold px-1 sm:px-2 min-w-[55px] sm:min-w-[70px] text-center font-mono">
              {currentPage} / {numPages || "?"}
            </span>
            <button
              onClick={() => scrollToPage(currentPage + 1)}
              disabled={currentPage >= numPages}
              className={`p-1.5 rounded-md disabled:opacity-40 transition ${themeClasses.btnHover}`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center gap-0.5 sm:gap-1 bg-black/10 rounded-lg p-0.5 border border-white/5">
            <button
              onClick={() => setScale((prev) => Math.max(prev - 0.15, 0.4))}
              className={`p-1.5 rounded-md transition ${themeClasses.btnHover}`}
              title="Zoom Arrière"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold px-1.5 min-w-[45px] text-center font-mono hidden min-[400px]:inline-block">
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={() => setScale((prev) => Math.min(prev + 0.15, 2.5))}
              className={`p-1.5 rounded-md transition ${themeClasses.btnHover}`}
              title="Zoom Avant"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={handleFitWidth}
              className={`p-1.5 rounded-md transition hidden md:inline-block ${themeClasses.btnHover}`}
              title="Ajuster à la largeur"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Side: Theme Cycle & Identity */}
        <div className="flex items-center gap-2">
          {/* Download Button (Only when PDF security is disabled) */}
          {!enableSecurity && (
            <a
              href={pdfUrl}
              download={`${documentTitle}.pdf`}
              className={`p-2 rounded-xl transition ${themeClasses.btnHover}`}
              title="Télécharger le support de cours"
            >
              <Download className="w-4 h-4" />
            </a>
          )}

          {/* Background Toggle */}
          <button
            onClick={cycleBackground}
            className={`p-2 rounded-xl transition ${themeClasses.btnHover}`}
            title="Changer le thème de lecture"
          >
            {viewerBg === "dark" && <Sun className="w-4 h-4" />}
            {viewerBg === "light" && <Moon className="w-4 h-4" />}
            {viewerBg === "sepia" && <BookOpen className="w-4 h-4 text-amber-700" />}
          </button>

          {/* Candidate Email Badge */}
          <div
            className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] font-bold max-w-[120px] sm:max-w-xs truncate font-mono ${themeClasses.badge}`}
          >
            <Lock className="w-3.5 h-3.5 text-[#D4A017] flex-shrink-0" />
            <span className="truncate text-[#D4A017]">{candidateEmail}</span>
          </div>
        </div>
      </header>

      {/* Main Viewport Area */}
      <div
        id="pdf-scroll-viewport"
        ref={scrollContainerRef}
        className="flex-1 w-full overflow-y-auto px-2 sm:px-4 py-4 flex flex-col items-center relative z-10"
      >
        {/* Document Loading State */}
        {loading && (
          <div className="absolute inset-0 bg-[#090D16]/95 z-50 flex flex-col items-center justify-center p-4">
            <div className="w-16 h-16 border-4 border-[#D4A017]/30 border-t-[#D4A017] rounded-full animate-spin mb-6" />
            <h3 className="text-sm font-bold tracking-wide text-slate-200">
              Décodage du support sécurisé...
            </h3>
            <div className="w-48 bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden border border-slate-700/50">
              <div
                className="bg-[#D4A017] h-full rounded-full transition-all duration-300"
                style={{ width: `${loadingPercent}%` }}
              />
            </div>
            <span className="text-[10px] text-[#D4A017] mt-1.5 font-bold font-mono">
              {loadingPercent}% chargé
            </span>
          </div>
        )}

        {/* Load Error State */}
        {loadError && (
          <div className="absolute inset-0 bg-[#090D16] z-50 flex items-center justify-center p-6">
            <div className="text-center max-w-md bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl space-y-4">
              <div className="w-12 h-12 bg-red-500/10 rounded-xl border border-red-500/20 flex items-center justify-center mx-auto text-red-400">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-slate-100">Erreur de chargement</h2>
              <p className="text-xs text-slate-400 leading-relaxed">{loadError}</p>
              <button
                onClick={() => window.location.reload()}
                className="text-xs font-bold bg-[#D4A017] text-slate-950 px-5 py-2.5 rounded-xl hover:bg-[#c39015] active:scale-95 transition-all shadow-lg"
              >
                Actualiser la page
              </button>
            </div>
          </div>
        )}

        {/* Render PDF Pages */}
        {!loading && !loadError && pdf && (
          <div className="w-full flex flex-col items-center">
            {Array.from({ length: numPages }).map((_, idx) => (
              <SecurePage
                key={idx + 1}
                pdf={pdf}
                pageNum={idx + 1}
                scale={scale}
                watermarkText={watermarkText}
                onVisible={() => setCurrentPage(idx + 1)}
                enableSecurity={enableSecurity}
              />
            ))}
          </div>
        )}
      </div>

      {/* Screen blur/pause overlay when tab is inactive */}
      {isBlurred && (
        <div className="fixed inset-0 bg-[#090D16]/95 backdrop-blur-md flex flex-col items-center justify-center text-center space-y-4 z-[1000] p-6">
          <div className="w-14 h-14 bg-slate-800/80 border border-slate-700/50 rounded-2xl flex items-center justify-center text-[#D4A017] animate-pulse">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="font-extrabold text-base text-slate-100 tracking-tight">
            Lecture en Pause
          </h2>
          <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
            Cliquez n'importe où dans la fenêtre pour reprendre la lecture de votre support de cours sécurisé.
          </p>
          <button
            onClick={() => setIsBlurred(false)}
            className="text-xs font-bold bg-[#D4A017] text-slate-950 px-6 py-2.5 rounded-xl hover:bg-[#c39015] active:scale-95 transition-all shadow-lg"
          >
            Reprendre la lecture
          </button>
        </div>
      )}

      {/* Standard CSS adjustments targeting overall page selection and scroll styling */}
      <style jsx global>{`
        body {
          -webkit-user-select: none !important;
          -moz-user-select: none !important;
          -ms-user-select: none !important;
          user-select: none !important;
          overflow: hidden !important;
        }
        #pdf-scroll-viewport::-webkit-scrollbar {
          width: 8px;
        }
        #pdf-scroll-viewport::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.1);
        }
        #pdf-scroll-viewport::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.15);
          border-radius: 4px;
        }
        #pdf-scroll-viewport::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </div>
  );
}

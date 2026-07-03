"use client";

import React, { useState } from "react";
import { Eye, X, ChevronLeft, ChevronRight, Play } from "lucide-react";

interface Affiche {
  id: string;
  url: string;
  title?: string;
  type?: "image" | "video";
}

interface AffichesGalleryProps {
  images: Affiche[];
}

export default function AffichesGallery({ images }: AffichesGalleryProps) {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  const openLightbox = (index: number) => {
    setActiveIdx(index);
    document.body.style.overflow = "hidden";
  };

  const closeLightbox = () => {
    setActiveIdx(null);
    document.body.style.overflow = "unset";
  };

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeIdx === null) return;
    setActiveIdx((activeIdx + 1) % images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeIdx === null) return;
    setActiveIdx((activeIdx - 1 + images.length) % images.length);
  };

  const isVideoFile = (item: Affiche) => {
    return (
      item.type === "video" ||
      item.url.toLowerCase().endsWith(".mp4") ||
      item.url.toLowerCase().endsWith(".webm") ||
      item.url.toLowerCase().endsWith(".mov")
    );
  };

  return (
    <div className="w-full">
      {/* Grid Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8 items-start justify-center">
        {images.map((img, idx) => {
          const isVideo = isVideoFile(img);
          return (
            <div
              key={img.id || idx}
              onClick={() => openLightbox(idx)}
              className="group relative cursor-pointer overflow-hidden rounded-[20px] bg-white border border-slate-150 shadow-sm transition-all duration-300 hover:shadow-md hover:border-[#D4A017]/40 hover:-translate-y-1 w-full h-auto"
            >
              {/* Media element (Image or Video) */}
              {isVideo ? (
                <div className="relative aspect-video sm:aspect-square w-full overflow-hidden bg-slate-950 flex items-center justify-center">
                  <video
                    src={img.url}
                    className="w-full h-full object-cover block transition-transform duration-500 group-hover:scale-105"
                    muted
                    loop
                    playsInline
                    autoPlay
                  />
                  <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-lg group-hover:scale-110 transition-all">
                      <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                    </div>
                  </div>
                </div>
              ) : (
                <img
                  src={img.url}
                  alt={img.title || `Affiche OGE Académie - ${idx + 1}`}
                  className="w-full h-auto block transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              )}

              {/* Dark glassmorphic gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5 text-white">
                <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-md p-2 rounded-full border border-white/20">
                  <Eye className="w-4 h-4 text-white" />
                </div>
                <div className="space-y-1 select-none">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#D4A017]">
                    {isVideo ? "Actualité Vidéo" : "Affiche Officielle"}
                  </span>
                  <h4 className="text-sm font-bold leading-snug tracking-tight text-white line-clamp-2">
                    {img.title || `Annonce ${idx + 1}`}
                  </h4>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Lightbox Modal */}
      {activeIdx !== null && (
        <div
          onClick={closeLightbox}
          className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 animate-fade-in"
        >
          {/* Top Bar / Controls */}
          <div className="absolute top-6 left-0 right-0 px-6 flex items-center justify-between z-10">
            <h4 className="text-white text-sm font-bold drop-shadow-md select-none">
              {images[activeIdx].title || `Affiche ${activeIdx + 1} / ${images.length}`}
            </h4>
            <button
              onClick={closeLightbox}
              className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-white transition-all cursor-pointer hover:scale-105 active:scale-95"
              aria-label="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-4 sm:left-6 p-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-white transition-all cursor-pointer hover:scale-105 active:scale-95 z-10"
                aria-label="Précédent"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 sm:right-6 p-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-white transition-all cursor-pointer hover:scale-105 active:scale-95 z-10"
                aria-label="Suivant"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Lightbox Content */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-full max-h-[85vh] flex items-center justify-center"
          >
            {isVideoFile(images[activeIdx]) ? (
              <video
                src={images[activeIdx].url}
                className="max-w-full max-h-[80vh] sm:max-h-[85vh] object-contain rounded-xl border border-white/10 shadow-2xl animate-zoom-in"
                controls
                autoPlay
                playsInline
              />
            ) : (
              <img
                src={images[activeIdx].url}
                alt={images[activeIdx].title || "Affiche agrandie"}
                className="max-w-full max-h-[80vh] sm:max-h-[85vh] object-contain rounded-xl border border-white/10 shadow-2xl animate-zoom-in"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

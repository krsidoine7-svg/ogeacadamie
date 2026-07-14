"use client";

import React, { useEffect, useRef, useState } from "react";

interface AutoplayVideoProps {
  src: string;
  poster?: string;
}

export default function AutoplayVideo({ src, poster }: AutoplayVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoDims, setVideoDims] = useState<{ width: number; height: number } | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Use IntersectionObserver to play/pause video when it enters/leaves the viewport
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Play video when in viewport
            video.play().catch((err) => {
              console.log("Autoplay prevented by browser policy:", err);
            });
          } else {
            // Pause video when out of viewport
            video.pause();
          }
        });
      },
      {
        threshold: 0.25, // Trigger when 25% of the video is visible
      }
    );

    observer.observe(video);

    return () => {
      observer.disconnect();
    };
  }, [src]);

  const handleLoadedMetadata = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    setVideoDims({
      width: video.videoWidth,
      height: video.videoHeight,
    });
  };

  let containerClass = "relative rounded-[16px] sm:rounded-[24px] overflow-hidden shadow-xl border border-slate-200 bg-slate-950 mx-auto transition-all duration-300";
  const containerStyle: React.CSSProperties = {};

  if (videoDims) {
    const ratio = videoDims.width / videoDims.height;
    if (ratio < 0.8) {
      // Portrait / TikTok format
      containerClass += " w-full max-w-[340px]";
      containerStyle.aspectRatio = `${videoDims.width} / ${videoDims.height}`;
    } else if (ratio >= 0.8 && ratio <= 1.2) {
      // Square format
      containerClass += " w-full max-w-[480px]";
      containerStyle.aspectRatio = `${videoDims.width} / ${videoDims.height}`;
    } else {
      // Landscape format
      containerClass += " w-full max-w-3xl";
      containerStyle.aspectRatio = `${videoDims.width} / ${videoDims.height}`;
    }
  } else {
    // Fallback/loading: assume standard 16:9 landscape to avoid initial layout shift
    containerClass += " w-full max-w-3xl aspect-video";
  }

  return (
    <div className={containerClass} style={containerStyle}>
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        loop
        muted
        playsInline
        controls
        onLoadedMetadata={handleLoadedMetadata}
        className="w-full h-full object-cover block"
      />
    </div>
  );
}


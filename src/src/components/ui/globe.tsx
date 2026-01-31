"use client";

import { useEffect, useRef } from "react";
import createGlobe from "cobe";

interface GlobeProps {
  className?: string;
}

export function Globe({ className }: GlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let phi = 0;

    if (!canvasRef.current) return;

    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: 2,
      width: 600 * 2,
      height: 600 * 2,
      phi: 0,
      theta: 0.3,
      dark: 1,
      diffuse: 1.2,
      mapSamples: 16000,
      mapBrightness: 6,
      baseColor: [0.3, 0.3, 0.3],
      markerColor: [0.6, 0.4, 1],
      glowColor: [0.4, 0.2, 0.6],
      markers: [
        // Popular content creation hubs
        { location: [37.7749, -122.4194], size: 0.05 }, // San Francisco
        { location: [40.7128, -74.006], size: 0.05 }, // New York
        { location: [51.5074, -0.1278], size: 0.05 }, // London
        { location: [35.6762, 139.6503], size: 0.05 }, // Tokyo
        { location: [28.6139, 77.209], size: 0.05 }, // Delhi
        { location: [-23.5505, -46.6333], size: 0.05 }, // São Paulo
        { location: [1.3521, 103.8198], size: 0.05 }, // Singapore
        { location: [55.7558, 37.6173], size: 0.05 }, // Moscow
        { location: [31.2304, 121.4737], size: 0.05 }, // Shanghai
        { location: [19.076, 72.8777], size: 0.05 }, // Mumbai
      ],
      onRender: (state) => {
        // Slowly rotate the globe
        state.phi = phi;
        phi += 0.003;
      },
    });

    return () => {
      globe.destroy();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        width: "100%",
        height: "100%",
        maxWidth: "100%",
        aspectRatio: 1,
      }}
    />
  );
}

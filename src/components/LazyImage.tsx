import { useState, useEffect } from "react";

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackType?:
    | "hero"
    | "hero2"
    | "pool"
    | "pool-night"
    | "bedroom"
    | "bedroom1"
    | "bedroom2"
    | "bedroom3"
    | "bedroom4"
    | "living"
    | "kitchen"
    | "terrace"
    | "garden"
    | "exterior"
    | "bonfire"
    | "dining"
    | "map"
    | "logo"
    | "generic";
  showOverlay?: boolean;
}

export default function LazyImage({
  src,
  alt,
  className = "",
  fallbackType = "generic",
  showOverlay = false,
}: LazyImageProps) {
  const [errorCount, setErrorCount] = useState(0);
  const [loaded, setLoaded] = useState(false);

  // Reset load state whenever src changes (e.g. Firestore loads after initial render)
  useEffect(() => {
    setLoaded(false);
    setErrorCount(0);
  }, [src]);

  // If we have encountered an error loading the real image, render beautiful vector graphics
  const isError = errorCount > 0;

  // Render SVG illustration representing each category
  const renderFallbackVector = () => {
    const baseStyle = "w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#141B26] to-[#0A0F1A] border border-[#C9A84C]/30 text-[#C9A84C] p-6 text-center select-none relative overflow-hidden";

    const sparkles = (
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <circle cx="20%" cy="30%" r="1" fill="#FFF" />
          <circle cx="80%" cy="20%" r="1.5" fill="#FFF" />
          <circle cx="40%" cy="70%" r="1" fill="#FFF" />
          <circle cx="75%" cy="80%" r="2" fill="#FFF" />
        </svg>
      </div>
    );

    switch (fallbackType) {
      case "logo":
        return (
          <div className="flex items-center gap-2 text-xl font-display font-bold text-[#F0D080]">
            <svg className="w-8 h-8 text-[#C9A84C]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L4 7v2l8 4 8-4V7L12 2zm0 18.5l-8-4v-1.1l8 4 8-4v1.1l-8 4z" />
            </svg>
            <span className="tracking-wide">👑 Kings Diamonds</span>
          </div>
        );

      case "hero":
      case "hero2":
        return (
          <div className={baseStyle}>
            {sparkles}
            <div className="z-10 flex flex-col items-center">
              <svg className="w-16 h-16 mb-4 text-[#F0D080]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <h4 className="font-display font-bold text-xl text-[#FAF6EE] mb-1">Kings Diamonds Estate</h4>
              <p className="subheading-cormorant text-[#C9A84C] text-lg italic">Premium Luxury Villa & Sahyadri Views</p>
            </div>
            {/* Soft decorative bottom gradient */}
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#0D1117] to-transparent pointer-events-none" />
          </div>
        );

      case "pool":
      case "pool-night":
        return (
          <div className={className + " " + baseStyle}>
            {sparkles}
            <div className="z-10 flex flex-col items-center">
              <svg className="w-14 h-14 mb-3 text-[#52B788]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h4 className="font-sans font-semibold text-[#FAF6EE]">Private Infinity Pool</h4>
              <p className="text-xs text-[#C9A84C] mt-1">Stunning Hill & Mist Sceneries</p>
            </div>
          </div>
        );

      case "bedroom":
      case "bedroom1":
      case "bedroom2":
      case "bedroom3":
      case "bedroom4":
        return (
          <div className={className + " " + baseStyle}>
            {sparkles}
            <div className="z-10 flex flex-col items-center">
              <svg className="w-14 h-14 mb-3 text-[#F0D080]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16H5V5zm0 0h14" />
              </svg>
              <h5 className="font-sans font-semibold text-[#FAF6EE]">{alt}</h5>
              <p className="text-xs text-[#C9A84C]/80 mt-1">Air Conditioned ◆ Royal Linens</p>
            </div>
          </div>
        );

      case "garden":
        return (
          <div className={className + " " + baseStyle}>
            <div className="z-10 flex flex-col items-center">
              <span className="text-4xl mb-2">🌿</span>
              <h5 className="font-sans font-semibold text-[#FAF6EE]">Lush Emerald Garden</h5>
              <p className="text-xs text-[#2D6A4F] font-semibold mt-1">Spacious Lawn Area</p>
            </div>
          </div>
        );

      case "exterior":
        return (
          <div className={className + " " + baseStyle}>
            <div className="z-10 flex flex-col items-center">
              <span className="text-4xl mb-2">🏰</span>
              <h5 className="font-sans font-semibold text-[#FAF6EE]">Gated Royal Villa Entrance</h5>
              <p className="text-xs text-[#C9A84C] mt-1">Pure Serenity & Privacy</p>
            </div>
          </div>
        );

      case "bonfire":
        return (
          <div className={className + " " + baseStyle}>
            <div className="z-10 flex flex-col items-center">
              <span className="text-4xl mb-2">🔥</span>
              <h5 className="font-sans font-semibold text-[#FAF6EE]">Bonfire & BBQ Deck</h5>
              <p className="text-xs text-[#C9A84C] mt-1">Under the Sahyadri Sky</p>
            </div>
          </div>
        );

      case "dining":
        return (
          <div className={className + " " + baseStyle}>
            <div className="z-10 flex flex-col items-center">
              <span className="text-4xl mb-2">🍽️</span>
              <h5 className="font-sans font-semibold text-[#FAF6EE]">Chic Dining Space</h5>
              <p className="text-xs text-[#C9A84C] mt-1">Curated Group Feast Arrangements</p>
            </div>
          </div>
        );

      case "living":
        return (
          <div className={className + " " + baseStyle}>
            <div className="z-10 flex flex-col items-center">
              <span className="text-4xl mb-2">📺</span>
              <h5 className="font-sans font-semibold text-[#FAF6EE]">Luxury Living Lobby</h5>
              <p className="text-xs text-[#C9A84C] mt-1">Smart TV & Comfortable Lounges</p>
            </div>
          </div>
        );

      case "kitchen":
        return (
          <div className={className + " " + baseStyle}>
            <div className="z-10 flex flex-col items-center">
              <span className="text-4xl mb-2">🍳</span>
              <h5 className="font-sans font-semibold text-[#FAF6EE]">Fully Equipped Kitchen</h5>
              <p className="text-xs text-[#C9A84C] mt-1">Premium Cooking Appliances</p>
            </div>
          </div>
        );

      case "terrace":
        return (
          <div className={className + " " + baseStyle}>
            <div className="z-10 flex flex-col items-center">
              <span className="text-4xl mb-2">🌅</span>
              <h5 className="font-sans font-semibold text-[#FAF6EE]">Mist View Terrace</h5>
              <p className="text-xs text-[#C9A84C] mt-1">Stunning Sahyadris Canopy</p>
            </div>
          </div>
        );

      case "map":
        return (
          <div className={className + " " + baseStyle}>
            <div className="z-10 flex flex-col items-center p-4">
              <svg className="w-12 h-12 mb-2 text-[#C9A84C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              <h5 className="font-sans text-xs font-semibold text-[#FAF6EE]">Malavali Area Interactive Hub</h5>
              <p className="text-[10px] text-[#C9A84C]/80 mt-1">Boraj Road, Near Stations</p>
            </div>
          </div>
        );

      default:
        return (
          <div className={className + " " + baseStyle}>
            {sparkles}
            <div className="z-10 flex flex-col items-center">
              <div className="text-[#C9A84C] text-sm tracking-wider">◆ KINGS DIAMONDS ◆</div>
              <p className="font-sans text-xs text-[#FAF6EE] mt-1">{alt}</p>
            </div>
          </div>
        );
    }
  };

  if (isError) {
    return renderFallbackVector();
  }

  return (
    <div className={`relative ${className} overflow-hidden group`}>
      {/* Fallback backing (shows while loading) */}
      <div className={`absolute inset-0 transition-opacity duration-500 ${loaded ? "opacity-0" : "opacity-100"}`}>
        {renderFallbackVector()}
      </div>

      <img
        src={src}
        alt={alt}
        onLoad={() => setLoaded(true)}
        onError={() => setErrorCount((c) => c + 1)}
        className={`w-full h-full object-cover transition-all duration-700 ease-out ${
          loaded ? "opacity-100 scale-100" : "opacity-0 scale-105"
        }`}
      />

      {showOverlay && (
        <div className="absolute inset-0 bg-gradient-to-t from-[#0D1117] via-[#0D1117]/10 to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-300" />
      )}
    </div>
  );
}

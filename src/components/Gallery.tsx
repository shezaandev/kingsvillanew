import React, { useState, useEffect, useRef } from "react";
import LazyImage from "./LazyImage";
import { Search, X, ChevronLeft, ChevronRight } from "lucide-react";
import { INSTAGRAM_URL } from "../data";
import { useSiteImages } from "../hooks/useSiteData";

interface GalleryProps {
  customImages?: any[];
}

export default function Gallery({ customImages }: GalleryProps) {
  const [activeImageIdx, setActiveImageIdx] = useState<number | null>(null);
  const touchStartX = useRef<number | null>(null);

  const { getUrl } = useSiteImages();
  const instagramBannerUrl = getUrl("instagram", "");

  const images = customImages && customImages.length > 0 
    ? customImages.map((img, i) => ({
        id: img.id,
        src: img.src,
        alt: img.alt,
        fallbackType: (img.category === "pool" || img.category === "bedroom" || img.category === "garden" || img.category === "terrace") ? img.category : "exterior",
        aspect: i % 4 === 0 ? "aspect-square" : i % 4 === 1 ? "aspect-[4/5]" : i % 4 === 2 ? "aspect-[16/10]" : "aspect-[3/4]",
      }))
    : Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        src: `/images/gallery${i + 1}.jpg`,
        alt: `Kings Diamonds Villa View ${i + 1}`,
        fallbackType: (i % 3 === 0 ? "pool" : i % 3 === 1 ? "bedroom" : "terrace") as "pool" | "bedroom" | "terrace" | "garden",
        aspect: i % 4 === 0 ? "aspect-square" : i % 4 === 1 ? "aspect-[4/5]" : i % 4 === 2 ? "aspect-[16/10]" : "aspect-[3/4]",
      }));

  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!gridRef.current || images.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("reveal-active");
            entry.target.classList.remove("reveal-hidden");
            observer.unobserve(entry.target); // stop watching once revealed
          }
        });
      },
      { threshold: 0.05, rootMargin: "0px 0px 100px 0px" } // 100px lookahead
    );

    // Small delay to let React finish rendering the grid
    const timer = setTimeout(() => {
      const cards = gridRef.current?.querySelectorAll(".gallery-card");
      cards?.forEach((card) => observer.observe(card));
    }, 50);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [images]); // re-runs whenever images array changes (Firestore loaded)

  // Handle keyboard events (Esc, Left, Right keys)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeImageIdx === null) return;
      if (e.key === "Escape") setActiveImageIdx(null);
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeImageIdx]);

  // Adjust scroll lock when lightbox is active
  useEffect(() => {
    if (activeImageIdx !== null) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [activeImageIdx]);

  const handlePrev = () => {
    setActiveImageIdx((prev) => {
      if (prev === null) return null;
      return prev === 0 ? images.length - 1 : prev - 1;
    });
  };

  const handleNext = () => {
    setActiveImageIdx((prev) => {
      if (prev === null) return null;
      return prev === images.length - 1 ? 0 : prev + 1;
    });
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;

    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        handleNext(); // Swiped left, show next
      } else {
        handlePrev(); // Swiped right, show prev
      }
    }
    touchStartX.current = null;
  };

  return (
    <section id="gallery" className="py-24 bg-[#0D1117] border-b border-[#C9A84C]/10 scroll-mt-16">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="text-xs uppercase tracking-[0.2em] text-[#C9A84C] font-semibold block mb-3">
            ◆ GALLERY ◆
          </span>
          <h2 className="text-3xl md:text-5xl font-display font-medium text-[#FAF6EE] mb-4">
            A Glimpse of Your Escape
          </h2>
          <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent mx-auto my-4" />
          <p className="subheading-cormorant text-xl text-[#F0D080]/80 italic max-w-2xl mx-auto">
            Take a sensory tour of our luxury oasis and start envisioning your royal retreat.
          </p>
        </div>

        {/* Masonry / Auto-Grid layout */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6" ref={gridRef}>
          {images.map((img, idx) => (
            <div
              key={img.id}
              className={`gallery-card break-inside-avoid relative overflow-hidden rounded-2xl border border-[#C9A84C]/10 bg-[#141B26] cursor-pointer group hover:border-[#C9A84C]/30 hover:shadow-[0_8px_32px_rgba(201,168,76,0.12)] transition-all duration-300 transform hover:-translate-y-1 ${img.aspect}`}
              onClick={() => setActiveImageIdx(idx)}
            >
              <LazyImage
                src={img.src}
                alt={img.alt}
                fallbackType={img.fallbackType}
                className="w-full h-full object-cover"
              />
              
              {/* Luxury Gold Overlay with View Icon */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0D1117]/90 via-[#141B26]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center text-center">
                <div className="p-3 bg-[#FAF6EE] text-[#0D1117] rounded-full shadow-lg transform scale-75 group-hover:scale-100 transition-transform duration-300">
                  <Search size={20} className="stroke-[2.5]" />
                </div>
                <span className="text-xs tracking-widest text-[#F0D080] font-sans font-medium uppercase mt-3">
                  🔍 View Spaces
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Instagram Callout Box */}
        <div className="mt-16 bg-[#141B26] border border-[#C9A84C]/30 rounded-2xl p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 hover:shadow-[0_8px_32px_rgba(201,168,76,0.1)] transition-all duration-300">
          <div className="flex items-center gap-4">
            {/* Show uploaded banner image if available, otherwise show emoji icon */}
            {instagramBannerUrl ? (
              <div className="w-16 h-16 rounded-xl overflow-hidden border border-[#C9A84C]/30 shrink-0">
                <img
                  src={instagramBannerUrl}
                  alt="Instagram preview"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            ) : (
              <div className="p-4 bg-gradient-to-tr from-[#C9A84C]/10 to-[#F0D080]/20 rounded-full border border-[#C9A84C]/20">
                <span className="text-3xl">📸</span>
              </div>
            )}
            <div>
              <h4 className="font-sans font-semibold text-[#FAF6EE] text-lg">
                Follow our journey on Instagram
              </h4>
              <p className="text-sm text-[#FAF6EE]/70 mt-1">
                See real guest moments, seasonal updates & exclusive offers at <span className="text-[#F0D080] font-semibold">@kings_diamonds_villas</span>
              </p>
            </div>
          </div>
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full md:w-auto px-6 py-3 rounded-lg bg-[#FAF6EE] hover:bg-[#FAF6EE]/90 text-[#0D1117] font-semibold text-center transition-all duration-300 shadow-md hover:shadow-lg inline-flex items-center justify-center gap-2"
          >
            Open Instagram →
          </a>
        </div>

        {/* Custom Pure JS Lightbox */}
        {activeImageIdx !== null && (
          <div
            className="fixed inset-0 bg-black/95 z-[99999] flex items-center justify-center p-4 backdrop-blur-md select-none animate-[fadeIn_0.3s_ease]"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onClick={() => setActiveImageIdx(null)}
          >
            {/* Close action */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveImageIdx(null);
              }}
              className="absolute top-6 right-6 p-3 text-[#FAF6EE]/80 hover:text-[#C9A84C] cursor-pointer hover:scale-110 transition-transform duration-300 z-50 bg-[#141B26]/50 rounded-full border border-[#FAF6EE]/10"
              aria-label="Close Lightbox"
            >
              <X size={26} />
            </button>

            {/* Left navigation */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              className="absolute left-4 md:left-8 p-3 text-[#FAF6EE]/80 hover:text-[#C9A84C] cursor-pointer hover:scale-110 transition-transform duration-200 z-50 bg-[#141B26]/50 rounded-full border border-[#FAF6EE]/10"
              aria-label="Previous Image"
            >
              <ChevronLeft size={30} />
            </button>

            {/* Centered Image Container */}
            <div
              className="relative max-w-5xl max-h-[85vh] flex flex-col justify-center items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <LazyImage
                src={images[activeImageIdx].src}
                alt={images[activeImageIdx].alt}
                fallbackType={images[activeImageIdx].fallbackType}
                className="max-w-full max-h-[75vh] object-contain rounded-lg border border-[#C9A84C]/40 shadow-[0_0_50px_rgba(201,168,76,0.3)]"
              />
              <div className="absolute -bottom-10 left-0 right-0 text-center text-xs md:text-sm text-[#FAF6EE]/80 bg-black/40 py-2 rounded-md font-sans tracking-wide">
                <span>{images[activeImageIdx].alt}</span>
                <span className="text-[#C9A84C] font-semibold ml-3">
                  {activeImageIdx + 1} / {images.length}
                </span>
              </div>
            </div>

            {/* Right navigation */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              className="absolute right-4 md:right-8 p-3 text-[#FAF6EE]/80 hover:text-[#C9A84C] cursor-pointer hover:scale-110 transition-transform duration-200 z-50 bg-[#141B26]/50 rounded-full border border-[#FAF6EE]/10"
              aria-label="Next Image"
            >
              <ChevronRight size={30} />
            </button>
          </div>
        )}

      </div>
    </section>
  );
}

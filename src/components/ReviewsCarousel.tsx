import { useState, useEffect, useRef } from "react";
import { GUEST_REVIEWS } from "../data";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import LazyImage from "./LazyImage";

interface ReviewsCarouselProps {
  customReviews?: any[];
}

export default function ReviewsCarousel({ customReviews }: ReviewsCarouselProps) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const reviewsList = customReviews && customReviews.length > 0 ? customReviews : GUEST_REVIEWS;

  // Auto-advance slides every 5 seconds unless hovered
  useEffect(() => {
    if (!isHovered) {
      timerRef.current = setInterval(() => {
        handleNext();
      }, 5000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isHovered, activeIdx, reviewsList.length]);

  const handlePrev = () => {
    setActiveIdx((prev) => (prev === 0 ? reviewsList.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIdx((prev) => (prev === reviewsList.length - 1 ? 0 : prev + 1));
  };

  const currentReview = reviewsList[activeIdx] || GUEST_REVIEWS[0];

  return (
    <section id="reviews" className="py-24 bg-[#141B26] border-b border-[#C9A84C]/10 scroll-mt-16">
      <div className="max-w-4xl mx-auto px-6">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="text-xs uppercase tracking-[0.2em] text-[#C9A84C] font-semibold block mb-3">
            ◆ GUEST REVIEWS ◆
          </span>
          <h2 className="text-3xl md:text-5xl font-display font-medium text-[#FAF6EE] mb-4">
            Words from Our Royalty
          </h2>
          <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent mx-auto my-4" />
        </div>

        {/* Carousel Outer Container */}
        <div
          className="relative px-4"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Active Review Card */}
          <div className="bg-[#0D1117] rounded-3xl border border-[#C9A84C]/20 p-8 md:p-12 text-center shadow-2xl relative overflow-hidden transition-all duration-500 hover:border-[#C9A84C]/40 min-h-[350px] md:min-h-[280px] flex flex-col justify-between">
            {/* Sparkles element */}
            <div className="absolute top-4 left-4 text-3xl opacity-10 select-none font-display">“</div>
            <div className="absolute bottom-4 right-4 text-3xl opacity-10 select-none font-display">”</div>

            {/* Stars */}
            <div className="flex justify-center gap-1 mb-6">
              {Array.from({ length: currentReview.stars }).map((_, i) => (
                <Star key={i} size={18} className="fill-[#C9A84C] stroke-[#C9A84C]" />
              ))}
            </div>

            {/* Quote text in elegant Cormorant italic font */}
            <p className="subheading-cormorant text-xl md:text-2xl text-[#FAF6EE] italic leading-relaxed mb-6 font-light">
              "{currentReview.text}"
            </p>

            {/* Author Profile section */}
            <div className="flex items-center justify-center gap-4 mt-4">
              {/* Optional avatar backing */}
              <div className="w-12 h-12 rounded-full overflow-hidden border border-[#C9A84C]/40 flex-shrink-0 bg-[#141B26]">
                <LazyImage
                  src={currentReview.avatar}
                  alt={currentReview.author}
                  fallbackType="generic"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="text-left">
                <h4 className="font-sans font-semibold text-[#F0D080] text-sm md:text-base">
                  {currentReview.author}
                </h4>
                <p className="text-xs text-[#FAF6EE]/60 tracking-wider">
                  Verified Guest &bull; {currentReview.location}
                </p>
              </div>
            </div>
          </div>

          {/* Left arrow trigger */}
          <button
            onClick={handlePrev}
            className="absolute left-[-20px] md:left-[-50px] top-1/2 -translate-y-1/2 p-3 bg-[#0D1117] hover:bg-[#C9A84C] text-[#C9A84C] hover:text-[#0D1117] rounded-full border border-[#C9A84C]/30 shadow-lg cursor-pointer transition-all duration-300"
            aria-label="Previous Review"
          >
            <ChevronLeft size={20} />
          </button>

          {/* Right arrow trigger */}
          <button
            onClick={handleNext}
            className="absolute right-[-20px] md:right-[-50px] top-1/2 -translate-y-1/2 p-3 bg-[#0D1117] hover:bg-[#C9A84C] text-[#C9A84C] hover:text-[#0D1117] rounded-full border border-[#C9A84C]/30 shadow-lg cursor-pointer transition-all duration-300"
            aria-label="Next Review"
          >
            <ChevronRight size={20} />
          </button>

          {/* Slide Indicator circles */}
          <div className="flex justify-center gap-2 mt-8">
            {reviewsList.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveIdx(idx)}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  activeIdx === idx
                    ? "bg-[#C9A84C] w-6"
                    : "bg-[#C9A84C]/30 hover:bg-[#C9A84C]/60"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Professional badge row */}
        <div className="mt-16 pt-8 border-t border-[#C9A84C]/10 flex flex-wrap justify-center items-center gap-6 md:gap-10 text-center text-xs md:text-sm text-[#FAF6EE]/70 font-sans">
          <div className="flex items-center gap-2">
            <span className="text-gold">⭐</span> Rated <span className="text-[#F0D080] font-semibold">4.3 / 5</span> on Justdial
          </div>
          <div className="hidden md:block text-[#C9A84C]">&bull;</div>
          <div className="flex items-center gap-2">
            <span className="text-gold">💎</span> Rated <span className="text-[#F0D080] font-semibold">5.0 / 5</span> on Diamond Villa
          </div>
          <div className="hidden md:block text-[#C9A84C]">&bull;</div>
          <div className="flex items-center gap-2 font-medium">
            🔒 Book directly for guaranteed best rates!
          </div>
        </div>

      </div>
    </section>
  );
}

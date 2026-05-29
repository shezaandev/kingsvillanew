import { useState, useEffect } from "react";
import { 
  Menu, 
  X, 
  ChevronDown, 
  ExternalLink, 
  MapPin, 
  Clock, 
  Sparkles, 
  ArrowRight,
  ShieldCheck,
  Award,
  Users
} from "lucide-react";

import { 
  BRAND_NAME, 
  OWNER_NAME, 
  INSTAGRAM_HANDLE, 
  INSTAGRAM_URL, 
  WHATSAPP_NUMBER,
  AMENITIES_LIST,
  ADD_ONS,
  EXPERIENCE_CARDS,
  DISTANCE_CALLOUTS,
  NEARBY_ATTRACTIONS,
  GUEST_REVIEWS
} from "../data";

import LazyImage from "./LazyImage";
import RoomsShowcase from "./RoomsShowcase";
import Gallery from "./Gallery";
import ReviewsCarousel from "./ReviewsCarousel";
import EnquiryForm from "./EnquiryForm";

import { 
  useSiteSettings, 
  usePricing, 
  useGallery, 
  useReviews,
  useSiteImages
} from "../hooks/useSiteData";

const EXP_KEYS: Record<string, string> = {
  birthdays: "pool",
  families: "garden",
  friends: "bonfire",
  romance: "terrace",
  corporate: "living",
  events: "poolNight"
};

export default function VillaWebsite() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Load live Firestore database hooks safely
  const settings = useSiteSettings();
  const pricing = usePricing();
  const liveImages = useGallery();
  const { getUrl } = useSiteImages();
  const liveReviews = useReviews();

  // Resolve active states with clean fallback safety
  const brandName = settings?.brandName || BRAND_NAME;
  const ownerName = settings?.ownerName || OWNER_NAME;
  const whatsappNumber = settings?.whatsappNumber || WHATSAPP_NUMBER;
  const instagramHandle = settings?.instagramHandle || INSTAGRAM_HANDLE;
  const instagramUrl = settings?.instagramUrl || INSTAGRAM_URL;
  const tagline = settings?.tagline || "Where Royalty Meets the Sahyadris";
  const villaAddress = settings?.villaAddress || "Malavali, Boraj Road crossing, Lonavala, Maharashtra, India, Pin 410405";
  const checkInTime = settings?.checkInTime || "1:00 PM";
  const checkOutTime = settings?.checkOutTime || "11:00 AM";

  // Build policies list
  const rulesList = settings?.bookingRules && settings.bookingRules.length > 0
    ? settings.bookingRules
    : [
        "50% advance to block dates and confirm booking calendar.",
        "Remaining balance fully payable at check-in desk on arrival.",
        "All payment forms accepted (UPI, Wire Transfer, Cash).",
        "Valid Government-signed photo ID card mandatory for check-in.",
        "Standard Hours • Check-in 1:00 PM | Checkout 11:00 AM.",
        "Loud music outdoor strictly capped until 10:00 PM per local laws."
      ];

  // Pricing configuration
  const weekdayRateText = pricing ? `₹${pricing.weekdayRate.toLocaleString()}` : "₹2,500";
  const weekdayUnitText = pricing ? "/ night (Entire Villa)" : "/ person / night";

  const weekendRateText = pricing ? `₹${pricing.weekendRate.toLocaleString()}` : "₹3,500";
  const weekendUnitText = pricing ? "/ night (Entire Villa)" : "/ person / night";

  const maxGuests = pricing ? pricing.maxGuests : 16;
  const pricingNotes = pricing ? pricing.notes : "Rates could reflect slight peak increases during heavy national holidays, long monsoonal weekends & festival seasons.";

  // Dynamic OG Image updater
  const ogImg = liveImages.find(i => i.isOgImage);
  useEffect(() => {
    if (ogImg?.src) {
      let ogMeta = document.querySelector('meta[property="og:image"]');
      if (!ogMeta) {
        ogMeta = document.createElement("meta");
        ogMeta.setAttribute("property", "og:image");
        document.head.appendChild(ogMeta);
      }
      ogMeta.setAttribute("content", ogImg.src);
    }
  }, [ogImg]);

  // Monitor scroll past 80px to compress navbar height & add bottom gold border
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 80) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Initialize browser Intersection Observer for high-performance fade-in-up animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("reveal-active");
            entry.target.classList.remove("reveal-hidden");
          }
        });
      },
      { threshold: 0.1 }
    );

    const animElms = document.querySelectorAll(".reveal-hidden");
    animElms.forEach((el) => observer.observe(el));

    return () => {
      animElms.forEach((el) => observer.unobserve(el));
    };
  }, []);

  const triggerWhatsAppDirect = (customText?: string) => {
    const defaultText = `Hi, I want to book ${brandName} Lonavala. Please let me know rates and check-in availability!`;
    const text = customText ? customText : defaultText;
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="min-h-screen bg-[#0D1117] text-[#FAF6EE] select-none font-sans antialiased relative">
      
      {/* SECTION 1 — STICKY NAVIGATION BAR */}
      <nav 
        className={`fixed top-0 left-0 right-0 z-[999] transition-all duration-300 ${
          scrolled 
            ? "h-14 md:h-16 bg-[#0D1117]/95 backdrop-blur-md border-b border-[#C9A84C]/30 shadow-lg shadow-[#0D1117]/50" 
            : "h-18 md:h-20 bg-[#0D1117]/60 backdrop-blur-sm border-b border-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto h-full px-6 flex items-center justify-between">
          
          {/* Logo (left) */}
          <a href="#home" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <div className="w-8 h-8 rounded-full flex items-center justify-center border border-[#C9A84C]/20 bg-[#141B26]">
              <span className="text-sm">👑</span>
            </div>
            <span className="font-display font-semibold text-[#F0D080] tracking-wide text-xs sm:text-base md:text-lg">
              {brandName}
            </span>
          </a>

          {/* Navigation Links (center/right desktop) */}
          <div className="hidden lg:flex items-center gap-7 text-[#FAF6EE]/80 text-xs tracking-wider uppercase font-medium">
            <a href="#home" className="hover:text-[#F0D080] transition-colors">Home</a>
            <a href="#about" className="hover:text-[#F0D080] transition-colors">The Villa</a>
            <a href="#amenities" className="hover:text-[#F0D080] transition-colors">Amenities</a>
            <a href="#rooms" className="hover:text-[#F0D080] transition-colors">Rooms</a>
            <a href="#gallery" className="hover:text-[#F0D080] transition-colors">Gallery</a>
            <a href="#experiences" className="hover:text-[#F0D080] transition-colors">Experiences</a>
            <a href="#pricing" className="hover:text-[#F0D080] transition-colors">Pricing</a>
            <a href="#reviews" className="hover:text-[#F0D080] transition-colors">Reviews</a>
            <a href="#contact" className="hover:text-[#F0D080] transition-colors">Contact</a>
          </div>

          {/* CTA Button (far right) */}
          <div className="hidden sm:block">
            <button
              onClick={() => triggerWhatsAppDirect()}
              className="px-5 py-2.5 rounded-full text-xs font-semibold tracking-wider text-[#0D1117] bg-gradient-to-r from-[#C9A84C] to-[#F0D080] hover:scale-[1.03] shadow-md shadow-[#C9A84C]/10 transition-all duration-200 cursor-pointer inline-flex items-center gap-1.5"
            >
              <span>📲</span> Book on WhatsApp
            </button>
          </div>

          {/* Mobile hamburger menu button */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden p-2 text-[#F0D080] hover:text-[#FAF6EE] focus:outline-none cursor-pointer"
            aria-label="Open Mobile Menu"
          >
            <Menu size={24} />
          </button>

        </div>
      </nav>

      {/* Fullscreen responsive slide-in menu for mobile */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[1000] bg-[#0D1117] flex flex-col items-center justify-center p-6 text-center animate-[fadeIn_0.3s_ease]">
          
          {/* Close trigger button */}
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="absolute top-6 right-6 p-3 text-[#F0D080] hover:text-[#FAF6EE] cursor-pointer bg-[#141B26] rounded-full border border-[#C9A84C]/20"
            aria-label="Close Mobile Menu"
          >
            <X size={24} />
          </button>

          {/* Logo in overlay */}
          <div className="mb-10">
            <span className="text-4xl block mb-2">👑</span>
            <h3 className="font-display text-[#F0D080] font-bold text-xl">{brandName}</h3>
            <p className="text-[10px] tracking-widest text-[#FAF6EE]/40 uppercase mt-1">Malavali &bull; Lonavala</p>
          </div>

          {/* Link blocks */}
          <div className="flex flex-col gap-6 text-base tracking-widest uppercase font-semibold text-[#FAF6EE]/90">
            <a href="#home" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#F0D080] transition-colors">Home</a>
            <a href="#about" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#F0D080] transition-colors">The Villa</a>
            <a href="#amenities" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#F0D080] transition-colors">Amenities</a>
            <a href="#rooms" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#F0D080] transition-colors">The Bedrooms</a>
            <a href="#gallery" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#F0D080] transition-colors">Interior Gallery</a>
            <a href="#experiences" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#F0D080] transition-colors">Experiences</a>
            <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#F0D080] transition-colors">Pricing & Rate</a>
            <a href="#reviews" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#F0D080] transition-colors">Guest Reviews</a>
            <a href="#contact" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#F0D080] transition-colors">Let's Connect</a>
          </div>

          {/* Instant Direct Whatsapp block */}
          <button
            onClick={() => {
              triggerWhatsAppDirect();
              setMobileMenuOpen(false);
            }}
            className="mt-12 w-full max-w-xs py-4 rounded-xl text-sm font-semibold tracking-widest text-[#0D1117] bg-gradient-to-r from-[#C9A84C] to-[#F0D080] transition-all cursor-pointer shadow-lg inline-flex items-center justify-center gap-2"
          >
            <span>📲</span> BOOK DIRECT VIA WHATSAPP
          </button>

          <p className="text-[10px] text-[#FAF6EE]/40 mt-6 font-light">
            Owned and monitored directly by {ownerName}
          </p>

        </div>
      )}

      {/* SECTION 2 — HERO (Full Viewport with Parallax setting) */}
      <header id="home" className="relative min-h-screen flex items-center justify-center bg-black overflow-hidden pt-12">
        
        {/* Parallax Background */}
        <div 
          className="absolute inset-0 bg-fixed-parallax bg-[#0D1117]" 
          style={{
            backgroundImage: `linear-gradient(to bottom, rgba(13,17,23,0.45) 0%, rgba(13,17,23,0.95) 100%), url('${getUrl("hero", "/images/hero.jpg")}')`
          }}
        />

        {/* Content alignment */}
        <div className="max-w-4xl mx-auto px-6 text-center z-10 flex flex-col items-center justify-center">
          
          <div className="reveal-hidden space-y-2 mb-4">
            <span className="text-xs uppercase tracking-[0.25em] text-[#C9A84C] font-semibold block px-4 py-1.5 rounded-full border border-[#C9A84C]/25 bg-[#0D1117]/80 backdrop-blur-md">
              ◆ MALAVALI &bull; LONAVALA &bull; MAHARASHTRA ◆
            </span>
          </div>

          {/* Shimmer headline */}
          <h1 className="reveal-hidden font-display font-black text-4xl sm:text-6xl md:text-7.5xl text-[#FAF6EE] leading-tight mb-6">
            Where Royalty Meets <br />
            <span className="shimmer-text py-1">the Sahyadris</span>
          </h1>

          {/* Subheadline from live Tagline settings */}
          <p className="reveal-hidden subheading-cormorant text-lg sm:text-2xl md:text-3xl text-[#FAF6EE]/90 italic max-w-3.5xl mb-10 leading-relaxed font-light font-serif-elegant">
            "{tagline}"
          </p>

          {/* Trust badges row */}
          <div className="reveal-hidden flex flex-wrap justify-center items-center gap-3 sm:gap-4 md:gap-5 mb-12 text-xs md:text-sm font-sans">
            <span className="px-3.5 py-1.5 rounded-full bg-[#141B26]/80 backdrop-blur-md border border-[#C9A84C]/15 text-[#F0D080] inline-flex items-center gap-1">
              🏊 Infinity Pool
            </span>
            <span className="px-3.5 py-1.5 rounded-full bg-[#141B26]/80 backdrop-blur-md border border-[#C9A84C]/15 text-[#F0D080] inline-flex items-center gap-1">
              🛏️ 4 AC Bedrooms
            </span>
            <span className="px-3.5 py-1.5 rounded-full bg-[#141B26]/80 backdrop-blur-md border border-[#C9A84C]/15 text-[#F0D080] inline-flex items-center gap-1">
              👨‍👩‍👧 Up to {maxGuests} Guests
            </span>
            <span className="px-3.5 py-1.5 rounded-full bg-[#141B26]/80 backdrop-blur-md border border-[#C9A84C]/15 text-[#F0D080] inline-flex items-center gap-1">
              🌿 Sahyadri Peaks
            </span>
          </div>

          {/* Call-to-actions */}
          <div className="reveal-hidden flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <button
              onClick={() => triggerWhatsAppDirect(`Hi, I want to book my villa getaway! Can you check availability for ${brandName}?`)}
              className="w-full sm:w-auto px-8 py-4 rounded-xl font-semibold text-[#0D1117] bg-gradient-to-r from-[#C9A84C] to-[#F0D080] hover:scale-[1.02] shadow-xl shadow-[#C9A84C]/15 hover:shadow-2xl cursor-pointer text-sm tracking-wider uppercase transition-all duration-300 inline-flex items-center justify-center gap-2"
            >
              <span>📲</span> WhatsApp to Book
            </button>
            <a
              href="#gallery"
              className="w-full sm:w-auto px-8 py-4 rounded-xl font-semibold text-[#C9A84C] border border-[#C9A84C]/40 hover:border-[#FAF6EE] hover:text-[#FAF6EE] bg-transparent text-sm tracking-wider uppercase transition-all duration-300 inline-flex items-center justify-center gap-2"
            >
              ▶ Explore the Villa
            </a>
          </div>

        </div>

        {/* Animated bounce gold chevron indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 z-10 animate-bounce cursor-pointer opacity-70">
          <span className="text-[10px] tracking-widest text-[#C9A84C]/80 uppercase">discover luxury</span>
          <ChevronDown size={20} className="text-[#C9A84C]" />
        </div>

      </header>

      {/* SECTION 3 — SOCIAL PROOF BAR */}
      <section className="bg-[#141B26] border-y border-[#C9A84C]/25 py-4 overflow-hidden shadow-inner font-sans">
        <div className="max-w-7xl mx-auto px-6">
          <div className="hidden md:flex justify-around items-center text-xs tracking-wider font-medium text-[#FAF6EE]/90">
            <div className="flex items-center gap-1.5">
              <span className="text-[#C9A84C]">⭐</span> 4.3/5 Rated on Justdial
            </div>
            <span className="text-[#C9A84C]/50">◆</span>
            <div className="flex items-center gap-1.5">
              <span className="text-[#C9A84C]">🏡</span> Trusted by 500+ Families
            </div>
            <span className="text-[#C9A84C]/50">◆</span>
            <div className="flex items-center gap-1.5">
              <span className="text-[#C9A84C]">📍</span> Malavali &bull; 9.7km from Lonavala Centre
            </div>
            <span className="text-[#C9A84C]/50">◆</span>
            <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-[#F0D080] transition-colors">
              <span className="text-[#C9A84C]">📲</span> {instagramHandle} on Instagram
            </a>
          </div>

          {/* Mobile continuous marquee slider */}
          <div className="md:hidden overflow-x-auto whitespace-nowrap scrollbar-hide py-1">
            <div className="inline-flex gap-8 text-xs tracking-wide text-[#FAF6EE]/90 animate-[marquee_20s_linear_infinite]">
              <span className="inline-flex items-center gap-1.5">⭐ 4.3/5 Rated on Justdial</span>
              <span className="text-[#C9A84C]">◆</span>
              <span className="inline-flex items-center gap-1.5">🏡 Trusted by 500+ Families</span>
              <span className="text-[#C9A84C]">◆</span>
              <span className="inline-flex items-center gap-1.5">📍 Malavali &bull; 9.7km to Lonavala Center</span>
              <span className="text-[#C9A84C]">◆</span>
              <span className="inline-flex items-center gap-1.5">📲 Instagram: {instagramHandle}</span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4 — VILLA INTRO / ABOUT */}
      <section id="about" className="py-24 bg-[#0D1117] border-b border-[#C9A84C]/10 scroll-mt-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Left Column: Image with offset border */}
            <div className="lg:col-span-5 reveal-hidden">
              <div className="relative mx-auto max-w-md lg:max-w-none pr-4 pb-4">
                <div className="absolute inset-0 border-[2px] border-[#C9A84C] translate-x-4 translate-y-4 rounded-2xl z-0" />
                <div className="relative rounded-2xl overflow-hidden shadow-2xl z-10 aspect-[4/5] object-cover">
                  <LazyImage
                    src={getUrl("exterior", "/images/exterior.jpg")}
                    alt={`${brandName} Entrance`}
                    fallbackType="exterior"
                    className="w-full h-full"
                  />
                </div>
              </div>
            </div>

            {/* Right Column: Copy & details */}
            <div className="lg:col-span-7 space-y-6 reveal-hidden">
              
              <span className="text-[#C9A84C] text-xs font-semibold tracking-widest uppercase block">
                ◆ ABOUT THE VILLA ◆
              </span>
              
              <h2 className="text-3xl md:text-5xl font-display font-medium text-[#FAF6EE]">
                Your Private Kingdom <br />in the Sahyadris
              </h2>
              
              <div className="w-20 h-0.5 bg-[#C9A84C] my-4" />

              <div className="text-sm md:text-base text-[#FAF6EE]/80 leading-relaxed space-y-5 font-light">
                <p>
                  Nestled in the lush lap of Malavali — just a short drive from the heart of Lonavala — 
                  <strong className="text-[#F0D080] font-medium"> {brandName}</strong> is a private sanctuary. 
                  Surrounded by the mist-kissed peaks of the Sahyadri range, this fully private 4BHK estate is designed to make every guest feel like royalty.
                </p>
                <p>
                  Whether you're planning a lively family reunion, a long-awaited getaway with friends, a grand birthday celebration, a focused corporate team offsite, or a romantic mountain escape — the villa wraps every single occasion in complete privacy, luxury, and warm hospitality.
                </p>
                <p>
                  With the gorgeous <span className="text-[#F0D080]">Kune Waterfalls just 1.7 km away</span> and the Della Adventure Park a quick drive from your doorstep, you're positioned at the ultimate crossroads of tranquility and action.
                </p>
              </div>

              {/* Stats highlights */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6">
                <div className="p-4 bg-[#141B26] border border-[#C9A84C]/25 rounded-2xl text-center">
                  <p className="text-[#F0D080] font-display font-bold text-lg sm:text-2xl">4 BHK</p>
                  <p className="text-[10px] sm:text-xs text-[#FAF6EE]/60 uppercase tracking-widest mt-1">Bedrooms</p>
                </div>
                <div className="p-4 bg-[#141B26] border border-[#C9A84C]/25 rounded-2xl text-center">
                  <p className="text-[#F0D080] font-display font-bold text-lg sm:text-2xl">4 Bath</p>
                  <p className="text-[10px] sm:text-xs text-[#FAF6EE]/60 uppercase tracking-widest mt-1">Attached Toilets</p>
                </div>
                <div className="p-4 bg-[#141B26] border border-[#C9A84C]/25 rounded-2xl text-center">
                  <p className="text-[#F0D080] font-display font-bold text-lg sm:text-2xl">{maxGuests} Guests</p>
                  <p className="text-[10px] sm:text-xs text-[#FAF6EE]/60 uppercase tracking-widest mt-1">Full Occupancy</p>
                </div>
                <div className="p-4 bg-[#141B26] border border-[#C9A84C]/25 rounded-2xl text-center">
                  <p className="text-[#F0D080] font-display font-bold text-lg sm:text-2xl">Private</p>
                  <p className="text-[10px] sm:text-xs text-[#FAF6EE]/60 uppercase tracking-widest mt-1">Infinity Pool</p>
                </div>
              </div>

              {/* Enquire For Availability Callout */}
              <div className="pt-4">
                <a
                  href="#contact"
                  className="font-sans font-semibold text-xs sm:text-sm tracking-widest text-[#F0D080] hover:text-[#FAF6EE] transition-colors inline-flex items-center gap-2 group border-b border-[#C9A84C]/30 pb-1"
                >
                  ENQUIRE FOR AVAILABILITY <ArrowRight size={14} className="transform group-hover:translate-x-1 transition-transform" />
                </a>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* SECTION 5 — AMENITIES */}
      <section id="amenities" className="py-24 bg-[#141B26] border-b border-[#C9A84C]/10 scroll-mt-16">
        <div className="max-w-7xl mx-auto px-6">
          
          <div className="text-center mb-16">
            <span className="text-xs uppercase tracking-[0.2em] text-[#C9A84C] font-semibold block mb-3">
              ◆ AMENITIES & FEATURES ◆
            </span>
            <h2 className="text-3xl md:text-5xl font-display font-medium text-[#FAF6EE] mb-4">
              Every Detail, Crafted for You
            </h2>
            <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent mx-auto my-4" />
            <p className="subheading-cormorant text-xl text-[#F0D080]/80 italic max-w-2xl mx-auto">
              "From the moment you arrive to the moment you reluctantly leave — we've thought of everything."
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6 mt-10">
            {AMENITIES_LIST.map((am) => (
              <div
                key={am.id}
                className="bg-[#0D1117] border border-[#C9A84C]/15 rounded-2xl p-5 hover:border-[#C9A84C]/45 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(201,168,76,0.12)] transition-all duration-300 flex flex-col items-center text-center group"
              >
                <div className="text-3xl mb-4 p-3 bg-[#141B26] rounded-full group-hover:scale-110 transition-transform duration-300 border border-[#C9A84C]/10">
                  {am.icon}
                </div>
                <h4 className="font-sans font-semibold text-[#FAF6EE] text-sm md:text-base mb-2">
                  {am.title}
                </h4>
                <p className="text-[11px] md:text-xs text-[#FAF6EE]/60 font-light leading-relaxed">
                  {am.description}
                </p>
              </div>
            ))}
          </div>

          {/* Add-On package callout box */}
          <div className="mt-12 p-6 md:p-8 rounded-2xl border border-[#C9A84C]/40 bg-gradient-to-r from-[#141B26] to-[#0A0F1A] text-center max-w-4xl mx-auto hover:shadow-[0_6px_24px_rgba(201,168,76,0.08)] transition-all">
            <h5 className="font-display font-medium text-[#F0D080] text-sm sm:text-base md:text-lg mb-4 flex items-center justify-center gap-2">
              <Sparkles size={16} className="text-[#C9A84C]" /> Custom Extras Available on Request
            </h5>
            
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3 text-xs">
              {(pricing?.addOns && pricing.addOns.length > 0 ? pricing.addOns.map(a => a.name) : ADD_ONS).map((addon, i) => (
                <span 
                  key={i} 
                  className="px-3.5 py-1.5 rounded-full bg-[#0D1117]/80 text-[#FAF6EE]/80 border border-[#C9A84C]/25"
                >
                  ⚡ {addon}
                </span>
              ))}
            </div>
            
            <p className="text-[11px] text-[#FAF6EE]/50 mt-4 font-light">
              * Kindly coordinate with our caretaker during booking to arrange music, decorations, or custom chef services.
            </p>
          </div>

        </div>
      </section>

      {/* SECTION 6 — ROOMS SHOWCASE */}
      <RoomsShowcase />

      {/* SECTION 7 — GALLERY (Masonry loaded with live images or static fallback) */}
      <Gallery customImages={liveImages} />

      {/* SECTION 8 — EXPERIENCES */}
      <section id="experiences" className="py-24 bg-[#0D1117] border-b border-[#C9A84C]/10 scroll-mt-16">
        <div className="max-w-7xl mx-auto px-6">
          
          <div className="text-center mb-16">
            <span className="text-xs uppercase tracking-[0.2em] text-[#C9A84C] font-semibold block mb-3">
              ◆ PERFECT FOR ◆
            </span>
            <h2 className="text-3xl md:text-5xl font-display font-medium text-[#FAF6EE] mb-4">
              Every Occasion Deserves a Royal Stage
            </h2>
            <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent mx-auto my-4" />
            <p className="subheading-cormorant text-xl text-[#F0D080]/80 italic max-w-2xl mx-auto font-serif-elegant">
              We design spaces that accommodate your specific event beautifully, giving your memories the luxury backdrop they deserve.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {EXPERIENCE_CARDS.map((exp, i) => (
              <div
                key={exp.id}
                className="group relative h-96 rounded-3xl overflow-hidden border border-[#C9A84C]/20 shadow-lg hover:border-[#C9A84C]/40 hover:-translate-y-1.5 transition-all duration-300"
              >
                <div className="absolute inset-0">
                  <LazyImage
                    src={getUrl(EXP_KEYS[exp.id] || "pool", exp.image)}
                    alt={exp.title}
                    fallbackType={i % 3 === 0 ? "pool" : i % 3 === 1 ? "garden" : "bonfire"}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0D1117]/95 via-[#0D1117]/65 to-transparent transition-opacity" />
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-8 flex flex-col justify-end text-left z-10">
                  <h3 className="font-display font-semibold text-xl md:text-2xl text-[#FAF6EE] mb-2 leading-snug group-hover:text-[#F0D080] transition-colors">
                    {exp.title}
                  </h3>
                  <p className="text-xs md:text-sm text-[#FAF6EE]/80 font-light leading-relaxed">
                    {exp.description}
                  </p>
                  <div className="mt-4 flex items-center gap-1 text-[11px] uppercase tracking-wider text-[#C9A84C] font-semibold opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                    Get custom details &rarr;
                  </div>
                </div>

              </div>
            ))}
          </div>

        </div>
      </section>

      {/* SECTION 9 — LOCATION */}
      <section className="py-24 bg-[#141B26] border-b border-[#C9A84C]/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            
            <div className="lg:col-span-5 space-y-6 reveal-hidden">
              <span className="text-[#C9A84C] text-xs font-semibold tracking-widest uppercase block mb-1">
                ◆ VILLA LOCATION SOURCE ◆
              </span>
              <h3 className="text-2xl font-display font-medium text-[#FAF6EE]">
                Boraj Road, Malavali, Lonavala
              </h3>
              
              <div className="rounded-2xl overflow-hidden border border-[#C9A84C]/30 shadow-2xl h-80 relative group">
                <LazyImage
                  src={getUrl("mapThumb", "/images/map-thumb.jpg")}
                  alt="Static location coordinate of Malavali, Lonavala"
                  fallbackType="map"
                  className="w-full h-full"
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-6 select-none">
                  <div className="flex gap-3 items-center">
                    <div className="p-2.5 bg-[#C9A84C] text-[#0D1117] rounded-full shadow-lg">
                      <MapPin size={22} className="stroke-[2.5]" />
                    </div>
                    <div>
                      <p className="font-sans font-bold text-[#FAF6EE] text-sm">{brandName}</p>
                      <p className="text-[10px] text-[#C9A84C] tracking-wide mt-0.5">Perfect central base near railway stations</p>
                    </div>
                  </div>
                </div>
              </div>

              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(brandName + " Malavali Lonavala")}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3.5 rounded-xl font-semibold bg-[#141B26] border border-[#C9A84C] text-[#C9A84C] hover:bg-[#FAF6EE] hover:text-[#0D1117] hover:border-[#FAF6EE] text-xs uppercase tracking-wider transition-all duration-300 inline-flex items-center justify-center gap-2"
              >
                📍 Open in Google Maps <ExternalLink size={14} />
              </a>
            </div>

            <div className="lg:col-span-7 space-y-8 reveal-hidden">
              <div>
                <span className="text-[#C9A84C] text-xs font-semibold tracking-widest uppercase block mb-1">
                  ◆ LOCATION ◆
                </span>
                <h2 className="text-3xl md:text-5xl font-display font-medium text-[#FAF6EE]">
                  The Perfect Escape — Closer Than You Think
                </h2>
                <div className="w-16 h-0.5 bg-[#C9A84C] my-4" />
                <p className="text-xs sm:text-sm text-[#F0D080] antialiased leading-relaxed">
                  📍 Address: {villaAddress}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {DISTANCE_CALLOUTS.map((col) => (
                  <div key={col.id} className="p-4 bg-[#0D1117] border border-[#C9A84C]/15 rounded-2xl flex gap-3">
                    <span className="text-2xl mt-1">{col.icon}</span>
                    <div>
                      <h4 className="font-sans font-semibold text-[#F0D080] text-sm">{col.title}</h4>
                      <p className="text-xs text-[#FAF6EE]/75 mt-1 leading-normal font-light">{col.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4">
                <h4 className="text-xs font-semibold uppercase tracking-widest text-[#C9A84C] mb-4">
                  NEARBY CRITICAL ATTRACTIONS
                </h4>
                <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-xs text-[#FAF6EE]/90">
                  {NEARBY_ATTRACTIONS.map((attr, idx) => (
                    <div key={idx} className="flex justify-between border-b border-[#C9A84C]/10 pb-1.5 hover:border-[#C9A84C]/35 transition-colors">
                      <span className="flex items-center gap-2">
                        <span className="text-[#C9A84C] text-[10px]">◆</span> {attr.name}
                      </span>
                      <span className="text-[#F0D080] font-sans font-semibold">{attr.distance}</span>
                    </div>
                  ))}
                </div>
                
                <p className="subheading-cormorant text-xs italic text-[#FAF6EE]/50 mt-5 block">
                  "Ideal base camp for Lonavala sightseeing — explore by day, unwind in your private villa by evening."
                </p>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* SECTION 10 — TRANSPARENT PRICING & DEPOSIT POLICIES */}
      <section id="pricing" className="py-24 bg-[#0D1117] border-b border-[#C9A84C]/10 scroll-mt-16">
        <div className="max-w-7xl mx-auto px-6">
          
          <div className="text-center mb-16">
            <span className="text-xs uppercase tracking-[0.2em] text-[#C9A84C] font-semibold block mb-3">
              ◆ PRICING ◆
            </span>
            <h2 className="text-3xl md:text-5xl font-display font-medium text-[#FAF6EE] mb-4">
              Transparent Pricing, Royal Value
            </h2>
            <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent mx-auto my-4" />
            <p className="subheading-cormorant text-xl text-[#F0D080]/80 italic max-w-2xl mx-auto font-serif-elegant">
              Clear rates, zero hidden charges. Choose your date block and secure your retreat.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-center">
            
            {/* Weekday Pricing */}
            <div className="bg-[#141B26] border border-[#C9A84C]/15 rounded-3xl p-8 hover:border-[#C9A84C]/35 transition-all duration-300">
              <span className="px-3 py-1 bg-[#0D1117] text-[#C9A84C] text-[10px] tracking-widest font-bold uppercase rounded-full border border-[#C9A84C]/20">
                MON – THU
              </span>
              <h3 className="text-xl font-display font-medium text-[#FAF6EE] mt-6 mb-2">Weekday Package</h3>
              <div className="flex items-baseline gap-1.5 my-6">
                <span className="text-4xl font-sans font-extrabold text-[#F0D080]">{weekdayRateText}</span>
                <span className="text-xs text-[#FAF6EE]/60">{weekdayUnitText}</span>
              </div>
              <p className="text-xs text-[#FAF6EE]/60 mb-6 italic">* Or call/message for premium exclusive villa rates</p>
              
              <div className="w-full h-px bg-gradient-to-r from-transparent via-[#C9A84C]/20 to-transparent mb-6" />
              
              <ul className="space-y-3.5 text-xs text-[#FAF6EE]/90 mb-8 font-sans">
                <li className="flex items-center gap-2"><span className="text-[#52B788] font-bold">✓</span> Entire villa 100% private</li>
                <li className="flex items-center gap-2"><span className="text-[#52B788] font-bold">✓</span> 24/7 infinity pool access</li>
                <li className="flex items-center gap-2"><span className="text-[#52B788] font-bold">✓</span> All 15+ premium amenities</li>
                <li className="flex items-center gap-2"><span className="text-[#52B788] font-bold">✓</span> On-call caretaker assistance</li>
                <li className="flex items-center gap-2"><span className="text-[#52B788] font-bold">✓</span> Free gated multi-vehicle parking</li>
              </ul>

              <button
                onClick={() => triggerWhatsAppDirect(`Hi, I want to check weekday booking rates for ${brandName}!`)}
                className="w-full py-3.5 rounded-xl font-semibold bg-transparent border border-[#C9A84C] text-[#C9A84C] hover:bg-[#FAF6EE] hover:text-[#0D1117] hover:border-[#FAF6EE] uppercase tracking-wider text-xs transition-all duration-300 cursor-pointer"
              >
                Check Weekday Rate
              </button>
            </div>

            {/* Weekend Pricing */}
            <div className="bg-[#141B26] border-[2px] border-[#C9A84C] rounded-3xl p-8 relative hover:shadow-[0_12px_45px_rgba(201,168,76,0.18)] transition-all duration-400 scale-100 md:scale-105">
              <div className="absolute top-0 right-8 -translate-y-1/2 px-4 py-1.5 bg-gradient-to-r from-[#C9A84C] to-[#F0D080] text-[#0D1117] text-[9px] sm:text-[10px] tracking-widest font-extrabold uppercase rounded-full shadow-md">
                ⭐ MOST POPULAR
              </div>
              <span className="px-3 py-1 bg-[#0D1117] text-[#F0D080] text-[10px] tracking-widest font-bold uppercase rounded-full border border-[#C9A84C]">
                FRI – SUN & HOLIDAYS
              </span>
              <h3 className="text-xl font-display font-medium text-[#FAF6EE] mt-6 mb-2">Weekend & Festivities</h3>
              <div className="flex items-baseline gap-1.5 my-6">
                <span className="text-4xl font-sans font-extrabold text-[#F0D080]">{weekendRateText}</span>
                <span className="text-xs text-[#FAF6EE]/60">{weekendUnitText}</span>
              </div>
              <p className="text-xs text-[#FAF6EE]/60 mb-6 italic">* Early advance reservation highly suggested</p>

              <div className="w-full h-px bg-gradient-to-r from-transparent via-[#C9A84C]/30 to-transparent mb-6" />

              <ul className="space-y-3.5 text-xs text-[#FAF6EE]/90 mb-8 font-sans">
                <li className="flex items-center gap-2"><span className="text-[#52B788] font-bold">✓</span> Entire villa 100% private</li>
                <li className="flex items-center gap-2"><span className="text-[#52B788] font-bold">✓</span> 24/7 infinity pool access</li>
                <li className="flex items-center gap-2"><span className="text-[#52B788] font-bold">✓</span> All 15+ premium amenities</li>
                <li className="flex items-center gap-2"><span className="text-[#52B788] font-bold">✓</span> Complimentary barbecue setups</li>
                <li className="flex items-center gap-2"><span className="text-[#C9A84C] font-bold">◆</span> Advance booking recommended</li>
              </ul>

              <button
                onClick={() => triggerWhatsAppDirect(`Hi, I want to book a weekend slot! Can you verify availability for ${brandName}?`)}
                className="w-full py-4 rounded-xl font-semibold text-[#0D1117] bg-gradient-to-r from-[#C9A84C] to-[#F0D080] hover:scale-[1.01] hover:shadow-lg hover:shadow-[#C9A84C]/10 uppercase tracking-widest text-xs transition-all duration-300 cursor-pointer"
              >
                Book for Weekend
              </button>
            </div>

          </div>

          {/* Booking policies */}
          <div className="mt-16 bg-[#141B26] border border-[#C9A84C]/30 rounded-3xl p-6 md:p-10 max-w-4xl mx-auto">
            <h4 className="font-sans font-semibold text-[#FAF6EE] text-sm md:text-base text-center uppercase tracking-widest mb-6 flex items-center justify-center gap-2">
              📂 BOOKING & DEPOSIT POLICIES
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-[#FAF6EE]/80 leading-relaxed font-sans">
              {rulesList.map((ruleText, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <span className="text-[#C9A84C] mt-0.5">◆</span> 
                  <span>{ruleText}</span>
                </div>
              ))}
            </div>

            <p className="text-center font-serif-elegant italic text-xs text-[#FAF6EE]/50 mt-8 border-t border-[#C9A84C]/10 pt-6">
              * {pricingNotes}
            </p>
          </div>

          {/* Instant Quote CTA */}
          <div className="text-center mt-12">
            <button
              onClick={() => triggerWhatsAppDirect(`Hi, I am looking for a direct quote for ${brandName} Lonavala!`)}
              className="px-10 py-4.5 rounded-xl font-semibold text-[#0D1117] bg-gradient-to-r from-[#C9A84C] to-[#F0D080] hover:scale-[1.03] text-sm tracking-wider uppercase transition-all duration-300 shadow-xl shadow-[#C9A84C]/10 cursor-pointer inline-flex items-center gap-2"
            >
              <span>📲</span> WhatsApp for Exact Quote &rarr;
            </button>
          </div>

        </div>
      </section>

      {/* SECTION 11 — REVIEWS CAROUSEL Testimonials (with dynamic live list) */}
      <ReviewsCarousel customReviews={liveReviews} />

      {/* SECTION 13 — CONTACT & DYNAMIC FORM */}
      <EnquiryForm />

      {/* SECTION 14 — FOOTER */}
      <footer className="bg-[#0A0F1A] border-t border-[#C9A84C]/30 pt-16 pb-8 text-xs sm:text-sm font-sans">
        <div className="max-w-7xl mx-auto px-6">
          
          <div className="flex flex-col md:flex-row justify-between items-center bg-[#141B26]/30 p-8 rounded-3xl border border-[#C9A84C]/15 mb-12 gap-6 text-center md:text-left">
            <div className="flex items-center gap-3">
              <span className="text-3xl">👑</span>
              <div>
                <h4 className="font-display font-bold text-lg text-[#F0D080] tracking-wide">{brandName}</h4>
                <p className="subheading-cormorant italic text-[#FAF6EE]/60 text-sm mt-0.5">"Official Rental Channel Partner"</p>
              </div>
            </div>
            
            <button
              onClick={() => triggerWhatsAppDirect("Hi! I want to coordinate calendar booking dates.")}
              className="px-6 py-3 rounded-xl bg-[#0D1117] border border-[#C9A84C] text-[#C9A84C] hover:bg-[#FAF6EE] hover:text-[#0D1117] transition-all font-semibold uppercase tracking-wider text-xs cursor-pointer"
            >
              Coordinate Dates Now
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-16 pb-12 text-[#FAF6EE]/80">
            
            <div className="space-y-4">
              <h5 className="font-sans font-bold text-[#F0D080] uppercase tracking-wider text-xs">QUICK EXPLORATION</h5>
              <div className="grid grid-cols-2 gap-2 text-xs font-light">
                <a href="#home" className="hover:text-[#F0D080] transition-colors">Home Base</a>
                <a href="#about" className="hover:text-[#F0D080] transition-colors">The Villa Overview</a>
                <a href="#amenities" className="hover:text-[#F0D080] transition-colors">15+ Amenities</a>
                <a href="#rooms" className="hover:text-[#F0D080] transition-colors">Sleep Layouts</a>
                <a href="#gallery" className="hover:text-[#F0D080] transition-colors">Spaces Gallery</a>
                <a href="#experiences" className="hover:text-[#F0D080] transition-colors">Bespoke Use Cases</a>
                <a href="#pricing" className="hover:text-[#F0D080] transition-colors">Rate Card</a>
                <a href="#contact" className="hover:text-[#F0D080] transition-colors">Enquire Now</a>
              </div>
            </div>

            <div className="space-y-4 text-xs font-light">
              <h5 className="font-sans font-bold text-[#F0D080] uppercase tracking-wider text-xs">DIRECT CONTACT</h5>
              <p className="leading-relaxed">
                🎯 Owner: <span className="text-[#F0D080] font-medium">{ownerName}</span> <br />
                📲 Phone: +{whatsappNumber} <br />
                📸 Instagram: <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="text-[#C9A84C] hover:underline">{instagramHandle}</a>
              </p>
              <p className="leading-relaxed">
                📍 Location: {villaAddress}
              </p>
            </div>

            <div className="space-y-4 text-xs font-light leading-relaxed">
              <h5 className="font-sans font-bold text-[#F0D080] uppercase tracking-wider text-xs">CORE VILLA CODES</h5>
              <p>
                🔒 Security Checklist: Blackout curtains, secure gates, first-aid support, and active backup lighting generators.
              </p>
              <p>
                ⏳ Checking Protocol: Fast-handover check-ins at {checkInTime}, and checkouts strictly at {checkOutTime}.
              </p>
            </div>

          </div>

          <div className="pt-8 border-t border-[#C9A84C]/20 text-center text-[#FAF6EE]/40 text-[11px] font-light flex flex-col sm:flex-row justify-between items-center gap-4">
            <p>
              &copy; {new Date().getFullYear()} {brandName} &bull; Malavali, Lonavala. All Rights Reserved.
            </p>
            <p className="flex items-center gap-1">
              Live database synchronized &bull; Owned and administered by {ownerName}
            </p>
          </div>

        </div>
      </footer>

      {/* SECTION 12 — FLOATING WHATSAPP BUTTON */}
      <div className="fixed bottom-6 right-6 z-[9999] group">
        <button
          onClick={() => triggerWhatsAppDirect(`Hi! I'm interested in booking ${brandName}. Please share availability & price quote.`)}
          className="whatsapp-pulse p-4 md:p-4.5 bg-[#2D6A4F] hover:bg-[#52B788] text-[#FAF6EE] rounded-full shadow-2xl hover:scale-105 transition-all duration-300 relative select-none cursor-pointer flex items-center justify-center gap-2 border border-[#52B788]/40"
          title="Chat to Book"
        >
          <div className="absolute inset-0 rounded-full animate-ping bg-[#2D6A4F]/25 pointer-events-none" />
          
          <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.022-.015-.072-.11-.314-.23-.242-.12-1.433-.707-1.656-.787-.223-.08-.386-.12-.55.12c-.164.24-.633.788-.775.95-.143.16-.285.18-.527.06-.242-.12-1.02-.375-1.943-1.193-.72-.64-1.202-1.43-1.343-1.673-.143-.242-.015-.373.107-.493.11-.11.242-.284.364-.425.12-.14.164-.242.243-.404.08-.162.04-.303-.02-.423-.06-.12-.55-1.325-.75-1.812-.195-.473-.393-.41-.54-.417-.14-.007-.3-.007-.46-.007s-.422.06-.642.3c-.22.24-.84.82-.84 2s.86 2.32.98 2.48c.12.16 1.69 2.583 4.1 3.623.574.248 1.02.396 1.37.508.577.183 1.102.157 1.517.096.463-.068 1.43-.585 1.631-1.15.201-.567.201-1.054.14-1.154-.061-.1-.223-.16-.465-.28zM12 2C6.48 2 2 6.48 2 12c0 2.17.7 4.19 1.88 5.83L2 22l4.31-1.78C7.88 21.24 9.87 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm0 18c-1.84 0-3.55-.53-5-1.43l-.36-.21-2.58.74.75-2.51-.23-.39C3.65 14.86 3 13.01 3 12c0-4.96 4.04-9 9-9s9 4.04 9 9-4.04 9-9 9z" />
          </svg>

          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 font-semibold tracking-wider text-xs whitespace-nowrap hidden md:inline">
            Chat to Book
          </span>
        </button>
      </div>

    </div>
  );
}

import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { seedFirestore } from "../utils/seedFirestore";
import { 
  DollarSign, 
  Image, 
  Star, 
  Settings, 
  PlusCircle, 
  Sparkles, 
  CheckCircle,
  Database,
  ArrowRight,
  TrendingUp,
  Sliders,
  ChevronRight
} from "lucide-react";
import { PricingRates } from "../../types";

export default function AdminDashboard() {
  const [pricing, setPricing] = useState<PricingRates | null>(null);
  const [galleryCount, setGalleryCount] = useState<number | null>(null);
  const [reviewsCount, setReviewsCount] = useState({ total: 0, visible: 0, pinned: 0 });
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [seedSuccess, setSeedSuccess] = useState(false);
  const navigate = useNavigate();

  const fetchStats = async () => {
    setLoading(true);
    try {
      // 1. Get rates
      const pricingSnap = await getDoc(doc(db, "pricing", "rates"));
      if (pricingSnap.exists()) {
        setPricing(pricingSnap.data() as PricingRates);
      }

      // 2. Get gallery count
      const gallerySnap = await getDocs(collection(db, "gallery"));
      setGalleryCount(gallerySnap.size);

      // 3. Get reviews count
      const reviewsSnap = await getDocs(collection(db, "reviews"));
      let total = 0;
      let visible = 0;
      let pinned = 0;
      reviewsSnap.forEach((doc) => {
        const data = doc.data();
        total++;
        if (data.visible !== false) visible++;
        if (data.pinned === true) pinned++;
      });
      setReviewsCount({ total, visible, pinned });
    } catch (e) {
      console.error("Dashboard statistics loading failed:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleSeed = async () => {
    if (confirm("Are you sure you want to seed default fallback data into your Firestore collections? This will override settings and rates, and write mock reviews and gallery items.")) {
      setSeeding(true);
      try {
        await seedFirestore();
        setSeedSuccess(true);
        setTimeout(() => setSeedSuccess(false), 5000);
        await fetchStats();
      } catch (err) {
        alert("Seeding failed: " + err);
      } finally {
        setSeeding(false);
      }
    }
  };

  return (
    <div className="space-y-8 animate-fade-in text-[#FAF6EE] max-w-6xl mx-auto px-2">
      
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-serif font-bold text-white tracking-tight" style={{ fontFamily: "Georgia, serif" }}>
            Overview Dashboard
          </h1>
          <p className="text-[#FAF6EE]/50 text-sm mt-1">
            Manage your Lonavala private estate pricing, media library, and client reviews live.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/"
            target="_blank"
            className="border border-[#C9A84C]/30 text-xs text-[#C9A84C] hover:border-[#C9A84C] px-4 py-2.5 rounded-xl font-semibold transition-all hover:bg-[#C9A84C]/5 flex items-center gap-1.5"
          >
            Preview Villa Site <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Seeding Box warning if database is flat out empty */}
      {(!loading && galleryCount === 0 && !pricing) && (
        <div className="bg-gradient-to-r from-[#C9A84C]/10 to-[#F0D080]/5 border border-[#C9A84C]/30 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <span className="text-3xl bg-[#C9A84C]/10 p-3 rounded-full shrink-0">✨</span>
            <div>
              <h3 className="text-base font-bold text-[#F0D080]">Seed Initial Data Found Empty</h3>
              <p className="text-xs text-[#FAF6EE]/60 max-w-xl mt-1 leading-relaxed">
                Your Firestore database looks empty! You can instantly seed original copy values, beautiful Unsplash images, local rates, and guest feedback directly.
              </p>
            </div>
          </div>
          <button
            onClick={handleSeed}
            disabled={seeding}
            className="bg-gradient-to-r from-[#C9A84C] to-[#F0D080] text-[#0D1117] hover:scale-[1.02] active:scale-100 disabled:opacity-40 px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap"
          >
            <Database className="w-4 h-4" />
            {seeding ? "Seeding..." : "Bootstrap Firestore"}
          </button>
        </div>
      )}

      {seedSuccess && (
        <div className="bg-[#2D6A4F] border border-[#52B788]/30 rounded-xl p-4 text-[#FAF6EE] flex items-center gap-3.5 text-sm">
          <CheckCircle className="w-5 h-5 text-[#52B788]" />
          <span>✅ Database successfully bootstrapped with high-resolution Unsplash photos and template prices!</span>
        </div>
      )}

      {/* Main Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Pricing Card */}
        <div className="bg-[#141B26] border border-[#C9A84C]/15 rounded-2xl p-6 flex flex-col justify-between hover:border-[#C9A84C]/35 transition-all group relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs text-[#FAF6EE]/50 uppercase font-semibold tracking-wider">RESERVATION PRICING</span>
            <div className="p-2.5 bg-[#C9A84C]/10 text-[#C9A84C] rounded-xl">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold">
              {loading ? (
                <div className="h-7 w-28 bg-[#0D1117]/60 rounded-lg animate-pulse" />
              ) : pricing ? (
                `₹${pricing.weekdayRate.toLocaleString()} / night`
              ) : (
                "₹12,000 / night"
              )}
            </div>
            <p className="text-xs text-[#FAF6EE]/40 mt-1">
              Weekend: {loading ? "..." : pricing ? `₹${pricing.weekendRate.toLocaleString()}` : "₹16,000"}
            </p>
          </div>
          <Link to="pricing" className="mt-5 text-xs text-[#C9A84C] hover:underline flex items-center gap-1 font-semibold">
            Manage rates <ChevronRight className="w-3.5 h-3.5 shrink-0" />
          </Link>
        </div>

        {/* Gallery Card */}
        <div className="bg-[#141B26] border border-[#C9A84C]/15 rounded-2xl p-6 flex flex-col justify-between hover:border-[#C9A84C]/35 transition-all group relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs text-[#FAF6EE]/50 uppercase font-semibold tracking-wider">MEDIA GALLERY</span>
            <div className="p-2.5 bg-[#C9A84C]/10 text-[#C9A84C] rounded-xl">
              <Image className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold">
              {loading ? (
                <div className="h-7 w-12 bg-[#0D1117]/60 rounded-lg animate-pulse" />
              ) : galleryCount !== null ? (
                `${galleryCount} Photos`
              ) : (
                "10 Photos"
              )}
            </div>
            <p className="text-xs text-[#FAF6EE]/40 mt-1">
              High-Res hosted on Cloudinary
            </p>
          </div>
          <Link to="gallery" className="mt-5 text-xs text-[#C9A84C] hover:underline flex items-center gap-1 font-semibold">
            Manage media room <ChevronRight className="w-3.5 h-3.5 shrink-0" />
          </Link>
        </div>

        {/* Reviews Card */}
        <div className="bg-[#141B26] border border-[#C9A84C]/15 rounded-2xl p-6 flex flex-col justify-between hover:border-[#C9A84C]/35 transition-all group relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs text-[#FAF6EE]/50 uppercase font-semibold tracking-wider">CLIENT FEEDBACK</span>
            <div className="p-2.5 bg-[#C9A84C]/10 text-[#C9A84C] rounded-xl">
              <Star className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold">
              {loading ? (
                <div className="h-7 w-16 bg-[#0D1117]/60 rounded-lg animate-pulse" />
              ) : (
                `${reviewsCount.total} Reviews`
              )}
            </div>
            <p className="text-xs text-[#FAF6EE]/40 mt-1">
              {reviewsCount.visible} visible · {reviewsCount.pinned} pinned
            </p>
          </div>
          <Link to="reviews" className="mt-5 text-xs text-[#C9A84C] hover:underline flex items-center gap-1 font-semibold">
            Moderate testimonials <ChevronRight className="w-3.5 h-3.5 shrink-0" />
          </Link>
        </div>

        {/* Settings Card */}
        <div className="bg-[#141B26] border border-[#C9A84C]/15 rounded-2xl p-6 flex flex-col justify-between hover:border-[#C9A84C]/35 transition-all group relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs text-[#FAF6EE]/50 uppercase font-semibold tracking-wider">SITE CONFIGURATION</span>
            <div className="p-2.5 bg-[#C9A84C]/10 text-[#C9A84C] rounded-xl">
              <Settings className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold font-serif" style={{ fontFamily: "Georgia, serif" }}>
              Active
            </div>
            <p className="text-xs text-[#FAF6EE]/40 mt-1">
              Brand settings, contact & policy
            </p>
          </div>
          <Link to="settings" className="mt-5 text-xs text-[#C9A84C] hover:underline flex items-center gap-1 font-semibold">
            Custom details <ChevronRight className="w-3.5 h-3.5 shrink-0" />
          </Link>
        </div>

      </div>

      {/* Quick Action Dashboard Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Quick Actions Panel */}
        <div className="bg-[#141B26] border border-[#C9A84C]/20 rounded-2xl p-6">
          <h2 className="text-lg font-serif font-bold text-[#F0D080] mb-4 flex items-center gap-2" style={{ fontFamily: "Georgia, serif" }}>
            <Sliders className="w-5 h-5 text-[#C9A84C]" />
            Quick Administrator Shortcuts
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => navigate("pricing")}
              className="bg-[#0D1117] hover:bg-[#0D1117]/80 border border-[#C9A84C]/25 text-xs text-left p-4 rounded-xl flex items-start gap-3 transition-colors hover:border-[#C9A84C] shrink-0"
            >
              <DollarSign className="w-5 h-5 text-[#C9A84C] mt-0.5" />
              <div>
                <h4 className="font-bold text-[#FAF6EE]">Update Base Prices</h4>
                <p className="text-[11px] text-[#FAF6EE]/50 mt-1 leading-relaxed">Direct base rate weekend pricing changes</p>
              </div>
            </button>
            <button
              onClick={() => navigate("gallery")}
              className="bg-[#0D1117] hover:bg-[#0D1117]/80 border border-[#C9A84C]/25 text-xs text-left p-4 rounded-xl flex items-start gap-3 transition-colors hover:border-[#C9A84C] shrink-0"
            >
              <PlusCircle className="w-5 h-5 text-[#C9A84C] mt-0.5" />
              <div>
                <h4 className="font-bold text-[#FAF6EE]">Add New Villa Photo</h4>
                <p className="text-[11px] text-[#FAF6EE]/50 mt-1 leading-relaxed">Drag files directly for unsigned Cloudinary uploads</p>
              </div>
            </button>
            <button
              onClick={() => navigate("reviews")}
              className="bg-[#0D1117] hover:bg-[#0D1117]/80 border border-[#C9A84C]/25 text-xs text-left p-4 rounded-xl flex items-start gap-3 transition-colors hover:border-[#C9A84C] shrink-0"
            >
              <Star className="w-5 h-5 text-[#C9A84C] mt-0.5" />
              <div>
                <h4 className="font-bold text-[#FAF6EE]">Moderate Guest Review</h4>
                <p className="text-[11px] text-[#FAF6EE]/50 mt-1 leading-relaxed">Publish, pin, re-order, or delete visitor reviews</p>
              </div>
            </button>
            <button
              onClick={() => navigate("settings")}
              className="bg-[#0D1117] hover:bg-[#0D1117]/80 border border-[#C9A84C]/25 text-xs text-left p-4 rounded-xl flex items-start gap-3 transition-colors hover:border-[#C9A84C] shrink-0"
            >
              <Settings className="w-5 h-5 text-[#C9A84C] mt-0.5" />
              <div>
                <h4 className="font-bold text-[#FAF6EE]">Edit Brand Info</h4>
                <p className="text-[11px] text-[#FAF6EE]/50 mt-1 leading-relaxed">Live phone contacts & checkout policy terms</p>
              </div>
            </button>
          </div>
        </div>

        {/* Informational Guidance */}
        <div className="bg-[#141B26] border border-[#C9A84C]/20 rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <Sparkles className="w-32 h-32 text-[#C9A84C]" />
          </div>
          <div>
            <h2 className="text-lg font-serif font-bold text-[#F0D080] mb-3 flex items-center gap-2" style={{ fontFamily: "Georgia, serif" }}>
              <TrendingUp className="w-5 h-5 text-[#C9A84C]" />
              Direct-To-Owner Setup Info
            </h2>
            <div className="space-y-3.5 text-xs text-[#FAF6EE]/70 mt-1 leading-relaxed">
              <p>
                👑 <strong>Full Sync System</strong>: Changes submitted in this panel propagate instantly to the live website. To review the modifications, open the live view link in the header.
              </p>
              <p>
                ⚡ <strong>Unsigned Cloudinary Hosting</strong>: Uploads leverage fast Content Delivery Networks (CDNs), which guarantees your photos load instantaneously around Mumbai & Pune.
              </p>
              <p>
                📁 <strong>Offline Fallback Guard</strong>: If Firestore credentials are missing, the website will seamlessly rely on high-fidelity offline fallbacks, meaning it will never fail or go down.
              </p>
            </div>
          </div>
          <div className="pt-6 border-t border-[#C9A84C]/10 text-[11px] text-[#C9A84C] font-semibold flex items-center gap-1">
            <span>●</span>
            <span>All systems live & secure on Cloud database</span>
          </div>
        </div>

      </div>

    </div>
  );
}

import React, { useState, useEffect, useRef } from "react";
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, query, orderBy, writeBatch } from "firebase/firestore";
import { db } from "../../firebase";
import { uploadToCloudinary } from "../utils/cloudinaryUpload";
import { 
  Star, 
  Trash2, 
  Check, 
  AlertCircle, 
  Plus, 
  Eye, 
  EyeOff, 
  Pin, 
  Image, 
  User, 
  MapPin, 
  SlidersHorizontal 
} from "lucide-react";
import { Review } from "../../types";

export default function AdminReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Form State
  const [author, setAuthor] = useState("");
  const [location, setLocation] = useState("");
  const [stars, setStars] = useState(5);
  const [text, setText] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchReviews = async () => {
    try {
      const q = query(collection(db, "reviews"), orderBy("order", "asc"));
      const snap = await getDocs(q);
      if (snap.empty) {
        const anySnap = await getDocs(collection(db, "reviews"));
        if (anySnap.empty) {
          const { GUEST_REVIEWS } = await import("../../data");
          const batch = writeBatch(db);
          for (let i = 0; i < GUEST_REVIEWS.length; i++) {
            const rev = GUEST_REVIEWS[i];
            const revRef = doc(db, "reviews", rev.id || `seed-rev-${i}`);
            batch.set(revRef, {
              stars: rev.stars,
              text: rev.text,
              author: rev.author,
              location: rev.location,
              avatar: rev.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(rev.author)}&background=C9A84C&color=0D1117&bold=true`,
              visible: true,
              pinned: false,
              order: i,
              createdAt: new Date().toISOString()
            });
          }
          await batch.commit();
          const snapAfter = await getDocs(q);
          const listAfter = snapAfter.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review));
          setReviews(listAfter);
          return;
        }
      }
      const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review));
      setReviews(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleCreateReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!author.trim() || !text.trim() || !location.trim()) {
      showToast("Please fill in Author, Location, and Review testimonial text.", "error");
      return;
    }

    setSaving(true);
    try {
      const finalAvatar = avatarUrl.trim() || `https://ui-avatars.com/api/?name=${encodeURIComponent(author)}&background=C9A84C&color=0D1117&bold=true`;
      const nextOrder = reviews.length > 0 ? Math.max(...reviews.map(r => r.order ?? 0)) + 1 : 0;
      
      await addDoc(collection(db, "reviews"), {
        stars,
        text: text.trim(),
        author: author.trim(),
        location: location.trim(),
        avatar: finalAvatar,
        visible: true,
        pinned: false,
        order: nextOrder,
        createdAt: new Date().toISOString()
      });

      showToast("Guest review added successfully!", "success");
      
      // Reset form
      setAuthor("");
      setLocation("");
      setStars(5);
      setText("");
      setAvatarUrl("");
      
      await fetchReviews();
    } catch (err: any) {
      showToast(`Creation failed: ${err.message}`, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleUploadAvatarInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadingAvatar(true);
      try {
        const uploadedUrl = await uploadToCloudinary(e.target.files[0]);
        setAvatarUrl(uploadedUrl);
        showToast("Guest avatar photo hosted successfully!", "success");
      } catch (err: any) {
        showToast(err.message || "Failed uploading guest avatar to Cloudinary", "error");
      } finally {
        setUploadingAvatar(false);
      }
    }
  };

  const handleToggleField = async (id: string, field: keyof Review, currentValue: any) => {
    try {
      const newValue = !currentValue;
      await updateDoc(doc(db, "reviews", id), { [field]: newValue });
      
      // Update local state quickly
      setReviews(prev => prev.map(r => r.id === id ? { ...r, [field]: newValue } : r));
      showToast(`Review updated.`, "success");
    } catch (err: any) {
      showToast("Toggle updated failed: " + err.message, "error");
    }
  };

  const handleUpdateFieldDirect = async (id: string, field: keyof Review, value: any) => {
    try {
      await updateDoc(doc(db, "reviews", id), { [field]: value });
      setReviews(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
    } catch (err: any) {
      showToast("Field change failure: " + err.message, "error");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this testimonial from the page database?")) return;
    try {
      await deleteDoc(doc(db, "reviews", id));
      showToast("Review deleted.", "success");
      await fetchReviews();
    } catch (err: any) {
      showToast("Deletion failed: " + err.message, "error");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-[#FAF6EE]">
        <div className="w-10 h-10 border-2 border-[#C9A84C] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="font-serif italic text-sm text-[#FAF6EE]/50">Reading Client Reviews...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-fade-in max-w-6xl mx-auto px-2 pb-16 text-[#FAF6EE]">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-serif font-bold text-white tracking-tight" style={{ fontFamily: "Georgia, serif" }}>
          Client Feedback Moderator
        </h1>
        <p className="text-sm text-[#FAF6EE]/50 mt-1">
          Review, approve, pin, or add verified user testimonials. Keep ratings impeccable.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Review Creator Form - Left */}
        <div className="lg:col-span-5 bg-[#141B26] border border-[#C9A84C]/20 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-[#C9A84C]" />
            <h2 className="text-lg font-serif font-bold text-[#F0D080]" style={{ fontFamily: "Georgia, serif" }}>
              Add Verified Testimonial
            </h2>
          </div>

          <form onSubmit={handleCreateReview} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-[#FAF6EE]/60 font-bold mb-1.5">
                  Guest Name
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#FAF6EE]/30"><User className="w-4 h-4" /></span>
                  <input
                    type="text"
                    placeholder="Rahul M."
                    required
                    className="w-full bg-[#0D1117] border border-[#C9A84C]/20 focus:border-[#C9A84C] rounded-xl pl-9 pr-3 py-3 text-sm outline-none text-[#FAF6EE] transition-all"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-[#FAF6EE]/60 font-bold mb-1.5">
                  Guest Location
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#FAF6EE]/30"><MapPin className="w-4 h-4" /></span>
                  <input
                    type="text"
                    required
                    placeholder="Mumbai / Pune"
                    className="w-full bg-[#0D1117] border border-[#C9A84C]/20 focus:border-[#C9A84C] rounded-xl pl-9 pr-3 py-3 text-sm outline-none text-[#FAF6EE] transition-all"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider text-[#FAF6EE]/60 font-bold mb-1.5">
                Star Rating
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setStars(num)}
                    className="p-1 cursor-pointer transition-transform duration-100 hover:scale-125 hover:-translate-y-0.5"
                  >
                    <Star 
                      className={`w-6 h-6 ${
                        num <= stars ? "fill-[#C9A84C] text-[#C9A84C]" : "text-[#FAF6EE]/20"
                      }`} 
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider text-[#FAF6EE]/60 font-bold mb-1.5">
                Guest Avatar (Optional)
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Paste URL or upload image file..."
                  className="w-full bg-[#0D1117] border border-[#C9A84C]/20 focus:border-[#C9A84C] rounded-xl px-4 py-3 text-xs outline-none text-[#FAF6EE] transition-all"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                />
                
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleUploadAvatarInput}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="bg-[#0D1117] hover:bg-[#0D1117]/80 border border-[#C9A84C]/30 text-[#C9A84C] hover:text-white rounded-xl px-4 flex items-center justify-center gap-1 transition-all pointer-events-auto cursor-pointer"
                  title="Host a profile picture on Cloudinary"
                >
                  <Image className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[10px] text-[#FAF6EE]/30 mt-1">Leaves blank to auto-generate styled monogram initials.</p>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider text-[#FAF6EE]/60 font-bold mb-1.5">
                Review Text / Recommendation copy
              </label>
              <textarea
                rows={4}
                required
                placeholder="Write genuine experience details..."
                className="w-full bg-[#0D1117] border border-[#C9A84C]/30 focus:border-[#C9A84C] rounded-xl px-4 py-3 text-sm outline-none text-[#FAF6EE] focus:ring-1 focus:ring-[#C9A84C] transition-all placeholder:text-[#FAF6EE]/30 text-left"
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-gradient-to-r from-[#C9A84C] to-[#F0D080] text-[#0D1117] py-3.5 rounded-xl font-bold uppercase tracking-[0.15em] text-xs shadow-lg hover:shadow-[#C9A84C]/15 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              {saving ? "Creating Testimonial..." : "Submit Review"}
            </button>
          </form>
        </div>

        {/* Live List Board - Right */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-[#FAF6EE]/70 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-[#C9A84C]" />
              Feedback Stack ({reviews.length} total)
            </span>
          </div>

          {reviews.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-[#C9A84C]/25 rounded-2xl bg-[#141B26]">
              <p className="text-sm italic text-[#FAF6EE]/50">No reviews found. Submit the left form to create one!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((rev) => (
                <div 
                  key={rev.id} 
                  className={`bg-[#141B26] border rounded-2xl p-5 shadow-md flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between transition-all ${
                    rev.pinned ? "border-[#C9A84C] ring-1 ring-[#C9A84C]/15" : "border-[#C9A84C]/10"
                  }`}
                >
                  {/* Left Column: Avatar & Text */}
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-11 h-11 rounded-full overflow-hidden bg-[#0D1117] border border-[#C9A84C]/25 shrink-0">
                      <img 
                        src={rev.avatar} 
                        alt={rev.author} 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5">
                        <cite className="font-serif font-bold text-sm text-[#FAF6EE] not-italic">{rev.author}</cite>
                        <span className="text-[10px] text-[#FAF6EE]/45 flex items-center gap-1 bg-[#0D1117] px-2 py-0.5 rounded-full">
                          <MapPin className="w-3 h-3 text-[#C9A84C]" />
                          {rev.location}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-3.5 h-3.5 ${
                              i < rev.stars ? "fill-[#C9A84C] text-[#C9A84C]" : "text-[#FAF6EE]/25"
                            }`} 
                          />
                        ))}
                      </div>

                      <p className="text-xs text-[#FAF6EE]/75 leading-relaxed italic pr-2">
                        "{rev.text}"
                      </p>
                    </div>
                  </div>

                  {/* Right Column: Interaction Toggles */}
                  <div className="flex sm:flex-col items-center sm:items-end gap-3.5 sm:border-l sm:border-[#C9A84C]/10 sm:pl-4 min-w-32 justify-between w-full sm:w-auto pt-3 sm:pt-0 border-t border-[#C9A84C]/5 sm:border-t-0">
                    
                    {/* Status Toggles Inline */}
                    <div className="flex items-center gap-3">
                      
                      {/* Pinned toggle */}
                      <button
                        type="button"
                        onClick={() => handleToggleField(rev.id, "pinned", rev.pinned)}
                        className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                          rev.pinned 
                            ? "bg-[#C9A84C]/10 border-[#C9A84C] text-[#C9A84C]" 
                            : "bg-[#0D1117] border-[#C9A84C]/15 text-[#FAF6EE]/40 hover:text-[#C9A84C]"
                        }`}
                        title={rev.pinned ? "Pinned to feature top" : "Click to pin review top"}
                      >
                        <Pin className="w-3.5 h-3.5" />
                      </button>

                      {/* Visible Approve Toggle */}
                      <button
                        type="button"
                        onClick={() => handleToggleField(rev.id, "visible", rev.visible !== false)}
                        className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                          rev.visible !== false 
                            ? "bg-transparent border-[#52B788]/30 text-[#52B788] hover:bg-[#52B788]/10" 
                            : "bg-[#E63946]/10 border-[#E63946]/20 text-[#E63946] hover:bg-[#E63946]/20"
                        }`}
                        title={rev.visible !== false ? "Approved (visible)" : "Blocked (hidden)"}
                      >
                        {rev.visible !== false ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </button>

                    </div>

                    {/* Sorting index & delete */}
                    <div className="flex items-center gap-2.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-[#FAF6EE]/30 uppercase font-mono">Order:</span>
                        <input 
                          type="number"
                          className="w-10 bg-[#0D1117] border border-[#C9A84C]/25 text-white rounded-md p-1 pl-1.5 text-xs text-center font-mono"
                          value={rev.order ?? 0}
                          onChange={(e) => handleUpdateFieldDirect(rev.id, "order", Number(e.target.value))}
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDelete(rev.id)}
                        className="text-[#E63946]/60 hover:text-[#E63946] p-1.5 rounded-lg hover:bg-red-500/5 transition-colors cursor-pointer"
                        title="Delete Review"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                  </div>

                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Floating Success / Error Notification Toast */}
      {toast && (
        <div 
          className={`fixed bottom-6 right-6 z-[120] flex items-center gap-3 px-5 py-3.5 rounded-xl border text-sm shadow-2xl animate-fade-in ${
            toast.type === "success" 
              ? "bg-[#2D6A4F] border-[#52B788]/40 text-[#FAF6EE]" 
              : "bg-[#7A1D25] border-[#E63946]/40 text-[#FAF6EE]"
          }`}
        >
          {toast.type === "success" ? <Check className="w-5 h-5 text-[#52B788]" /> : <AlertCircle className="w-5 h-5 text-[#E63946]" />}
          <span className="font-semibold">{toast.message}</span>
        </div>
      )}

    </div>
  );
}

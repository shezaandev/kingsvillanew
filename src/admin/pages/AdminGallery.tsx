import React, { useState, useEffect, useRef } from "react";
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, writeBatch, query, orderBy, setDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { uploadToCloudinary } from "../utils/cloudinaryUpload";
import { 
  CloudUpload, 
  Trash2, 
  Check, 
  AlertCircle, 
  Sparkles, 
  Grid, 
  FileEdit, 
  Globe, 
  Info, 
  Loader2,
  Save,
  Upload
} from "lucide-react";
import { GalleryImage } from "../../types";

const CATEGORIES = [
  { value: "exterior", label: "Exterior / Hills" },
  { value: "pool", label: "Infinity Pool" },
  { value: "bedroom", label: "AC Bedrooms" },
  { value: "living", label: "Living Room" },
  { value: "dining", label: "Dining Hall" },
  { value: "garden", label: "Lush Lawn / Garden" },
  { value: "bonfire", label: "Bonfire & BBQ" },
  { value: "terrace", label: "Sky Terrace" },
  { value: "other", label: "Other Area" }
] as const;

const SECTION_IMAGES = [
  { key: "hero", label: "Hero Background", defaultPath: "/images/hero.jpg" },
  { key: "instagram", label: "Instagram Section Banner", defaultPath: "" },
  { key: "exterior", label: "Exterior Showcase", defaultPath: "/images/exterior.jpg" },
  { key: "mapThumb", label: "Location Map Thumbnail", defaultPath: "/images/map-thumb.jpg" },
  { key: "bedroom1", label: "Bedroom 1 Suite", defaultPath: "/images/bedroom1.jpg" },
  { key: "bedroom2", label: "Bedroom 2 Suite", defaultPath: "/images/bedroom2.jpg" },
  { key: "bedroom3", label: "Bedroom 3 Suite", defaultPath: "/images/bedroom3.jpg" },
  { key: "bedroom4", label: "Bedroom 4 Suite", defaultPath: "/images/bedroom4.jpg" },
  { key: "living", label: "Living Room Showcase", defaultPath: "/images/living.jpg" },
  { key: "kitchen", label: "Kitchen Showcase", defaultPath: "/images/kitchen.jpg" },
  { key: "dining", label: "Dining Hall Showcase", defaultPath: "/images/dining.jpg" },
  { key: "pool", label: "Pool Experience", defaultPath: "/images/pool.jpg" },
  { key: "garden", label: "Garden Experience", defaultPath: "/images/garden.jpg" },
  { key: "bonfire", label: "Bonfire Experience", defaultPath: "/images/bonfire.jpg" },
  { key: "terrace", label: "Terrace Experience", defaultPath: "/images/terrace.jpg" },
  { key: "poolNight", label: "Night Pool Experience", defaultPath: "/images/pool-night.jpg" },
];

export default function AdminGallery() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  
  // Website section images
  const [siteImages, setSiteImages] = useState<Record<string, string>>({});
  const [siteImagesLoaded, setSiteImagesLoaded] = useState(false);
  const [savingSiteImageKey, setSavingSiteImageKey] = useState<string | null>(null);
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);

  // Staged uploads & editing alts
  const [editingAlts, setEditingAlts] = useState<Record<string, string>>({});
  const [stagedFile, setStagedFile] = useState<File | null>(null);
  const [stagedPreview, setStagedPreview] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [sectionStagedFiles, setSectionStagedFiles] = useState<Record<string, File>>({});
  const [sectionStagedPreviews, setSectionStagedPreviews] = useState<Record<string, string>>({});

  // Create state
  const [newAlt, setNewAlt] = useState("");
  const [newCat, setNewCat] = useState<GalleryImage["category"]>("exterior");
  
  // Status state
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchImages = async () => {
    try {
      const q = query(collection(db, "gallery"), orderBy("order", "asc"));
      const snap = await getDocs(q);
      const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as GalleryImage));
      setImages(list);
    } catch (err) {
      console.error("Failed to fetch gallery images:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSiteImages = async () => {
    try {
      const snap = await getDocs(collection(db, "siteImages"));
      const mapping: Record<string, string> = {};
      snap.forEach(doc => {
        mapping[doc.id] = doc.data().url || "";
      });
      setSiteImages(mapping);
    } catch (err) {
      console.error("Failed to fetch site images:", err);
    } finally {
      setSiteImagesLoaded(true);
    }
  };

  const handleSaveSiteImage = async (key: string, url: string) => {
    setSavingSiteImageKey(key);
    try {
      await setDoc(doc(db, "siteImages", key), { url: url.trim() });
      showToast(`Saved ${key} image URL successfully!`, "success");
      setSiteImages(prev => ({ ...prev, [key]: url.trim() }));
    } catch (err: any) {
      console.error(err);
      showToast(`Failed to save site image: ${err.message}`, "error");
    } finally {
      setSavingSiteImageKey(null);
    }
  };

  const handleImageUpload = async (key: string, file: File) => {
    setUploadingKey(key);
    try {
      const uploadedUrl = await uploadToCloudinary(file);
      await handleSaveSiteImage(key, uploadedUrl);
      showToast("✅ Image uploaded and saved successfully!", "success");
      
      // Clear staged state for that key
      setSectionStagedFiles(prev => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
      setSectionStagedPreviews(prev => {
        if (prev[key]) {
          URL.revokeObjectURL(prev[key]);
        }
        const next = { ...prev };
        delete next[key];
        return next;
      });
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "❌ Upload failed. Try pasting a URL instead.", "error");
    } finally {
      setUploadingKey(null);
    }
  };

  useEffect(() => {
    fetchImages();
    fetchSiteImages();
  }, []);

  // Upload trigger
  const handleUploadFile = async (file: File) => {
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    try {
      showToast("Uploading file to Cloudinary...", "success");
      // Upload to Cloudinary
      const uploadedUrl = await uploadToCloudinary(file);
      
      // Save metadata to Firestore
      const nextOrder = images.length > 0 ? Math.max(...images.map(i => i.order || 0)) + 1 : 0;
      await addDoc(collection(db, "gallery"), {
        src: uploadedUrl,
        alt: newAlt.trim() || file.name.split(".")[0],
        category: newCat,
        order: nextOrder,
        isOgImage: images.length === 0 // If first image, set as OG preview automatically
      });
      
      showToast("Media uploaded successfully!", "success");
      setNewAlt("");
      
      // Clear staged state
      setStagedFile(null);
      if (stagedPreview) {
        URL.revokeObjectURL(stagedPreview);
        setStagedPreview(null);
      }
      await fetchImages();
    } catch (err: any) {
      console.error(err);
      setUploadError(err.message || "Failed to upload image.");
      showToast(err.message || "Failed to upload image. Please verify setups.", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setUploadError(null);
      setStagedFile(file);
      if (stagedPreview) {
        URL.revokeObjectURL(stagedPreview);
      }
      setStagedPreview(URL.createObjectURL(file));
    }
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadError(null);
      setStagedFile(file);
      if (stagedPreview) {
        URL.revokeObjectURL(stagedPreview);
      }
      setStagedPreview(URL.createObjectURL(file));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this beautiful photo from the showcase gallery?")) return;
    try {
      await deleteDoc(doc(db, "gallery", id));
      showToast("Image deleted from gallery.", "success");
      await fetchImages();
    } catch (err: any) {
      showToast("Delete failed: " + err.message, "error");
    }
  };

  const handleUpdateField = async (id: string, field: keyof GalleryImage, value: any) => {
    try {
      await updateDoc(doc(db, "gallery", id), { [field]: value });
      // update state locally to reflect quickly without full fetch
      setImages(prev => prev.map(img => img.id === id ? { ...img, [field]: value } : img));
    } catch (err: any) {
      showToast("Field update failed: " + err.message, "error");
    }
  };

  // Set as OG Image (only one can be true at a time)
  const handleSetOgImage = async (id: string) => {
    try {
      const batch = writeBatch(db);
      
      images.forEach(img => {
        const imageRef = doc(db, "gallery", img.id);
        batch.update(imageRef, { isOgImage: img.id === id });
      });

      await batch.commit();
      showToast("Selected image has been configured as primary social sharing OG image!", "success");
      
      // Update locally
      setImages(prev => prev.map(img => ({ ...img, isOgImage: img.id === id })));
    } catch (err: any) {
      showToast("Failed setting OG image: " + err.message, "error");
    }
  };

  const selectFilesClick = () => {
    fileInputRef.current?.click();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-[#FAF6EE]">
        <div className="w-10 h-10 border-2 border-[#C9A84C] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="font-serif italic text-sm text-[#FAF6EE]/50">Reading Showcase Media...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-fade-in max-w-6xl mx-auto px-2 pb-16 text-[#FAF6EE]">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-serif font-bold text-white tracking-tight" style={{ fontFamily: "Georgia, serif" }}>
          Media Showcase Gallery
        </h1>
        <p className="text-sm text-[#FAF6EE]/50 mt-1">
          Arrange aesthetic, high-resolution villa photos. Upload items directly to live Cloudinary hosting.
        </p>
      </div>

      {/* Website Section Images Section */}
      <div className="bg-[#141B26] border border-[#C9A84C]/25 rounded-3xl p-6 shadow-2xl space-y-6 relative overflow-hidden backdrop-blur-md">
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-[#C9A84C]" />
          <h2 className="text-xl font-serif font-bold text-[#F0D080]" style={{ fontFamily: "Georgia, serif" }}>
            Website Section Images
          </h2>
        </div>
        <p className="text-xs text-[#FAF6EE]/60 max-w-2xl leading-relaxed">
          Manage individual static section background layouts across the entire landing page. Select an image from your device to upload it directly to live storage.
        </p>

        {!siteImagesLoaded ? (
          <div className="flex items-center gap-2 text-[#FAF6EE]/40 text-sm py-4">
            <span className="w-4 h-4 border-2 border-[#C9A84C] border-t-transparent rounded-full animate-spin" />
            Loading saved images...
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {SECTION_IMAGES.map((item) => {
              const currentValue = siteImages[item.key]?.trim() || "";
              return (
                <div key={item.key} className="bg-[#0D1117] border border-[#C9A84C]/15 rounded-2xl p-4 flex flex-col justify-between space-y-4 shadow-md hover:border-[#C9A84C]/35 transition-all">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-white tracking-wide">{item.label}</span>
                      <span className="text-[9px] font-mono text-[#C9A84C]/50 px-1.5 py-0.5 rounded-md bg-[#141B26] border border-[#C9A84C]/10">{item.key}</span>
                    </div>
                    {(() => {
                      const displaySrc = sectionStagedPreviews[item.key] || currentValue;

                      return (
                        <div className="aspect-[16/9] w-full bg-black/50 rounded-lg overflow-hidden relative border border-[#C9A84C]/5">
                          {displaySrc ? (
                            <img
                              key={displaySrc}
                              src={displaySrc}
                              alt={item.label}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = "none";
                                // Show fallback text inside the parent div instead
                                const parent = (e.target as HTMLImageElement).parentElement;
                                if (parent && !parent.querySelector(".img-error-label")) {
                                  const label = document.createElement("div");
                                  label.className = "img-error-label absolute inset-0 flex items-center justify-center text-[#C9A84C] text-xs font-semibold";
                                  label.textContent = "No Live Image";
                                  parent.appendChild(label);
                                }
                              }}
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-[#C9A84C] text-xs font-semibold">
                              No Live Image
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  {/* Upload from device */}
                  <div className="space-y-2">
                    <label className="block text-[9px] uppercase tracking-wider text-[#FAF6EE]/50 font-bold mb-1">
                      Upload Image
                    </label>
                    <label
                      htmlFor={`upload-${item.key}`}
                      className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-dashed border-[#C9A84C]/40 text-[#C9A84C] font-bold text-xs cursor-pointer hover:border-[#C9A84C] hover:bg-[#C9A84C]/5 transition-all"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      {sectionStagedFiles[item.key] ? "Change Selected" : "Choose from Gallery"}
                      <input
                        id={`upload-${item.key}`}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={uploadingKey !== null}
                        onChange={e => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setSectionStagedFiles(prev => ({ ...prev, [item.key]: file }));
                            if (sectionStagedPreviews[item.key]) {
                              URL.revokeObjectURL(sectionStagedPreviews[item.key]);
                            }
                            setSectionStagedPreviews(prev => ({ ...prev, [item.key]: URL.createObjectURL(file) }));
                          }
                        }}
                      />
                    </label>

                    {/* Staged preview and Upload button */}
                    {sectionStagedPreviews[item.key] && (
                      <div className="bg-[#141B26] border border-[#C9A84C]/25 rounded-xl p-3 space-y-3 mt-2 animate-fade-in">
                        <div className="flex items-center gap-3">
                          <img 
                            src={sectionStagedPreviews[item.key]} 
                            alt="Staged" 
                            className="w-12 h-12 rounded object-cover border border-[#C9A84C]/20 shrink-0" 
                          />
                          <div className="min-w-0 flex-1">
                            <span className="text-[10px] font-bold text-[#C9A84C] block truncate">Selected Photo</span>
                            <span className="text-[9px] text-[#FAF6EE]/40 block truncate">{(sectionStagedFiles[item.key]?.size / (1024 * 1024)).toFixed(2)} MB</span>
                          </div>
                        </div>

                        <button
                          type="button"
                          disabled={uploadingKey !== null}
                          onClick={() => handleImageUpload(item.key, sectionStagedFiles[item.key])}
                          className="w-full bg-[#C9A84C]/20 hover:bg-[#C9A84C]/35 text-[#C9A84C] hover:text-white border border-[#C9A84C]/50 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          {uploadingKey === item.key ? (
                            <>
                              <span className="w-3.5 h-3.5 border-2 border-[#C9A84C] border-t-transparent rounded-full animate-spin" />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Upload className="w-3.5 h-3.5" />
                              Upload Image
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Upload Form - Left */}
        <div className="lg:col-span-4 bg-[#141B26] border border-[#C9A84C]/20 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center gap-2">
            <CloudUpload className="w-5 h-5 text-[#C9A84C]" />
            <h2 className="text-lg font-serif font-bold text-[#F0D080]" style={{ fontFamily: "Georgia, serif" }}>
              Upload Portfolio Item
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-[#FAF6EE]/60 font-bold mb-2">
                Aesthetic Label / Alt text
              </label>
              <input
                type="text"
                placeholder="e.g. Stunning Private Infinity Pool at dusk"
                className="w-full bg-[#0D1117] border border-[#C9A84C]/20 focus:border-[#C9A84C] rounded-xl px-4 py-3 text-sm outline-none transition-all"
                value={newAlt}
                onChange={(e) => setNewAlt(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider text-[#FAF6EE]/60 font-bold mb-2">
                Section Classification
              </label>
              <select
                className="w-full bg-[#0D1117] border border-[#C9A84C]/20 focus:border-[#C9A84C] rounded-xl px-4 py-3 text-sm outline-none transition-all"
                value={newCat}
                onChange={(e) => setNewCat(e.target.value as GalleryImage["category"])}
              >
                {CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            {/* Drag & Drop Boundary Box */}
            <div
              className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center text-center justify-center transition-all min-h-48 cursor-pointer ${
                dragActive 
                  ? "border-[#C9A84C] bg-[#C9A84C]/10" 
                  : "border-[#C9A84C]/20 bg-[#0D1117]/50 hover:bg-[#0D1117]"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={selectFilesClick}
            >
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileInput}
                disabled={uploading}
              />
              
              {uploading ? (
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="w-8 h-8 text-[#C9A84C] animate-spin" />
                  <p className="text-xs text-[#FAF6EE]/50">Engaging Cloudinary CDN upload...</p>
                </div>
              ) : stagedPreview && stagedFile ? (
                <div className="flex flex-col items-center gap-3 w-full">
                  <img 
                    src={stagedPreview} 
                    alt="Staged Portfolio item" 
                    className="max-h-24 rounded-lg object-contain border border-[#C9A84C]/30 shadow-md" 
                  />
                  <div>
                    <p className="text-xs font-bold text-[#C9A84C] truncate max-w-[200px]">{stagedFile.name}</p>
                    <p className="text-[10px] text-[#FAF6EE]/40">{(stagedFile.size / (1024 * 1024)).toFixed(2)} MB &bull; Drop/click to replace</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3.5">
                  <div className="p-3 bg-[#C9A84C]/5 text-[#C9A84C] rounded-full">
                    <CloudUpload className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#FAF6EE]/80">Drag and drop file or click to select</p>
                    <p className="text-[10px] text-[#FAF6EE]/35 mt-1">Supports PNG, JPG, JPEG (Max 15MB)</p>
                  </div>
                </div>
              )}
            </div>

            {/* GOLD upload button (only visible when stagedFile !== null) */}
            {stagedFile && !uploading && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleUploadFile(stagedFile);
                }}
                className="w-full py-3 rounded-xl bg-[#C9A84C]/20 hover:bg-[#C9A84C]/35 text-[#C9A84C] hover:text-white border border-[#C9A84C]/50 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                Upload Image
              </button>
            )}

            {/* Red error box below the drop zone */}
            {uploadError && (
              <div className="bg-[#7A1D25]/20 border border-[#E63946]/30 rounded-xl p-3 text-xs text-[#FAF6EE] flex items-start gap-2 animate-fade-in">
                <AlertCircle className="w-4 h-4 text-[#E63946] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block text-[#E63946]">CDN Upload Error</span>
                  <p className="mt-0.5 leading-relaxed text-[#FAF6EE]/80">{uploadError}</p>
                </div>
              </div>
            )}
            
            <div className="flex items-start gap-2 text-[10px] text-[#FAF6EE]/40 leading-relaxed bg-[#0D1117]/30 p-3 rounded-lg border border-[#C9A84C]/10">
              <Info className="w-3.5 h-3.5 text-[#C9A84C] shrink-0 mt-0.5" />
              <p>Uploaded images default to the end of the lineup and can be instantly modified.</p>
            </div>
          </div>
        </div>

        {/* Live Grid Showcase - Right */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-[#FAF6EE]/70 flex items-center gap-2">
              <Grid className="w-4 h-4 text-[#C9A84C]" />
              ショーケース Grid ({images.length} photos)
            </span>
          </div>

          {images.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-[#C9A84C]/25 rounded-2xl bg-[#141B26]">
              <p className="text-sm italic text-[#FAF6EE]/50">Showcase Gallery is empty. Drag a file on the left side to begin!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {images.map((img) => (
                <div 
                  key={img.id} 
                  className={`bg-[#141B26] border rounded-2xl overflow-hidden shadow-lg transition-all group relative ${
                    img.isOgImage ? "border-[#C9A84C] ring-1 ring-[#C9A84C]/30 shadow-[#C9A84C]/5" : "border-[#C9A84C]/10"
                  }`}
                >
                  {/* Image with Aspect ratio */}
                  <div className="aspect-[4/3] bg-black/40 relative overflow-hidden">
                    <img 
                      src={img.src} 
                      alt={img.alt} 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                    />
                    
                    {/* Corner category pill */}
                    <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-md border border-[#C9A84C]/30 text-[10px] font-bold text-[#FAF6EE] uppercase tracking-wider">
                      {CATEGORIES.find(c => c.value === img.category)?.label || img.category}
                    </div>

                    {img.isOgImage && (
                      <div className="absolute top-3 right-3 bg-[#C9A84C] text-[#0D1117] px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                        <Globe className="w-3 h-3" />
                        OG Primary Link
                      </div>
                    )}
                  </div>

                  {/* Card Actions / Details */}
                  <div className="p-4 space-y-4">
                    {/* Edit Alt text input */}
                    <div className="space-y-1.5">
                      <label className="block text-[9px] uppercase tracking-wider text-[#FAF6EE]/40 font-bold">
                        Description copy
                      </label>
                      <input 
                        type="text" 
                        className="w-full bg-[#0D1117] border border-[#C9A84C]/15 focus:border-[#C9A84C] rounded-lg px-2.5 py-1.5 text-xs text-white outline-none"
                        value={editingAlts[img.id] ?? img.alt}
                        onChange={(e) => {
                          const val = e.target.value;
                          setEditingAlts(prev => ({ ...prev, [img.id]: val }));
                        }}
                        onBlur={(e) => handleUpdateField(img.id, "alt", e.target.value)}
                        placeholder="Enter dynamic alt tag description..."
                      />
                    </div>

                    {/* Class Selector & Order Number Input */}
                    <div className="grid grid-cols-12 gap-3">
                      <div className="col-span-8 space-y-1">
                        <label className="block text-[9px] uppercase tracking-wider text-[#FAF6EE]/40 font-bold">
                          Filter View
                        </label>
                        <select 
                          className="w-full bg-[#0D1117] border border-[#C9A84C]/15 focus:border-[#C9A84C] rounded-lg p-1.5 text-xs text-white outline-none"
                          value={img.category}
                          onChange={(e) => handleUpdateField(img.id, "category", e.target.value)}
                        >
                          {CATEGORIES.map(cat => (
                            <option key={cat.value} value={cat.value}>{cat.label}</option>
                          ))}
                        </select>
                      </div>

                      <div className="col-span-4 space-y-1">
                        <label className="block text-[9px] uppercase tracking-wider text-[#FAF6EE]/40 font-bold">
                          Order index
                        </label>
                        <input 
                          type="number"
                          className="w-full bg-[#0D1117] border border-[#C9A84C]/15 focus:border-[#C9A84C] rounded-lg p-1.5 text-xs text-center text-white outline-none font-mono"
                          value={img.order}
                          onChange={(e) => handleUpdateField(img.id, "order", Number(e.target.value))}
                        />
                      </div>
                    </div>

                    {/* Bottom Action Footer buttons */}
                    <div className="pt-3 border-t border-[#C9A84C]/10 flex items-center justify-between gap-3 text-xs">
                      
                      {/* Set Primary OG social share visual icon */}
                      <button
                        type="button"
                        onClick={() => handleSetOgImage(img.id)}
                        disabled={img.isOgImage}
                        className={`font-semibold shrink-0 transition-colors flex items-center gap-1 cursor-pointer hover:bg-white/5 p-1 px-1.5 rounded-md ${
                          img.isOgImage 
                            ? "text-[#C9A84C]/50 cursor-not-allowed" 
                            : "text-[#FAF6EE]/60 hover:text-[#C9A84C]"
                        }`}
                        title="Configure as the primary Open Graph sharing banner in index.html"
                      >
                        <Globe className="w-3.5 h-3.5" />
                        Set Primary Social OG
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => handleDelete(img.id)}
                        className="text-[#E63946]/60 hover:text-[#E63946] font-semibold flex items-center gap-1 transition-colors hover:bg-red-500/5 p-1 px-1.5 rounded-md cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete image
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

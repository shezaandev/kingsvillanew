import React, { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { 
  Settings, 
  Save, 
  Trash2, 
  Plus, 
  Instagram, 
  Phone, 
  Home, 
  Clock, 
  Check, 
  AlertCircle, 
  Sparkles,
  Award,
  BookOpen
} from "lucide-react";
import { SiteSettings } from "../../types";
import { 
  BRAND_NAME, 
  OWNER_NAME, 
  WHATSAPP_NUMBER, 
  INSTAGRAM_HANDLE, 
  INSTAGRAM_URL 
} from "../../data";

export default function AdminSettings() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Rule input state
  const [newRule, setNewRule] = useState("");

  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const snap = await getDoc(doc(db, "settings", "main"));
        if (snap.exists()) {
          setSettings(snap.data() as SiteSettings);
        } else {
          // Default fallbacks from core data sheet
          setSettings({
            brandName: BRAND_NAME,
            ownerName: OWNER_NAME,
            whatsappNumber: WHATSAPP_NUMBER,
            instagramHandle: INSTAGRAM_HANDLE,
            instagramUrl: INSTAGRAM_URL,
            villaAddress: "Malavali, Boraj Road, Lonavala, Maharashtra 410405",
            checkInTime: "1:00 PM",
            checkOutTime: "11:00 AM",
            tagline: "Where Royalty Meets the Sahyadris",
            bookingRules: [
              "Weekend bookings require 50% advance booking deposit.",
              "Gov-approved photo ID card required for all adult check-ins.",
              "Furry companions are family here! Prior notification appreciated."
            ]
          });
        }
      } catch (err: any) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    if (!settings.brandName.trim() || !settings.whatsappNumber.trim()) {
      showToast("Brand Name and Whatsapp Contact Number cannot be empty.", "error");
      return;
    }

    setSaving(true);
    try {
      await setDoc(doc(db, "settings", "main"), settings);
      showToast("Site settings saved successfully!", "success");
    } catch (err: any) {
      console.error(err);
      showToast(`Save settings failure: ${err.message}`, "error");
    } finally {
      setSaving(false);
    }
  };

  // Rule management
  const handleAddRule = () => {
    if (!settings || !newRule.trim()) return;
    setSettings({
      ...settings,
      bookingRules: [...settings.bookingRules, newRule.trim()]
    });
    setNewRule("");
  };

  const handleDeleteRule = (idx: number) => {
    if (!settings) return;
    const filtered = settings.bookingRules.filter((_, i) => i !== idx);
    setSettings({
      ...settings,
      bookingRules: filtered
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-[#FAF6EE]">
        <div className="w-10 h-10 border-2 border-[#C9A84C] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="font-serif italic text-sm text-[#FAF6EE]/50">Reading General configuration...</p>
      </div>
    );
  }

  if (!settings) return null;

  return (
    <div className="space-y-10 animate-fade-in max-w-5xl mx-auto px-2 pb-16 text-[#FAF6EE]">
      
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-serif font-bold text-white tracking-tight" style={{ fontFamily: "Georgia, serif" }}>
          General Site Configuration
        </h1>
        <p className="text-sm text-[#FAF6EE]/50 mt-1">
          Adjust branding copywriting, social integrations, location coordinates, and booking terms here.
        </p>
      </div>

      <form onSubmit={handleSaveSettings} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Form Column */}
        <div className="lg:col-span-7 bg-[#141B26] border border-[#C9A84C]/20 rounded-2xl p-6 shadow-xl space-y-6">
          
          <div className="flex items-center gap-2 border-b border-[#C9A84C]/10 pb-4">
            <Award className="w-5 h-5 text-[#C9A84C]" />
            <h2 className="text-lg font-serif font-bold text-[#F0D080]" style={{ fontFamily: "Georgia, serif" }}>
              Aesthetic branding config
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-[#FAF6EE]/60 font-bold mb-2">
                Brand Name Title
              </label>
              <input
                type="text"
                required
                className="w-full bg-[#0D1117] border border-[#C9A84C]/20 focus:border-[#C9A84C] rounded-xl px-4 py-3 text-sm outline-none text-white transition-all focus:ring-1 focus:ring-[#C9A84C]"
                value={settings.brandName}
                onChange={(e) => setSettings({ ...settings, brandName: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider text-[#FAF6EE]/60 font-bold mb-2">
                Owner Registered Name
              </label>
              <input
                type="text"
                required
                className="w-full bg-[#0D1117] border border-[#C9A84C]/20 focus:border-[#C9A84C] rounded-xl px-4 py-3 text-sm outline-none text-white transition-all focus:ring-1 focus:ring-[#C9A84C]"
                value={settings.ownerName}
                onChange={(e) => setSettings({ ...settings, ownerName: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-wider text-[#FAF6EE]/60 font-bold mb-2">
              Marketing Tagline copy
            </label>
            <input
              type="text"
              required
              className="w-full bg-[#0D1117] border border-[#C9A84C]/20 focus:border-[#C9A84C] rounded-xl px-4 py-3 text-sm outline-none text-white transition-all focus:ring-1 focus:ring-[#C9A84C]"
              value={settings.tagline}
              onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-[#FAF6EE]/60 font-bold mb-2">
                Contact Phone / Whatsapp
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#C9A84C]"><Phone className="w-4 h-4" /></span>
                <input
                  type="text"
                  required
                  placeholder="e.g. 917208162620"
                  className="w-full bg-[#0D1117] border border-[#C9A84C]/20 focus:border-[#C9A84C] rounded-xl pl-10 pr-4 py-3 text-sm outline-none text-white transition-all focus:ring-1 focus:ring-[#C9A84C]"
                  value={settings.whatsappNumber}
                  onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value.replace(/\D/g, "") })}
                />
              </div>
              <p className="text-[10px] text-[#FAF6EE]/30 mt-1">Digits only: Include country code (91) (no symbols).</p>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider text-[#FAF6EE]/60 font-bold mb-2">
                Instagram handle
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#C9A84C]"><Instagram className="w-4 h-4" /></span>
                <input
                  type="text"
                  required
                  placeholder="e.g. @kings_diamonds_villas"
                  className="w-full bg-[#0D1117] border border-[#C9A84C]/20 focus:border-[#C9A84C] rounded-xl pl-10 pr-4 py-3 text-sm outline-none text-white transition-all focus:ring-1 focus:ring-[#C9A84C]"
                  value={settings.instagramHandle}
                  onChange={(e) => setSettings({ ...settings, instagramHandle: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-wider text-[#FAF6EE]/60 font-bold mb-2">
              Instagram profile URL
            </label>
            <input
              type="url"
              required
              className="w-full bg-[#0D1117] border border-[#C9A84C]/20 focus:border-[#C9A84C] rounded-xl px-4 py-3 text-sm outline-none text-white transition-all focus:ring-1 focus:ring-[#C9A84C]"
              value={settings.instagramUrl}
              onChange={(e) => setSettings({ ...settings, instagramUrl: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-[#FAF6EE]/60 font-bold mb-2">
                Check-in Time
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#C9A84C]"><Clock className="w-4 h-4" /></span>
                <input
                  type="text"
                  required
                  className="w-full bg-[#0D1117] border border-[#C9A84C]/20 focus:border-[#C9A84C] rounded-xl pl-10 pr-4 py-3 text-sm outline-none text-white transition-all focus:ring-1 focus:ring-[#C9A84C]"
                  value={settings.checkInTime}
                  onChange={(e) => setSettings({ ...settings, checkInTime: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider text-[#FAF6EE]/60 font-bold mb-2">
                Check-out Time
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#C9A84C]"><Clock className="w-4 h-4" /></span>
                <input
                  type="text"
                  required
                  className="w-full bg-[#0D1117] border border-[#C9A84C]/20 focus:border-[#C9A84C] rounded-xl pl-10 pr-4 py-3 text-sm outline-none text-white transition-all focus:ring-1 focus:ring-[#C9A84C]"
                  value={settings.checkOutTime}
                  onChange={(e) => setSettings({ ...settings, checkOutTime: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-wider text-[#FAF6EE]/60 font-bold mb-2">
              Physical Villa Address
            </label>
            <div className="relative">
              <span className="absolute top-3.5 left-3.5 text-[#C9A84C]"><Home className="w-4 h-4" /></span>
              <textarea
                rows={3}
                required
                className="w-full bg-[#0D1117] border border-[#C9A84C]/20 focus:border-[#C9A84C] rounded-xl pl-10 pr-4 py-3 text-sm outline-none text-white transition-all focus:ring-1 focus:ring-[#C9A84C] resize-none text-left"
                value={settings.villaAddress}
                onChange={(e) => setSettings({ ...settings, villaAddress: e.target.value })}
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={saving}
              className="w-full bg-gradient-to-r from-[#C9A84C] to-[#F0D080] text-[#0D1117] py-4 rounded-xl font-bold uppercase tracking-[0.2em] text-xs shadow-lg hover:shadow-[#C9A84C]/15 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              {saving ? "Deploying Site Settings..." : "Save Settings Metadata"}
            </button>
          </div>

        </div>

        {/* Right Form Rules Column */}
        <div className="lg:col-span-5 bg-[#141B26] border border-[#C9A84C]/20 rounded-2xl p-6 shadow-xl space-y-6">
          
          <div className="flex items-center gap-2 border-b border-[#C9A84C]/10 pb-4">
            <BookOpen className="w-5 h-5 text-[#C9A84C]" />
            <h2 className="text-lg font-serif font-bold text-[#F0D080]" style={{ fontFamily: "Georgia, serif" }}>
              House Policy & Rules
            </h2>
          </div>

          {/* New Rule Line */}
          <div className="space-y-3">
            <label className="block text-[10px] uppercase tracking-wider text-[#FAF6EE]/60 font-bold">
              Append Policy Rule
            </label>
            
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. Quiet hours requested after 10:00 PM."
                className="w-full bg-[#0D1117] border border-[#C9A84C]/20 focus:border-[#C9A84C] rounded-xl px-4 py-3 text-xs outline-none text-white transition-all"
                value={newRule}
                onChange={(e) => setNewRule(e.target.value)}
              />
              <button
                type="button"
                onClick={handleAddRule}
                className="bg-[#0D1117] hover:bg-[#0D1117]/80 border border-[#C9A84C]/30 text-[#C9A84C] hover:text-white rounded-xl px-4 flex items-center justify-center transition-colors pointer-events-auto cursor-pointer"
              >
                <Plus className="w-4.5 h-4.5" />
              </button>
            </div>
            <p className="text-[9px] text-[#FAF6EE]/30 leading-relaxed">Adds list items. Saved immediately once database commits.</p>
          </div>

          {/* Current Rules list */}
          <div className="space-y-3">
            <label className="block text-[10px] uppercase tracking-wider text-[#FAF6EE]/60 font-bold">
              Currently Active (Lists)
            </label>

            <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
              {settings.bookingRules.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-[#C9A84C]/20 rounded-xl bg-[#0D1117]/30">
                  <p className="text-xs text-[#FAF6EE]/45 italic">No booking rules declared.</p>
                </div>
              ) : (
                settings.bookingRules.map((rule, idx) => (
                  <div key={idx} className="flex gap-3 items-center bg-[#0D1117] p-3 rounded-xl border border-[#C9A84C]/10 text-xs text-[#FAF1E6]/85 hover:border-[#C9A84C]/30 transition-all leading-tight">
                    <span className="text-[#C9A84C] font-bold font-mono">{idx + 1}.</span>
                    <span className="flex-1 text-left">{rule}</span>
                    <button
                      type="button"
                      onClick={() => handleDeleteRule(idx)}
                      className="text-[#E63946]/50 hover:text-[#E63946] p-0.5 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </form>

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

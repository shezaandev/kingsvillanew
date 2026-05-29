import React, { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { 
  Save, 
  Plus, 
  Trash2, 
  DollarSign, 
  Calendar, 
  Tag, 
  Users, 
  FileText, 
  Check, 
  AlertCircle 
} from "lucide-react";
import { PricingRates, AddOnItem, SeasonalRateRange } from "../../types";

export default function AdminPricing() {
  const [rates, setRates] = useState<PricingRates | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingSection, setSavingSection] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const snap = await getDoc(doc(db, "pricing", "rates"));
        if (snap.exists()) {
          const fetched = snap.data() as PricingRates;
          setRates({
            weekdayRate: fetched.weekdayRate ?? 12000,
            weekendRate: fetched.weekendRate ?? 16000,
            currency: fetched.currency ?? "INR",
            maxGuests: fetched.maxGuests ?? 16,
            addOns: fetched.addOns ?? [],
            seasonalRates: fetched.seasonalRates ?? [],
            notes: fetched.notes ?? ""
          });
        } else {
          // Defaults if not seeded
          setRates({
            weekdayRate: 12000,
            weekendRate: 16000,
            currency: "INR",
            maxGuests: 16,
            addOns: [
              { id: "addon-0", name: "Rain Dance", price: 1500 },
              { id: "addon-1", name: "Catered Meals", price: 500 },
              { id: "addon-2", name: "Cake & Decoration", price: 2000 },
              { id: "addon-3", name: "DJ Setup", price: 5000 },
              { id: "addon-4", name: "Birthday/Anniversary Surprise", price: 3000 },
              { id: "addon-5", name: "Hookah", price: 1200 }
            ],
            seasonalRates: [],
            notes: "Prices are per night. Call for group/event pricing."
          });
        }
      } catch (e) {
        console.error("Rates fetch failed:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchRates();
  }, []);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  const handleSave = async (section: string, updatedData: PricingRates) => {
    setSavingSection(section);
    try {
      await setDoc(doc(db, "pricing", "rates"), updatedData);
      showToast(`Successfully saved ${section}!`, "success");
    } catch (err: any) {
      console.error(err);
      showToast(`Error saving rates: ${err.message || String(err)}`, "error");
    } finally {
      setSavingSection(null);
    }
  };

  const updateBaseRates = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rates) return;
    handleSave("Base Rates", rates);
  };

  // Add-Ons handlers
  const handleAddOnFieldChange = (index: number, fld: keyof AddOnItem, val: string | number) => {
    if (!rates) return;
    const updatedAddOns = [...rates.addOns];
    updatedAddOns[index] = { ...updatedAddOns[index], [fld]: val };
    setRates({ ...rates, addOns: updatedAddOns });
  };

  const handleAddAddOn = () => {
    if (!rates) return;
    const newAddOn: AddOnItem = {
      id: `addon-${Date.now()}`,
      name: "",
      price: 0
    };
    setRates({ ...rates, addOns: [...rates.addOns, newAddOn] });
  };

  const handleDeleteAddOn = (index: number) => {
    if (!rates) return;
    const updatedAddOns = rates.addOns.filter((_, i) => i !== index);
    setRates({ ...rates, addOns: updatedAddOns });
  };

  const saveAddOns = () => {
    if (!rates) return;
    // Basic validation
    const invalid = rates.addOns.some(item => !item.name.trim());
    if (invalid) {
      showToast("All add-ons must have a valid service name.", "error");
      return;
    }
    handleSave("Add-On Services", rates);
  };

  // Seasonal rates handlers
  const handleSeasonalFieldChange = (index: number, fld: keyof SeasonalRateRange, val: string | number) => {
    if (!rates) return;
    const updatedSeasonal = [...rates.seasonalRates];
    updatedSeasonal[index] = { ...updatedSeasonal[index], [fld]: val };
    setRates({ ...rates, seasonalRates: updatedSeasonal });
  };

  const handleAddSeasonal = () => {
    if (!rates) return;
    const today = new Date().toISOString().split("T")[0];
    const newRange: SeasonalRateRange = {
      label: "",
      startDate: today,
      endDate: today,
      price: 15000
    };
    setRates({ ...rates, seasonalRates: [...rates.seasonalRates, newRange] });
  };

  const handleDeleteSeasonal = (index: number) => {
    if (!rates) return;
    const updatedSeasonal = rates.seasonalRates.filter((_, i) => i !== index);
    setRates({ ...rates, seasonalRates: updatedSeasonal });
  };

  const saveSeasonal = () => {
    if (!rates) return;
    const invalid = rates.seasonalRates.some(r => !r.label.trim() || !r.startDate || !r.endDate);
    if (invalid) {
      showToast("Please fill out all seasonal Labels, Start Dates, and End Dates.", "error");
      return;
    }
    handleSave("Seasonal Rates", rates);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-[#FAF6EE]">
        <div className="w-10 h-10 border-2 border-[#C9A84C] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="font-serif italic text-sm text-[#FAF6EE]/50">Reading Pricing Rates from Live Database...</p>
      </div>
    );
  }

  if (!rates) return null;

  return (
    <div className="space-y-10 animate-fade-in max-w-5xl mx-auto px-2 pb-16 text-[#FAF6EE]">
      
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-serif font-bold text-white tracking-tight" style={{ fontFamily: "Georgia, serif" }}>
          Rates & Pricing Engine
        </h1>
        <p className="text-sm text-[#FAF6EE]/50 mt-1">
          Adjust weekday / weekend pricing and customize guest add-on accessories.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Base Rates */}
        <div className="lg:col-span-5 space-y-8">
          <div className="bg-[#141B26] border border-[#C9A84C]/20 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="flex items-center gap-2 mb-6">
              <DollarSign className="w-5 h-5 text-[#C9A84C]" />
              <h2 className="text-lg font-serif font-bold text-[#F0D080]" style={{ fontFamily: "Georgia, serif" }}>
                1. Base Reservation Rates
              </h2>
            </div>

            <form onSubmit={updateBaseRates} className="space-y-5">
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-[#FAF6EE]/60 font-bold mb-2">
                    Weekday (Sun-Thu)
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#C9A84C] font-semibold text-sm">₹</span>
                    <input
                      type="number"
                      required
                      min="1"
                      className="w-full bg-[#0D1117] border border-[#C9A84C]/30 focus:border-[#C9A84C] rounded-xl pl-8 pr-4 py-3 text-[#FAF6EE] text-sm outline-none focus:ring-1 focus:ring-[#C9A84C] transition-all"
                      value={rates.weekdayRate}
                      onChange={(e) => setRates({ ...rates, weekdayRate: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-[#FAF6EE]/60 font-bold mb-2">
                    Weekend (Fri-Sat)
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#C9A84C] font-semibold text-sm">₹</span>
                    <input
                      type="number"
                      required
                      min="1"
                      className="w-full bg-[#0D1117] border border-[#C9A84C]/30 focus:border-[#C9A84C] rounded-xl pl-8 pr-4 py-3 text-[#FAF6EE] text-sm outline-none focus:ring-1 focus:ring-[#C9A84C] transition-all"
                      value={rates.weekendRate}
                      onChange={(e) => setRates({ ...rates, weekendRate: Number(e.target.value) })}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-[#FAF6EE]/60 font-bold mb-2">
                  Max Guest Limit
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#FAF6EE]/30"><Users className="w-4 h-4" /></div>
                  <input
                    type="number"
                    required
                    min="1"
                    max="100"
                    className="w-full bg-[#0D1117] border border-[#C9A84C]/30 focus:border-[#C9A84C] rounded-xl pl-10 pr-4 py-3 text-[#FAF6EE] text-sm outline-none focus:ring-1 focus:ring-[#C9A84C] transition-all"
                    value={rates.maxGuests}
                    onChange={(e) => setRates({ ...rates, maxGuests: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-[#FAF6EE]/60 font-bold mb-2">
                  Pricing Policy Text
                </label>
                <div className="relative">
                  <div className="absolute top-3 left-3 text-[#FAF6EE]/30"><FileText className="w-4 h-4" /></div>
                  <textarea
                    rows={3}
                    className="w-full bg-[#0D1117] border border-[#C9A84C]/30 focus:border-[#C9A84C] rounded-xl pl-10 pr-4 py-3 text-[#FAF6EE] text-sm outline-none focus:ring-1 focus:ring-[#C9A84C] transition-all placeholder:text-[#FAF6EE]/30"
                    placeholder="Enter additional conditions..."
                    value={rates.notes}
                    onChange={(e) => setRates({ ...rates, notes: e.target.value })}
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={savingSection === "Base Rates"}
                  className="w-full bg-gradient-to-r from-[#C9A84C] to-[#F0D080] text-[#0D1117] py-3.5 rounded-xl font-bold uppercase tracking-[0.1em] text-xs shadow-lg hover:shadow-[#C9A84C]/15 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
                >
                  <Save className="w-4 h-4" />
                  {savingSection === "Base Rates" ? "Saving..." : "Save Base Rates"}
                </button>
              </div>

            </form>
          </div>
        </div>

        {/* Right Side: Add-On Services & Seasonal Rates */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Section 2: Add-Ons */}
          <div className="bg-[#141B26] border border-[#C9A84C]/20 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-[#C9A84C]" />
                <h2 className="text-lg font-serif font-bold text-[#F0D080]" style={{ fontFamily: "Georgia, serif" }}>
                  2. Add-On Luxury Accessories
                </h2>
              </div>
              <button
                type="button"
                onClick={handleAddAddOn}
                className="text-xs text-[#C9A84C] hover:text-white flex items-center gap-1.5 border border-[#C9A84C]/30 px-3 py-1.5 rounded-lg hover:bg-[#C9A84C]/10 font-bold transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Service
              </button>
            </div>

            <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
              {rates.addOns.length === 0 ? (
                <div className="text-center py-6 border border-dashed border-[#C9A84C]/25 rounded-xl">
                  <p className="text-xs text-[#FAF6EE]/40 italic">No custom add-on events configured yet.</p>
                </div>
              ) : (
                rates.addOns.map((addOn, index) => (
                  <div key={addOn.id} className="flex gap-4 items-center bg-[#0D1117] p-3.5 rounded-xl border border-[#C9A84C]/10">
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder="Service name (e.g. Rain Dance)"
                        required
                        className="w-full bg-transparent border-b border-[#C9A84C]/20 focus:border-[#C9A84C] text-[#FAF6EE] text-sm outline-none pb-1 transition-all"
                        value={addOn.name}
                        onChange={(e) => handleAddOnFieldChange(index, "name", e.target.value)}
                      />
                    </div>
                    <div className="w-32 relative">
                      <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-[#C9A84C] text-xs">₹</span>
                      <input
                        type="number"
                        min="0"
                        required
                        className="w-full bg-transparent border-b border-[#C9A84C]/20 focus:border-[#C9A84C] text-[#FAF6EE] text-sm outline-none pl-6 pb-1 transition-all"
                        value={addOn.price}
                        onChange={(e) => handleAddOnFieldChange(index, "price", Number(e.target.value))}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteAddOn(index)}
                      className="text-[#E63946]/50 hover:text-[#E63946] p-1 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {rates.addOns.length > 0 && (
              <div className="pt-6 border-t border-[#C9A84C]/10 mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={saveAddOns}
                  disabled={savingSection === "Add-On Services"}
                  className="bg-transparent hover:bg-[#C9A84C]/10 border border-[#C9A84C]/35 text-[#C9A84C] hover:text-white px-5 py-2.5 rounded-xl font-bold uppercase tracking-wider text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
                >
                  <Save className="w-3.5 h-3.5" />
                  {savingSection === "Add-On Services" ? "Saving..." : "Save Add-Ons"}
                </button>
              </div>
            )}
          </div>

          {/* Section 3: Seasonal Rates Override */}
          <div className="bg-[#141B26] border border-[#C9A84C]/20 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#C9A84C]" />
                <h2 className="text-lg font-serif font-bold text-[#F0D080]" style={{ fontFamily: "Georgia, serif" }}>
                  3. Seasonal Overrides
                </h2>
              </div>
              <button
                type="button"
                onClick={handleAddSeasonal}
                className="text-xs text-[#C9A84C] hover:text-white flex items-center gap-1.5 border border-[#C9A84C]/30 px-3 py-1.5 rounded-lg hover:bg-[#C9A84C]/10 font-bold transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Date Range
              </button>
            </div>

            <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
              {rates.seasonalRates.length === 0 ? (
                <div className="text-center py-6 border border-dashed border-[#C9A84C]/25 rounded-xl">
                  <p className="text-xs text-[#FAF6EE]/40 italic">No seasonal overrides defined yet. (e.g. Diwali peaks)</p>
                </div>
              ) : (
                rates.seasonalRates.map((season, index) => (
                  <div key={index} className="space-y-3 bg-[#0D1117] p-4 rounded-xl border border-[#C9A84C]/10 relative group">
                    
                    <button
                      type="button"
                      onClick={() => handleDeleteSeasonal(index)}
                      className="absolute top-4 right-4 text-[#E63946]/55 hover:text-[#E63946] transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="w-[85%]">
                      <input
                        type="text"
                        placeholder="Label (e.g. Diwali Long Weekend)"
                        required
                        className="w-full bg-transparent border-b border-[#C9A84C]/20 focus:border-[#C9A84C] text-[#FAF6EE] text-sm outline-none pb-1 font-bold transition-all"
                        value={season.label}
                        onChange={(e) => handleSeasonalFieldChange(index, "label", e.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                      <div>
                        <label className="block text-[9px] uppercase text-[#FAF6EE]/40 font-medium mb-1">Start Date</label>
                        <input
                          type="date"
                          required
                          className="w-full bg-[#141B26] border border-[#C9A84C]/20 rounded-lg p-2 text-xs text-white outline-none focus:ring-1 focus:ring-[#C9A84C]"
                          value={season.startDate}
                          onChange={(e) => handleSeasonalFieldChange(index, "startDate", e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] uppercase text-[#FAF6EE]/40 font-medium mb-1">End Date</label>
                        <input
                          type="date"
                          required
                          className="w-full bg-[#141B26] border border-[#C9A84C]/20 rounded-lg p-2 text-xs text-white outline-none focus:ring-1 focus:ring-[#C9A84C]"
                          value={season.endDate}
                          onChange={(e) => handleSeasonalFieldChange(index, "endDate", e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] uppercase text-[#FAF6EE]/40 font-medium mb-1">Price per Night</label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-[#C9A84C] text-xs">₹</span>
                          <input
                            type="number"
                            min="0"
                            required
                            className="w-full bg-[#141B26] border border-[#C9A84C]/20 rounded-lg p-2 pl-6 text-xs text-white outline-none focus:ring-1 focus:ring-[#C9A84C]"
                            value={season.price}
                            onChange={(e) => handleSeasonalFieldChange(index, "price", Number(e.target.value))}
                          />
                        </div>
                      </div>
                    </div>

                  </div>
                ))
              )}
            </div>

            {rates.seasonalRates.length > 0 && (
              <div className="pt-6 border-t border-[#C9A84C]/10 mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={saveSeasonal}
                  disabled={savingSection === "Seasonal Rates"}
                  className="bg-transparent hover:bg-[#C9A84C]/10 border border-[#C9A84C]/35 text-[#C9A84C] hover:text-white px-5 py-2.5 rounded-xl font-bold uppercase tracking-wider text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
                >
                  <Save className="w-3.5 h-3.5" />
                  {savingSection === "Seasonal Rates" ? "Saving..." : "Save Overrides"}
                </button>
              </div>
            )}
          </div>

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

import React, { useState } from "react";
import { WHATSAPP_NUMBER, OWNER_NAME, BRAND_NAME } from "../data";
import { Send, CheckCircle2 } from "lucide-react";

export default function EnquiryForm() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    checkIn: "",
    checkOut: "",
    guests: "2",
    occasion: "Family Getaway",
    requests: "",
  });

  const [committed, setCommitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Psychological engineering: serialize precise request message
    const message = `Hi ${BRAND_NAME},

I want to enquire about booking the villa in Lonavala. Here are our travel details:

🌿 *Reservation Details*
◆ *Guest Name:* ${formData.name}
◆ *Phone Number:* ${formData.phone}
◆ *Check-In Date:* ${formData.checkIn || "Not Selected"}
◆ *Check-Out Date:* ${formData.checkOut || "Not Selected"}
◆ *Total Guests:* ${formData.guests} Guests
◆ *Occasion:* ${formData.occasion}
${formData.requests ? `◆ *Special Requests:* ${formData.requests}` : ""}

Please let me know room availability and final pricing. Thanks!`;

    const encodedText = encodeURIComponent(message);
    const waURL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedText}`;

    // Launch in new browser window/tab
    window.open(waURL, "_blank", "noopener,noreferrer");
    setCommitted(true);
  };

  return (
    <section id="contact" className="py-24 bg-[#0D1117] border-b border-[#C9A84C]/10 scroll-mt-16">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="text-xs uppercase tracking-[0.2em] text-[#C9A84C] font-semibold block mb-3">
            ◆ BOOK NOW ◆
          </span>
          <h2 className="text-3xl md:text-5xl font-display font-medium text-[#FAF6EE] mb-4">
            Reserve Your Royal Escape
          </h2>
          <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent mx-auto my-4" />
          <p className="subheading-cormorant text-xl text-[#F0D080]/80 italic max-w-2xl mx-auto">
            Ready to live like royalty? Contact us directly or fill in the enquiry form for an instant quote.
          </p>
        </div>

        {/* Form Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mt-10">
          
          {/* Left Column — Quick Details */}
          <div className="lg:col-span-5 space-y-8 bg-[#141B26] p-8 rounded-3xl border border-[#C9A84C]/20 hover:border-[#C9A84C]/45 transition-colors duration-300">
            <div>
              <span className="text-[#C9A84C] text-xs font-semibold uppercase tracking-wider block mb-2">OWNERSHIP & CONTACT</span>
              <h3 className="text-xl font-display font-semibold text-[#FAF6EE] mb-4">Kings Diamonds Villas</h3>
              <p className="text-sm text-[#FAF6EE]/70 font-light leading-relaxed mb-6">
                Owned and personally managed by <span className="text-[#F0D080] font-medium">{OWNER_NAME}</span>. Every booking is backed by direct-to-owner coordination for pristine accountability.
              </p>
            </div>

            {/* Structured Quick Info */}
            <div className="space-y-4 text-sm font-sans">
              <div className="flex items-center gap-3">
                <span className="text-lg">📲</span>
                <div>
                  <p className="text-xs font-semibold text-[#FAF6EE]/50">WHATSAPP / CALL</p>
                  <p className="text-[#F0D080] font-medium">+91 72081 62620</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-lg">📸</span>
                <div>
                  <p className="text-xs font-semibold text-[#FAF6EE]/50">INSTAGRAM</p>
                  <a href="https://www.instagram.com/kings_diamonds_villas/" target="_blank" rel="noopener noreferrer" className="text-[#F0D080] font-medium hover:underline">@kings_diamonds_villas</a>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-lg">📍</span>
                <div>
                  <p className="text-xs font-semibold text-[#FAF6EE]/50">VILLA ADDRESS</p>
                  <p className="text-[#F0D080] font-medium">Malavali, Boraj Road, Lonavala, Maharashtra 410405</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-lg">🕐</span>
                <div>
                  <p className="text-xs font-semibold text-[#FAF6EE]/50">CHECK-IN / CHECK-OUT</p>
                  <p className="text-[#FAF6EE]/80">Check-In: 1:00 PM &bull; Check-Out: 11:00 AM</p>
                </div>
              </div>
            </div>

            {/* Bullet Highlights */}
            <div className="pt-6 border-t border-[#C9A84C]/10 space-y-3 text-xs">
              <div className="flex items-center gap-2 text-[#FAF6EE]/90">
                <span className="text-[#C9A84C]">◆</span> Weekend bookings advance payment suggested.
              </div>
              <div className="flex items-center gap-2 text-[#FAF6EE]/90">
                <span className="text-[#C9A84C]">◆</span> Gov-approved photo ID required for all adult guests.
              </div>
              <div className="flex items-center gap-2 text-[#FAF6EE]/90">
                <span className="text-[#C9A84C]">◆</span> Furry friends are absolute royalty here! (Prior notice)
              </div>
            </div>

            {/* 3 Step Mini-Guide */}
            <div className="bg-[#0D1117] border border-[#C9A84C]/15 rounded-2xl p-6 mt-6">
              <h5 className="font-sans font-semibold text-[#FAF6EE] text-sm mb-4">3-Step Easy Booking Journey</h5>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <span className="text-xs bg-gradient-to-r from-[#C9A84C] to-[#F0D080] text-[#0D1117] w-5 h-5 rounded-full flex items-center justify-center font-bold flex-shrink-0">1</span>
                  <p className="text-xs text-[#FAF6EE]/80">WhatsApp us your preferred check-in dates and guest count.</p>
                </div>
                <div className="flex gap-3">
                  <span className="text-xs bg-gradient-to-r from-[#C9A84C] to-[#F0D080] text-[#0D1117] w-5 h-5 rounded-full flex items-center justify-center font-bold flex-shrink-0">2</span>
                  <p className="text-xs text-[#FAF6EE]/80">Confirm calendar availability and wire 50% advance to block.</p>
                </div>
                <div className="flex gap-3">
                  <span className="text-xs bg-gradient-to-r from-[#C9A84C] to-[#F0D080] text-[#0D1117] w-5 h-5 rounded-full flex items-center justify-center font-bold flex-shrink-0">3</span>
                  <p className="text-xs text-[#FAF6EE]/80">Arrive in scenic Lonavala and immerse in your royal escape!</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column — enquiry HTML form */}
          <div className="lg:col-span-7">
            <div className="bg-[#141B26] p-8 md:p-10 rounded-3xl border border-[#C9A84C]/20 relative hover:border-[#C9A84C]/35 transition-colors duration-300">
              
              {committed && (
                <div className="mb-6 p-4 rounded-xl border border-[#52B788]/30 bg-[#2D6A4F]/10 flex items-center gap-3 animate-[slideIn_0.3s_ease]">
                  <CheckCircle2 size={20} className="text-[#52B788]" />
                  <p className="text-xs md:text-sm text-[#FAF6EE]">
                    Booking details gathered! We have launched WhatsApp to finalize your booking directly with {OWNER_NAME}.
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Name & Phone */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold tracking-wider text-[#C9A84C] uppercase mb-2">FULL NAME *</label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. Shezaan Khan"
                      className="w-full bg-[#0D1117] border border-[#C9A84C]/30 focus:border-[#C9A84C] rounded-xl px-4 py-3 text-[#FAF6EE] text-sm outline-none focus:ring-1 focus:ring-[#C9A84C] transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold tracking-wider text-[#C9A84C] uppercase mb-2">PHONE NUMBER *</label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="e.g. +91 98765 43210"
                      className="w-full bg-[#0D1117] border border-[#C9A84C]/30 focus:border-[#C9A84C] rounded-xl px-4 py-3 text-[#FAF6EE] text-sm outline-none focus:ring-1 focus:ring-[#C9A84C] transition-all"
                    />
                  </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold tracking-wider text-[#C9A84C] uppercase mb-2">CHECK-IN DATE</label>
                    <input
                      type="date"
                      name="checkIn"
                      value={formData.checkIn}
                      onChange={handleChange}
                      className="w-full bg-[#0D1117] border border-[#C9A84C]/30 focus:border-[#C9A84C] rounded-xl px-4 py-3 text-[#FAF6EE] text-sm outline-none focus:ring-1 focus:ring-[#C9A84C] transition-all scheme-dark"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold tracking-wider text-[#C9A84C] uppercase mb-2">CHECK-OUT DATE</label>
                    <input
                      type="date"
                      name="checkOut"
                      value={formData.checkOut}
                      onChange={handleChange}
                      className="w-full bg-[#0D1117] border border-[#C9A84C]/30 focus:border-[#C9A84C] rounded-xl px-4 py-3 text-[#FAF6EE] text-sm outline-none focus:ring-1 focus:ring-[#C9A84C] transition-all scheme-dark"
                    />
                  </div>
                </div>

                {/* Guests & Occasions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold tracking-wider text-[#C9A84C] uppercase mb-2">TOTAL GUESTS</label>
                    <select
                      name="guests"
                      value={formData.guests}
                      onChange={handleChange}
                      className="w-full bg-[#0D1117] border border-[#C9A84C]/30 focus:border-[#C9A84C] rounded-xl px-4 py-3 text-[#FAF6EE] text-sm outline-none focus:ring-1 focus:ring-[#C9A84C] transition-all"
                    >
                      {Array.from({ length: 16 }, (_, i) => i + 1).map((val) => (
                        <option key={val} value={val} className="bg-[#141B26]">
                          {val} {val === 1 ? "Guest" : `Guests (Max 16)`}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold tracking-wider text-[#C9A84C] uppercase mb-2">OCCASION TYPE</label>
                    <select
                      name="occasion"
                      value={formData.occasion}
                      onChange={handleChange}
                      className="w-full bg-[#0D1117] border border-[#C9A84C]/30 focus:border-[#C9A84C] rounded-xl px-4 py-3 text-[#FAF6EE] text-sm outline-none focus:ring-1 focus:ring-[#C9A84C] transition-all"
                    >
                      <option value="Family Getaway" className="bg-[#141B26]">👨‍👩‍👧 Family Getaway</option>
                      <option value="Friends' Trip" className="bg-[#141B26]">🥂 Friends' Trip</option>
                      <option value="Birthday Celebration" className="bg-[#141B26]">🎂 Birthday / Anniversary</option>
                      <option value="Corporate Event" className="bg-[#141B26]">💼 Corporate Offsite</option>
                      <option value="Romantic Retreat" className="bg-[#141B26]">💑 Romantic Escape</option>
                      <option value="Other Celebrations" className="bg-[#141B26]">🎉 Other Private Events</option>
                    </select>
                  </div>
                </div>

                {/* Special Requests */}
                <div>
                  <label className="block text-xs font-semibold tracking-wider text-[#C9A84C] uppercase mb-2">SPECIAL REQUESTS / QUESTIONS</label>
                  <textarea
                    name="requests"
                    rows={4}
                    value={formData.requests}
                    onChange={handleChange}
                    placeholder="e.g. Do you provide BBQ coal and setup? Want to arrange a birthday theme cake as surprise..."
                    className="w-full bg-[#0D1117] border border-[#C9A84C]/30 focus:border-[#C9A84C] rounded-xl px-4 py-3 text-[#FAF6EE] text-sm outline-none focus:ring-1 focus:ring-[#C9A84C] transition-all resize-none"
                  />
                </div>

                {/* Submitting Button */}
                <button
                  type="submit"
                  className="w-full py-4 rounded-xl font-semibold text-[#0D1117] bg-gradient-to-r from-[#C9A84C] to-[#F0D080] hover:from-[#FAF6EE] hover:to-[#FAF6EE] active:scale-[0.99] text-sm tracking-wide shadow-xl cursor-pointer hover:shadow-2xl hover:shadow-[#C9A84C]/20 transition-all duration-300 inline-flex items-center justify-center gap-2"
                >
                  <Send size={16} />
                  Send Enquiry via WhatsApp &rarr;
                </button>

                <p className="text-center text-[11px] text-[#FAF6EE]/50 font-light mt-4">
                  ⏳ We typically review configurations and respond within 30 minutes on WhatsApp!
                </p>

              </form>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}

import { useState } from "react";
import { BEDROOMS_LIST, INTERESTING_SPACES } from "../data";
import LazyImage from "./LazyImage";
import { useSiteImages } from "../hooks/useSiteData";

export default function RoomsShowcase() {
  const [activeTabIdx, setActiveTabIdx] = useState(0);
  const { getUrl } = useSiteImages();

  const activeBedroom = BEDROOMS_LIST[activeTabIdx];
  const activeBedroomImage = getUrl(`bedroom${activeTabIdx + 1}`, activeBedroom.image);

  const spaceKeys = ["living", "kitchen", "dining"];

  return (
    <section id="rooms" className="py-24 bg-[#141B26] border-b border-[#C9A84C]/10 scroll-mt-16">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="text-xs uppercase tracking-[0.2em] text-[#C9A84C] font-semibold block mb-3">
            ◆ THE BEDROOMS ◆
          </span>
          <h2 className="text-3xl md:text-5xl font-display font-medium text-[#FAF6EE] mb-4">
            Sleep Like a King
          </h2>
          <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent mx-auto my-4" />
          <p className="subheading-cormorant text-xl text-[#F0D080]/80 italic max-w-2xl mx-auto">
            Each suite is designed with premium air conditioning, royal linens, and large windows looking out to the Sahyadris.
          </p>
        </div>

        {/* Room Tab Selectors */}
        <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-12">
          {BEDROOMS_LIST.map((bd, i) => (
            <button
              key={bd.id}
              onClick={() => setActiveTabIdx(i)}
              className={`px-5 py-3 rounded-full text-xs md:text-sm font-semibold tracking-wider uppercase transition-all duration-300 border cursor-pointer ${
                activeTabIdx === i
                  ? "bg-gradient-to-r from-[#C9A84C] to-[#F0D080] text-[#0D1117] border-[#FAF6EE]"
                  : "bg-[#0D1117]/40 text-[#FAF6EE]/70 border-[#C9A84C]/30 hover:border-[#C9A84C]/60 hover:text-[#FAF6EE]"
              }`}
            >
              {bd.id === "master" ? "👑 Master Suite" : `Room ${i + 1}`}
            </button>
          ))}
        </div>

        {/* Tab Content Display */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center bg-[#0D1117]/80 rounded-3xl border border-[#C9A84C]/20 p-6 md:p-10 hover:shadow-[0_12px_40px_rgba(201,168,76,0.1)] transition-shadow duration-500">
          
          {/* Active room image */}
          <div className="lg:col-span-7 h-[300px] md:h-[450px] rounded-2xl overflow-hidden border border-[#C9A84C]/15 shadow-inner">
            <LazyImage
              src={activeBedroomImage}
              alt={activeBedroom.name}
              fallbackType={`bedroom${activeTabIdx + 1}` as any}
              className="w-full h-full"
            />
          </div>

          {/* Active room features */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            <span className="text-[#C9A84C] text-xs font-semibold tracking-widest uppercase mb-1">
              EXCLUSIVE SUITE ACCOMMODATION
            </span>
            <h3 className="text-2xl md:text-3.5xl font-display font-medium text-[#F0D080] leading-snug mb-6">
              {activeBedroom.name}
            </h3>

            {/* Feature lists using ◆ bullet points */}
            <div className="space-y-4">
              {activeBedroom.features.map((feature, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <span className="text-[#C9A84C] text-[15px] mt-1 select-none">◆</span>
                  <p className="text-sm md:text-base text-[#FAF6EE]/90 font-light">
                    {feature}
                  </p>
                </div>
              ))}
            </div>

            {/* Quick trust message */}
            <div className="mt-8 pt-6 border-t border-[#C9A84C]/10 flex items-center gap-3">
              <span className="text-xl">🌟</span>
              <p className="subheading-cormorant italic text-sm text-[#FAF6EE]/70">
                Pristine sanitization and heavy-duty blackout curtains are configured for perfect sleep.
              </p>
            </div>
          </div>

        </div>

        {/* Secondary spaces (Living, Kitchen, Dining) */}
        <div className="mt-20">
          <h4 className="text-sm md:text-base tracking-[0.16em] text-[#C9A84C] uppercase text-center font-semibold mb-10">
            COMMON ROYAL LIVING SPACES
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {INTERESTING_SPACES.map((space, idx) => (
              <div
                key={idx}
                className="bg-[#0D1117] rounded-3xl border border-[#C9A84C]/20 p-4 hover:border-[#C9A84C]/40 hover:shadow-[0_8px_32px_rgba(201,168,76,0.1)] transition-all duration-300 group"
              >
                <div className="h-56 rounded-2xl overflow-hidden mb-5">
                  <LazyImage
                    src={getUrl(spaceKeys[idx], space.image)}
                    alt={space.name}
                    fallbackType={idx === 0 ? "living" : idx === 1 ? "kitchen" : "dining"}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <h5 className="font-display font-medium text-[#FAF6EE] text-lg mb-1">
                  {space.name}
                </h5>
                <p className="text-xs text-[#FAF6EE]/70">
                  {space.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}

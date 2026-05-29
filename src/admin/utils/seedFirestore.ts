import { setDoc, doc, addDoc, collection } from "firebase/firestore";
import { db } from "../../firebase";
import { 
  GUEST_REVIEWS, 
  BRAND_NAME, 
  OWNER_NAME, 
  WHATSAPP_NUMBER, 
  INSTAGRAM_HANDLE, 
  INSTAGRAM_URL 
} from "../../data";

export async function seedFirestore() {
  // Seed settings
  await setDoc(doc(db, "settings", "main"), {
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
      "Weekend bookings advance payment suggested.",
      "Gov-approved photo ID required for all adult guests.",
      "Furry friends are absolute royalty here! (Prior notice)"
    ]
  });

  // Seed pricing
  await setDoc(doc(db, "pricing", "rates"), {
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

  // Seed reviews
  for (const [i, review] of GUEST_REVIEWS.entries()) {
    await addDoc(collection(db, "reviews"), {
      stars: review.stars,
      text: review.text,
      author: review.author,
      location: review.location,
      avatar: review.avatar,
      visible: true,
      pinned: i < 2, // Pin first two by default
      order: i,
      createdAt: new Date().toISOString()
    });
  }

  // Seed sample gallery images
  const sampleImages = Array.from({ length: 10 }).map((_, i) => ({
    src: `/images/gallery${i + 1}.jpg`,
    alt: `Kings Diamonds Villa View ${i + 1}`,
    category: i === 0 ? "pool" : i === 1 ? "bedroom" : "other",
    order: i,
    isOgImage: i === 0
  }));

  for (const img of sampleImages) {
    await addDoc(collection(db, "gallery"), img);
  }
}

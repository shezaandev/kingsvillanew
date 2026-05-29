import { useEffect, useState } from "react";
import { doc, getDoc, getDocs, collection, query, orderBy, where, deleteDoc, addDoc } from "firebase/firestore";
import { db } from "../firebase";
import { 
  BRAND_NAME, 
  OWNER_NAME, 
  WHATSAPP_NUMBER, 
  INSTAGRAM_HANDLE, 
  INSTAGRAM_URL,
  GUEST_REVIEWS 
} from "../data";
import { SiteSettings, PricingRates, Review, GalleryImage } from "../types";

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    getDoc(doc(db, "settings", "main"))
      .then((snap) => {
        if (snap.exists()) {
          setSettings(snap.data() as SiteSettings);
        } else {
          // Use default fallback structure
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
              "Weekend bookings advance payment suggested.",
              "Gov-approved photo ID required for all adult guests.",
              "Furry friends are absolute royalty here! (Prior notice)"
            ]
          });
        }
      })
      .catch((err) => {
        console.error("Firestore settings read failed, using fallback:", err);
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
            "Weekend bookings advance payment suggested.",
            "Gov-approved photo ID required for all adult guests.",
            "Furry friends are absolute royalty here! (Prior notice)"
          ]
        });
      });
  }, []);

  return settings;
}

export function usePricing() {
  const [pricing, setPricing] = useState<PricingRates | null>(null);

  useEffect(() => {
    getDoc(doc(db, "pricing", "rates"))
      .then((snap) => {
        if (snap.exists()) {
          setPricing(snap.data() as PricingRates);
        } else {
          setPricing({
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
      })
      .catch((err) => {
        console.error("Firestore pricing read failed, using fallback:", err);
        setPricing({
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
      });
  }, []);

  return pricing;
}

export function useGallery() {
  const [images, setImages] = useState<GalleryImage[]>([]);

  useEffect(() => {
    getDocs(query(collection(db, "gallery"), orderBy("order", "asc")))
      .then((snap) => {
        if (!snap.empty) {
          setImages(snap.docs.map((d) => ({ id: d.id, ...d.data() } as GalleryImage)));
        } else {
          // Fallback static files
          const staticGallery: GalleryImage[] = Array.from({ length: 10 }).map((_, i) => ({
            id: `img-${i}`,
            src: `/images/gallery${i + 1}.jpg`,
            alt: `Scenic View ${i + 1}`,
            category: "other",
            order: i,
            isOgImage: i === 0
          }));
          setImages(staticGallery);
        }
      })
      .catch((err) => {
        console.error("Firestore gallery read failed, using static fallback:", err);
        const staticGallery: GalleryImage[] = Array.from({ length: 10 }).map((_, i) => ({
          id: `img-${i}`,
          src: `/images/gallery${i + 1}.jpg`,
          alt: `Scenic View ${i + 1}`,
          category: "other",
          order: i,
          isOgImage: i === 0
        }));
        setImages(staticGallery);
      });
  }, []);

  return images;
}

export function useReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    const run = async () => {
      try {
        const migrated = localStorage.getItem("kings_reviews_migrated_v3");
        if (!migrated) {
          const snapAll = await getDocs(collection(db, "reviews"));
          const oldAuthors = ["Rahul M.", "Priya S.", "Akash & Neha", "The Sharma Family", "Sneha K."];
          let foundOldOrEmpty = snapAll.empty;
          const toDelete: any[] = [];
          
          snapAll.docs.forEach((d) => {
            if (oldAuthors.includes(d.data().author)) {
              foundOldOrEmpty = true;
              toDelete.push(d.ref);
            }
          });

          if (foundOldOrEmpty) {
            for (const ref of toDelete) {
              await deleteDoc(ref);
            }
            for (const [i, review] of GUEST_REVIEWS.entries()) {
              await addDoc(collection(db, "reviews"), {
                stars: review.stars,
                text: review.text,
                author: review.author,
                location: review.location,
                avatar: review.avatar,
                visible: true,
                pinned: i < 2,
                order: i,
                createdAt: new Date().toISOString()
              });
            }
          }
          localStorage.setItem("kings_reviews_migrated_v3", "true");
        }
      } catch (err) {
        console.error("Reviews migration failed: ", err);
      }

      // Query database for active reviews
      getDocs(
        query(
          collection(db, "reviews"),
          where("visible", "==", true),
          orderBy("pinned", "desc"),
          orderBy("order", "asc")
        )
      )
        .then((snap) => {
          if (!snap.empty) {
            setReviews(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Review)));
          } else {
            setReviews(GUEST_REVIEWS.map((r, i) => ({ ...r, visible: true, pinned: false, order: i })));
          }
        })
        .catch((err) => {
          console.error("Firestore reviews read failed (or indexing active), using fallback:", err);
          getDocs(collection(db, "reviews"))
            .then((snapshot) => {
              if (!snapshot.empty) {
                const allReviews = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Review));
                const visible = allReviews.filter((r) => r.visible !== false);
                visible.sort((a, b) => {
                  const pinA = a.pinned ? 1 : 0;
                  const pinB = b.pinned ? 1 : 0;
                  if (pinA !== pinB) return pinB - pinA;
                  return (a.order || 0) - (b.order || 0);
                });
                setReviews(visible);
              } else {
                setReviews(GUEST_REVIEWS.map((r, i) => ({ ...r, visible: true, pinned: false, order: i })));
              }
            })
            .catch(() => {
              setReviews(GUEST_REVIEWS.map((r, i) => ({ ...r, visible: true, pinned: false, order: i })));
            });
        });
    };

    run();
  }, []);

  return reviews;
}

export function useSiteImages() {
  const [siteImages, setSiteImages] = useState<Record<string, string>>({});

  useEffect(() => {
    getDocs(collection(db, "siteImages"))
      .then((snap) => {
        const mapping: Record<string, string> = {};
        snap.forEach((doc) => {
          mapping[doc.id] = doc.data().url || "";
        });
        setSiteImages(mapping);
      })
      .catch((err) => {
        console.error("Failed to fetch siteImages hook:", err);
      });
  }, []);

  const getUrl = (key: string, fallback: string): string => {
    const url = siteImages[key];
    return (url && url.trim().length > 0) ? url.trim() : fallback;
  };

  return { siteImages, getUrl };
}


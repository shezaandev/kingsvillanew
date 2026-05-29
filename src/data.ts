import { Amenity, Bedroom, Experience, DistanceCallout, Attraction, Review } from "./types";

export const BRAND_NAME = "Kings Diamonds Villas";
export const OWNER_NAME = "Shadab Khan";
export const INSTAGRAM_HANDLE = "@kings_diamonds_villas";
export const INSTAGRAM_URL = "https://www.instagram.com/kings_diamonds_villas/";
export const WHATSAPP_NUMBER = "917208162620"; // Placeholder actual custom-ready phone number or template number

export const AMENITIES_LIST: Amenity[] = [
  {
    id: "pool",
    icon: "🏊",
    title: "Private Infinity Pool",
    description: "Your own sparkling pool with Sahyadri hill views — no sharing, ever."
  },
  {
    id: "bedrooms",
    icon: "🛏️",
    title: "4 Luxury AC Bedrooms",
    description: "Spacious, elegantly furnished rooms with king/double beds & fresh linen."
  },
  {
    id: "garden",
    icon: "🌿",
    title: "Lush Private Garden",
    description: "Sprawling green lawn — perfect for outdoor games, morning yoga or evening chai."
  },
  {
    id: "bonfire",
    icon: "🔥",
    title: "Bonfire & BBQ Area",
    description: "Star-lit bonfire nights and sizzling BBQ setups on request."
  },
  {
    id: "kitchen",
    icon: "🍳",
    title: "Fully Equipped Kitchen",
    description: "All appliances, gas stove, fridge, cookware — cook your own feast."
  },
  {
    id: "smart-tv",
    icon: "📺",
    title: "Smart TV + Netflix",
    description: "Flat-screen smart TV in living room for movie nights."
  },
  {
    id: "parking",
    icon: "🚗",
    title: "Free Private Parking",
    description: "Secure gated parking for multiple vehicles."
  },
  {
    id: "power-backup",
    icon: "⚡",
    title: "24/7 Power Backup",
    description: "Uninterrupted electricity — no monsoon blackout surprises."
  },
  {
    id: "views",
    icon: "🌄",
    title: "Panoramic Mountain Views",
    description: "Garden, pool, mountain, landmark & city views from rooms and terrace."
  },
  {
    id: "bathrooms",
    icon: "🛁",
    title: "Private Bathrooms",
    description: "Attached bathrooms with hot water in all rooms."
  },
  {
    id: "dining",
    icon: "🍽️",
    title: "Dining Table Setup",
    description: "Large dining area for group meals together."
  },
  {
    id: "terrace",
    icon: "🌙",
    title: "Terrace / Balcony",
    description: "Open terrace to watch the mist roll in over the hills."
  },
  {
    id: "caretaker",
    icon: "🧹",
    title: "Caretaker Service",
    description: "On-call caretaker available throughout your stay."
  },
  {
    id: "pricing",
    icon: "💵",
    title: "Flexible Pricing",
    description: "Weekday & weekend rates — call for group/event pricing."
  },
  {
    id: "wifi",
    icon: "📶",
    title: "High-Speed Wi-Fi",
    description: "Reliable broadband throughout the villa — stream, work or video call seamlessly."
  }
];

export const ADD_ONS = [
  "Rain Dance",
  "Catered Meals",
  "Cake & Decoration",
  "DJ Setup",
  "Birthday/Anniversary Surprise",
  "Hookah"
];

export const BEDROOMS_LIST: Bedroom[] = [
  {
    id: "master",
    name: "Royal Master Suite (Bedroom 1)",
    image: "/images/bedroom1.jpg",
    features: ["Split Air Conditioner", "King-size Premium Bed", "Attached Bathroom with Hot Water Geyser", "Glass Balcony with Mountain Views", "Fresh Premium Linens & Towels"]
  },
  {
    id: "bedroom2",
    name: "Sahyadri Bliss Suite (Bedroom 2)",
    image: "/images/bedroom2.jpg",
    features: ["Split Air Conditioner", "King-size Bed", "Attached Bathroom with Hot Water Geyser", "Direct Pool-Facing Glass Windows", "Elegant Seating Area"]
  },
  {
    id: "bedroom3",
    name: "Golden Crest Suite (Bedroom 3)",
    image: "/images/bedroom3.jpg",
    features: ["Split Air Conditioner", "Queen-size Bed", "Attached Bathroom with Hot Water Geyser", "Lawn & Garden Entry", "Desk & Mirror Setups"]
  },
  {
    id: "bedroom4",
    name: "Mist View Sanctuary (Bedroom 4)",
    image: "/images/bedroom4.jpg",
    features: ["Split Air Conditioner", "Double Queen Beds (Perfect for Groups)", "Attached Bathroom with Hot Water Geyser", "Terrace Entry Point", "Stunning Sunrise Balcony"]
  }
];

export const INTERESTING_SPACES = [
  { name: "Luxury Living Room", image: "/images/living.jpg", desc: "Spacious seating with full entertainment setups." },
  { name: "Fully Equipped Kitchen", image: "/images/kitchen.jpg", desc: "Equipped with gas stove, microwave, and custom utensils." },
  { name: "Royal Dining Hall", image: "/images/dining.jpg", desc: "Banquet-style dining arrangements for the entire gang." }
];

export const EXPERIENCE_CARDS: Experience[] = [
  {
    id: "birthdays",
    title: "🎂 Birthdays & Anniversaries",
    description: "Private pool, bonfire, surprise setups — make it a night they'll never forget",
    image: "/images/pool.jpg"
  },
  {
    id: "families",
    title: "👨‍👩‍👧 Family Getaways",
    description: "Space for grandparents to kids — every generation finds their corner",
    image: "/images/garden.jpg"
  },
  {
    id: "friends",
    title: "🥂 Friends' Trips",
    description: "Late-night bonfire, rain dance, pool games — your gang deserves this",
    image: "/images/bonfire.jpg"
  },
  {
    id: "romance",
    title: "💑 Romantic Escapes",
    description: "Mist, mountains, and privacy — reconnect in the most beautiful setting",
    image: "/images/terrace.jpg"
  },
  {
    id: "corporate",
    title: "💼 Corporate Retreats",
    description: "Team bonding offsite that actually bonds people — book the whole villa",
    image: "/images/living.jpg"
  },
  {
    id: "events",
    title: "🎉 Private Events",
    description: "Intimate celebrations with full privacy — no hotel crowds, no noise rules",
    image: "/images/pool-night.jpg"
  }
];

export const DISTANCE_CALLOUTS: DistanceCallout[] = [
  {
    id: "mumbai",
    icon: "🚗",
    title: "~90 min from Mumbai",
    description: "Direct highway access via the Mumbai-Pune Expressway."
  },
  {
    id: "pune",
    icon: "🚗",
    title: "~60 min from Pune",
    description: "A gorgeous, scenic drive heading towards Lonavala peaks."
  },
  {
    id: "station",
    icon: "🚂",
    title: "50m from Malavali Railway Station",
    description: "Just a stone's throw away — highly accessible location."
  },
  {
    id: "airport",
    icon: "✈️",
    title: "~63 km from Pune Airport",
    description: "Easy cab pick-up & drop arrangements directly to the villa."
  }
];

export const NEARBY_ATTRACTIONS: Attraction[] = [
  { name: "Kune Waterfalls", distance: "1.7 km" },
  { name: "Della Adventure Park", distance: "~8 km" },
  { name: "Bhushi Dam", distance: "~10 km" },
  { name: "Tiger's Leap (Tiger Point)", distance: "~12 km" },
  { name: "Lion's Point", distance: "~14 km" },
  { name: "Rajmachi Fort Trek", distance: "~22 km" },
  { name: "Karla Caves", distance: "~15 km" },
  { name: "Lonavala Lake", distance: "~10 km" },
  { name: "Celebrity Wax Museum", distance: "~10 km" },
  { name: "Wet N Joy Water Park", distance: "~15 km" }
];

export const GUEST_REVIEWS: Review[] = [
  {
    id: "rev1",
    stars: 5,
    text: "This is hands down one of the best villas I’ve stayed in. The design, cleanliness, and overall vibe are top-notch. The outdoor seating and garden space made it even more enjoyable. Highly recommend for anyone looking to chill and recharge!",
    author: "Rehab Khan",
    location: "Lonavala",
    avatar: "https://ui-avatars.com/api/?name=Rehab+Khan&background=0D1117&color=C9A84C&bold=true&size=128"
  },
  {
    id: "rev2",
    stars: 5,
    text: "My favourite villa in Lonavala the kings villa\nVery family friendly place.. hygiene & beautifully well maintained villa.. the staff is also very supportive & helping towards customers...\nHighly recommend place to hang out with family friends & loved ones... ❤️❤️",
    author: "Amrin Khan",
    location: "Lonavala",
    avatar: "https://ui-avatars.com/api/?name=Amrin+Khan&background=0D1117&color=C9A84C&bold=true&size=128"
  },
  {
    id: "rev3",
    stars: 5,
    text: "Wonderful experience very nice bungalow with private pool and turf...kitchen has all the facilities and excellent service by the care taker...its a must visit with friends and family",
    author: "Theseen Rangari",
    location: "Lonavala",
    avatar: "https://ui-avatars.com/api/?name=Theseen+Rangari&background=0D1117&color=C9A84C&bold=true&size=128"
  },
  {
    id: "rev4",
    stars: 5,
    text: "This Villa is Best of All the time\nShadab bhai is the owner of This Villa He is Very collaboration with Our Customer like a Family\nAll of us Please Visit its Extremely Best in Lonavala",
    author: "Rahim Shaikh",
    location: "Lonavala",
    avatar: "https://ui-avatars.com/api/?name=Rahim+Shaikh&background=0D1117&color=C9A84C&bold=true&size=128"
  }
];

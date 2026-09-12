import type {
  Comment,
  Conversation,
  EventItem,
  Message,
  Organization,
  Person,
  Post,
} from "./types";

export const AVATARS = [
  "/images/avatars/a1.png",
  "/images/avatars/a2.png",
  "/images/avatars/a3.png",
  "/images/avatars/a4.png",
  "/images/avatars/a5.png",
];

export const INTERESTS = [
  "Nightlife",
  "House",
  "Hip-Hop",
  "Live Music",
  "Food",
  "Art",
  "Festivals",
  "Rooftops",
];

export const EVENT_CATEGORIES = [
  "Music",
  "Rap",
  "Jazz",
  "Rock",
  "House",
  "Festival",
  "Food",
  "Art",
  "Comedy",
];

export const ORG_TYPES = [
  "Nightclub",
  "Promoter",
  "Venue",
  "Festival",
  "Collective",
  "Agency",
];

export const ORG_CATEGORIES = [
  "Promoter",
  "Artist",
  "DJ",
  "Influencer",
  "Photographer",
  "Videographer",
];

export const TOP_ORGANIZERS = [
  { id: "org-cs", name: "Cusler Sole", logo: "/images/orgs/cs.png" },
  { id: "org-330", name: "330 Studio", logo: "/images/orgs/nest.png" },
  { id: "org-pickle", name: "Pickle Factory", logo: "/images/orgs/eon.png" },
  { id: "org-eon", name: "Eon Malone", logo: "/images/orgs/eon.png" },
  { id: "org-xoyo", name: "XOYO", logo: "/images/orgs/xoyo.png" },
  { id: "org-nebula", name: "Nebula Lounge", logo: "/images/orgs/cs.png" },
  { id: "org-velvet", name: "The Velvet Room", logo: "/images/orgs/nest.png" },
  { id: "org-solaris", name: "Solaris Loft", logo: "/images/orgs/eon.png" },
  { id: "org-crimson", name: "Crimson Harbor", logo: "/images/orgs/cs.png" },
  { id: "org-echo", name: "Echo Chamber", logo: "/images/orgs/xoyo.png" },
  { id: "org-midnight", name: "Midnight Garden", logo: "/images/orgs/nest.png" },
];

export const ORGANIZATIONS: Organization[] = [
  {
    id: "org-nightbloom",
    name: "Night Bloom",
    type: "Nightclub",
    description:
      "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout.",
    categories: ["Promoter"],
    logo: "/images/orgs/nest.png",
    cover: "/images/posters/crowd.jpg",
    rating: 4.6,
    ratingCount: "3k+",
    followers: "18.4k",
    verified: true,
    location: { address: "Huston's Texas", city: "Houston", country: "USA" },
    team: [
      {
        id: "tm-1",
        name: "Alex Morgan",
        role: "Door Manager",
        phone: "+121 114 2000",
        email: "alex.morgan@gmail.com",
        avatar: "/images/avatars/a1.png",
      },
      {
        id: "tm-2",
        name: "Kellye Declan",
        role: "Event Manager",
        phone: "+121 114 2000",
        email: "alex.morgan@gmail.com",
        avatar: "/images/avatars/a2.png",
      },
    ],
  },
  {
    id: "org-timeless",
    name: "Timeless Organizer",
    type: "Promoter",
    categories: ["Promoter", "DJ"],
    logo: "/images/orgs/xoyo.png",
    cover: "/images/posters/crowd.jpg",
    rating: 4.6,
    ratingCount: "3k+",
    followers: "18.4k",
    verified: true,
    location: { address: "New York, US", city: "New York", country: "USA" },
  },
];

const NY_LOCATION = {
  address: "77 A Reade St, New York, NY 10007, USA",
  lat: 40.7148,
  lng: -74.0064,
  city: "New York",
  country: "USA",
  zipcode: "10007",
};

const baseTickets = [
  {
    id: "tt-general",
    name: "General",
    price: 35,
    quantity: 1000,
    minPerOrder: 1,
    maxPerOrder: 4,
    startTime: "22:00",
    endTime: "04:00",
  },
  {
    id: "tt-vip",
    name: "VIP",
    price: 85,
    quantity: 150,
    minPerOrder: 1,
    maxPerOrder: 2,
    ageRestriction: "21+",
    startTime: "22:00",
    endTime: "04:00",
  },
  {
    id: "tt-guest",
    name: "Guest List",
    price: 25,
    quantity: 300,
    minPerOrder: 1,
    maxPerOrder: 4,
    saleEnds: "Aug 15",
    startTime: "22:00",
    endTime: "04:00",
  },
];

const DESCRIPTION =
  "Get ready for an unforgettable experience at New York's biggest rap celebration. From legendary MCs to rising stars, witness electrifying performances, surprise guests and an atmosphere you will never forget. Doors open early, bring your energy and your people.";

export const EVENTS: EventItem[] = [
  {
    id: "ev-1",
    title: "The Rolling Stones Live in Concert",
    category: "Music",
    subtitle: "Music Fest",
    tagline: "Eminem, Dr. Dre, Shoop Dogg...",
    description: DESCRIPTION,
    faqs: "Common attendee questions answered at the door.",
    rules: "Age, entry and conduct rules apply.",
    dressCode: "Smart Nightlife Attire",
    parking: "Valet, rideshare and garage info",
    cover: "/images/posters/sunset.png",
    organizationId: "org-nightbloom",
    organizerName: "Night Bloom",
    organizerLogo: "/images/orgs/nest.png",
    organizerRating: 4.6,
    organizerRatingCount: "3k+",
    startDate: "2026-12-18",
    endDate: "2026-12-18",
    startTime: "20:00",
    endTime: "23:30",
    venue: "Brooklyn Bridge",
    location: NY_LOCATION,
    price: 120,
    guests: 50,
    ticketTypes: baseTickets,
    attendance: "ticketed",
    visibility: "public",
    status: "live",
  },
  {
    id: "ev-2",
    title: "Night Party at Expose Resort Hall",
    category: "Rap",
    subtitle: "Rap Night",
    tagline: "Kendrick, Cole, Drake...",
    description: DESCRIPTION,
    cover: "/images/posters/night.jpg",
    organizationId: "org-timeless",
    organizerName: "Timeless",
    organizerLogo: "/images/orgs/xoyo.png",
    organizerRating: 4.6,
    organizerRatingCount: "3k+",
    startDate: "2026-12-20",
    endDate: "2026-12-20",
    startTime: "21:00",
    endTime: "02:00",
    venue: "Expose Resort Hall",
    location: {
      address: "Downtown, Las Vegas, NV, USA",
      lat: 36.1699,
      lng: -115.1398,
      city: "Las Vegas",
      country: "USA",
    },
    price: 120,
    guests: 50,
    ticketTypes: baseTickets,
    attendance: "ticketed",
    visibility: "public",
    status: "live",
  },
  {
    id: "ev-3",
    title: "NY Rap Music Fest",
    category: "Jazz",
    subtitle: "Music Fest",
    tagline: "Eminem, Dr. Dre, Shoop Dogg...",
    description: DESCRIPTION,
    cover: "/images/posters/sunset.png",
    organizationId: "org-nightbloom",
    organizerName: "Night Bloom",
    organizerLogo: "/images/orgs/nest.png",
    organizerRating: 4.6,
    organizerRatingCount: "3k+",
    startDate: "2026-10-21",
    endDate: "2026-10-21",
    startTime: "19:30",
    endTime: "23:30",
    venue: "Brooklyn Bridge",
    location: NY_LOCATION,
    price: 132,
    guests: 50,
    ticketTypes: baseTickets,
    attendance: "ticketed",
    visibility: "public",
    status: "live",
  },
  {
    id: "ev-4",
    title: "Urban Music Party",
    category: "Rock",
    subtitle: "Music Fest",
    tagline: "DJ Arian, DJ Khalia",
    description: DESCRIPTION,
    cover: "/images/posters/party.jpg",
    organizationId: "org-nightbloom",
    organizerName: "Night Bloom",
    organizerLogo: "/images/orgs/nest.png",
    organizerRating: 4.6,
    organizerRatingCount: "3k+",
    startDate: "2026-11-21",
    endDate: "2026-11-23",
    startTime: "19:30",
    endTime: "23:30",
    venue: "NightBloom Club",
    location: NY_LOCATION,
    price: 120,
    guests: 50,
    ticketTypes: [
      baseTickets[0],
      baseTickets[1],
      { ...baseTickets[2], id: "tt-early", name: "Early Bird" },
    ],
    attendance: "ticketed",
    visibility: "public",
    status: "live",
  },
  {
    id: "ev-5",
    title: "The Return of Kapaemahu",
    category: "Music",
    subtitle: "Every Wednesday",
    tagline: "Free live show",
    description: DESCRIPTION,
    cover: "/images/posters/crowd.jpg",
    organizationId: "org-nightbloom",
    organizerName: "Night Bloom",
    organizerLogo: "/images/orgs/nest.png",
    organizerRating: 4.6,
    organizerRatingCount: "3k+",
    startDate: "2026-12-18",
    endDate: "2026-12-18",
    startTime: "20:00",
    endTime: "23:30",
    venue: "Kapaemahu Hall",
    location: NY_LOCATION,
    price: 120,
    guests: 50,
    ticketTypes: baseTickets,
    attendance: "ticketed",
    visibility: "public",
    status: "live",
  },
  {
    id: "ev-6",
    title: "Sunset Exclusive Rooftop",
    category: "House",
    subtitle: "Rooftop Session",
    tagline: "House all night",
    description: DESCRIPTION,
    cover: "/images/posters/sunset.png",
    organizationId: "org-timeless",
    organizerName: "Timeless",
    organizerLogo: "/images/orgs/xoyo.png",
    organizerRating: 4.6,
    organizerRatingCount: "3k+",
    startDate: "2024-09-05",
    endDate: "2024-09-05",
    startTime: "18:00",
    endTime: "23:00",
    venue: "Solaris Loft",
    location: NY_LOCATION,
    price: 95,
    guests: 50,
    ticketTypes: baseTickets,
    attendance: "ticketed",
    visibility: "public",
    status: "past",
  },
];

export const PEOPLE: Person[] = [
  {
    id: "u-david",
    name: "David Martinez",
    avatar: "/images/avatars/a1.png",
    title: "Event Manager",
    followers: "15.7k",
    verified: true,
    location: "Huston's Texas",
    rating: 4.0,
    bio: "It Is A Long Established Fact That A Reader Will Be Distracted By The Readable Content Of A Page When Looking At Its Layout.",
    stats: { posts: 845, followers: "15.7k", followings: 256 },
    cover: "/images/posters/crowd.jpg",
    gallery: [
      "/images/posters/sunset.png",
      "/images/posters/night.jpg",
      "/images/posters/party.jpg",
      "/images/posters/crowd.jpg",
      "/images/posters/sunset.png",
      "/images/posters/night.jpg",
    ],
  },
  {
    id: "u-kesha",
    name: "Kesha John",
    avatar: "/images/avatars/a2.png",
    title: "Promoter",
    followers: "18.4k",
    location: "Huston's Texas",
    rating: 4.0,
    bio: "It Is A Long Established Fact That A Reader Will Be Distracted By The Readable Content Of A Page When Looking At Its Layout.",
    stats: { posts: 845, followers: "15.7k", followings: 256 },
    cover: "/images/posters/crowd.jpg",
    gallery: [
      "/images/posters/night.jpg",
      "/images/posters/party.jpg",
      "/images/posters/sunset.png",
      "/images/posters/crowd.jpg",
      "/images/posters/night.jpg",
      "/images/posters/party.jpg",
    ],
  },
  { id: "u-tolan", name: "Tolan Kenner", avatar: "/images/avatars/a3.png", title: "People · 4 Mutual Friends" },
  { id: "u-nightbloom", name: "Night Bloom", avatar: "/images/orgs/nest.png", title: "People · 4 Mutual Friends" },
  { id: "u-robert", name: "Robert Hall", avatar: "/images/avatars/a5.png", title: "People · 4 Mutual Friends" },
  { id: "u-timeless", name: "Timeless", avatar: "/images/orgs/xoyo.png", title: "Promoter · 18k Followers" },
  { id: "u-shanaya", name: "Shanaya Kale", avatar: "/images/avatars/a2.png" },
  { id: "u-angelina", name: "Angelina", avatar: "/images/avatars/a4.png" },
  { id: "u-natasha", name: "Natasha", avatar: "/images/avatars/a3.png" },
  { id: "u-jane", name: "Jane", avatar: "/images/avatars/a2.png" },
  { id: "u-katty", name: "Katty", avatar: "/images/avatars/a4.png" },
  { id: "u-johnny", name: "Johnny", avatar: "/images/avatars/a1.png" },
  { id: "u-rose", name: "Rose", avatar: "/images/avatars/a5.png" },
  { id: "u-nina", name: "Nina John", avatar: "/images/avatars/a2.png" },
];

export const POSTS: Post[] = [
  {
    id: "p-1",
    authorId: "u-nina",
    authorName: "Nina John",
    authorAvatar: "/images/avatars/a2.png",
    createdAt: new Date(Date.now() - 6 * 60_000).toISOString(),
    title: "Green Eat Florida",
    caption:
      "Frozen mixed veggies would also work (don't need much cooking time here, either – probably 4-5 minutes).🔥🔥",
    media: [{ url: "/images/posters/crowd.jpg", type: "image" }],
    likes: 82000,
    comments: 551,
    shares: 551,
    saves: 5000,
    eventId: "ev-2",
  },
  {
    id: "p-2",
    authorId: "u-david",
    authorName: "David Martinez",
    authorAvatar: "/images/avatars/a1.png",
    createdAt: new Date(Date.now() - 3 * 3_600_000).toISOString(),
    title: "Sunset Exclusive",
    caption: "Last night was unreal. Thank you New York 🧡",
    media: [{ url: "/images/posters/sunset.png", type: "image" }],
    likes: 12400,
    comments: 210,
    shares: 98,
    saves: 1200,
    eventId: "ev-1",
  },
  {
    id: "p-3",
    authorId: "u-kesha",
    authorName: "Kesha John",
    authorAvatar: "/images/avatars/a2.png",
    createdAt: new Date(Date.now() - 26 * 3_600_000).toISOString(),
    title: "Urban Music Party",
    caption: "Feb 25 · doors at 8PM. Bring everyone.",
    media: [{ url: "/images/posters/party.jpg", type: "image" }],
    likes: 5400,
    comments: 88,
    shares: 40,
    saves: 320,
    eventId: "ev-4",
    verifiedEvent: true,
  },
];

export const COMMENTS: Comment[] = [
  {
    id: "c-1",
    postId: "p-1",
    authorId: "u-jaxson",
    authorName: "Jaxson Vaccaro",
    authorAvatar: "/images/avatars/a1.png",
    text: "It is a long established fact that a reader will be distracted by the readable content",
    createdAt: new Date(Date.now() - 4 * 3_600_000).toISOString(),
    likes: 257,
  },
  {
    id: "c-2",
    postId: "p-1",
    authorId: "u-kierra",
    authorName: "Kierra Siphron",
    authorAvatar: "/images/avatars/a2.png",
    text: "It is a long established fact that a reader will be distracted by the readable content",
    createdAt: new Date(Date.now() - 4 * 3_600_000).toISOString(),
    likes: 257,
  },
  {
    id: "c-3",
    postId: "p-1",
    authorId: "u-rayna",
    authorName: "Rayna Dias",
    authorAvatar: "/images/avatars/a3.png",
    text: "It is a long established fact that a reader will be distracted by the readable content",
    createdAt: new Date(Date.now() - 4 * 3_600_000).toISOString(),
    likes: 257,
    replies: [
      {
        id: "c-3-1",
        postId: "p-1",
        authorId: "u-jaydon",
        authorName: "Jaydon Bator",
        authorAvatar: "/images/avatars/a4.png",
        text: "Reader Will Be Distracted By The Readable Content",
        createdAt: new Date(Date.now() - 3 * 3_600_000).toISOString(),
        likes: 12,
      },
    ],
  },
];

export const CONVERSATIONS: Conversation[] = [
  {
    id: "cv-1",
    participantId: "u-lydia",
    name: "Lydia Aminoff",
    subtitle: "Operations",
    avatar: "/images/avatars/a2.png",
    online: true,
    unread: 2,
    lastAt: "10:30 AM",
  },
  {
    id: "cv-2",
    participantId: "u-dulce",
    name: "Dulce Bator",
    subtitle: "Finance Team",
    avatar: "/images/avatars/a1.png",
    online: true,
    unread: 0,
    lastAt: "Yesterday",
  },
  {
    id: "cv-3",
    participantId: "u-martin",
    name: "Martin Franci",
    subtitle: "On-site Supervisor",
    avatar: "/images/avatars/a5.png",
    online: false,
    unread: 1,
    lastAt: "2d ago",
  },
];

const today = new Date();
const at = (h: number, m: number) => {
  const d = new Date(today);
  d.setHours(h, m, 0, 0);
  return d.toISOString();
};

export const MESSAGES: Message[] = [
  { id: "m-1", conversationId: "cv-1", senderId: "u-lydia", text: "Hello! How are you doing with the calculus assignment?", createdAt: at(10, 15) },
  { id: "m-2", conversationId: "cv-1", senderId: "me", text: "I'm doing well, thanks! Just working through problem 15.", createdAt: at(10, 20), read: true },
  { id: "m-3", conversationId: "cv-1", senderId: "u-lydia", text: "Great! Remember to show all your work for full credit.", createdAt: at(10, 25) },
  { id: "m-4", conversationId: "cv-1", senderId: "u-lydia", text: "Please submit your assignment by Friday", createdAt: at(10, 30) },
  { id: "m-5", conversationId: "cv-2", senderId: "u-dulce", text: "Invoice INV-2026-0781 is ready for review.", createdAt: at(9, 0) },
  { id: "m-6", conversationId: "cv-3", senderId: "u-martin", text: "Access issue has been resolved.", createdAt: at(8, 0) },
];

export const AUTO_REPLIES = [
  "Sounds good, I'll get back to you shortly.",
  "Perfect, thanks for the update!",
  "Got it. See you at the event 🎉",
  "Let me check and confirm.",
];

export function formatEventDate(ev: { startDate: string; startTime: string }) {
  const d = new Date(`${ev.startDate}T${ev.startTime}`);
  const date = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const time = d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  return `${date} - ${time}`;
}

export function formatLongDate(iso: string) {
  return new Date(`${iso}T00:00`).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function formatTime12(t: string) {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

export function money(n: number) {
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function compact(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1000) return `${Math.round(n / 100) / 10}k`;
  return String(n);
}

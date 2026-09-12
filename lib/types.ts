export type Role = "guest" | "organizer";

export interface SocialLinks {
  instagram?: string;
  x?: string;
  youtube?: string;
  snapchat?: string;
}

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface LocationValue extends Partial<GeoPoint> {
  address: string;
  country?: string;
  city?: string;
  zipcode?: string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatar?: string;
  cover?: string;
  title?: string;
  bio?: string;
  location?: LocationValue;
  social?: SocialLinks;
  interests?: string[];
  rating?: number;
  verified?: boolean;
  role: Role;
  stats?: { posts: number; followers: number; followings: number };
}

export interface Organization {
  id: string;
  name: string;
  type: string;
  description?: string;
  categories: string[];
  logo?: string;
  cover?: string;
  email?: string;
  phone?: string;
  social?: SocialLinks;
  location?: LocationValue;
  rating?: number;
  ratingCount?: string;
  followers?: string;
  verified?: boolean;
  team?: TeamMember[];
  ownerId?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "Event Manager" | "Door Manager";
  avatar?: string;
}

export interface TicketType {
  id: string;
  name: string;
  price: number;
  quantity: number;
  startTime?: string;
  endTime?: string;
  minPerOrder: number;
  maxPerOrder: number;
  ageRestriction?: string;
  description?: string;
  accessArea?: string;
  notes?: string;
  saleEnds?: string;
}

export type EventVisibility =
  | "public"
  | "private"
  | "invite-only"
  | "password";

export type EventStatus = "live" | "draft" | "past";

export interface EventItem {
  id: string;
  title: string;
  category: string;
  subtitle?: string;
  tagline?: string;
  description: string;
  faqs?: string;
  rules?: string;
  dressCode?: string;
  parking?: string;
  cover: string;
  flyer?: string;
  gallery?: string[];
  organizationId: string;
  organizerName: string;
  organizerLogo?: string;
  organizerRating?: number;
  organizerRatingCount?: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  venue: string;
  location: LocationValue;
  price: number;
  guests: number;
  ticketTypes: TicketType[];
  attendance: "ticketed" | "rsvp";
  visibility: EventVisibility;
  password?: string;
  guestList?: {
    enabled: boolean;
    capacity: number;
    eligibility: string;
    contactCapture: string;
    marketingConsent: string;
  };
  status: EventStatus;
  boosted?: boolean;
  ownerId?: string;
  createdAt?: string;
}

export interface CartLine {
  ticketTypeId: string;
  qty: number;
}

export interface OrderTicket {
  id: string;
  ticketTypeId: string;
  ticketTypeName: string;
  qty: number;
  unitPrice: number;
  code: string;
}

export interface Order {
  id: string;
  eventId: string;
  tickets: OrderTicket[];
  total: number;
  tax: number;
  createdAt: string;
  address?: DeliveryAddress;
}

export interface DeliveryAddress {
  fullName: string;
  phone: string;
  dialCode: string;
  country: string;
  city: string;
  location: LocationValue;
  zipcode: string;
  label: "Home" | "Office";
  isDefault: boolean;
}

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  createdAt: string;
  title: string;
  caption: string;
  media: { url: string; type: "image" | "video" }[];
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  eventId?: string;
  isPublic?: boolean;
  location?: string;
  verifiedEvent?: boolean;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  text: string;
  createdAt: string;
  likes: number;
  replies?: Comment[];
}

export interface Conversation {
  id: string;
  participantId: string;
  name: string;
  subtitle: string;
  avatar?: string;
  online?: boolean;
  unread: number;
  lastAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  attachment?: { url: string; name: string; type: string };
  createdAt: string;
  read?: boolean;
}

export interface Person {
  id: string;
  name: string;
  avatar: string;
  title?: string;
  followers?: string;
  verified?: boolean;
  location?: string;
  bio?: string;
  rating?: number;
  social?: SocialLinks;
  stats?: { posts: number; followers: string; followings: number };
  gallery?: string[];
  cover?: string;
}

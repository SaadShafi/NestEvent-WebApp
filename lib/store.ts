"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  AUTO_REPLIES,
  CONVERSATIONS,
  EVENTS,
  MESSAGES,
  ORGANIZATIONS,
  POSTS,
  COMMENTS,
} from "./data";
import type {
  CartLine,
  Comment,
  Conversation,
  DeliveryAddress,
  EventItem,
  Message,
  Order,
  Organization,
  Post,
  Role,
  User,
} from "./types";
import { ticketCode, uid } from "./utils";

export interface DraftEvent extends Partial<EventItem> {
  id: string;
  step?: number;
}

export interface NestState {
  hydrated: boolean;
  // auth
  user: User | null;
  role: Role;
  onboarded: boolean;
  // preferences
  interests: string[];
  favorites: string[];
  following: string[];
  followers: string[];
  followRequests: string[];
  savedPosts: string[];
  likedPosts: string[];
  currentLocation: string;
  notifications: { id: string; text: string; read: boolean; at: string }[];
  // shopping
  cart: { eventId: string; lines: CartLine[] } | null;
  addresses: DeliveryAddress[];
  orders: Order[];
  // content
  events: EventItem[];
  posts: Post[];
  comments: Comment[];
  conversations: Conversation[];
  messages: Message[];
  organizations: Organization[];
  draft: DraftEvent | null;

  // actions
  setHydrated: () => void;
  setRole: (r: Role) => void;
  signIn: (email: string, role?: Role) => void;
  signUp: (u: Partial<User>) => void;
  signOut: () => void;
  updateUser: (patch: Partial<User>) => void;
  setOnboarded: (v: boolean) => void;
  setInterests: (v: string[]) => void;
  toggleFavorite: (eventId: string) => void;
  toggleFollow: (personId: string) => void;
  removeFollower: (personId: string) => void;
  acceptRequest: (personId: string) => void;
  declineRequest: (personId: string) => void;
  toggleSave: (postId: string) => void;
  toggleLike: (postId: string) => void;
  setCurrentLocation: (s: string) => void;
  markNotificationsRead: () => void;

  setCart: (eventId: string, lines: CartLine[]) => void;
  clearCart: () => void;
  addAddress: (a: DeliveryAddress) => void;
  placeOrder: (address?: DeliveryAddress) => Order | null;

  addPost: (p: Omit<Post, "id" | "createdAt" | "likes" | "comments" | "shares" | "saves">) => Post;
  addComment: (postId: string, text: string, parentId?: string) => void;

  sendMessage: (conversationId: string, text: string, attachment?: Message["attachment"]) => void;
  markConversationRead: (conversationId: string) => void;
  startConversation: (participantId: string, name: string, avatar?: string) => string;

  addOrganization: (o: Organization) => void;
  updateOrganization: (id: string, patch: Partial<Organization>) => void;
  setDraft: (d: DraftEvent | null) => void;
  patchDraft: (patch: Partial<DraftEvent>) => void;
  publishDraft: (status?: EventItem["status"]) => EventItem | null;
  updateEvent: (id: string, patch: Partial<EventItem>) => void;
  deleteEvent: (id: string) => void;
}

const DEMO_USER: User = {
  id: "me",
  firstName: "Jon",
  lastName: "Snow",
  email: "jon@nest.app",
  phone: "+1 555 010 2030",
  avatar: "/images/avatars/a1.png",
  cover: "/images/posters/crowd.jpg",
  title: "Event Manager",
  bio: "It Is A Long Established Fact That A Reader Will Be Distracted By The Readable Content Of A Page When Looking At Its Layout.",
  location: { address: "Huston's Texas", city: "Houston", country: "USA" },
  rating: 4.0,
  verified: true,
  role: "guest",
  stats: { posts: 845, followers: 15700, followings: 256 },
};

export const useNest = create<NestState>()(
  persist(
    (set, get) => ({
      hydrated: false,
      user: null,
      role: "guest",
      onboarded: false,
      interests: [],
      favorites: [],
      following: ["u-kesha"],
      followers: ["u-shanaya", "u-angelina", "u-natasha", "u-jane", "u-katty", "u-johnny", "u-rose"],
      followRequests: ["u-tolan", "u-robert"],
      savedPosts: [],
      likedPosts: [],
      currentLocation: "",
      notifications: [
        { id: "n-1", text: "Your VIP ticket for NY Rap Music Fest is confirmed.", read: false, at: new Date().toISOString() },
        { id: "n-2", text: "Night Bloom posted a new event near you.", read: false, at: new Date().toISOString() },
      ],
      cart: null,
      addresses: [],
      orders: [],
      events: EVENTS,
      posts: POSTS,
      comments: COMMENTS,
      conversations: CONVERSATIONS,
      messages: MESSAGES,
      organizations: ORGANIZATIONS,
      draft: null,

      setHydrated: () => set({ hydrated: true }),
      setRole: (role) => set({ role }),
      signIn: (email, role) =>
        set((s) => ({
          user: { ...(s.user ?? DEMO_USER), email, role: role ?? s.role },
          role: role ?? s.role,
        })),
      signUp: (u) =>
        set((s) => ({
          user: {
            ...DEMO_USER,
            ...u,
            id: "me",
            role: s.role,
            avatar: u.avatar ?? DEMO_USER.avatar,
          } as User,
          onboarded: false,
        })),
      signOut: () => set({ user: null, onboarded: false, cart: null }),
      updateUser: (patch) => set((s) => ({ user: s.user ? { ...s.user, ...patch } : s.user })),
      setOnboarded: (v) => set({ onboarded: v }),
      setInterests: (v) => set({ interests: v }),
      toggleFavorite: (id) =>
        set((s) => ({
          favorites: s.favorites.includes(id) ? s.favorites.filter((x) => x !== id) : [...s.favorites, id],
        })),
      toggleFollow: (id) =>
        set((s) => ({
          following: s.following.includes(id) ? s.following.filter((x) => x !== id) : [...s.following, id],
        })),
      removeFollower: (id) => set((s) => ({ followers: s.followers.filter((x) => x !== id) })),
      acceptRequest: (id) =>
        set((s) => ({
          followRequests: s.followRequests.filter((x) => x !== id),
          followers: s.followers.includes(id) ? s.followers : [...s.followers, id],
        })),
      declineRequest: (id) => set((s) => ({ followRequests: s.followRequests.filter((x) => x !== id) })),
      toggleSave: (id) =>
        set((s) => ({
          savedPosts: s.savedPosts.includes(id) ? s.savedPosts.filter((x) => x !== id) : [...s.savedPosts, id],
        })),
      toggleLike: (id) =>
        set((s) => {
          const liked = s.likedPosts.includes(id);
          return {
            likedPosts: liked ? s.likedPosts.filter((x) => x !== id) : [...s.likedPosts, id],
            posts: s.posts.map((p) => (p.id === id ? { ...p, likes: p.likes + (liked ? -1 : 1) } : p)),
          };
        }),
      setCurrentLocation: (currentLocation) => set({ currentLocation }),
      markNotificationsRead: () =>
        set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) })),

      setCart: (eventId, lines) => set({ cart: { eventId, lines: lines.filter((l) => l.qty > 0) } }),
      clearCart: () => set({ cart: null }),
      addAddress: (a) =>
        set((s) => ({
          addresses: a.isDefault
            ? [a, ...s.addresses.map((x) => ({ ...x, isDefault: false }))]
            : [...s.addresses, a],
        })),
      placeOrder: (address) => {
        const s = get();
        if (!s.cart || !s.cart.lines.length) return null;
        const ev = s.events.find((e) => e.id === s.cart!.eventId);
        if (!ev) return null;
        const tickets = s.cart.lines.map((l) => {
          const tt = ev.ticketTypes.find((t) => t.id === l.ticketTypeId)!;
          return {
            id: uid("tk"),
            ticketTypeId: tt.id,
            ticketTypeName: tt.name,
            qty: l.qty,
            unitPrice: tt.price,
            code: ticketCode(),
          };
        });
        const subtotal = tickets.reduce((a, t) => a + t.qty * t.unitPrice, 0);
        const tax = Math.round(subtotal * 0.0102 * 100) / 100;
        const order: Order = {
          id: uid("ord"),
          eventId: ev.id,
          tickets,
          tax,
          total: Math.round((subtotal + tax) * 100) / 100,
          createdAt: new Date().toISOString(),
          address,
        };
        set({ orders: [order, ...s.orders], cart: null });
        return order;
      },

      addPost: (p) => {
        const post: Post = {
          ...p,
          id: uid("p"),
          createdAt: new Date().toISOString(),
          likes: 0,
          comments: 0,
          shares: 0,
          saves: 0,
        };
        set((s) => ({ posts: [post, ...s.posts] }));
        return post;
      },
      addComment: (postId, text, parentId) =>
        set((s) => {
          const me = s.user;
          const c: Comment = {
            id: uid("c"),
            postId,
            authorId: me?.id ?? "me",
            authorName: me ? `${me.firstName} ${me.lastName}` : "You",
            authorAvatar: me?.avatar,
            text,
            createdAt: new Date().toISOString(),
            likes: 0,
          };
          const comments = parentId
            ? s.comments.map((x) => (x.id === parentId ? { ...x, replies: [...(x.replies ?? []), c] } : x))
            : [...s.comments, c];
          return {
            comments,
            posts: s.posts.map((p) => (p.id === postId ? { ...p, comments: p.comments + 1 } : p)),
          };
        }),

      sendMessage: (conversationId, text, attachment) => {
        const now = new Date().toISOString();
        const msg: Message = { id: uid("m"), conversationId, senderId: "me", text, attachment, createdAt: now, read: false };
        set((s) => ({
          messages: [...s.messages, msg],
          conversations: s.conversations.map((c) => (c.id === conversationId ? { ...c, lastAt: "Just now" } : c)),
        }));
        // simulated reply from the other participant
        const conv = get().conversations.find((c) => c.id === conversationId);
        if (conv) {
          setTimeout(() => {
            const reply: Message = {
              id: uid("m"),
              conversationId,
              senderId: conv.participantId,
              text: AUTO_REPLIES[Math.floor(Math.random() * AUTO_REPLIES.length)],
              createdAt: new Date().toISOString(),
            };
            set((s) => ({
              messages: s.messages.map((m) => (m.id === msg.id ? { ...m, read: true } : m)).concat(reply),
            }));
          }, 1400);
        }
      },
      markConversationRead: (id) =>
        set((s) => ({ conversations: s.conversations.map((c) => (c.id === id ? { ...c, unread: 0 } : c)) })),
      startConversation: (participantId, name, avatar) => {
        const existing = get().conversations.find((c) => c.participantId === participantId);
        if (existing) return existing.id;
        const conv: Conversation = {
          id: uid("cv"),
          participantId,
          name,
          subtitle: "New conversation",
          avatar,
          online: true,
          unread: 0,
          lastAt: "Now",
        };
        set((s) => ({ conversations: [conv, ...s.conversations] }));
        return conv.id;
      },

      addOrganization: (o) => set((s) => ({ organizations: [o, ...s.organizations] })),
      updateOrganization: (id, patch) =>
        set((s) => ({ organizations: s.organizations.map((o) => (o.id === id ? { ...o, ...patch } : o)) })),
      setDraft: (draft) => set({ draft }),
      patchDraft: (patch) =>
        set((s) => ({ draft: s.draft ? { ...s.draft, ...patch } : { id: uid("draft"), ...patch } })),
      publishDraft: (status = "live") => {
        const s = get();
        const d = s.draft;
        if (!d) return null;
        const org = s.organizations.find((o) => o.id === d.organizationId) ?? s.organizations[0];
        const ev: EventItem = {
          id: d.id.startsWith("ev-") ? d.id : uid("ev"),
          title: d.title ?? "Untitled Event",
          category: d.category ?? "Music",
          subtitle: d.subtitle ?? d.category ?? "Event",
          tagline: d.tagline,
          description: d.description ?? "",
          faqs: d.faqs,
          rules: d.rules,
          dressCode: d.dressCode,
          parking: d.parking,
          cover: d.cover ?? d.flyer ?? "/images/posters/party.jpg",
          flyer: d.flyer,
          gallery: d.gallery ?? [],
          organizationId: org?.id ?? "org-nightbloom",
          organizerName: org?.name ?? "Night Bloom",
          organizerLogo: org?.logo,
          organizerRating: org?.rating ?? 4.6,
          organizerRatingCount: org?.ratingCount ?? "3k+",
          startDate: d.startDate ?? new Date().toISOString().slice(0, 10),
          endDate: d.endDate ?? d.startDate ?? new Date().toISOString().slice(0, 10),
          startTime: d.startTime ?? "22:00",
          endTime: d.endTime ?? "04:00",
          venue: d.venue ?? "",
          location: d.location ?? { address: "" },
          price: d.ticketTypes?.[0]?.price ?? 0,
          guests: 0,
          ticketTypes: d.ticketTypes ?? [],
          attendance: d.attendance ?? "ticketed",
          visibility: d.visibility ?? "public",
          password: d.password,
          guestList: d.guestList,
          status,
          boosted: d.boosted,
          ownerId: "me",
          createdAt: new Date().toISOString(),
        };
        const exists = s.events.some((e) => e.id === ev.id);
        set({
          events: exists ? s.events.map((e) => (e.id === ev.id ? ev : e)) : [ev, ...s.events],
          draft: null,
        });
        return ev;
      },
      updateEvent: (id, patch) => set((s) => ({ events: s.events.map((e) => (e.id === id ? { ...e, ...patch } : e)) })),
      deleteEvent: (id) => set((s) => ({ events: s.events.filter((e) => e.id !== id) })),
    }),
    {
      name: "nest-webapp",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => {
        const { hydrated, ...rest } = s;
        void hydrated;
        return rest;
      },
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    },
  ),
);

export const useCurrentUser = () => useNest((s) => s.user);

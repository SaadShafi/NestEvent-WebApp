"use client";

import { PEOPLE } from "@/lib/data";
import { useNest } from "@/lib/store";
import { FlowPage } from "@/components/shell/flow-layout";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/primitives";
import { ProfileView, type ProfileData } from "../../organizations/_components/profile-view";

const FALLBACK_GALLERY = [
  "/images/posters/sunset.png",
  "/images/posters/night.jpg",
  "/images/posters/party.jpg",
  "/images/posters/crowd.jpg",
  "/images/posters/sunset.png",
  "/images/posters/night.jpg",
];

export function UserProfile({ id }: { id: string }) {
  const events = useNest((s) => s.events);
  const organizations = useNest((s) => s.organizations);
  const person = PEOPLE.find((p) => p.id === id);

  if (!person) {
    // allow /users/<org id> too (search "Users" list includes promoters)
    const org = organizations.find((o) => o.id === id);
    if (!org) {
      return (
        <FlowPage title="Details" backHref="/search" width="md">
          <EmptyState title="User not found" action={<Button href="/search">Back to Search</Button>} />
        </FlowPage>
      );
    }
    const profile: ProfileData = {
      id: org.id,
      name: org.name,
      avatar: org.logo,
      cover: org.cover,
      verified: org.verified,
      title: org.categories[0] ?? org.type,
      location: org.location?.address,
      rating: org.rating,
      bio: org.description,
      stats: { posts: 120, followers: org.followers ?? "0", followings: 42 },
      gallery: FALLBACK_GALLERY,
      social: org.social,
    };
    return <ProfileView profile={profile} events={events.filter((e) => e.organizationId === org.id)} backTitle="Details" backHref="/search" />;
  }

  const isPromoter = (person.title ?? "").toLowerCase().includes("promoter");
  const profile: ProfileData = {
    id: person.id,
    name: person.name,
    avatar: person.avatar,
    cover: person.cover ?? "/images/posters/night.jpg",
    verified: person.verified,
    title: isPromoter || !person.title?.startsWith("People") ? person.title : undefined,
    location: person.location ?? "Huston's Texas",
    rating: person.rating,
    bio: person.bio ?? "Loves live music, rooftops and late nights. Catch me at the next NEST event.",
    stats: person.stats ?? { posts: 120, followers: person.followers ?? "1.2k", followings: 180 },
    gallery: person.gallery ?? FALLBACK_GALLERY,
    social: person.social,
  };
  // events this user is attending: live events
  const attending = events.filter((e) => e.status === "live");
  return <ProfileView profile={profile} events={attending} backTitle="Details" backHref="/search" />;
}

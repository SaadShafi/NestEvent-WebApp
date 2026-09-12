"use client";

import { useMemo } from "react";
import { PEOPLE, TOP_ORGANIZERS } from "@/lib/data";
import { useNest } from "@/lib/store";
import { FlowPage } from "@/components/shell/flow-layout";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/primitives";
import { ProfileView, type ProfileData } from "../_components/profile-view";

const DEFAULT_BIO =
  "It Is A Long Established Fact That A Reader Will Be Distracted By The Readable Content Of A Page When Looking At Its Layout.";

export function OrganizationProfile({ id }: { id: string }) {
  const organizations = useNest((s) => s.organizations);
  const events = useNest((s) => s.events);

  const profile = useMemo<ProfileData | null>(() => {
    const org = organizations.find((o) => o.id === id);
    const orgEvents = events.filter((e) => e.organizationId === id && e.status !== "draft");
    if (org) {
      const loc = org.location?.address ?? [org.location?.city, org.location?.country].filter(Boolean).join(", ");
      return {
        id: org.id,
        name: org.name,
        avatar: org.logo,
        cover: org.cover ?? orgEvents[0]?.cover,
        verified: org.verified,
        title: org.categories[0] ?? org.type,
        location: loc || undefined,
        rating: org.rating,
        bio: org.description ?? DEFAULT_BIO,
        stats: { posts: orgEvents.length * 3 + 12, followers: org.followers ?? "0", followings: org.team?.length ?? 0 },
        gallery: orgEvents.length ? orgEvents.flatMap((e) => [e.cover, ...(e.gallery ?? [])]) : ["/images/posters/crowd.jpg", "/images/posters/party.jpg", "/images/posters/night.jpg"],
        social: org.social,
      };
    }
    const top = TOP_ORGANIZERS.find((o) => o.id === id);
    if (top) {
      return {
        id: top.id,
        name: top.name,
        avatar: top.logo,
        cover: "/images/posters/crowd.jpg",
        verified: true,
        title: "Promoter",
        location: "New York, US",
        rating: 4.6,
        bio: DEFAULT_BIO,
        stats: { posts: 845, followers: "18.4k", followings: 256 },
        gallery: ["/images/posters/sunset.png", "/images/posters/night.jpg", "/images/posters/party.jpg", "/images/posters/crowd.jpg", "/images/posters/sunset.png", "/images/posters/night.jpg"],
      };
    }
    const person = PEOPLE.find((p) => p.id === id);
    if (person) {
      return {
        id: person.id,
        name: person.name,
        avatar: person.avatar,
        cover: person.cover,
        verified: person.verified,
        title: person.title,
        location: person.location,
        rating: person.rating,
        bio: person.bio,
        stats: person.stats ?? { posts: 0, followers: person.followers ?? "0", followings: 0 },
        gallery: person.gallery ?? [],
        social: person.social,
      };
    }
    return null;
  }, [organizations, events, id]);

  if (!profile) {
    return (
      <FlowPage title="Details" backHref="/search" width="md">
        <EmptyState title="Organization not found" action={<Button href="/search">Back to Search</Button>} />
      </FlowPage>
    );
  }

  const orgEvents = events.filter((e) => e.organizationId === id && e.status !== "draft");
  return <ProfileView profile={profile} events={orgEvents} backTitle="Details" backHref="/search" />;
}

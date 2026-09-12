import { OrganizationProfile } from "./organization-profile";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <OrganizationProfile id={id} />;
}

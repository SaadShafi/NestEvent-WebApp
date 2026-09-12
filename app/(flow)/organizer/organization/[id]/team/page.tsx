import { TeamRoles } from "./team-roles";

export default async function OrganizationTeamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <TeamRoles id={id} />;
}

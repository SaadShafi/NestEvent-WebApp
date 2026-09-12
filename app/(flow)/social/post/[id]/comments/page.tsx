import { CommentsClient } from "./comments-client";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CommentsClient id={id} />;
}

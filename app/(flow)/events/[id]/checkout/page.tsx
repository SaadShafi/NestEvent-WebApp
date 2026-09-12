import { Cart } from "./cart";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <Cart id={id} />;
}

import { redirect } from "next/navigation";

export default async function Page({
  params,
}: {
  params: Promise<{ key: string }>;
}) {
  const { key } = await params;

  redirect(`/landing.html?key=${encodeURIComponent(key)}`);
}
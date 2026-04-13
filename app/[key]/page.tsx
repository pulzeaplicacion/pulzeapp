import { redirect } from "next/navigation";

export default function Page({
  params,
}: {
  params: { key: string };
}) {
  redirect(`/landing.html?key=${encodeURIComponent(params.key)}`);
}
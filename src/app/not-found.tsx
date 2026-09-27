import Link from "next/link";
import { HorizonMark } from "@/components/site/horizon-mark";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-5 text-center">
      <HorizonMark className="size-14" />
      <h1 className="mt-6 text-4xl font-semibold">This page doesn&apos;t exist</h1>
      <p className="mt-3 text-ink-soft">It may have been moved or unpublished.</p>
      <Link href="/" className="mt-6 text-sea underline">
        Go to the home page
      </Link>
    </div>
  );
}

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import AppLayout from "@/components/layout/AppLayout";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

export default function MatchesRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/?filter=wishlist");
  }, [router]);

  return (
    <AppLayout>
      <div className="py-20 text-center space-y-4">
        <Sparkles size={36} className="mx-auto text-[#E11D48] animate-pulse" />
        <h2 className="text-base font-bold text-[#111C2D]">Loading Wishlist Matches...</h2>
        <p className="text-xs text-[#475569]">
          Redirecting to Browse Vehicles with your active Wishlist filter applied.
        </p>
        <Link
          href="/?filter=wishlist"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#E11D48] hover:underline"
        >
          Click here if not redirected automatically <ArrowRight size={13} />
        </Link>
      </div>
    </AppLayout>
  );
}

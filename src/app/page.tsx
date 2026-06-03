"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "../utils/authUtils";

export default function EntryPage() {
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated()) {
      router.push("/dashboard");
    } else {
      router.push("/login");
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center text-text-primary font-sans">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary-teal"></div>
    </div>
  );
}

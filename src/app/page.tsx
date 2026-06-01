"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function EntryPage() {
  const router = useRouter();

  useEffect(() => {
    const auth = localStorage.getItem("wrixty_authenticated");
    if (auth) {
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

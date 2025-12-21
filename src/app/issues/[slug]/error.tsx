"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Header, Footer } from "@/components";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.error("Issue page error:", error);
    }
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 flex items-center justify-center bg-paper px-4">
        <div className="max-w-md w-full text-center">
          <h1 className="font-serif font-bold text-3xl text-navy mb-4">
            Failed to load this issue
          </h1>
          <p className="text-slate mb-8">
            We couldn't load this newsletter issue. It might not exist or there
            could be a temporary problem.
          </p>
          <div className="flex gap-4 justify-center">
            <button onClick={() => reset()} className="btn-primary">
              Try again
            </button>
            <Link href="/issues" className="btn-secondary">
              View all issues
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

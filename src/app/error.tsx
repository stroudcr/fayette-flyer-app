"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.error("Application error:", error);
    }
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper px-4">
      <div className="max-w-md w-full text-center">
        <h1 className="font-serif font-bold text-4xl text-navy mb-4">
          Something went wrong
        </h1>
        <p className="text-slate mb-8">
          We encountered an unexpected error. Please try again or return to the
          home page.
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => reset()}
            className="btn-primary"
          >
            Try again
          </button>
          <Link href="/" className="btn-secondary">
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

import Link from "next/link";
import { Header, Footer } from "@/components";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 flex items-center justify-center bg-paper">
        <div className="text-center px-4 py-16">
          <div className="w-20 h-20 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-10 h-10 text-gold"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          <h1 className="font-serif font-bold text-4xl text-navy mb-4">
            Page Not Found
          </h1>
          <p className="text-slate text-lg mb-8 max-w-md mx-auto">
            Sorry, we couldn&apos;t find the page you&apos;re looking for. It may have
            been moved or no longer exists.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/" className="btn-primary inline-block">
              Go Home
            </Link>
            <Link href="/issues" className="btn-secondary inline-block">
              Browse Issues
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

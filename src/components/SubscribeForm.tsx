"use client";

import { useState, FormEvent } from "react";

interface SubscribeFormProps {
  variant?: "hero" | "inline" | "card";
  theme?: "surface" | "inverse";
  className?: string;
}

export function SubscribeForm({
  variant = "inline",
  theme = "surface",
  className = "",
}: SubscribeFormProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const isInverse = theme === "inverse";

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!email) {
      setStatus("error");
      setMessage("Please enter your email address");
      return;
    }

    setStatus("loading");

    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          utm_source: "website",
          utm_medium: variant,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      setStatus("success");
      setMessage("Welcome to the Fayette Flyer!");
      setEmail("");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Something went wrong");
    }
  }

  if (status === "success") {
    return (
      <div
        className={`rounded-2xl border p-6 text-center ${
          isInverse
            ? "border-white/20 bg-white/10 text-white backdrop-blur-md"
            : "border-gold bg-white text-navy"
        } ${className}`}
      >
        <svg
          className="w-12 h-12 text-gold mx-auto mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p className={`font-serif text-lg font-semibold ${isInverse ? "text-white" : "text-navy"}`}>
          {message}
        </p>
      </div>
    );
  }

  if (variant === "hero") {
    return (
      <form onSubmit={handleSubmit} className={className}>
        <div
          className={`flex flex-col gap-3 sm:flex-row ${
            isInverse ? "max-w-xl" : "mx-auto max-w-md"
          }`}
        >
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className={`min-w-0 flex-1 rounded-md border px-4 py-3 text-base focus:border-transparent focus:outline-none focus:ring-2 ${
              isInverse
                ? "border-white/20 bg-white/[0.12] text-white placeholder:text-white/60 focus:ring-gold"
                : "border-gray-300 bg-white text-slate focus:ring-navy"
            }`}
            disabled={status === "loading"}
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className={`whitespace-nowrap rounded-md px-5 py-3 font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 ${
              isInverse
                ? "bg-gold text-navy hover:bg-[#c6ad76] focus-visible:outline-gold"
                : "bg-navy text-white hover:bg-navy-dark focus-visible:outline-navy"
            }`}
          >
            {status === "loading" ? "Subscribing..." : "Subscribe Free"}
          </button>
        </div>
        {status === "error" && (
          <p className={`mt-2 text-sm ${isInverse ? "text-red-200" : "text-center text-red-600"}`}>
            {message}
          </p>
        )}
        <p className={`mt-3 text-sm ${isInverse ? "text-white/[0.72]" : "text-center text-slate/70"}`}>
          Join thousands of Fayette County residents. Free, twice-a-week delivery.
        </p>
      </form>
    );
  }

  if (variant === "card") {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
        <h3 className="font-serif font-bold text-xl text-navy mb-2">
          Stay in the loop
        </h3>
        <p className="text-slate text-sm mb-4">
          Get local news delivered to your inbox every week.
        </p>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-navy focus:border-transparent text-slate mb-3"
            disabled={status === "loading"}
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="btn-primary w-full disabled:opacity-50"
          >
            {status === "loading" ? "Subscribing..." : "Subscribe Free"}
          </button>
          {status === "error" && (
            <p className="text-red-600 text-sm mt-2">{message}</p>
          )}
        </form>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`flex gap-2 ${className}`}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
        className="flex-1 px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-navy focus:border-transparent text-slate text-sm"
        disabled={status === "loading"}
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className="btn-primary text-sm disabled:opacity-50"
      >
        {status === "loading" ? "..." : "Subscribe"}
      </button>
    </form>
  );
}

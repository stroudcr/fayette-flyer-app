"use client";

import { useState, FormEvent } from "react";

interface SubscribeFormProps {
  variant?: "hero" | "inline" | "card";
  className?: string;
}

export function SubscribeForm({ variant = "inline", className = "" }: SubscribeFormProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

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
      <div className={`text-center p-6 bg-white rounded-lg border border-gold ${className}`}>
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
        <p className="text-navy font-serif font-semibold text-lg">{message}</p>
      </div>
    );
  }

  if (variant === "hero") {
    return (
      <form onSubmit={handleSubmit} className={className}>
        <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="flex-1 px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-navy focus:border-transparent text-slate"
            disabled={status === "loading"}
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="btn-primary whitespace-nowrap disabled:opacity-50"
          >
            {status === "loading" ? "Subscribing..." : "Subscribe Free"}
          </button>
        </div>
        {status === "error" && (
          <p className="text-red-600 text-sm mt-2 text-center">{message}</p>
        )}
        <p className="text-white text-sm mt-3 text-center">
          Join thousands of Fayette County residents. Free, weekly delivery.
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

  // Inline variant
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

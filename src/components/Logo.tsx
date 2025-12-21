import Link from "next/link";

interface LogoProps {
  variant?: "full" | "stacked" | "icon";
  className?: string;
}

export function Logo({ variant = "full", className = "" }: LogoProps) {
  if (variant === "icon") {
    return (
      <Link href="/" className={`block ${className}`}>
        <img
          src="/FF_Logo.JPG"
          alt="Fayette Flyer"
          className="w-40 h-40"
        />
      </Link>
    );
  }

  if (variant === "stacked") {
    return (
      <Link href="/" className={`flex flex-col items-center gap-2 ${className}`}>
        <img
          src="/FF_Logo.JPG"
          alt="Fayette Flyer"
          className="w-48 h-48"
        />
      </Link>
    );
  }

  // Full horizontal variant
  return (
    <Link href="/" className={`flex items-center gap-3 ${className}`}>
      <img
        src="/FF_Logo.JPG"
        alt="Fayette Flyer"
        className="w-20 h-20 sm:w-24 sm:h-24 md:w-30 md:h-30 shrink-0"
      />
    </Link>
  );
}

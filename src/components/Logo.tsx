import Link from "next/link";
import Image from "next/image";

interface LogoProps {
  variant?: "full" | "stacked" | "icon";
  className?: string;
}

export function Logo({ variant = "full", className = "" }: LogoProps) {
  if (variant === "icon") {
    return (
      <Link href="/" className={`block ${className}`}>
        <Image
          src="/FF_logo.svg"
          alt="Fayette Flyer"
          width={160}
          height={160}
          className="w-40 h-40"
        />
      </Link>
    );
  }

  if (variant === "stacked") {
    return (
      <Link href="/" className={`flex flex-col items-center gap-2 ${className}`}>
        <Image
          src="/FF_logo.svg"
          alt="Fayette Flyer"
          width={192}
          height={192}
          className="w-48 h-48"
        />
      </Link>
    );
  }

  // Full horizontal variant
  return (
    <Link href="/" className={`flex items-center gap-3 ${className}`}>
      <Image
        src="/FF_logo.svg"
        alt="Fayette Flyer"
        width={64}
        height={64}
        sizes="(max-width: 640px) 48px, (max-width: 768px) 56px, 64px"
        priority
        className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 flex-shrink-0"
      />
    </Link>
  );
}

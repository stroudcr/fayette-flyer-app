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
        width={120}
        height={120}
        sizes="(max-width: 640px) 80px, (max-width: 768px) 96px, 120px"
        priority
        className="w-20 h-20 sm:w-24 sm:h-24 md:w-30 md:h-30 shrink-0"
      />
    </Link>
  );
}

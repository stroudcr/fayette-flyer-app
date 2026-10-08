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
          src="/FF_Logo.JPG"
          alt="Fayette Flyer"
          width={1584}
          height={672}
          quality={75}
          sizes="160px"
          className="h-40 w-auto object-contain"
        />
      </Link>
    );
  }

  if (variant === "stacked") {
    return (
      <Link href="/" className={`flex flex-col items-center gap-2 ${className}`}>
        <Image
          src="/FF_Logo.JPG"
          alt="Fayette Flyer"
          width={1584}
          height={672}
          quality={75}
          sizes="192px"
          className="h-48 w-auto object-contain"
        />
      </Link>
    );
  }

  return (
    <Link
      href="/"
      className={`flex shrink-0 items-center rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold ${className}`}
    >
      <Image
        src="/fayette-flyer-navbar.webp"
        alt="Fayette Flyer"
        width={720}
        height={99}
        preload
        unoptimized
        className="h-auto w-[200px] sm:w-[240px]"
      />
    </Link>
  );
}

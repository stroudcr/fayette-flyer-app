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
    <Link href="/" className={`flex items-center gap-3 ${className}`}>
      <Image
        src="/FF_Logo.JPG"
        alt="Fayette Flyer"
        width={1584}
        height={672}
        quality={75}
        sizes="(max-width: 640px) 120px, (max-width: 768px) 140px, 160px"
        className="h-12 w-auto sm:h-14 md:h-15 object-contain shrink-0"
      />
    </Link>
  );
}

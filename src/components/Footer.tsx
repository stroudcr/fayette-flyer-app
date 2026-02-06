import Link from "next/link";
import Image from "next/image";
import { SITE_CONFIG } from "@/lib/seo/constants";
import { FacebookIcon, InstagramIcon } from "./Icons";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-navy text-white mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Brand column */}
          <div className="md:col-span-2">
            <div className="mb-3">
              <Link href="/">
                <Image
                  src="/Footer.JPEG"
                  alt="Fayette Flyer"
                  width={200}
                  height={80}
                  quality={75}
                  className="h-20 w-auto"
                />
              </Link>
            </div>
            <p className="text-gray-100 text-sm max-w-sm">
              Your trusted source for news and events in Fayette County, Georgia.
              Delivered weekly to your inbox.
            </p>
          </div>

          {/* Navigation column */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider mb-4 text-white">
              Navigation
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-100 hover:text-white text-sm transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/issues" className="text-gray-100 hover:text-white text-sm transition-colors">
                  Issues
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-100 hover:text-white text-sm transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/advertise" className="text-gray-100 hover:text-white text-sm transition-colors">
                  Advertise
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-100 hover:text-white text-sm transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal column */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider mb-4 text-white">
              Resources
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy" className="text-gray-100 hover:text-white text-sm transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-100 hover:text-white text-sm transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-6 border-t border-navy-dark">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-gray-200 text-sm">
              &copy; {currentYear} Fayette Flyer. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a
                href={SITE_CONFIG.social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-gold transition-colors"
                aria-label="Facebook"
              >
                <FacebookIcon />
              </a>
              <a
                href={SITE_CONFIG.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-gold transition-colors"
                aria-label="Instagram"
              >
                <InstagramIcon />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

import React, { useEffect, useState } from 'react';
import { Icons } from './Icons';

interface NavbarProps {
  cartCount: number;
  onOpenCart: () => void;
  onOpenStylist: () => void;
  onOpenTracker: () => void;
  onOpenCategorySidebar: () => void;
}

const Navbar: React.FC<NavbarProps> = ({
  cartCount,
  onOpenCart,
  onOpenStylist,
  onOpenTracker,
  onOpenCategorySidebar
}) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      aria-label="Main navigation"
      className={`fixed inset-x-0 top-0 z-50 border-b transition-all duration-300 ${
        scrolled
          ? 'border-stone-800/80 bg-stone-950/95 py-3 shadow-lg shadow-black/10 backdrop-blur-xl'
          : 'border-white/10 bg-stone-950/75 py-4 backdrop-blur-md'
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 sm:px-8">
        <div className="flex min-w-0 items-center gap-5">
          <button
            type="button"
            onClick={onOpenCategorySidebar}
            className="inline-flex items-center gap-2 text-xs font-medium tracking-wide text-stone-300 transition hover:text-amber-200"
            aria-label="Browse collections"
          >
            <Icons.Menu className="h-4 w-4" />
            <span className="hidden sm:inline">Collections</span>
          </button>

          <a href="#top" className="group flex min-w-0 items-center gap-2.5" aria-label="The Swat Loom home">
            <Icons.Mountain className="h-5 w-5 shrink-0 text-amber-500 transition-colors group-hover:text-amber-300" />
            <span className="truncate font-heading text-base font-semibold tracking-[0.16em] text-stone-100 sm:text-lg">
              THE SWAT LOOM
            </span>
          </a>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-4">
          <button
            type="button"
            onClick={onOpenTracker}
            className="hidden items-center gap-1.5 text-xs text-stone-400 transition hover:text-stone-100 sm:inline-flex"
            title="Track an order"
          >
            <Icons.Truck className="h-4 w-4" />
            <span>Track order</span>
          </button>

          <button
            type="button"
            onClick={onOpenStylist}
            className="hidden items-center gap-1.5 text-xs text-stone-400 transition hover:text-amber-200 md:inline-flex"
            title="Open AI Stylist"
          >
            <Icons.Sparkles className="h-4 w-4" />
            <span>AI Stylist</span>
          </button>

          <button
            type="button"
            onClick={onOpenCart}
            className="relative inline-flex h-9 w-9 items-center justify-center rounded-full text-stone-200 transition hover:bg-white/5 hover:text-amber-200"
            aria-label={`Open cart${cartCount ? `, ${cartCount} items` : ''}`}
            title="Shopping bag"
          >
            <Icons.Bag className="h-[18px] w-[18px]" />
            {cartCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-600 px-1 text-[9px] font-semibold leading-none text-white">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

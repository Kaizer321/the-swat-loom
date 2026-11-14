import React, { useEffect, useState } from 'react';
import { Icons } from './Icons';
import { Product } from '../types';

type Gender = 'all' | 'men' | 'women';

interface CategorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCategory: string;
  selectedGender: Gender;
  onSelectCategory: (category: string, gender: Gender) => void;
  products: Product[];
  categories: string[];
}

const CATEGORY_LABELS: Record<string, string> = {
  'Mens Shawls': "Men's Shawls"
};

export const CategorySidebar: React.FC<CategorySidebarProps> = ({
  isOpen,
  onClose,
  selectedCategory,
  selectedGender,
  onSelectCategory,
  products,
  categories: categoryNames
}) => {
  const [activeTab, setActiveTab] = useState<Gender>(selectedGender);

  useEffect(() => {
    if (selectedGender !== 'all') setActiveTab(selectedGender);
    else setActiveTab('all');
  }, [selectedGender]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const visibleProducts = products.filter(product =>
    activeTab === 'all' || product.gender === activeTab || product.gender === 'unisex'
  );

  const handleSelect = (category: string) => {
    onSelectCategory(category, activeTab);
    onClose();
    window.setTimeout(() => {
      document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  };

  if (!isOpen) return null;

  const categories = ['New Arrivals', ...categoryNames];

  return (
    <div className="fixed inset-0 z-[80] flex justify-start" role="presentation">
      <button
        type="button"
        aria-label="Close collections menu"
        onClick={onClose}
        className="absolute inset-0 bg-black/65 backdrop-blur-[2px]"
      />

      <aside
        aria-label="Shop collections"
        aria-modal="true"
        role="dialog"
        className="relative z-10 flex h-full w-[min(88vw,380px)] flex-col border-r border-stone-800/80 bg-stone-950 text-stone-200 shadow-2xl shadow-black/40 animate-slide-in-right"
      >
        <header className="flex items-center justify-between border-b border-stone-800/80 px-6 py-5">
          <div>
            <p className="mb-1 text-[10px] font-medium uppercase tracking-[0.22em] text-stone-500">The Swat Loom</p>
            <h2 className="font-heading text-xl font-medium tracking-wide text-stone-100">Collections</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full text-stone-400 transition hover:bg-white/5 hover:text-white"
            aria-label="Close menu"
          >
            <Icons.Close className="h-5 w-5" />
          </button>
        </header>

        <div className="border-b border-stone-800/80 px-6 py-4">
          <div className="grid grid-cols-3 rounded-full bg-stone-900 p-1 text-xs">
            {([
              ['all', 'All'],
              ['women', 'Women'],
              ['men', 'Men']
            ] as [Gender, string][]).map(([value, label]) => (
              <button
                type="button"
                key={value}
                onClick={() => setActiveTab(value)}
                className={`rounded-full px-3 py-2 transition ${
                  activeTab === value
                    ? 'bg-stone-700 text-stone-50 shadow-sm'
                    : 'text-stone-500 hover:text-stone-200'
                }`}
                aria-pressed={activeTab === value}
              >
                {label}
              </button>
            ))}
          </div>
          <p className="mt-3 text-xs text-stone-500">
            {visibleProducts.length} {visibleProducts.length === 1 ? 'piece' : 'pieces'} available
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.2em] text-stone-500">Shop by category</p>
          <div className="divide-y divide-stone-800/70">
            <button
              type="button"
              onClick={() => handleSelect('All')}
              className={`flex w-full items-center justify-between py-3.5 text-left text-sm transition ${
                selectedCategory === 'All' ? 'text-amber-200' : 'text-stone-300 hover:text-white'
              }`}
            >
              <span>All collections</span>
              <span className="text-xs tabular-nums text-stone-600">{visibleProducts.length}</span>
            </button>

            {categories.map(category => {
              const count = visibleProducts.filter(product => category === 'New Arrivals' ? Boolean(product.isNewArrival) : product.category === category).length;
              const selected = selectedCategory === category;
              return (
                <button
                  type="button"
                  key={category}
                  onClick={() => handleSelect(category)}
                  className={`group flex w-full items-center justify-between py-3.5 text-left text-sm transition ${
                    selected ? 'text-amber-200' : 'text-stone-300 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <span className={`h-1.5 w-1.5 rounded-full transition-colors ${
                      selected ? 'bg-amber-400' : 'bg-transparent group-hover:bg-stone-500'
                    }`} />
                    {CATEGORY_LABELS[category] || category}
                  </span>
                  <span className={`text-xs tabular-nums ${selected ? 'text-amber-400/80' : 'text-stone-600'}`}>{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        <footer className="border-t border-stone-800/80 px-6 py-4">
          <button
            type="button"
            onClick={() => handleSelect('All')}
            className="w-full rounded-full border border-stone-700 px-4 py-3 text-xs font-medium tracking-wide text-stone-200 transition hover:border-stone-500 hover:bg-white/5"
          >
            View all pieces
          </button>
        </footer>
      </aside>
    </div>
  );
};

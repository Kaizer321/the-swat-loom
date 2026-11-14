import React, { useState, useMemo, useEffect } from 'react';
import { Product } from '../types';
import ProductCard from './ProductCard';
import { Icons } from './Icons';

interface ProductGridProps {
  products: Product[];
  categories: string[];
  onAddToCart: (product: Product) => void;
  onViewDetails: (product: Product) => void;
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  selectedGender: 'all' | 'men' | 'women';
  onSelectGender: (gender: 'all' | 'men' | 'women') => void;
  onOpenSidebar: () => void;
}

type SortOption = 'featured' | 'price-asc' | 'price-desc';

const ProductGrid: React.FC<ProductGridProps> = ({ 
  products,
  categories,
  onAddToCart, 
  onViewDetails,
  selectedCategory,
  onSelectCategory,
  selectedGender,
  onSelectGender,
  onOpenSidebar
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>('featured');
  const [visibleCount, setVisibleCount] = useState(12);

  // Reset visible count when filters change
  useEffect(() => {
    setVisibleCount(12);
  }, [selectedCategory, selectedGender, searchQuery, sortOption]);

  const filteredAndSortedProducts = useMemo(() => {
    let result = products;

    // 1. Filter by Gender
    if (selectedGender !== 'all') {
      result = result.filter(p => p.gender === selectedGender || p.gender === 'unisex');
    }

    // 2. Filter by Category
    if (selectedCategory === 'New Arrivals') {
      result = result.filter(p => Boolean(p.isNewArrival));
    } else if (selectedCategory !== "All") {
      result = result.filter(p => p.category === selectedCategory);
    }

    // 3. Filter by Search Query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.material.toLowerCase().includes(query) ||
        p.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // 4. Sort
    if (sortOption === 'price-asc') {
      result = [...result].sort((a, b) => (a.salePrice && a.salePrice < a.price ? a.salePrice : a.price) - (b.salePrice && b.salePrice < b.price ? b.salePrice : b.price));
    } else if (sortOption === 'price-desc') {
      result = [...result].sort((a, b) => (b.salePrice && b.salePrice < b.price ? b.salePrice : b.price) - (a.salePrice && a.salePrice < a.price ? a.salePrice : a.price));
    }

    return result;
  }, [products, selectedCategory, selectedGender, searchQuery, sortOption]);

  const visibleProducts = filteredAndSortedProducts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredAndSortedProducts.length;

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 12);
  };

  return (
    <section id="collection" className="py-20 bg-stone-950 relative min-h-screen border-t border-stone-850">
      <div className="container mx-auto px-6 relative z-10">
        
        {/* Editorial Section Header */}
        <div className="flex flex-col items-center mb-12 text-center">
          <div className="text-stone-500 text-[10px] font-mono uppercase tracking-[0.28em] mb-4">
            The Swat Loom · Hand-finished in Swat
          </div>
          
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl text-stone-100 tracking-tight font-medium mb-3">
            Our Collection
          </h2>
          
          <p className="font-body text-stone-400 text-sm max-w-lg leading-relaxed">
            Thoughtfully selected shawls, woven with care and made to be treasured.
          </p>

          {/* Gender Segmented Filter (Minimalist Anti-Pill Switch) */}
          <div className="flex items-center gap-1 mt-8 p-1 border border-stone-800 bg-stone-900/60 rounded-lg text-xs font-mono uppercase tracking-wider">
            <button
              onClick={() => onSelectGender('all')}
              className={`px-4 py-2 rounded-md transition-all ${
                selectedGender === 'all'
                  ? 'bg-stone-800 text-amber-300 font-bold'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              All Pieces
            </button>
            <button
              onClick={() => onSelectGender('women')}
              className={`px-4 py-2 rounded-md transition-all ${
                selectedGender === 'women'
                  ? 'bg-stone-800 text-amber-300 font-bold'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Women’s Collection
            </button>
            <button
              onClick={() => onSelectGender('men')}
              className={`px-4 py-2 rounded-md transition-all ${
                selectedGender === 'men'
                  ? 'bg-stone-800 text-amber-300 font-bold'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Men’s Chadars
            </button>
          </div>

          {/* Search, Sort & Sidebar Drawer Trigger */}
          <div className="w-full max-w-4xl mt-8 flex flex-col md:flex-row gap-3 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Icons.Search className="h-4 w-4 text-stone-500" />
              </div>
              <input
                type="text"
                className="w-full pl-10 pr-4 py-2.5 border border-stone-800 bg-stone-900/40 text-stone-200 placeholder-stone-600 focus:outline-none focus:border-amber-700 transition-colors text-xs font-mono rounded-lg"
                placeholder="Search weave, fabric, or motif..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2.5 w-full md:w-auto">
              {/* Category Drawer Trigger Button */}
              <button
                onClick={onOpenSidebar}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-3.5 py-2.5 border border-stone-800 hover:border-amber-700/70 bg-stone-900/60 hover:bg-stone-800/80 text-stone-300 text-xs font-mono uppercase tracking-wider rounded-lg transition-colors"
                title="Open Category Navigation Drawer"
              >
                <Icons.Layers className="w-3.5 h-3.5 text-amber-500" />
                <span>Categories</span>
              </button>

              {/* Sort Selector */}
              <div className="relative flex-1 md:flex-none">
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value as SortOption)}
                  className="w-full md:w-44 appearance-none bg-stone-900/60 border border-stone-800 text-stone-300 py-2.5 px-3.5 pr-8 rounded-lg focus:outline-none focus:border-amber-700 text-xs font-mono uppercase tracking-wider cursor-pointer"
                >
                  <option value="featured">Featured First</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-stone-500">
                  <Icons.ArrowRight className="h-3 w-3 rotate-90" />
                </div>
              </div>
            </div>
          </div>

          {/* Category Horizontal Filter Tags */}
          <div className="w-full overflow-x-auto pb-2 mt-6 flex justify-start md:justify-center custom-scrollbar">
            <div className="flex items-center gap-1.5">
              {['All', 'New Arrivals', ...categories].map(cat => (
                <button
                  key={cat}
                  onClick={() => onSelectCategory(cat)}
                  className={`whitespace-nowrap px-3.5 py-1.5 text-[11px] font-mono uppercase tracking-wider transition-all border rounded-md ${
                    selectedCategory === cat
                      ? 'text-amber-300 border-amber-800/80 bg-amber-950/40'
                      : 'text-stone-400 border-stone-800/60 hover:text-stone-200 hover:border-stone-700 bg-stone-900/20'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Collection Tiles Grid */}
        {visibleProducts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in">
              {visibleProducts.map((product) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  onAddToCart={onAddToCart}
                  onViewDetails={onViewDetails}
                />
              ))}
            </div>

            {/* Load More Action */}
            {hasMore && (
              <div className="mt-14 flex flex-col items-center justify-center gap-3">
                <button 
                  onClick={handleLoadMore}
                  className="px-8 py-3 border border-stone-800 hover:border-amber-700 bg-stone-900/40 text-stone-300 hover:text-white uppercase tracking-[0.2em] text-xs font-mono transition-all rounded-lg"
                >
                  Load More Pieces
                </button>
                <span className="text-stone-500 text-[11px] font-mono tracking-widest">
                  Showing {visibleProducts.length} of {filteredAndSortedProducts.length} Pieces
                </span>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-stone-500 border border-stone-850 rounded-xl bg-stone-900/20 max-w-lg mx-auto">
             <Icons.Search className="w-10 h-10 opacity-30 mb-3 text-amber-500" />
             <p className="font-heading text-lg mb-1 text-stone-300">No matching shawls found</p>
             <p className="font-body text-xs text-stone-500 text-center px-4">
               Try clearing filters or search term to see all available weaves.
             </p>
             <button 
               onClick={() => {
                 setSearchQuery(''); 
                 onSelectCategory('All');
                 onSelectGender('all');
               }}
               className="mt-4 px-4 py-2 border border-stone-700 hover:border-amber-600 rounded text-xs font-mono uppercase tracking-wider text-amber-400 hover:text-white transition-colors"
             >
               Reset Filters
             </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductGrid;
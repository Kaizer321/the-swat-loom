import React from 'react';
import { Product } from '../types';
import { Icons } from './Icons';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onViewDetails: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart, onViewDetails }) => {
  const [currentImageIdx, setCurrentImageIdx] = React.useState(0);

  // Combine main image and gallery images
  const allImages = React.useMemo(() => {
    const list = product.images && product.images.length > 0 ? product.images : [product.image];
    if (!list.includes(product.image)) return [product.image, ...list];
    return list;
  }, [product]);

  const isNewArrival = Boolean(product.isNewArrival);
  const hasDiscount = Boolean(product.salePrice && product.salePrice > 0 && product.salePrice < product.price);

  const activeImage = allImages[currentImageIdx] || product.image;

  return (
    <div className="group relative bg-stone-950 border border-stone-800/80 overflow-hidden transition-all duration-300 hover:border-amber-700/60 flex flex-col h-full">
      
      {/* Image Section with Slide Navigation */}
      <div className="relative aspect-[3/4] overflow-hidden cursor-pointer bg-stone-900" onClick={() => onViewDetails(product)}>
        <img 
          src={activeImage} 
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent opacity-40 group-hover:opacity-20 transition-opacity" />
        
        {/* Minimalist Top Meta (Unboxed) */}
        <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-none">
          {isNewArrival ? (
            <span className="text-[10px] font-mono tracking-widest uppercase text-amber-300 bg-stone-950/80 px-2 py-0.5 border border-stone-800 backdrop-blur-sm">
              New Loom
            </span>
          ) : (
            <span className="text-[10px] font-mono tracking-widest uppercase text-stone-400 bg-stone-950/80 px-2 py-0.5 border border-stone-850 backdrop-blur-sm">
              {product.gender === 'men' ? "Men's" : product.gender === 'women' ? "Women's" : "Unisex"}
            </span>
          )}

          {/* Slide dots indicator */}
          {allImages.length > 1 && (
            <div className="flex items-center gap-1 bg-stone-950/80 backdrop-blur-sm px-2 py-1 border border-stone-800">
              {allImages.map((_, dotIdx) => (
                <span
                  key={dotIdx}
                  className={`w-1 h-1 rounded-full transition-all ${
                    dotIdx === currentImageIdx ? 'bg-amber-400 w-2.5' : 'bg-stone-500 opacity-50'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Multi-Photo Slide Arrows (Subtle) */}
        {allImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setCurrentImageIdx(prev => (prev === 0 ? allImages.length - 1 : prev - 1));
              }}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-stone-950/80 hover:bg-stone-900 text-stone-300 hover:text-amber-400 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 border border-stone-800 shadow-sm"
              title="Previous photo"
            >
              <Icons.ArrowRight className="w-3.5 h-3.5 rotate-180" />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setCurrentImageIdx(prev => (prev === allImages.length - 1 ? 0 : prev + 1));
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-stone-950/80 hover:bg-stone-900 text-stone-300 hover:text-amber-400 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 border border-stone-800 shadow-sm"
              title="Next photo"
            >
              <Icons.ArrowRight className="w-3.5 h-3.5" />
            </button>
          </>
        )}

        {/* Quick View Prompt */}
        <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex justify-center z-10 bg-stone-950/90 backdrop-blur border-t border-stone-800">
          <span className="text-stone-300 font-mono text-[11px] uppercase tracking-widest flex items-center gap-1.5">
            <Icons.Search className="w-3 h-3 text-amber-500" />
            Inspect Weave
          </span>
        </div>
      </div>

      {/* Info Section */}
      <div className="p-5 flex-1 flex flex-col justify-between bg-stone-950">
        <div>
          <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-widest text-stone-500 mb-1.5">
            <span>{product.material.split(' ')[0]} · {product.category}</span>
            <span className="text-right">{hasDiscount && <span className="block text-[10px] text-stone-500 line-through">Rs. {product.price.toLocaleString("en-PK")}</span>}<span className={hasDiscount ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>Rs. {(hasDiscount ? product.salePrice! : product.price).toLocaleString("en-PK")}</span></span>
          </div>

          <h3 
            onClick={() => onViewDetails(product)}
            className="font-heading text-lg text-stone-200 group-hover:text-amber-200 transition-colors cursor-pointer line-clamp-1"
          >
            {product.name}
          </h3>
          
          <p className="text-stone-400 text-xs line-clamp-2 font-body mt-1.5 mb-4 leading-relaxed">
            {product.description}
          </p>
        </div>

        <div>
          {/* Subtle color indicators */}
          {product.colors && product.colors.length > 0 && (
            <div className="flex items-center gap-1.5 mb-3.5">
              {product.colors.slice(0, 4).map((color, idx) => (
                <div 
                  key={idx} 
                  className="w-2.5 h-2.5 rounded-full border border-stone-700/80" 
                  style={{ backgroundColor: color }} 
                  title={`Color swatch`}
                />
              ))}
              {product.colors.length > 4 && (
                <span className="text-[10px] text-stone-500 font-mono">+{product.colors.length - 4}</span>
              )}
            </div>
          )}

          <button 
            onClick={() => onAddToCart(product)}
            className="w-full py-2.5 px-4 border border-stone-800 hover:border-amber-700/80 bg-stone-900/40 hover:bg-amber-950/30 text-stone-300 hover:text-amber-200 text-xs font-mono uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2"
          >
            <Icons.Bag className="w-3.5 h-3.5 text-amber-500" />
            Add to Loom
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
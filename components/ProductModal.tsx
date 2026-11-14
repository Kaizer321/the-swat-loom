import React, { useState, MouseEvent, useEffect } from 'react';
import { Product } from '../types';
import { Icons } from './Icons';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
}

const ProductModal: React.FC<ProductModalProps> = ({ product, onClose, onAddToCart }) => {
  const [zoomProps, setZoomProps] = useState({ x: 0, y: 0, show: false });
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState<string>('');

  // Combine main image and gallery images
  const allImages = React.useMemo(() => {
      if (!product) return [];
      const imgs = product.images && product.images.length > 0 ? product.images : [product.image];
      // Ensure main image is first if not already in list (legacy support)
      if (!imgs.includes(product.image)) return [product.image, ...imgs];
      return imgs;
  }, [product]);

  useEffect(() => {
    if (product) {
      setActiveImage(product.image);
      if (product.colors.length > 0) {
        setSelectedColor(product.colors[0]);
      }
    }
  }, [product]);

  if (!product) return null;

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomProps({ x, y, show: true });
  };

  const handleMouseLeave = () => {
    setZoomProps({ ...zoomProps, show: false });
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose}></div>
      
      <div className="relative bg-stone-900 w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-none md:rounded-lg shadow-2xl grid grid-cols-1 md:grid-cols-2 animate-scale-up border border-stone-700">
        <button onClick={onClose} className="absolute top-4 right-4 z-10 bg-black/50 p-2 rounded-full text-white hover:bg-amber-600 transition-colors">
          <Icons.Close className="w-6 h-6" />
        </button>

        {/* Image Side with Gallery Slides */}
        <div className="h-[50vh] md:h-full flex flex-col bg-stone-925">
          <div 
            className="relative flex-1 overflow-hidden cursor-crosshair group"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <img 
              src={activeImage} 
              alt={product.name} 
              className={`w-full h-full object-cover transition-transform duration-100 ease-out ${zoomProps.show ? 'scale-[2]' : 'scale-100'}`}
              style={{
                transformOrigin: `${zoomProps.x}% ${zoomProps.y}%`
              }}
            />
            <div className={`absolute inset-0 bg-gradient-to-b from-transparent to-stone-900/90 md:bg-gradient-to-r md:from-transparent md:to-stone-900/50 pointer-events-none transition-opacity duration-300 ${zoomProps.show ? 'opacity-0' : 'opacity-100'}`} />
            
            {/* Slide Arrows for Multi-Photo Browsing */}
            {allImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    const currentIdx = allImages.indexOf(activeImage);
                    const prevIdx = currentIdx <= 0 ? allImages.length - 1 : currentIdx - 1;
                    setActiveImage(allImages[prevIdx]);
                  }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 border border-stone-700 hover:border-amber-500"
                  title="Previous Photo"
                >
                  <Icons.ArrowRight className="w-4 h-4 rotate-180" />
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    const currentIdx = allImages.indexOf(activeImage);
                    const nextIdx = currentIdx >= allImages.length - 1 ? 0 : currentIdx + 1;
                    setActiveImage(allImages[nextIdx]);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 border border-stone-700 hover:border-amber-500"
                  title="Next Photo"
                >
                  <Icons.ArrowRight className="w-4 h-4" />
                </button>
              </>
            )}

            {/* Slide Counter Badge */}
            {allImages.length > 1 && (
              <div className="absolute top-4 left-4 bg-black/70 backdrop-blur px-3 py-1 rounded-full text-[11px] font-mono text-stone-300 z-10 border border-stone-800">
                Photo {Math.max(1, allImages.indexOf(activeImage) + 1)} / {allImages.length}
              </div>
            )}

            {/* Zoom Hint */}
            <div className={`absolute bottom-4 left-4 bg-black/60 backdrop-blur px-4 py-2 rounded-full text-xs text-stone-300 flex items-center gap-2 transition-opacity duration-300 ${zoomProps.show ? 'opacity-0' : 'opacity-100'}`}>
              <Icons.Search className="w-3 h-3" />
              <span>Hover to Magnify</span>
            </div>
          </div>

          {/* Gallery Thumbnails */}
          {allImages.length > 1 && (
            <div className="flex gap-2 p-4 overflow-x-auto bg-stone-950 border-t border-stone-800">
              {allImages.map((img, idx) => (
                <button 
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`relative w-16 h-16 flex-shrink-0 rounded-lg border-2 overflow-hidden transition-all ${activeImage === img ? 'border-amber-500 opacity-100 shadow-md shadow-amber-900/50 scale-105' : 'border-stone-800 opacity-60 hover:opacity-100'}`}
                >
                  <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info Side */}
        <div className="p-8 md:p-12 flex flex-col justify-center bg-stone-900">
          <div className="mb-6">
            <span className="text-amber-500 font-mono uppercase tracking-[0.25em] text-[10px] block mb-1">
              Authentic Islampur Weave · Swat Valley
            </span>
            <h2 className="font-heading text-2xl md:text-4xl text-stone-100 mb-3 leading-tight font-medium">
              {product.name}
            </h2>
            <div className="flex flex-wrap items-center gap-2 mb-4 text-[11px] font-mono text-stone-400">
              {product.tags.map((tag, idx) => (
                <span key={tag} className="flex items-center gap-1.5">
                  <span className="text-stone-300">{tag}</span>
                  {idx < product.tags.length - 1 && <span className="text-stone-600">·</span>}
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-6 mb-8">
            <p className="font-accent text-lg text-stone-300 italic leading-relaxed border-l-2 border-amber-700 pl-4">
              "{product.longDescription}"
            </p>
            
            <div className="grid grid-cols-2 gap-4 text-sm text-stone-400 font-body">
              <div>
                <span className="block text-stone-600 uppercase text-xs mb-1">Material</span>
                {product.material}
              </div>
              <div>
                <span className="block text-stone-600 uppercase text-xs mb-1">Origin</span>
                Swat Valley, Pakistan
              </div>
            </div>

            {/* Color Selection */}
            <div>
              <span className="block text-stone-600 uppercase text-xs mb-3">Available Colors</span>
              <div className="flex flex-wrap gap-3">
                {product.colors.map((color, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedColor(color)}
                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                      selectedColor === color ? 'border-amber-500 scale-110' : 'border-stone-600 hover:border-stone-400'
                    }`}
                    style={{ backgroundColor: color }}
                    aria-label={`Select color`}
                  >
                    {selectedColor === color && (
                      <div className="w-2 h-2 bg-white rounded-full shadow-sm" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-6 border-t border-stone-800">
            <div className="flex items-baseline gap-3"><span className="font-heading text-3xl text-white">Rs. {(product.salePrice && product.salePrice > 0 && product.salePrice < product.price ? product.salePrice : product.price).toLocaleString("en-PK")}</span>{product.salePrice && product.salePrice > 0 && product.salePrice < product.price && <span className="text-stone-500 line-through">Rs. {product.price.toLocaleString("en-PK")}</span>}</div>
            <button 
              onClick={() => {
                onAddToCart({ ...product, tags: [...product.tags, `Color: ${selectedColor}`] });
                onClose();
              }}
              className="px-8 py-4 bg-amber-700 hover:bg-amber-600 text-white font-bold tracking-widest transition-colors shadow-lg shadow-amber-900/20"
            >
              ADD TO LOOM
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
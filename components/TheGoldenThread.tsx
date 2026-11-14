import React, { useState, useEffect } from 'react';
import { Icons } from './Icons';
import { Product } from '../types';

const DAILY_DROP_IMAGES = [
  '/assets/aistudio/Pashmina_shawl_available__Shwal_6e849720.jfif', // Royal Crimson Pashmina with gold zari
  '/assets/aistudio/download_abc5126d.jfif', // Bagh-e-Gandhara mosaic heirloom
  '/assets/aistudio/1pc_Women_s_Autumn_Winter_Faux_Cashmere_Embroidered_Scarf__Thick_Warm_Tasseled_Embroidered_Bohemian_Style_Travel_Shawl_Ponchoscarfs_2846aa22.jfif' // Embroidered cashmere with tassels
];

// High-value exclusive heirloom item
const DAILY_DROP: Product = {
  id: 'golden-thread-1',
  name: 'The Royal Durbar Zari Pashmina',
  price: 890,
  category: 'Pashmina',
  image: DAILY_DROP_IMAGES[0],
  images: DAILY_DROP_IMAGES,
  description: 'A singular royal masterpiece draped with ripples of pure Pashmina cashmere and an unbroken antique gold tilla border.',
  longDescription: 'Woven with certified pure Himalayan cashmere and interwoven with genuine gold zari thread along the borders. Only one unit released from the Islampur master archive.',
  material: '100% Pashmina with Antique Gold Zari',
  tags: ['Vault Exclusive', '1 of 1', 'Masterpiece', 'Featured'],
  colors: ['#881337', '#d4af37', '#1c1917']
};

const TheGoldenThread: React.FC<{ onAddToCart: (p: Product) => void }> = ({ onAddToCart }) => {
  const [timeLeft, setTimeLeft] = useState(14400); // 4 hours in seconds
  const [isRevealed, setIsRevealed] = useState(false);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <section className="py-16 bg-stone-950 border-y border-stone-850 relative overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col items-center text-center mb-10">
          <div className="inline-flex items-center gap-2 text-amber-500 text-xs font-mono uppercase tracking-[0.25em] mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Archive Vault Exclusive
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl text-stone-100 font-medium mb-2">
            The Daily Heirloom Release
          </h2>
          <p className="font-body text-stone-400 text-xs sm:text-sm max-w-lg mx-auto">
            A singular pure Pashmina weave curated directly from the master weaver’s loom in Islampur.
          </p>
        </div>

        <div className="max-w-5xl mx-auto bg-stone-900/50 border border-amber-900/30 p-1 rounded-2xl overflow-hidden">
          <div className="bg-stone-950 rounded-xl border border-stone-800 p-8 md:p-12 relative flex flex-col md:flex-row gap-12 items-center">
            
            {/* Mystery/Image Side with Slides */}
            <div className="w-full md:w-1/2 flex flex-col gap-3">
              <div className="relative aspect-square rounded-xl overflow-hidden border border-stone-800 bg-stone-900 group">
                {!isRevealed ? (
                  <div 
                    className="absolute inset-0 bg-stone-900 z-20 flex flex-col items-center justify-center cursor-pointer transition-colors hover:bg-stone-850"
                    onClick={() => setIsRevealed(true)}
                  >
                    <Icons.Wind className="w-16 h-16 text-stone-600 mb-4 animate-pulse" />
                    <span className="font-heading text-2xl text-stone-300 tracking-widest">CLICK TO REVEAL</span>
                    <span className="text-xs text-amber-700 mt-2 uppercase tracking-[0.2em]">Restricted Access</span>
                  </div>
                ) : (
                  <div className="relative h-full w-full overflow-hidden animate-fade-in">
                    <img 
                      src={DAILY_DROP_IMAGES[activePhotoIdx]} 
                      alt={`Daily Drop Angle ${activePhotoIdx + 1}`} 
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" 
                    />
                    <div className="absolute top-4 right-4 bg-amber-600 text-white text-xs font-bold px-3 py-1 uppercase tracking-widest shadow-md">
                      1 of 1
                    </div>
                    <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur px-3 py-1 rounded-full text-[11px] font-mono text-stone-300 border border-stone-800">
                      Angle 0{activePhotoIdx + 1} / 0{DAILY_DROP_IMAGES.length}
                    </div>
                  </div>
                )}
              </div>

              {/* Photo Angle Thumbnails */}
              {isRevealed && (
                <div className="flex gap-2 justify-center animate-fade-in">
                  {DAILY_DROP_IMAGES.map((imgUrl, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActivePhotoIdx(idx)}
                      className={`relative w-16 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                        activePhotoIdx === idx
                          ? 'border-amber-500 scale-105 shadow-md shadow-amber-900/40'
                          : 'border-stone-800 opacity-60 hover:opacity-100'
                      }`}
                      title={`Inspect angle ${idx + 1}`}
                    >
                      <img src={imgUrl} alt={`Angle ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info Side */}
            <div className="w-full md:w-1/2 flex flex-col justify-center text-left">
              <div className="flex items-center gap-4 mb-6">
                 <div className="flex flex-col">
                   <span className="text-[10px] uppercase text-stone-500 tracking-widest">Time Remaining</span>
                   <span className="font-mono text-2xl text-amber-500 font-bold">{formatTime(timeLeft)}</span>
                 </div>
                 <div className="h-8 w-[1px] bg-stone-700"></div>
                 <div className="flex flex-col">
                   <span className="text-[10px] uppercase text-stone-500 tracking-widest">Current Bid</span>
                   <span className="font-mono text-2xl text-stone-300 font-bold">Fixed Price</span>
                 </div>
              </div>

              <h3 className={`font-heading text-3xl text-white mb-4 transition-all duration-500 ${isRevealed ? 'blur-0' : 'blur-md select-none'}`}>
                {isRevealed ? DAILY_DROP.name : 'The Hidden Heirloom'}
              </h3>
              
              <p className={`font-accent text-stone-400 italic mb-8 transition-all duration-500 ${isRevealed ? 'blur-0' : 'blur-sm select-none'}`}>
                {isRevealed ? DAILY_DROP.description : 'Hidden in the mists of the valley, this piece features patterns lost to time...'}
              </p>

              <div className="flex gap-4 mt-auto">
                <button 
                  disabled={!isRevealed}
                  onClick={() => onAddToCart(DAILY_DROP)}
                  className={`flex-1 py-4 font-bold uppercase tracking-widest transition-all duration-300 ${
                    isRevealed 
                    ? 'bg-gradient-to-r from-amber-700 to-amber-600 text-white hover:shadow-[0_0_20px_rgba(217,119,6,0.4)]' 
                    : 'bg-stone-800 text-stone-600 cursor-not-allowed'
                  }`}
                >
                  {isRevealed ? `Claim for Rs. ${DAILY_DROP.price.toLocaleString("en-PK")}` : 'Reveal to Purchase'}
                </button>
              </div>
              
              {!isRevealed && (
                <p className="text-xs text-stone-600 mt-4 text-center md:text-left">
                  *Only one unit available worldwide.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TheGoldenThread;
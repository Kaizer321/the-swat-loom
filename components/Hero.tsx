import React, { useState, useEffect } from 'react';
import { Icons } from './Icons';

interface HeroSlide {
  url: string;
  title: string;
  subtitle: string;
  tag: string;
  location: string;
}

const HERO_SLIDES: HeroSlide[] = [
  {
    url: "/assets/aistudio/Islampur_velly_14d0c52a.jfif",
    title: "Islampur Valley: Cradle of the Loom",
    subtitle: "The village of master weavers nestled beneath the snow-crowned peaks of Swat",
    tag: "Village of Weavers",
    location: "Islampur Valley, Swat"
  },
  {
    url: "/assets/aistudio/Pashmina_shawl_available__Shwal_6e849720.jfif",
    title: "Durbar Crimson Zari Pashmina",
    subtitle: "100% Pure featherlight Pashmina with antique gold needlework",
    tag: "Imperial Heritage",
    location: "Islampur Royal Atelier"
  },
  {
    url: "/assets/aistudio/Top_10_beautiful_Places_of_Malam_Jabba_de86f875.jfif",
    title: "Malam Jabba Snow Peaks",
    subtitle: "Pine forests and snowy slopes where pure highland wool withstands the mountain frost",
    tag: "Malam Jabba",
    location: "Malam Jabba, Swat"
  },
  {
    url: "/assets/aistudio/Saidu_sharif_ea5cdb22.jfif",
    title: "Saidu Sharif Royal Heritage",
    subtitle: "The historic capital of Swat and royal landmark of princely artisanal heritage",
    tag: "Royal Capital",
    location: "Saidu Sharif, Swat"
  },
  {
    url: "/assets/aistudio/The_White_Palace_of_Marghazar_Swat_Valley_b8efad8c.jfif",
    title: "The White Palace of Marghazar",
    subtitle: "Historic white marble summer retreat of the Wali of Swat amidst lush valleys",
    tag: "White Palace",
    location: "White Palace, Marghazar, Swat Valley"
  },
  {
    url: "/assets/aistudio/Klama_bazar_6355702f.jfif",
    title: "Kalam Handloom Shawl Bazaar",
    subtitle: "The vibrant mountain market overflowing with authentic handwoven Islampuri shawls",
    tag: "Shawl Bazaar",
    location: "Kalam Bazaar, Swat"
  },
  {
    url: "/assets/aistudio/elum_4ab1b48c.jfif",
    title: "Koh-e-Elum Sacred Valley",
    subtitle: "Misty terraced hillsides and emerald pine roads winding through the Hindu Kush",
    tag: "Mount Elum",
    location: "Mount Elum, Swat"
  },
  {
    url: "/assets/aistudio/Islampur_velly_14d0c52a.jfif",
    title: "The Ancestral Village of Islampur",
    subtitle: "Over 2,400 warp threads hand-tensioned on wooden pit-looms passed down through generations",
    tag: "Ancestral Weaving",
    location: "Islampur Valley, Swat"
  }
];

interface HeroProps {
  onOpenTracker?: () => void;
}

const Hero: React.FC<HeroProps> = ({ onOpenTracker }) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCurrentSlideIndex((prevIndex) => (prevIndex + 1) % HERO_SLIDES.length);
    }, 5500); // Change slide every 5.5 seconds

    return () => clearInterval(interval);
  }, [isPlaying]);

  const handlePrev = () => {
    setCurrentSlideIndex((prev) => (prev === 0 ? HERO_SLIDES.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentSlideIndex((prev) => (prev + 1) % HERO_SLIDES.length);
  };

  const currentSlide = HERO_SLIDES[currentSlideIndex];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Slideshow Backgrounds with Ken Burns animation */}
      {HERO_SLIDES.map((slide, index) => (
        <div 
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentSlideIndex ? 'opacity-100 z-0' : 'opacity-0 -z-10 pointer-events-none'
          }`}
        >
          <img 
            src={slide.url} 
            alt={slide.title} 
            className="w-full h-full object-cover grayscale-0 contrast-105 scale-105 transition-transform duration-[10000ms] ease-out" 
            style={{ transform: index === currentSlideIndex ? 'scale(1.12)' : 'scale(1.0)' }}
          />
          {/* Multi-layered cinematic vignette overlays */}
          <div className="absolute inset-0 bg-gradient-to-b from-stone-950/80 via-stone-950/45 to-stone-950" />
          <div className="absolute inset-0 bg-radial-vignette opacity-50" />
        </div>
      ))}

      {/* Main Hero Center Content */}
      <div className="relative z-10 container mx-auto px-6 text-center pt-24 pb-28">
        <div className="animate-fade-in-up max-w-3xl mx-auto">
          
          {/* Minimalist Top Location Kicker */}
          <div className="inline-flex items-center gap-2 mb-6 text-amber-400 text-xs font-mono uppercase tracking-[0.3em]">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span>{currentSlide.tag}</span>
            <span className="text-stone-600">·</span>
            <span className="text-stone-400 font-mono">0{currentSlideIndex + 1} / 0{HERO_SLIDES.length}</span>
          </div>
          
          <h1 className="font-heading text-4xl sm:text-6xl md:text-7xl font-medium text-stone-100 mb-6 leading-[1.1] tracking-tight">
            Threads of the <br/>
            <span className="text-amber-200">
              Hindu Kush
            </span>
          </h1>

          <p className="font-accent text-base sm:text-xl text-stone-300 max-w-xl mx-auto mb-4 italic leading-relaxed">
            "{currentSlide.subtitle}"
          </p>

          <p className="font-mono text-xs text-stone-400 tracking-widest uppercase mb-10 flex items-center justify-center gap-2">
            <Icons.MapPin className="w-3.5 h-3.5 text-amber-500" />
            {currentSlide.location}
          </p>

          {/* Minimalist Call to Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a 
              href="#collection"
              className="w-full sm:w-auto px-7 py-3.5 bg-stone-100 hover:bg-white text-stone-950 font-mono text-xs uppercase tracking-widest font-bold transition-all rounded"
            >
              Explore Collection
            </a>
            
            {onOpenTracker && (
              <button 
                onClick={onOpenTracker}
                className="w-full sm:w-auto px-6 py-3.5 border border-stone-800 hover:border-amber-700 text-stone-300 hover:text-amber-200 transition-all tracking-widest font-mono text-xs uppercase bg-stone-900/60 backdrop-blur rounded flex items-center justify-center gap-2"
              >
                <Icons.Truck className="w-3.5 h-3.5 text-amber-500" />
                <span>Track Weave</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Left / Right Slide Arrow Buttons */}
      <button 
        onClick={handlePrev}
        className="hidden md:flex absolute left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-stone-950/70 hover:bg-stone-900 border border-stone-800 text-stone-300 hover:text-white items-center justify-center transition-colors"
        title="Previous Slide"
      >
        <Icons.ArrowRight className="w-4 h-4 rotate-180" />
      </button>

      <button 
        onClick={handleNext}
        className="hidden md:flex absolute right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-stone-950/70 hover:bg-stone-900 border border-stone-800 text-stone-300 hover:text-white items-center justify-center transition-colors"
        title="Next Slide"
      >
        <Icons.ArrowRight className="w-4 h-4" />
      </button>

      {/* Bottom Floating Photo Slide Thumbnails & Controls */}
      <div className="absolute bottom-6 left-6 right-6 z-20 flex flex-col sm:flex-row items-center justify-between gap-4 pointer-events-none">
        
        {/* Play/Pause & Slide Title */}
        <div className="pointer-events-auto flex items-center gap-3 bg-stone-950/90 backdrop-blur-md px-3.5 py-1.5 rounded-lg border border-stone-800 text-xs font-mono text-stone-300">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-1 rounded hover:text-amber-400 transition-colors"
            title={isPlaying ? "Pause Slideshow" : "Resume Slideshow"}
          >
            <Icons.Activity className={`w-3 h-3 ${isPlaying ? 'text-amber-500' : 'text-stone-600'}`} />
          </button>
          <span className="font-heading text-stone-200 hidden sm:inline">{currentSlide.title}</span>
          <span className="text-stone-600 hidden sm:inline">·</span>
          <span className="text-amber-400">0{currentSlideIndex + 1} / 0{HERO_SLIDES.length}</span>
        </div>

        {/* Clickable Photo Thumbnails */}
        <div className="pointer-events-auto flex items-center gap-1.5 bg-stone-950/90 backdrop-blur-md p-1 rounded-lg border border-stone-800">
          {HERO_SLIDES.map((slide, idx) => (
            <button
              key={idx}
              onClick={() => {
                setCurrentSlideIndex(idx);
                setIsPlaying(false);
              }}
              className={`relative w-10 h-7 rounded overflow-hidden border transition-all ${
                idx === currentSlideIndex
                  ? 'border-amber-500 opacity-100'
                  : 'border-transparent opacity-40 hover:opacity-90'
              }`}
              title={slide.title}
            >
              <img src={slide.url} alt={slide.title} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;
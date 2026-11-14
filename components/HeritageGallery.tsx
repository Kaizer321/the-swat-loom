import React, { useState, useEffect } from 'react';
import { Icons } from './Icons';

export interface GalleryPhoto {
  id: string;
  url: string;
  title: string;
  subtitle: string;
  category: 'women-shawls' | 'men-shawls' | 'weavers' | 'swat';
  location: string;
  description: string;
}

const GALLERY_PHOTOS: GalleryPhoto[] = [
  // 1. Durbar Crimson Zari Pashmina (User Asset)
  {
    id: 'photo-user-crimson-zari',
    url: '/assets/aistudio/Pashmina_shawl_available__Shwal_6e849720.jfif',
    title: 'Durbar Crimson Zari Pashmina',
    subtitle: 'Royal Pashmina with Antique Gold Needlework',
    category: 'women-shawls',
    location: 'Islampur Royal Atelier, Swat',
    description: 'A masterpiece pure Pashmina shawl in royal crimson, adorned with an unbroken border of antique gold needlework executed by master artisans.'
  },
  // 2. Bagh-e-Gandhara Mosaic Heirloom (User Asset)
  {
    id: 'photo-user-gandhara-mosaic',
    url: '/assets/aistudio/download_abc5126d.jfif',
    title: 'Bagh-e-Gandhara Mosaic Heirloom',
    subtitle: 'Multi-Panel Jacquard Heirloom Shawl',
    category: 'women-shawls',
    location: 'Islampur Guild Archive',
    description: 'Heirloom multi-panel mosaic shawl depicting paisley, floral gardens, and historical Swati motifs in rich emerald, saffron, and terracotta.'
  },
  // 3. Noor-e-Swat Monolith Jacquard (User Asset)
  {
    id: 'photo-user-monolith-jacquard',
    url: '/assets/aistudio/1pc_Women_s_Double-Sided_Faux_Cashmere_Grey___White_Plant_Jacquard_Warm_Scarf_Shawl_Suitable_For_Daily_Wear_In_Autumn___Winter_Elegant_4781b1bc.jfif',
    title: 'Noor-e-Swat Monolith Jacquard',
    subtitle: 'Double-Sided Reversible Cashmere Wrap',
    category: 'women-shawls',
    location: 'Malam Jabba Winter Pavilion',
    description: 'Double-sided midnight charcoal and cream botanical jacquard wrap draped on mannequin, featuring geometric border framing.'
  },
  // 4. Gul-e-Kalam Embroidered Pashmina (User Asset)
  {
    id: 'photo-user-ivory-embroidered',
    url: '/assets/aistudio/1pc_Women_s_Autumn_Winter_Faux_Cashmere_Embroidered_Scarf__Thick_Warm_Tasseled_Embroidered_Bohemian_Style_Travel_Shawl_Ponchoscarfs_2846aa22.jfif',
    title: 'Gul-e-Kalam Embroidered Pashmina',
    subtitle: 'Ivory Cashmere with Hand-Tied Tassels',
    category: 'women-shawls',
    location: 'Saidu Sharif Workshop',
    description: 'Delicate ivory ground illuminated by jewel-toned floral and paisley corner embroidery with hand-tied cream fringe tassels.'
  },
  // 5. Marghazar Turquoise Paisley Wrap (User Asset)
  {
    id: 'photo-user-turquoise-paisley',
    url: '/assets/aistudio/SHEIN_Winter_Scarf_for_Women___Paisley_Pashmina_Shawl_with_Tassels___33e05d15.jfif',
    title: 'Marghazar Turquoise Paisley Wrap',
    subtitle: 'Persian Paisley & Terracotta Weave',
    category: 'women-shawls',
    location: 'White Palace, Marghazar Swat',
    description: 'Stunning turquoise and burnt sienna paisley tapestry drape with cream fringe tassels and contrasting reverse interior.'
  },
  // 6. Valley Terracotta Paisley Shawl (User Asset)
  {
    id: 'photo-user-terracotta-paisley',
    url: '/assets/aistudio/1pc_Paisley_Pattern_Thick_Warm_Scarf_With_Tassels__Bohemian_Style_Shawl__Versatile___Elegant_For_Daily_Wear_For_Dress_99963d01.jfif',
    title: 'Valley Terracotta Paisley Shawl',
    subtitle: 'Camel & Ochre Winter Warmth',
    category: 'women-shawls',
    location: 'Kalam High Pastures',
    description: 'Timeless bohemian paisley tapestry shawl with traditional hand-twisted fringe tassels woven for deep winter comfort.'
  },
  // 7. Koh-e-Elum Reversible Cape (User Asset)
  {
    id: 'photo-user-reversible-cape',
    url: '/assets/aistudio/1pc_Women_Double-Sided_Imitation_Cashmere_Floral_Jacquard_Warm_Scarf_Shawl__Suitable_For_Daily_Wear__Autumn_Winter_5ecfde81.jfif',
    title: 'Koh-e-Elum Reversible Cape',
    subtitle: 'Open-Front Botanical Jacquard Shawl',
    category: 'women-shawls',
    location: 'Mount Elum Foothills, Islampur',
    description: 'Reversible open-front cape shawl displayed on hanger, showing botanical motifs and ivory piped border.'
  },
  // 8. Men's Sardar Highland Chadar
  {
    id: 'photo-men-highland-chadar',
    url: 'https://images.unsplash.com/photo-1505022610485-0249ba5b3675?q=80&w=1000',
    title: 'Sardar’s Highland Woolen Chadar',
    subtitle: 'Highland Mountain Sheep Fleece (100% Pure Wool)',
    category: 'men-shawls',
    location: 'Islampur Valley Weavers Guild',
    description: 'Heavyweight masculine chadar woven from raw highland fleece with double-twisted fringes, designed to brave sub-zero mountain gales.'
  },
  // 9. Men's Golden Kaddi Pit-Loom Drape
  {
    id: 'photo-men-golden-kaddi',
    url: 'https://images.unsplash.com/photo-1576473623577-0041226870d0?q=80&w=1000',
    title: 'Golden Kaddi Ceremonial Drape',
    subtitle: 'Hand-Spun Mountain Khaddar with Zari Borders',
    category: 'men-shawls',
    location: 'Traditional Pit-Loom #07, Islampur',
    description: 'Ancestral hand-loomed Khaddar in natural sand tone with fine bronze and copper selvedge borders, hand-spun by master weavers.'
  },
  // 10. Men's Royal Tarkashi Openwork
  {
    id: 'photo-men-tarkashi-mantle',
    url: 'https://images.unsplash.com/photo-1597484662317-c93138065520?q=80&w=1000',
    title: 'Royal Tarkashi Geometric Men’s Mantle',
    subtitle: 'Dense Midnight Wool with Hand-Drawn Openwork',
    category: 'men-shawls',
    location: 'Saidu Sharif Atelier',
    description: 'Deep onyx masculine chadar featuring needle-drawn geometric lattices along the full length, reflecting ancient Gandhara heritage.'
  },
  // 11. Islampur Valley (User Asset)
  {
    id: 'photo-loc-islampur-valley',
    url: '/assets/aistudio/Islampur_velly_14d0c52a.jfif',
    title: 'Islampur Valley: Cradle of the Loom',
    subtitle: 'Village of Weavers Beneath Snow-Crowned Peaks',
    category: 'weavers',
    location: 'Islampur Valley, Swat',
    description: 'The historic village of Islampur where generational wood pit-looms weave every warp and weft by hand beneath the northern Swat mountains.'
  },
  // 12. The White Palace of Marghazar (User Asset)
  {
    id: 'photo-loc-white-palace',
    url: '/assets/aistudio/The_White_Palace_of_Marghazar_Swat_Valley_b8efad8c.jfif',
    title: 'The White Palace of Marghazar',
    subtitle: 'Royal Summer Palace of the Wali of Swat',
    category: 'swat',
    location: 'Marghazar, Swat Valley',
    description: 'Built in 1940 with pure white marble, the summer residence of the royal rulers of Swat where the finest Islampuri shawls were draped.'
  },
  // 13. Malam Jabba (User Asset)
  {
    id: 'photo-loc-malam-jabba',
    url: '/assets/aistudio/Top_10_beautiful_Places_of_Malam_Jabba_de86f875.jfif',
    title: 'Malam Jabba Alpine Snow Peaks',
    subtitle: 'Pine Forests & Frosty Highland Slopes',
    category: 'swat',
    location: 'Malam Jabba, Swat',
    description: 'High-altitude ski slopes and pine forests where winter gales inspire the heaviest, warmest highland sheep wool weaves.'
  },
  // 14. Kalam Handloom Shawl Market (User Asset)
  {
    id: 'photo-loc-kalam-bazaar',
    url: '/assets/aistudio/Klama_bazar_6355702f.jfif',
    title: 'Kalam Handloom Shawl Bazaar',
    subtitle: 'Vibrant Stacks of Swati Handwoven Woolens',
    category: 'weavers',
    location: 'Kalam Bazaar, Swat',
    description: 'The famed mountain bazaar lined ceiling-high with handcrafted Islampur shawls, embroidery scarves, and traditional pashminas.'
  },
  // 15. Saidu Sharif (User Asset)
  {
    id: 'photo-loc-saidu-sharif',
    url: '/assets/aistudio/Saidu_sharif_ea5cdb22.jfif',
    title: 'Saidu Sharif Royal Landmark',
    subtitle: 'Historic Capital & Cultural Heart of Swat',
    category: 'swat',
    location: 'Saidu Sharif, Swat',
    description: 'The historic administrative capital and cultural hub of Swat, preserving centuries of royal patrons and artisan guilds.'
  },
  // 16. Koh-e-Elum (User Asset)
  {
    id: 'photo-loc-elum',
    url: '/assets/aistudio/elum_4ab1b48c.jfif',
    title: 'Koh-e-Elum Sacred Mist Ridges',
    subtitle: 'Terraced Hillsides & Winding Valley Pass',
    category: 'swat',
    location: 'Mount Elum, Swat Valley',
    description: 'The mythical and sacred Mount Elum, wrapped in eternal mountain mist and lush alpine pastures.'
  }
];

interface HeritageGalleryProps {
  onOpenStylist?: (query?: string) => void;
}

export const HeritageGallery: React.FC<HeritageGalleryProps> = ({ onOpenStylist }) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'women-shawls' | 'men-shawls' | 'weavers' | 'swat'>('all');
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const [sliderIndex, setSliderIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const filteredPhotos = activeCategory === 'all'
    ? GALLERY_PHOTOS
    : GALLERY_PHOTOS.filter(p => p.category === activeCategory);

  // Auto-play for the featured highlight slider
  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setSliderIndex((prev) => (prev + 1) % GALLERY_PHOTOS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const handlePrevSlide = () => {
    setSliderIndex((prev) => (prev === 0 ? GALLERY_PHOTOS.length - 1 : prev - 1));
  };

  const handleNextSlide = () => {
    setSliderIndex((prev) => (prev + 1) % GALLERY_PHOTOS.length);
  };

  // Lightbox handlers
  const openLightbox = (index: number) => {
    setSelectedPhotoIndex(index);
  };

  const closeLightbox = () => {
    setSelectedPhotoIndex(null);
  };

  const handleLightboxPrev = () => {
    if (selectedPhotoIndex === null) return;
    setSelectedPhotoIndex((prev) => 
      prev === 0 ? filteredPhotos.length - 1 : (prev as number) - 1
    );
  };

  const handleLightboxNext = () => {
    if (selectedPhotoIndex === null) return;
    setSelectedPhotoIndex((prev) => 
      prev === filteredPhotos.length - 1 ? 0 : (prev as number) + 1
    );
  };

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedPhotoIndex === null) return;
      if (e.key === 'ArrowLeft') handleLightboxPrev();
      if (e.key === 'ArrowRight') handleLightboxNext();
      if (e.key === 'Escape') closeLightbox();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPhotoIndex, filteredPhotos.length]);

  const activeLightboxPhoto = selectedPhotoIndex !== null ? filteredPhotos[selectedPhotoIndex] : null;

  return (
    <section id="gallery" className="py-20 bg-stone-950 border-t border-stone-850 relative">
      <div className="container mx-auto px-6 relative z-10">
        
        {/* Minimalist Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-amber-500 text-xs font-mono uppercase tracking-[0.25em]">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              Photobook & Archive
            </div>
            <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl text-stone-100 tracking-tight font-medium">
              The Swat Valley Lookbook
            </h2>
            <p className="font-body text-stone-400 max-w-xl text-xs sm:text-sm leading-relaxed">
              Every curated piece and scenic landmark captured across the Islampur weaving corridor and high mountain retreats.
            </p>
          </div>

          {/* Minimalist Tab Navigation */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-stone-900/60 border border-stone-800 rounded-lg text-xs font-mono uppercase tracking-wider">
            {[
              { id: 'all', label: 'All Photos' },
              { id: 'women-shawls', label: "Women's Shawls" },
              { id: 'men-shawls', label: "Men's Chadars" },
              { id: 'weavers', label: 'Weavers & Looms' },
              { id: 'swat', label: 'Swat Landscapes' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveCategory(tab.id as any);
                  setSelectedPhotoIndex(null);
                }}
                className={`px-3 py-1.5 rounded-md transition-all ${
                  activeCategory === tab.id
                    ? 'bg-stone-800 text-amber-300 font-bold'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Minimalist Featured Slideshow Carousel Banner */}
        <div className="mb-14 bg-stone-950 border border-stone-800 overflow-hidden relative rounded-xl">
          <div className="relative aspect-[16/9] md:aspect-[21/9] max-h-[480px] w-full overflow-hidden bg-stone-900">
            {GALLERY_PHOTOS.map((photo, idx) => (
              <div
                key={photo.id}
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                  idx === sliderIndex ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                }`}
              >
                <img
                  src={photo.url}
                  alt={photo.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/30 to-transparent" />

                {/* Clean Minimalist Slide Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
                  <div className="max-w-2xl space-y-1.5">
                    <div className="flex items-center gap-3 text-[11px] font-mono uppercase tracking-widest text-amber-400">
                      <span>0{idx + 1} / {GALLERY_PHOTOS.length}</span>
                      <span>·</span>
                      <span className="text-stone-300">{photo.location}</span>
                    </div>

                    <h3 className="font-heading text-xl md:text-3xl text-stone-100 font-medium">
                      {photo.title}
                    </h3>
                    <p className="text-xs text-stone-300 leading-relaxed font-body line-clamp-2 md:line-clamp-none max-w-xl">
                      {photo.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => openLightbox(idx)}
                      className="px-4 py-2 bg-stone-950/80 hover:bg-stone-900 text-stone-200 border border-stone-700 rounded-md text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 transition-colors"
                    >
                      <Icons.Search className="w-3.5 h-3.5 text-amber-400" />
                      Fullscreen
                    </button>
                    {onOpenStylist && (
                      <button
                        onClick={() => onOpenStylist(`Tell me about the story behind ${photo.title} from Swat.`)}
                        className="px-4 py-2 bg-amber-800 hover:bg-amber-700 text-white rounded-md text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 transition-colors"
                      >
                        <Icons.Sparkles className="w-3.5 h-3.5" />
                        Inquire
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Slide Navigation Arrows */}
            <button
              onClick={handlePrevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-stone-950/80 hover:bg-stone-900 border border-stone-800 text-stone-300 hover:text-white flex items-center justify-center transition-colors"
              title="Previous Photo"
            >
              <Icons.ArrowRight className="w-4 h-4 rotate-180" />
            </button>
            <button
              onClick={handleNextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-stone-950/80 hover:bg-stone-900 border border-stone-800 text-stone-300 hover:text-white flex items-center justify-center transition-colors"
              title="Next Photo"
            >
              <Icons.ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Interactive Slide Thumbnail Strip */}
          <div className="p-2.5 bg-stone-950 border-t border-stone-800 flex items-center justify-between gap-3 overflow-x-auto custom-scrollbar">
            <button
              onClick={() => setIsAutoPlaying(!isAutoPlaying)}
              className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider text-stone-400 hover:text-stone-200 flex items-center gap-1.5 shrink-0"
            >
              <Icons.Activity className={`w-3 h-3 ${isAutoPlaying ? 'text-amber-500' : 'text-stone-600'}`} />
              {isAutoPlaying ? 'Playing' : 'Paused'}
            </button>

            <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
              {GALLERY_PHOTOS.map((photo, idx) => (
                <button
                  key={photo.id}
                  onClick={() => {
                    setSliderIndex(idx);
                    setIsAutoPlaying(false);
                  }}
                  className={`relative w-12 h-8 shrink-0 rounded overflow-hidden border transition-all ${
                    idx === sliderIndex
                      ? 'border-amber-500 opacity-100'
                      : 'border-transparent opacity-40 hover:opacity-80'
                  }`}
                  title={photo.title}
                >
                  <img src={photo.url} alt={photo.title} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Responsive Photo Tiles Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredPhotos.map((photo, idx) => (
            <div
              key={photo.id}
              onClick={() => openLightbox(idx)}
              className="group relative bg-stone-950 border border-stone-800/80 overflow-hidden cursor-pointer hover:border-amber-700/60 transition-all duration-300 flex flex-col rounded-lg"
            >
              {/* Photo Box */}
              <div className="relative aspect-[4/5] overflow-hidden bg-stone-900">
                <img
                  src={photo.url}
                  alt={photo.title}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/20 to-transparent opacity-70 group-hover:opacity-40 transition-opacity" />

                {/* Minimalist Location Tag */}
                <div className="absolute top-2.5 left-2.5 bg-stone-950/80 backdrop-blur-sm px-2 py-0.5 border border-stone-800 text-[10px] font-mono uppercase tracking-wider text-stone-300">
                  {photo.location.split(',')[0]}
                </div>
              </div>

              {/* Photo Info */}
              <div className="p-3.5 bg-stone-950 flex-1 flex flex-col justify-between border-t border-stone-850">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-stone-500 block mb-1">
                    {photo.subtitle}
                  </span>
                  <h4 className="font-heading text-stone-200 text-sm font-medium group-hover:text-amber-200 transition-colors line-clamp-1">
                    {photo.title}
                  </h4>
                </div>
                <p className="text-stone-400 text-xs font-body mt-1.5 line-clamp-2 leading-relaxed">
                  {photo.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Fullscreen Slideshow Lightbox Modal */}
      {selectedPhotoIndex !== null && activeLightboxPhoto && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md animate-fade-in p-4 sm:p-6">
          
          {/* Close Button */}
          <button
            onClick={closeLightbox}
            className="absolute top-5 right-5 z-50 p-2 text-stone-400 hover:text-white hover:bg-stone-900 rounded-md transition-colors"
            title="Close Lightbox (Esc)"
          >
            <Icons.Close className="w-6 h-6" />
          </button>

          {/* Left Arrow */}
          <button
            onClick={handleLightboxPrev}
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-50 w-10 h-10 rounded-full bg-stone-950/80 hover:bg-stone-900 border border-stone-800 text-stone-300 hover:text-white flex items-center justify-center transition-colors"
            title="Previous (Arrow Left)"
          >
            <Icons.ArrowRight className="w-5 h-5 rotate-180" />
          </button>

          {/* Right Arrow */}
          <button
            onClick={handleLightboxNext}
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-50 w-10 h-10 rounded-full bg-stone-950/80 hover:bg-stone-900 border border-stone-800 text-stone-300 hover:text-white flex items-center justify-center transition-colors"
            title="Next (Arrow Right)"
          >
            <Icons.ArrowRight className="w-5 h-5" />
          </button>

          {/* Lightbox Main Container */}
          <div className="relative max-w-4xl w-full max-h-[88vh] flex flex-col md:flex-row bg-stone-950 border border-stone-800 rounded-xl overflow-hidden shadow-2xl">
            {/* Main Photo */}
            <div className="w-full md:w-3/5 bg-black flex items-center justify-center overflow-hidden min-h-[320px] md:min-h-[500px]">
              <img
                src={activeLightboxPhoto.url}
                alt={activeLightboxPhoto.title}
                className="w-full h-full object-contain max-h-[65vh] md:max-h-[80vh]"
              />
            </div>

            {/* Sidebar Photo Details */}
            <div className="w-full md:w-2/5 p-6 flex flex-col justify-between bg-stone-950 border-t md:border-t-0 md:border-l border-stone-800">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-widest text-stone-500">
                  <span>Photo {selectedPhotoIndex + 1} of {filteredPhotos.length}</span>
                  <span className="text-amber-400">{activeLightboxPhoto.location}</span>
                </div>

                <div>
                  <span className="text-[11px] font-mono uppercase tracking-wider text-stone-500 block">
                    {activeLightboxPhoto.subtitle}
                  </span>
                  <h3 className="font-heading text-xl text-stone-100 font-medium mt-1">
                    {activeLightboxPhoto.title}
                  </h3>
                </div>

                <div className="p-3.5 bg-stone-900/60 rounded-lg border border-stone-800/80">
                  <p className="text-xs text-stone-300 leading-relaxed font-body">
                    {activeLightboxPhoto.description}
                  </p>
                </div>

                <div className="space-y-1.5 text-xs text-stone-400 font-mono">
                  <div className="flex justify-between py-1 border-b border-stone-850">
                    <span className="text-stone-500">Origin</span>
                    <span className="text-stone-300">Islampur, Swat Valley</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-stone-850">
                    <span className="text-stone-500">Guild</span>
                    <span className="text-stone-300">Ancestral Pit-Loom Weavers</span>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-4 border-t border-stone-800 space-y-2">
                {onOpenStylist && (
                  <button
                    onClick={() => {
                      closeLightbox();
                      onOpenStylist(`Tell me about ${activeLightboxPhoto.title} and how it relates to Islampur shawls.`);
                    }}
                    className="w-full py-2.5 bg-amber-800 hover:bg-amber-700 text-white rounded-md text-xs font-mono uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
                  >
                    <Icons.Sparkles className="w-3.5 h-3.5" />
                    Inquire with Weaver
                  </button>
                )}

                <div className="flex items-center justify-between text-[11px] font-mono text-stone-500 pt-1">
                  <span>Arrow keys to browse</span>
                  <button
                    onClick={closeLightbox}
                    className="text-stone-400 hover:text-white uppercase tracking-wider"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default HeritageGallery;

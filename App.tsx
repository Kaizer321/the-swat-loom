import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ProductGrid from './components/ProductGrid';
import ProductModal from './components/ProductModal';
import AiStylist from './components/AiStylist';
import CartDrawer from './components/CartDrawer';
import TheGoldenThread from './components/TheGoldenThread';
import AdminDashboard from './components/AdminDashboard';
import { OrderTracker } from './components/OrderTracker';
import { CategorySidebar } from './components/CategorySidebar';
import { Product, CartItem, Order } from './types';
import { Icons } from './components/Icons';
import { db } from './services/db';

const CRAFT_SLIDES = [
  {
    url: '/assets/aistudio/Islampur_velly_14d0c52a.jfif',
    title: 'The Ancestral Village of Islampur',
    stage: 'Pit-Loom Weaving • Islampur Valley',
    caption: 'Every warp yarn is aligned by hand on ancestral wooden looms nestled in the mountain folds of Swat.'
  },
  {
    url: 'https://images.unsplash.com/photo-1597484662317-c93138065520?q=80&w=2574&auto=format&fit=crop',
    title: 'Geometric Tarkashi Detailing',
    stage: 'Needle Openwork • Saidu Sharif',
    caption: 'Threads are drawn out with surgical precision and cross-stitched into ancient Gandhara geometric grids.'
  },
  {
    url: '/assets/aistudio/Klama_bazar_6355702f.jfif',
    title: 'Kalam Handloom Shawl Market',
    stage: 'Artisan Curation • Kalam Bazaar',
    caption: 'Master pieces inspected and curated in the historic mountain bazaar before being certified for connoisseurs.'
  },
  {
    url: 'https://images.unsplash.com/photo-1615954618642-e14104839423?q=80&w=2574&auto=format&fit=crop',
    title: 'Zari Borders & Cedar Box Packing',
    stage: 'Master Seal • Saidu Hub',
    caption: 'Each finished heirloom is enfolded in pure unbleached muslin with dried Swat cedar chips.'
  }
];

const App: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isStylistOpen, setIsStylistOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isTrackerOpen, setIsTrackerOpen] = useState(false);
  const [isCategorySidebarOpen, setIsCategorySidebarOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedGender, setSelectedGender] = useState<'all' | 'men' | 'women'>('all');
  const [trackedOrderId, setTrackedOrderId] = useState<string | undefined>(undefined);
  const [newlyPlacedOrder, setNewlyPlacedOrder] = useState<Order | null>(null);
  const [stylistInitialQuery, setStylistInitialQuery] = useState<string | undefined>(undefined);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>(['Pashmina', 'Tarkashi', 'Woolen', 'Stallers', 'Printed', 'Mens Shawls', 'Kaddi']);
  const [craftSlideIndex, setCraftSlideIndex] = useState(0);

  // Initialize DB and load products
  useEffect(() => {
    let active = true;
    db.init().then(() => Promise.all([db.getAll(), db.getCategories()])).then(([rows, categoryRows]) => { if (active) { setProducts(rows); setCategories(categoryRows); } })
      .catch(error => console.error('Could not load products from Supabase:', error));
    return () => { active = false; };
  }, []);

  const handleUpdateProduct = async (product: Product) => {
    const updatedList = await db.save(product);
    setProducts([...updatedList]);
  };

  const handleDeleteProduct = async (id: string) => {
    const updatedList = await db.delete(id);
    setProducts([...updatedList]);
  };

  const handleAddToCart = (product: Product) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        const stockLimit = Number(product.stock) > 0 ? Number(product.stock) : 20;
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: Math.min(20, stockLimit, item.quantity + 1) }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const handleRemoveFromCart = (id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const handleCartQuantityChange = (id: string, quantity: number) => {
    if (quantity < 1) return;
    setCartItems(prev => prev.map(item => {
      if (item.id !== id) return item;
      const stockLimit = Number(item.stock) > 0 ? Number(item.stock) : 20;
      return { ...item, quantity: Math.min(20, stockLimit, quantity) };
    }));
  };

  const handleCheckout = async (customerDetails: { name: string; email: string; phone: string; address: string; city: string }) => {
    try {
      const newOrder = await db.createOrder({ ...customerDetails, items: [...cartItems] });
      setCartItems([]);
      setIsCartOpen(false);
      setNewlyPlacedOrder(newOrder);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Could not place your order. Please try again.');
      throw error;
    }
  };

  const handleOpenTracker = (orderId?: string) => {
    setTrackedOrderId(orderId);
    setIsTrackerOpen(true);
  };

  const handleConsultArtisan = (query: string) => {
    setStylistInitialQuery(query);
    setIsStylistOpen(true);
  };

  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div id="top" className="min-h-screen bg-stone-950 text-stone-200 font-sans selection:bg-amber-900 selection:text-white">
      <Navbar 
        cartCount={totalItems} 
        onOpenCart={() => setIsCartOpen(true)} 
        onOpenStylist={() => {
          setStylistInitialQuery(undefined);
          setIsStylistOpen(true);
        }} 
        onOpenTracker={() => handleOpenTracker()}
        onOpenCategorySidebar={() => setIsCategorySidebarOpen(true)}
      />
      
      <Hero onOpenTracker={() => handleOpenTracker()} />

      <TheGoldenThread onAddToCart={handleAddToCart} />
      
      <main>
        <ProductGrid 
          products={products}
          categories={categories}
          onAddToCart={handleAddToCart} 
          onViewDetails={setSelectedProduct}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          selectedGender={selectedGender}
          onSelectGender={setSelectedGender}
          onOpenSidebar={() => setIsCategorySidebarOpen(true)}
        />
        
        {/* Heritage Weaving & Order Journey Showcase */}
        <section className="py-20 bg-stone-950 border-t border-stone-850 relative">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <div className="text-center space-y-2 mb-12">
                <div className="inline-flex items-center gap-2 text-amber-500 text-xs font-mono uppercase tracking-[0.25em]">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  Ancestral Craftsmanship
                </div>
                <h2 className="font-heading text-3xl md:text-4xl text-stone-100 font-medium tracking-tight">
                  The Loom-to-Doorstep Journey
                </h2>
                <p className="font-body text-stone-400 max-w-xl mx-auto text-xs sm:text-sm leading-relaxed">
                  Every Swati shawl carries the generational mastery of Islampur weavers. 
                  Follow your commission through all stages of hand creation.
                </p>
              </div>

              {/* 4 Feature Steps Preview */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                <div className="bg-stone-950 border border-stone-850 p-5 rounded-lg group hover:border-amber-700/60 transition-colors">
                  <span className="text-xs font-mono text-amber-500 block mb-1">STAGE 01</span>
                  <h4 className="font-heading text-stone-200 text-sm font-semibold mb-1">Mountain Fleece</h4>
                  <p className="text-xs text-stone-400 leading-relaxed font-body">
                    Virgin highland sheep fleece and pure pashmina skeins inspected by hand.
                  </p>
                </div>

                <div className="bg-stone-950 border border-stone-850 p-5 rounded-lg group hover:border-amber-700/60 transition-colors">
                  <span className="text-xs font-mono text-amber-500 block mb-1">STAGE 02</span>
                  <h4 className="font-heading text-stone-200 text-sm font-semibold mb-1">Kaddi Pit-Loom</h4>
                  <p className="text-xs text-stone-400 leading-relaxed font-body">
                    Over 2,400 warp threads tensioned upon ancestral wooden frames in Islampur.
                  </p>
                </div>

                <div className="bg-stone-950 border border-stone-850 p-5 rounded-lg group hover:border-amber-700/60 transition-colors">
                  <span className="text-xs font-mono text-amber-500 block mb-1">STAGE 03</span>
                  <h4 className="font-heading text-stone-200 text-sm font-semibold mb-1">Tarkashi Detailing</h4>
                  <p className="text-xs text-stone-400 leading-relaxed font-body">
                    Pulled-thread geometric lattice and traditional borders hand-stitched.
                  </p>
                </div>

                <div className="bg-stone-950 border border-stone-850 p-5 rounded-lg group hover:border-amber-700/60 transition-colors">
                  <span className="text-xs font-mono text-amber-500 block mb-1">STAGE 04</span>
                  <h4 className="font-heading text-stone-200 text-sm font-semibold mb-1">Valley Transit</h4>
                  <p className="text-xs text-stone-400 leading-relaxed font-body">
                    Enfolded in cedar & unbleached muslin, dispatched through Swat mountain passes.
                  </p>
                </div>
              </div>

              {/* Action Banner */}
              <div className="bg-stone-900/40 border border-stone-800 p-6 md:p-8 rounded-xl flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4 text-left">
                  <div className="w-10 h-10 rounded-lg bg-stone-900 border border-stone-800 flex items-center justify-center text-amber-500 shrink-0">
                    <Icons.Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-heading text-base md:text-lg text-stone-100 font-medium">
                      Already commissioned a shawl?
                    </h3>
                    <p className="text-xs text-stone-400 mt-0.5">
                      Enter your order ID to see real-time pit-loom status, artisan log, and courier milestones.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 w-full md:w-auto">
                  <button
                    onClick={() => handleOpenTracker()}
                    className="flex-1 md:flex-none px-5 py-2.5 bg-stone-100 hover:bg-white text-stone-950 rounded text-xs font-mono uppercase tracking-wider font-bold transition-all flex items-center justify-center gap-2"
                  >
                    <Icons.Search className="w-3.5 h-3.5" />
                    Track Order
                  </button>
                  <button
                    onClick={() => handleOpenTracker('SWAT-8492')}
                    className="flex-1 md:flex-none px-4 py-2.5 bg-stone-900 hover:bg-stone-850 border border-stone-700 text-stone-300 rounded text-xs font-mono uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
                  >
                    Demo Weave
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Story Section / About with Multi-Photo Craftsmanship Carousel */}
        <section id="heritage" className="py-20 bg-stone-950 border-t border-stone-850">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1 space-y-4">
                <div className="inline-flex items-center gap-2 text-amber-500 text-xs font-mono uppercase tracking-[0.25em]">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  The Valley Heritage
                </div>
                <h2 className="font-heading text-3xl sm:text-4xl text-stone-100 font-medium">The Soul of Islampur</h2>
                <p className="font-body text-stone-400 leading-relaxed text-xs sm:text-sm">
                  Hidden in the mountains of Swat lies Islampur, the historic village of weavers. Here, the rhythm of the wooden pit-loom is the pulse of the community. 
                  From the delicate drawn-thread geometry of <strong>Tarkashi</strong> to the rugged warmth of <strong>Men’s Highland Chadars</strong>, 
                  every thread is spun from ancient craft traditions.
                </p>
                <div className="flex flex-wrap gap-3 pt-2 text-xs font-mono text-stone-400">
                  <div className="px-3 py-2 bg-stone-900/60 border border-stone-850 rounded">
                    <span className="text-stone-350 block text-[10px] text-stone-500 uppercase">Region</span>
                    Swat Valley
                  </div>
                  <div className="px-3 py-2 bg-stone-900/60 border border-stone-850 rounded">
                    <span className="text-stone-350 block text-[10px] text-stone-500 uppercase">Loom Technique</span>
                    Wooden Pit-Loom
                  </div>
                  <div className="px-3 py-2 bg-stone-900/60 border border-stone-850 rounded">
                    <span className="text-stone-350 block text-[10px] text-stone-500 uppercase">Fiber Standard</span>
                    100% Pure Fleece
                  </div>
                </div>
              </div>

              {/* Interactive Craft Photo Slideshow */}
              <div className="order-1 md:order-2 relative">
                <div className="absolute -inset-4 border-2 border-amber-800/30 z-0 translate-x-3 translate-y-3 rounded-2xl hidden sm:block"></div>
                
                <div className="relative z-10 bg-stone-950 rounded-2xl overflow-hidden border border-stone-700 shadow-2xl group">
                  {/* Slide Image Box */}
                  <div className="relative aspect-[4/3] overflow-hidden">
                    {CRAFT_SLIDES.map((slide, idx) => (
                      <div
                        key={idx}
                        className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                          idx === craftSlideIndex ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                        }`}
                      >
                        <img 
                          src={slide.url} 
                          alt={slide.title} 
                          className="w-full h-full object-cover transform scale-100 hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/20 to-transparent" />
                      </div>
                    ))}

                    {/* Navigation Buttons */}
                    <button
                      onClick={() => setCraftSlideIndex((prev) => (prev === 0 ? CRAFT_SLIDES.length - 1 : prev - 1))}
                      className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-stone-950/70 hover:bg-stone-900 border border-stone-700 text-stone-200 flex items-center justify-center transition-all opacity-80 hover:opacity-100"
                      title="Previous Craft Stage"
                    >
                      <Icons.ArrowRight className="w-4 h-4 rotate-180" />
                    </button>
                    <button
                      onClick={() => setCraftSlideIndex((prev) => (prev + 1) % CRAFT_SLIDES.length)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-stone-950/70 hover:bg-stone-900 border border-stone-700 text-stone-200 flex items-center justify-center transition-all opacity-80 hover:opacity-100"
                      title="Next Craft Stage"
                    >
                      <Icons.ArrowRight className="w-4 h-4" />
                    </button>

                    {/* Stage Badge */}
                    <div className="absolute top-4 left-4 z-20 bg-stone-950/80 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-mono text-amber-300 border border-amber-800/50">
                      {CRAFT_SLIDES[craftSlideIndex].stage}
                    </div>

                    {/* Slide Counter */}
                    <div className="absolute top-4 right-4 z-20 bg-black/70 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[11px] font-mono text-stone-400">
                      {craftSlideIndex + 1} / {CRAFT_SLIDES.length}
                    </div>
                  </div>

                  {/* Caption & Thumbnail Tray */}
                  <div className="p-5 bg-stone-950 border-t border-stone-800">
                    <h4 className="font-heading text-stone-100 text-lg font-bold mb-1">
                      {CRAFT_SLIDES[craftSlideIndex].title}
                    </h4>
                    <p className="text-xs text-stone-400 font-body leading-relaxed mb-4">
                      {CRAFT_SLIDES[craftSlideIndex].caption}
                    </p>

                    <div className="flex gap-2">
                      {CRAFT_SLIDES.map((slide, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCraftSlideIndex(idx)}
                          className={`relative flex-1 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                            craftSlideIndex === idx
                              ? 'border-amber-500 opacity-100 shadow-md shadow-amber-900/40'
                              : 'border-stone-800 opacity-50 hover:opacity-80'
                          }`}
                          title={slide.title}
                        >
                          <img src={slide.url} alt={slide.title} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>

      <footer className="bg-stone-950 py-12 border-t border-stone-900 relative">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center opacity-75 text-sm gap-4">
          <div className="flex items-center gap-2">
            <p>&copy; 2024 Islampur Heritage Looms. All rights reserved.</p>
            {/* Hidden Admin Trigger */}
            <button 
              onClick={() => setIsAdminOpen(true)} 
              className="text-stone-700 hover:text-stone-500 transition-colors ml-2"
              title="Staff Access"
            >
              <Icons.Lock className="w-3 h-3" />
            </button>
          </div>
          <div className="flex items-center gap-6">
            <button 
              onClick={() => handleOpenTracker()} 
              className="hover:text-amber-400 transition-colors flex items-center gap-1.5 text-stone-400"
            >
              <Icons.Truck className="w-4 h-4 text-amber-500" />
              <span>Track Order</span>
            </button>
            <a href="#collection" className="hover:text-amber-500 text-stone-400">Collection</a>
            <a href="#heritage" className="hover:text-amber-500 text-stone-400">Heritage</a>
            <button 
              onClick={() => {
                setStylistInitialQuery(undefined);
                setIsStylistOpen(true);
              }}
              className="hover:text-amber-500 text-stone-400"
            >
              Master Weaver AI
            </button>
          </div>
        </div>
      </footer>

      {/* Interactive Components */}
      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        items={cartItems} 
        onRemove={handleRemoveFromCart} 
        onQuantityChange={handleCartQuantityChange}
        onCheckout={handleCheckout}
      />
      
      <AiStylist 
        isOpen={isStylistOpen} 
        onClose={() => setIsStylistOpen(false)}
        initialQuery={stylistInitialQuery}
      />

      <ProductModal 
        product={selectedProduct} 
        onClose={() => setSelectedProduct(null)} 
        onAddToCart={handleAddToCart} 
      />

      {/* Category Navigation Sidebar Drawer */}
      <CategorySidebar
        isOpen={isCategorySidebarOpen}
        onClose={() => setIsCategorySidebarOpen(false)}
        selectedCategory={selectedCategory}
        selectedGender={selectedGender}
        onSelectCategory={(cat, gender) => {
          setSelectedCategory(cat);
          setSelectedGender(gender);
        }}
        products={products}
        categories={categories}
      />

      <AdminDashboard 
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        products={products}
        onUpdateProduct={handleUpdateProduct}
        onDeleteProduct={handleDeleteProduct}
        onCategoriesChange={(nextCategories) => { setCategories(nextCategories); if (selectedCategory !== 'All' && selectedCategory !== 'New Arrivals' && !nextCategories.includes(selectedCategory)) setSelectedCategory('All'); }}
        onTrackOrder={(id) => handleOpenTracker(id)}
      />

      {/* Order Tracker Modal */}
      <OrderTracker
        isOpen={isTrackerOpen}
        onClose={() => setIsTrackerOpen(false)}
        initialOrderId={trackedOrderId}
        onOpenStylistWithContext={handleConsultArtisan}
      />

      {/* Celebratory Order Confirmation Modal */}
      {newlyPlacedOrder && (
        <div className="fixed inset-0 z-[75] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg bg-stone-900 border border-amber-800/60 p-6 sm:p-8 rounded-2xl shadow-2xl text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-amber-950 border-2 border-amber-600 flex items-center justify-center mx-auto text-amber-400 shadow-lg shadow-amber-900/40">
              <Icons.Sparkles className="w-8 h-8 animate-pulse" />
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold tracking-[0.3em] text-amber-500">
                Order Received
              </span>
              <h3 className="font-heading text-2xl sm:text-3xl text-stone-100 mt-1">
                Your Order Is Registered
              </h3>
              <p className="text-xs text-stone-400 mt-2 max-w-sm mx-auto leading-relaxed">
                Thank you, <strong className="text-stone-200">{newlyPlacedOrder.customerName}</strong>. 
                Your commission has been accepted into the Islampur master register.
              </p>
            </div>

            <div className="p-4 bg-stone-950 rounded-xl border border-stone-800 space-y-2">
              <div className="flex justify-between items-center text-xs text-stone-400">
                <span>Order Reference ID</span>
                <span className="font-mono text-base font-bold text-amber-400">#{newlyPlacedOrder.id}</span>
              </div>
              <div className="flex justify-between items-center text-xs text-stone-400 pt-2 border-t border-stone-900">
                <span>Commission Total</span>
                <span className="font-bold text-stone-200">Rs. {newlyPlacedOrder.total.toLocaleString("en-PK")}</span>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => {
                  const id = newlyPlacedOrder.id;
                  setNewlyPlacedOrder(null);
                  handleOpenTracker(id);
                }}
                className="w-full py-3.5 bg-gradient-to-r from-amber-800 to-amber-600 hover:from-amber-700 hover:to-amber-500 text-white font-bold uppercase tracking-widest text-xs rounded-xl shadow-lg shadow-amber-900/30 flex items-center justify-center gap-2 transition-all"
              >
                <Icons.Truck className="w-4 h-4" />
                Track Weaving & Delivery Timeline
              </button>

              <button
                onClick={() => setNewlyPlacedOrder(null)}
                className="w-full py-2.5 bg-stone-950 hover:bg-stone-800 text-stone-400 hover:text-white rounded-xl text-xs font-medium uppercase tracking-wider transition-colors"
              >
                Explore More Shawls
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
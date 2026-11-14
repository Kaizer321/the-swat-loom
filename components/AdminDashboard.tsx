import React, { useState, useRef, useEffect } from 'react';
import { Product, Order, OrderStatus } from '../types';
import { Icons } from './Icons';
import { db } from '../services/db';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onUpdateProduct: (product: Product) => Promise<void>;
  onDeleteProduct: (id: string) => Promise<void>;
  onCategoriesChange?: (categories: string[]) => void;
  onTrackOrder?: (orderId: string) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  isOpen, 
  onClose, 
  products, 
  onUpdateProduct, 
  onDeleteProduct,
  onCategoriesChange,
  onTrackOrder
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isBusy, setIsBusy] = useState(false);
  const [activeTab, setActiveTab] = useState<'inventory' | 'orders'>('inventory');
  
  // Inventory State
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState<string[]>(['Pashmina', 'Tarkashi', 'Woolen', 'Stallers', 'Printed', 'Mens Shawls', 'Kaddi']);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // New Color state
  const [newColor, setNewColor] = useState('#000000');

  // Orders State
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderFilter, setOrderFilter] = useState<OrderStatus | 'All'>('All');
  const [orderSearch, setOrderSearch] = useState('');

  // Load orders when tab switches or auth successful
  useEffect(() => {
    if (isAuthenticated && isOpen) {
      db.getOrders().then(setOrders).catch(error => setLoginError(error.message));
      db.getCategories().then(setCategories).catch(error => setLoginError(error.message));
    }
  }, [isAuthenticated, isOpen, activeTab]);

  // Filter logic
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const normalizedOrderSearch = orderSearch.trim().toLowerCase();
  const filteredOrders = orders.filter(o => {
    const matchesStatus = orderFilter === 'All' || o.status === orderFilter;
    const searchable = [o.id, o.trackingCode, o.customerName, o.email, o.phone, o.city,
      ...(o.items || []).map(item => item.name)]
      .filter(Boolean).join(' ').toLowerCase();
    return matchesStatus && (!normalizedOrderSearch || searchable.includes(normalizedOrderSearch));
  });

  const handleLogin = async () => {
    setIsBusy(true); setLoginError('');
    try { await db.adminLogin(email, password); setIsAuthenticated(true); setPassword(''); }
    catch (error) { setLoginError(error instanceof Error ? error.message : 'Sign in failed.'); }
    finally { setIsBusy(false); }
  };

  // --- INVENTORY HANDLERS ---
  const handleSaveProduct = () => {
    if (!editingProduct || !editingProduct.name || !editingProduct.price) {
      alert('Name and Price are required');
      return;
    }

    // Ensure image array exists
    const images = editingProduct.images || (editingProduct.image ? [editingProduct.image] : []);
    const mainImage = images.length > 0 ? images[0] : 'https://via.placeholder.com/400';

    const newProduct: Product = {
      id: editingProduct.id || `prod-${Date.now()}`,
      name: editingProduct.name,
      price: Number(editingProduct.price),
      salePrice: editingProduct.salePrice ? Number(editingProduct.salePrice) : null,
      isNewArrival: Boolean(editingProduct.isNewArrival),
      stock: Math.max(0, Math.floor(Number(editingProduct.stock) || 0)),
      description: editingProduct.description || '',
      longDescription: editingProduct.longDescription || '',
      category: editingProduct.category || 'Tarkashi',
      material: editingProduct.material || 'Pure Wool',
      image: mainImage,
      images: images,
      tags: editingProduct.tags || [],
      colors: editingProduct.colors || ['#000000'],
      createdAt: editingProduct.createdAt // Preserve original date if editing
    };

    onUpdateProduct(newProduct).then(() => setEditingProduct(null)).catch(error => alert(error.message));
  };

  const handleAddNew = () => {
    setEditingProduct({
      id: '',
      name: '',
      price: 0,
      salePrice: null,
      isNewArrival: false,
      stock: 0,
      category: categories[0] || 'Tarkashi',
      description: '',
      material: 'Pure Wool',
      image: '',
      images: [],
      tags: [],
      colors: ['#000000']
    });
  };

  // --- IMAGE HANDLING (MULTI) ---
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = async (files: File[]) => {
    if (!editingProduct) return;
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const validFiles = files.filter(file => allowedTypes.includes(file.type) && file.size <= 8 * 1024 * 1024);
    if (validFiles.length !== files.length) alert('Only JPG, PNG or WebP images up to 8 MB each are supported.');
    if (!validFiles.length) return;
    setIsBusy(true);
    try {
      const newImages = await Promise.all(validFiles.map(file => new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(new Error(`Could not read ${file.name}.`));
        reader.onload = async () => {
          try {
            if (typeof reader.result !== 'string') throw new Error('Invalid image file.');
            resolve(await db.uploadProductImage(reader.result));
          } catch (error) { reject(error); }
        };
        reader.readAsDataURL(file);
      })));
      const currentImages = editingProduct.images || (editingProduct.image ? [editingProduct.image] : []);
      setEditingProduct({
        ...editingProduct,
        images: [...currentImages, ...newImages],
        image: currentImages.length === 0 ? newImages[0] : currentImages[0]
      });
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Could not upload product images.');
    } finally { setIsBusy(false); }
  };

  const removeImage = (index: number) => {
    if (!editingProduct || !editingProduct.images) return;
    const newImages = [...editingProduct.images];
    newImages.splice(index, 1);
    setEditingProduct({
      ...editingProduct,
      images: newImages,
      image: newImages.length > 0 ? newImages[0] : ''
    });
  };

  // --- COLOR HANDLING ---
  const addColor = () => {
    if (editingProduct && !editingProduct.colors?.includes(newColor)) {
      setEditingProduct({
        ...editingProduct,
        colors: [...(editingProduct.colors || []), newColor]
      });
    }
  };

  const removeColor = (colorToRemove: string) => {
    if (editingProduct) {
      setEditingProduct({
        ...editingProduct,
        colors: (editingProduct.colors || []).filter(c => c !== colorToRemove)
      });
    }
  };

  // --- ORDER HANDLERS ---
  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try { const updatedOrders = await db.updateOrderStatus(orderId, newStatus); setOrders([...updatedOrders]); }
    catch (error) { alert(error instanceof Error ? error.message : 'Could not update order.'); }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch(status) {
      case 'Pending': return 'text-amber-500 bg-amber-900/20 border-amber-700';
      case 'Confirmed': return 'text-blue-400 bg-blue-900/20 border-blue-700';
      case 'Dispatched': return 'text-purple-400 bg-purple-900/20 border-purple-700';
      case 'Delivered': return 'text-emerald-400 bg-emerald-900/20 border-emerald-700';
      case 'Cancelled': return 'text-red-400 bg-red-900/20 border-red-700';
      default: return 'text-stone-400';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[90] bg-stone-950 flex flex-col animate-fade-in">
      {/* Header */}
      <div className="p-6 border-b border-stone-800 flex justify-between items-center bg-stone-900">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <Icons.Lock className="text-amber-500" />
            <h2 className="font-heading text-2xl text-stone-100">Weaver's Desk</h2>
          </div>
          
          {isAuthenticated && (
            <div className="flex bg-stone-950 p-1 rounded-lg border border-stone-800">
              <button 
                onClick={() => setActiveTab('inventory')}
                className={`px-4 py-1 rounded-md text-sm font-bold transition-all ${activeTab === 'inventory' ? 'bg-stone-800 text-white' : 'text-stone-500 hover:text-stone-300'}`}
              >
                Inventory
              </button>
              <button 
                onClick={() => setActiveTab('orders')}
                className={`px-4 py-1 rounded-md text-sm font-bold transition-all ${activeTab === 'orders' ? 'bg-stone-800 text-white' : 'text-stone-500 hover:text-stone-300'}`}
              >
                Orders
              </button>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          {isAuthenticated && <button onClick={() => { db.adminLogout().finally(() => { setIsAuthenticated(false); setActiveTab('inventory'); }); }} className="text-xs text-amber-500 hover:text-amber-300">Sign out</button>}
          <button onClick={onClose} className="text-stone-500 hover:text-white">
            <Icons.Close className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {!isAuthenticated ? (
          <div className="h-full flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-md bg-stone-900 p-8 border border-stone-800 rounded-xl shadow-2xl text-center">
              <Icons.Lock className="w-12 h-12 text-amber-600 mx-auto mb-6" />
              <h3 className="text-xl text-stone-200 font-heading mb-6">Authorized Personnel Only</h3>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Administrator email"
                className="w-full bg-stone-950 border border-stone-700 rounded-lg px-4 py-3 text-stone-200 mb-3 focus:border-amber-600 focus:outline-none"
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter Password"
                className="w-full bg-stone-950 border border-stone-700 rounded-lg px-4 py-3 text-stone-200 mb-4 focus:border-amber-600 focus:outline-none"
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              />
              <button 
                onClick={handleLogin}
                className="w-full bg-amber-700 hover:bg-amber-600 text-white font-bold py-3 rounded-lg transition-colors"
              >
                {isBusy ? 'Signing in...' : 'Access Dashboard'}
              </button>
              {loginError && <p className="text-red-400 text-sm mt-3">{loginError}</p>}
            </div>
          </div>
        ) : (
          <>
            {/* ---------------- INVENTORY TAB ---------------- */}
            {activeTab === 'inventory' && (
              <div className="h-full flex flex-col">
                <div className="border-b border-stone-800 bg-stone-950 px-5 py-3 flex flex-wrap items-center gap-2">
                  <span className="text-[10px] uppercase tracking-widest text-stone-500 mr-2">Categories</span>
                  {categories.map(category => <span key={category} className="inline-flex items-center gap-2 rounded border border-stone-800 px-2 py-1 text-xs text-stone-300">{category}<button title={`Remove ${category}`} onClick={async () => { if (!window.confirm(`Remove ${category}? Categories with active products cannot be removed.`)) return; try { const updated = await db.deleteCategory(category); setCategories(updated); onCategoriesChange?.(updated); } catch (error) { alert(error instanceof Error ? error.message : 'Could not remove category.'); } }} className="text-stone-500 hover:text-red-400">×</button></span>)}
                  <form className="flex gap-2 ml-auto" onSubmit={async e => { e.preventDefault(); if (!newCategoryName.trim()) return; try { const updated = await db.addCategory(newCategoryName); setCategories(updated); onCategoriesChange?.(updated); setNewCategoryName(''); } catch (error) { alert(error instanceof Error ? error.message : 'Could not add category.'); } }}>
                    <input value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} placeholder="New category" className="w-36 bg-stone-900 border border-stone-700 rounded px-2 py-1.5 text-xs text-stone-200" />
                    <button className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 rounded text-xs text-stone-200">Add</button>
                  </form>
                </div>
                <div className="flex-1 min-h-0 flex flex-col md:flex-row">
                {/* List View */}
                <div className={`w-full md:w-1/3 border-r border-stone-800 flex flex-col ${editingProduct ? 'hidden md:flex' : 'flex'}`}>
                  <div className="p-4 border-b border-stone-800 bg-stone-925 flex gap-2">
                    <div className="relative flex-1">
                      <Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
                      <input 
                        type="text" 
                        placeholder="Search inventory..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-stone-900 border border-stone-700 rounded-lg pl-9 pr-3 py-2 text-sm text-stone-200 focus:outline-none focus:border-amber-600"
                      />
                    </div>
                    <button 
                      onClick={handleAddNew}
                      className="bg-amber-700 hover:bg-amber-600 text-white p-2 rounded-lg"
                      title="Add New Product"
                    >
                      <Icons.Plus className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto">
                    {filteredProducts.map(product => (
                      <div 
                        key={product.id}
                        className="p-4 border-b border-stone-800 hover:bg-stone-900 transition-colors flex gap-3 items-center group"
                      >
                        <div className="relative">
                          <img src={product.image} alt={product.name} className="w-12 h-12 object-cover rounded bg-stone-800" />
                          {/* New indicator in list */}
                          {product.isNewArrival && (
                            <div className="absolute -top-1 -left-1 w-3 h-3 bg-amber-600 rounded-full animate-pulse border border-stone-900"></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-stone-200 font-bold text-sm truncate">{product.name}</h4>
                          <p className="text-stone-500 text-xs">{product.category} • Rs. {(product.salePrice && product.salePrice > 0 && product.salePrice < product.price ? product.salePrice : product.price).toLocaleString("en-PK")}{product.salePrice && product.salePrice > 0 && product.salePrice < product.price ? ' (sale)' : ''}</p>
                        </div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => setEditingProduct(product)}
                            className="p-1.5 text-stone-400 hover:text-amber-500 hover:bg-stone-800 rounded"
                          >
                            <Icons.Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => {
                              if (window.confirm('Delete this masterpiece?')) onDeleteProduct(product.id).catch(error => alert(error.message));
                            }}
                            className="p-1.5 text-stone-400 hover:text-red-500 hover:bg-stone-800 rounded"
                          >
                            <Icons.Trash className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Editor View */}
                <div className={`flex-1 bg-stone-900 p-8 overflow-y-auto ${editingProduct ? 'block' : 'hidden md:block'}`}>
                  {editingProduct ? (
                    <div className="max-w-2xl mx-auto animate-fade-in">
                      <div className="flex justify-between items-center mb-8">
                        <h2 className="text-2xl font-heading text-stone-100">
                          {editingProduct.id ? 'Edit Masterpiece' : 'Weave New Item'}
                        </h2>
                        <div className="flex gap-4">
                          <button 
                            onClick={() => setEditingProduct(null)}
                            className="px-4 py-2 text-stone-400 hover:text-white"
                          >
                            Cancel
                          </button>
                          <button 
                            onClick={handleSaveProduct}
                            className="flex items-center gap-2 px-6 py-2 bg-amber-700 hover:bg-amber-600 text-white rounded-lg font-bold transition-colors"
                          >
                            <Icons.Save className="w-4 h-4" />
                            Save to Loom
                          </button>
                        </div>
                      </div>

                      <div className="space-y-6">
                        {/* Basic Info */}
                        <div className="grid grid-cols-2 gap-6">
                          <div>
                            <label className="block text-stone-500 text-xs uppercase font-bold mb-2">Product Name</label>
                            <input 
                              type="text" 
                              value={editingProduct.name || ''} 
                              onChange={e => setEditingProduct({...editingProduct, name: e.target.value})}
                              className="w-full bg-stone-950 border border-stone-700 rounded p-3 text-stone-200 focus:border-amber-600 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-stone-500 text-xs uppercase font-bold mb-2">Price (PKR)</label>
                            <input 
                              type="number" 
                              value={editingProduct.price || 0} 
                              onChange={e => setEditingProduct({...editingProduct, price: Number(e.target.value)})}
                              className="w-full bg-stone-950 border border-stone-700 rounded p-3 text-stone-200 focus:border-amber-600 focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                          <div>
                            <label className="block text-stone-500 text-xs uppercase font-bold mb-2">Category</label>
                            <select 
                              value={editingProduct.category || 'Tarkashi'}
                              onChange={e => setEditingProduct({...editingProduct, category: e.target.value})}
                              className="w-full bg-stone-950 border border-stone-700 rounded p-3 text-stone-200 focus:border-amber-600 focus:outline-none"
                            >
                              {categories.map(c => (
                                <option key={c} value={c}>{c}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-stone-500 text-xs uppercase font-bold mb-2">Material</label>
                            <input 
                              type="text" 
                              value={editingProduct.material || ''} 
                              onChange={e => setEditingProduct({...editingProduct, material: e.target.value})}
                              placeholder="e.g. 100% Pashmina"
                              className="w-full bg-stone-950 border border-stone-700 rounded p-3 text-stone-200 focus:border-amber-600 focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                          <div>
                            <label className="block text-stone-500 text-xs uppercase font-bold mb-2">Stock quantity</label>
                            <input type="number" min="0" step="1" value={editingProduct.stock ?? 0} onChange={e => setEditingProduct({...editingProduct, stock: Math.max(0, Math.floor(Number(e.target.value) || 0))})} className="w-full bg-stone-950 border border-stone-700 rounded p-3 text-stone-200 focus:border-amber-600 focus:outline-none" />
                            <p className="text-[10px] text-stone-500 mt-1">0 = unlimited / not tracked.</p>
                          </div>
                          <div>
                            <label className="block text-stone-500 text-xs uppercase font-bold mb-2">Sale Price (PKR, optional)</label>
                            <input type="number" min="0" max={editingProduct.price || undefined} value={editingProduct.salePrice ?? ''} onChange={e => setEditingProduct({...editingProduct, salePrice: e.target.value === '' ? null : Number(e.target.value)})} placeholder="Leave blank for no discount" className="w-full bg-stone-950 border border-stone-700 rounded p-3 text-stone-200 focus:border-amber-600 focus:outline-none" />
                            <p className="text-[10px] text-stone-500 mt-1">Must be lower than the regular price.</p>
                          </div>
                          <label className="flex items-center gap-3 self-center text-sm text-stone-300">
                            <input type="checkbox" checked={Boolean(editingProduct.isNewArrival)} onChange={e => setEditingProduct({...editingProduct, isNewArrival: e.target.checked})} className="accent-amber-600 w-4 h-4" />
                            Mark as New Arrival
                          </label>
                        </div>

                        {/* Images */}
                        <div>
                          <label className="block text-stone-500 text-xs uppercase font-bold mb-2">Gallery Images</label>
                          <div 
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                            className={`
                              relative w-full h-48 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300 group overflow-hidden
                              ${dragActive 
                                ? 'border-amber-500 bg-amber-900/20 scale-[1.02]' 
                                : 'border-stone-700 bg-stone-950 hover:border-stone-500 hover:bg-stone-900'
                              }
                            `}
                          >
                            <input 
                              ref={fileInputRef}
                              type="file" 
                              multiple
                              className="hidden" 
                              onChange={handleFileChange}
                              accept="image/jpeg,image/png,image/webp"
                            />
                            
                            <div className="text-center p-6">
                              <div className="w-12 h-12 bg-stone-800 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                <Icons.Upload className="w-6 h-6 text-stone-400 group-hover:text-amber-500 transition-colors" />
                              </div>
                              <p className="text-stone-300 font-bold mb-1">Drop Images Here</p>
                              <p className="text-stone-600 text-xs">Upload multiple for gallery</p>
                            </div>
                          </div>

                          {/* Thumbnails */}
                          {editingProduct.images && editingProduct.images.length > 0 && (
                            <div className="flex flex-wrap gap-3 mt-4">
                              {editingProduct.images.map((img, idx) => (
                                <div key={idx} className="relative w-20 h-20 group">
                                  <img src={img} alt="" className="w-full h-full object-cover rounded border border-stone-700" />
                                  <button 
                                    onClick={() => removeImage(idx)}
                                    className="absolute -top-2 -right-2 bg-red-900 text-red-200 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <Icons.Close className="w-3 h-3" />
                                  </button>
                                  {idx === 0 && <span className="absolute bottom-0 left-0 w-full bg-black/70 text-[10px] text-center text-white">Cover</span>}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Colors */}
                        <div>
                          <label className="block text-stone-500 text-xs uppercase font-bold mb-2">Available Colors</label>
                          <div className="flex items-center gap-4 bg-stone-950 p-3 rounded border border-stone-700">
                            <input 
                              type="color" 
                              value={newColor}
                              onChange={(e) => setNewColor(e.target.value)}
                              className="w-10 h-10 rounded cursor-pointer bg-transparent border-none p-0"
                            />
                            <button 
                              onClick={addColor}
                              className="px-4 py-2 bg-stone-800 hover:bg-stone-700 rounded text-xs font-bold uppercase"
                            >
                              Add Color
                            </button>
                          </div>
                          
                          <div className="flex flex-wrap gap-2 mt-3">
                            {editingProduct.colors?.map((color, idx) => (
                              <div key={idx} className="flex items-center gap-2 bg-stone-800 pl-2 pr-1 py-1 rounded-full">
                                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: color }}></div>
                                <button onClick={() => removeColor(color)} className="text-stone-400 hover:text-white">
                                  <Icons.Close className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block text-stone-500 text-xs uppercase font-bold mb-2">Description (Short)</label>
                          <input 
                            type="text" 
                            value={editingProduct.description || ''} 
                            onChange={e => setEditingProduct({...editingProduct, description: e.target.value})}
                            className="w-full bg-stone-950 border border-stone-700 rounded p-3 text-stone-200 focus:border-amber-600 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-stone-600 opacity-50">
                      <Icons.Edit className="w-16 h-16 mb-4" />
                      <p className="text-xl font-heading">Select a product to edit</p>
                      <p>or click "+" to create new</p>
                    </div>
                  )}
                </div>
                </div>
              </div>
            )}

            {/* ---------------- ORDERS TAB ---------------- */}
            {activeTab === 'orders' && (
              <div className="h-full flex flex-col bg-stone-900">
                {/* Filter Bar */}
                <div className="p-6 border-b border-stone-800 space-y-4">
                  <div className="relative max-w-xl">
                    <input
                      type="search"
                      value={orderSearch}
                      onChange={e => setOrderSearch(e.target.value)}
                      placeholder="Search customer name, email, phone, order ID or product..."
                      aria-label="Search customer orders"
                      className="w-full bg-stone-950 border border-stone-700 rounded-lg px-4 py-3 text-sm text-stone-200 placeholder:text-stone-600 focus:border-amber-600 focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                  {['All', 'Pending', 'Confirmed', 'Dispatched', 'Delivered', 'Cancelled'].map(status => (
                    <button
                      key={status}
                      onClick={() => setOrderFilter(status as any)}
                      className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest border transition-all ${
                        orderFilter === status 
                          ? 'bg-amber-900/20 border-amber-700 text-amber-500' 
                          : 'border-transparent text-stone-500 hover:bg-stone-800'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                  </div>
                  <p className="text-xs text-stone-500">Showing {filteredOrders.length} of {orders.length} orders</p>
                </div>

                {/* Orders List */}
                <div className="flex-1 overflow-y-auto p-6">
                  {filteredOrders.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-stone-600 opacity-50">
                      <Icons.Clipboard className="w-16 h-16 mb-4" />
                      <p className="text-xl font-heading">No orders found.</p>
                    </div>
                  ) : (
                    <div className="space-y-4 max-w-5xl mx-auto">
                      {filteredOrders.map(order => (
                        <div key={order.id} className="bg-stone-950 border border-stone-800 rounded-xl p-6 flex flex-col md:flex-row gap-6 animate-fade-in">
                          {/* Header Info */}
                          <div className="flex-1">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <div className="flex items-center gap-3 mb-1">
                                  <h4 className="text-stone-200 font-bold text-lg">{order.customerName}</h4>
                                  <span className="text-xs text-stone-500 bg-stone-900 px-2 py-1 rounded">
                                    #{order.id.slice(-6)}
                                  </span>
                                </div>
                                <p className="text-stone-500 text-xs flex items-center gap-2">
                                  <Icons.Clock className="w-3 h-3" />
                                  {new Date(order.date).toLocaleString()}
                                </p>
                              </div>
                              <div className={`px-3 py-1 rounded border text-xs font-bold uppercase tracking-widest ${getStatusColor(order.status)}`}>
                                {order.status}
                              </div>
                            </div>

                            <div className="mt-4 rounded-lg border border-stone-800 bg-stone-900/70 p-4 space-y-2">
                              <h5 className="text-[10px] uppercase tracking-widest font-bold text-amber-500 mb-2">Customer & Delivery Details</h5>
                              <p className="text-sm text-stone-300"><span className="text-stone-500 mr-2">Name</span>{order.customerName}</p>
                              <p className="text-sm text-stone-300"><span className="text-stone-500 mr-2">Email</span>{order.email}</p>
                              <p className="text-sm text-stone-300"><span className="text-stone-500 mr-2">Phone</span>{order.phone || 'Not provided'}</p>
                              <p className="text-sm text-stone-300"><span className="text-stone-500 mr-2">City</span>{order.city || 'Not provided'}</p>
                              <p className="text-sm text-stone-300"><span className="text-stone-500 mr-2">Address</span>{order.address}</p>
                            </div>
                          </div>

                          {/* Items & Actions */}
                          <div className="w-full md:w-1/3 flex flex-col justify-between border-t md:border-t-0 md:border-l border-stone-800 pt-4 md:pt-0 md:pl-6">
                            <div className="mb-4">
                              <h5 className="text-xs uppercase font-bold text-stone-500 mb-2">Order Items</h5>
                              <div className="space-y-2 max-h-32 overflow-y-auto custom-scrollbar">
                                {order.items.map((item, idx) => (
                                  <div key={idx} className="flex justify-between text-sm text-stone-300">
                                    <span>{item.quantity}x {item.name}</span>
                                    <span className="text-right text-stone-400">Rs. {(item.price * item.quantity).toLocaleString("en-PK")}{item.originalPrice && item.originalPrice > item.price && <span className="block text-[10px] text-stone-600 line-through">Rs. {(item.originalPrice * item.quantity).toLocaleString("en-PK")}</span>}</span>
                                  </div>
                                ))}
                              </div>
                              <div className="flex justify-between items-center mt-3 pt-3 border-t border-stone-800 font-bold text-amber-500">
                                <span>Total</span>
                                <span>Rs. {order.total.toLocaleString("en-PK")}</span>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="grid grid-cols-2 gap-2">
                              {onTrackOrder && (
                                <button
                                  onClick={() => {
                                    onClose();
                                    onTrackOrder(order.id);
                                  }}
                                  className="col-span-2 bg-stone-900 hover:bg-stone-800 text-amber-300 border border-amber-800/40 py-2 rounded text-xs font-bold uppercase transition-colors flex items-center justify-center gap-1.5"
                                  title="Open in customer Loom Tracker view"
                                >
                                  <Icons.Mountain className="w-3.5 h-3.5 text-amber-500" />
                                  View Loom Journey
                                </button>
                              )}
                              {order.status === 'Pending' && (
                                <button 
                                  onClick={() => handleStatusChange(order.id, 'Confirmed')}
                                  className="col-span-2 bg-blue-900/30 text-blue-400 border border-blue-800 hover:bg-blue-900/50 py-2 rounded text-xs font-bold uppercase transition-colors"
                                >
                                  Confirm Order
                                </button>
                              )}
                              {order.status === 'Confirmed' && (
                                <button 
                                  onClick={() => handleStatusChange(order.id, 'Dispatched')}
                                  className="col-span-2 bg-purple-900/30 text-purple-400 border border-purple-800 hover:bg-purple-900/50 py-2 rounded text-xs font-bold uppercase transition-colors flex items-center justify-center gap-2"
                                >
                                  <Icons.Truck className="w-4 h-4" />
                                  Dispatch
                                </button>
                              )}
                              {order.status === 'Dispatched' && (
                                <button 
                                  onClick={() => handleStatusChange(order.id, 'Delivered')}
                                  className="col-span-2 bg-emerald-900/30 text-emerald-400 border border-emerald-800 hover:bg-emerald-900/50 py-2 rounded text-xs font-bold uppercase transition-colors flex items-center justify-center gap-2"
                                >
                                  <Icons.CheckCircle className="w-4 h-4" />
                                  Mark Delivered
                                </button>
                              )}
                              {order.status !== 'Delivered' && order.status !== 'Cancelled' && (
                                <button 
                                  onClick={() => {
                                     if(window.confirm("Cancel this order?")) handleStatusChange(order.id, 'Cancelled');
                                  }}
                                  className="col-span-2 text-stone-500 hover:text-red-500 text-xs mt-2 underline"
                                >
                                  Cancel Order
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
import React, { useState } from 'react';
import { Icons } from './Icons';
import { CartItem } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onRemove: (id: string) => void;
  onQuantityChange: (id: string, quantity: number) => void;
  onCheckout: (details: { name: string; email: string; phone: string; address: string; city: string }) => Promise<void>;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose, items, onRemove, onQuantityChange, onCheckout }) => {
  const [step, setStep] = useState<'cart' | 'checkout'>('cart');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: ''
  });

  const effectivePrice = (item: CartItem) => item.salePrice && item.salePrice > 0 && item.salePrice < item.price ? item.salePrice : item.price;
  const total = items.reduce((sum, item) => sum + (effectivePrice(item) * item.quantity), 0);

  const handleBack = () => {
    setStep('cart');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone || !formData.address || !formData.city) return;
    
    setIsSubmitting(true);
    onCheckout(formData).then(() => {
      setStep('cart');
      setFormData({ name: '', email: '', phone: '', address: '', city: '' });
    }).catch(() => {}).finally(() => setIsSubmitting(false));
  };

  // Reset step when drawer closes
  React.useEffect(() => {
    if (!isOpen) {
      setTimeout(() => setStep('cart'), 300);
    }
  }, [isOpen]);

  return (
    <div className={`fixed inset-0 z-[60] pointer-events-none ${isOpen ? 'pointer-events-auto' : ''}`}>
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-0'}`} 
        onClick={onClose}
      />

      {/* Drawer */}
      <div className={`absolute top-0 right-0 h-full w-full sm:w-[400px] bg-stone-900 border-l border-stone-800 transform transition-transform duration-500 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-stone-800 flex justify-between items-center">
            <div className="flex items-center gap-2">
              {step === 'checkout' && (
                <button onClick={handleBack} className="text-stone-500 hover:text-white mr-2">
                  <Icons.ArrowRight className="w-5 h-5 rotate-180" />
                </button>
              )}
              <h2 className="font-heading text-2xl text-stone-100">
                {step === 'cart' ? 'Your Loom' : 'Secure Checkout'}
              </h2>
            </div>
            <button onClick={onClose} className="text-stone-500 hover:text-white transition-colors">
              <Icons.Close className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          {step === 'cart' ? (
            <>
              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {items.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-stone-600 gap-4">
                    <Icons.Wind className="w-12 h-12 opacity-50" />
                    <p className="font-accent italic">The loom is empty.</p>
                  </div>
                ) : (
                  items.map((item) => (
                    <div key={item.id} className="flex gap-4 animate-fade-in">
                      <img src={item.image} alt={item.name} className="w-20 h-24 object-cover rounded-sm border border-stone-700" />
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h4 className="font-heading text-stone-200 text-sm">{item.name}</h4>
                          <button onClick={() => onRemove(item.id)} className="text-stone-600 hover:text-red-400">
                            <Icons.Close className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-xs text-stone-500 mt-1">{item.material}</p>
                        <div className="flex justify-between items-center mt-4">
                          <div className="flex items-center gap-2" aria-label={`Quantity for ${item.name}`}>
                            <button type="button" onClick={() => onQuantityChange(item.id, item.quantity - 1)} disabled={item.quantity <= 1}
                              aria-label={`Decrease ${item.name} quantity`} className="w-7 h-7 rounded border border-stone-700 text-stone-300 hover:border-amber-600 disabled:opacity-30 disabled:cursor-not-allowed">−</button>
                            <span className="min-w-5 text-center text-stone-300 text-sm tabular-nums">{item.quantity}</span>
                            <button type="button" onClick={() => onQuantityChange(item.id, item.quantity + 1)} disabled={item.quantity >= 20 || (Number(item.stock) > 0 && item.quantity >= Number(item.stock))}
                              aria-label={`Increase ${item.name} quantity`} className="w-7 h-7 rounded border border-stone-700 text-stone-300 hover:border-amber-600 disabled:opacity-30 disabled:cursor-not-allowed">+</button>
                          </div>
                          <span className="text-right"><span className="block text-amber-500 font-bold">Rs. {(effectivePrice(item) * item.quantity).toLocaleString("en-PK")}</span>{effectivePrice(item) < item.price && <span className="block text-[10px] text-stone-500 line-through">Rs. {(item.price * item.quantity).toLocaleString("en-PK")}</span>}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="p-6 bg-stone-950 border-t border-stone-800">
                <div className="flex justify-between items-center mb-6 text-stone-200">
                  <span className="font-body uppercase tracking-widest text-sm">Total</span>
                  <span className="font-heading text-xl">Rs. {total.toLocaleString("en-PK")}</span>
                </div>
                <button 
                  onClick={() => setStep('checkout')}
                  className="w-full py-4 bg-amber-700 text-white font-bold uppercase tracking-widest hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
                  disabled={items.length === 0}
                >
                  Proceed to Checkout
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Checkout Form */}
              <div className="flex-1 overflow-y-auto p-6">
                <form id="checkout-form" onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-stone-500 text-xs uppercase font-bold mb-2">Full Name</label>
                    <input 
                      required
                      type="text" 
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-stone-950 border border-stone-700 rounded p-3 text-stone-200 focus:border-amber-600 focus:outline-none"
                      placeholder="Gul Zareen"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-500 text-xs uppercase font-bold mb-2">Email Address</label>
                    <input 
                      required
                      type="email" 
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                      className="w-full bg-stone-950 border border-stone-700 rounded p-3 text-stone-200 focus:border-amber-600 focus:outline-none"
                      placeholder="guest@islampur.com"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-500 text-xs uppercase font-bold mb-2">Phone Number</label>
                    <input required type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
                      className="w-full bg-stone-950 border border-stone-700 rounded p-3 text-stone-200 focus:border-amber-600 focus:outline-none" placeholder="03XX XXXXXXX" />
                  </div>
                  <div>
                    <label className="block text-stone-500 text-xs uppercase font-bold mb-2">City</label>
                    <input required type="text" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})}
                      className="w-full bg-stone-950 border border-stone-700 rounded p-3 text-stone-200 focus:border-amber-600 focus:outline-none" placeholder="Mingora, Swat" />
                  </div>
                  <div>
                    <label className="block text-stone-500 text-xs uppercase font-bold mb-2">Shipping Address</label>
                    <textarea 
                      required
                      value={formData.address}
                      onChange={e => setFormData({...formData, address: e.target.value})}
                      rows={4}
                      className="w-full bg-stone-950 border border-stone-700 rounded p-3 text-stone-200 focus:border-amber-600 focus:outline-none"
                      placeholder="Village, Street, City..."
                    />
                  </div>
                  
                  <div className="pt-4 border-t border-stone-800">
                    <h3 className="font-heading text-stone-400 mb-4">Order Summary</h3>
                    <div className="space-y-2 mb-4">
                      {items.map(item => (
                        <div key={item.id} className="flex justify-between text-sm text-stone-500">
                          <span>{item.quantity}x {item.name}</span>
                          <span>Rs. {(effectivePrice(item) * item.quantity).toLocaleString("en-PK")}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between items-center text-stone-200 font-bold">
                      <span>Total to Pay</span>
                      <span className="text-amber-500 font-heading text-xl">Rs. {total.toLocaleString("en-PK")}</span>
                    </div>
                  </div>
                </form>
              </div>

              {/* Footer */}
              <div className="p-6 bg-stone-950 border-t border-stone-800">
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  form="checkout-form"
                  className="w-full py-4 bg-gradient-to-r from-amber-800 to-amber-600 text-white font-bold uppercase tracking-widest hover:from-amber-700 hover:to-amber-500 transition-all shadow-lg shadow-amber-900/20" 
                >
                  {isSubmitting ? 'Placing Order...' : 'Place COD Order'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartDrawer;
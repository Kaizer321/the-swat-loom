import React, { useEffect, useState } from 'react';
import { Icons } from './Icons';
import { Order, OrderStatus } from '../types';
import { db } from '../services/db';

interface OrderTrackerProps {
  isOpen: boolean;
  onClose: () => void;
  initialOrderId?: string;
  onOpenStylistWithContext?: (query: string) => void;
}

const ORDER_STAGES: OrderStatus[] = ['Pending', 'Confirmed', 'Dispatched', 'Delivered'];

const STATUS_COPY: Record<OrderStatus, string> = {
  Pending: 'Your order has been received and is awaiting confirmation.',
  Confirmed: 'Your order is confirmed and is being prepared.',
  Dispatched: 'Your order has been dispatched and is on its way.',
  Delivered: 'Your order has been delivered. Thank you for shopping with us.',
  Cancelled: 'This order has been cancelled. Please contact us if you need help.'
};

const formatDate = (value?: string) => {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString('en-PK', {
    day: 'numeric', month: 'short', year: 'numeric'
  });
};

export const OrderTracker: React.FC<OrderTrackerProps> = ({ isOpen, onClose, initialOrderId }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [phoneQuery, setPhoneQuery] = useState('');
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (initialOrderId) {
      setSearchQuery(initialOrderId);
      setPhoneQuery('');
      setActiveOrder(null);
      setErrorMsg('Enter the phone number used for this order to verify your identity.');
    } else {
      setSearchQuery('');
      setActiveOrder(null);
      setErrorMsg(null);
    }
  }, [isOpen, initialOrderId]);

  const lookupOrder = async (value: string, phone: string) => {
    const lookup = value.trim();
    if (!lookup || !phone.trim()) {
      setErrorMsg('Enter your order number and the phone number used at checkout.');
      setActiveOrder(null);
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setActiveOrder(null);
    try {
      const order = await db.getOrderById(lookup, phone);
      if (order) setActiveOrder(order);
      else setErrorMsg('We couldn’t find an order with those details. Please check the number and try again.');
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : 'We couldn’t retrieve your order. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    void lookupOrder(searchQuery, phoneQuery);
  };

  const handleCopy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setErrorMsg('Could not copy the order number. You can select and copy it manually.');
    }
  };

  if (!isOpen) return null;

  const isCancelled = activeOrder?.status === 'Cancelled';
  const currentStage = activeOrder ? ORDER_STAGES.indexOf(activeOrder.status) : -1;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-6">
      <button aria-label="Close order tracking" className="absolute inset-0 bg-stone-950/70 backdrop-blur-sm" onClick={onClose} />

      <section role="dialog" aria-modal="true" aria-labelledby="order-tracker-title" className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white text-stone-900 shadow-2xl">
        <header className="flex items-center justify-between border-b border-stone-100 px-5 py-4 sm:px-7">
          <div>
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-stone-500">The Swat Loom</p>
            <h2 id="order-tracker-title" className="font-heading text-xl sm:text-2xl">Track your order</h2>
          </div>
          <button onClick={onClose} aria-label="Close" className="rounded-full p-2 text-stone-500 transition hover:bg-stone-100 hover:text-stone-900">
            <Icons.Close className="h-5 w-5" />
          </button>
        </header>

        <div className="overflow-y-auto">
          <div className="border-b border-stone-100 px-5 py-5 sm:px-7 sm:py-6">
            <p className="mb-3 text-sm text-stone-600">Enter your order number and the phone number used at checkout to verify your order.</p>
            <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row">
              <div className="relative flex-1">
                <Icons.Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Order number or tracking code"
                  aria-label="Order number or tracking code"
                  className="w-full rounded-lg border border-stone-200 bg-stone-50 py-3 pl-10 pr-3 text-sm outline-none transition placeholder:text-stone-400 focus:border-stone-500 focus:bg-white focus:ring-2 focus:ring-stone-100"
                />
              </div>
              <input
                value={phoneQuery}
                onChange={(event) => setPhoneQuery(event.target.value)}
                placeholder="Checkout phone number"
                aria-label="Phone number used at checkout"
                autoComplete="tel"
                className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-3 text-sm outline-none transition placeholder:text-stone-400 focus:border-stone-500 focus:bg-white focus:ring-2 focus:ring-stone-100 sm:w-48"
              />
              <button type="submit" disabled={isLoading} className="inline-flex items-center justify-center gap-2 rounded-lg bg-stone-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-stone-700 disabled:cursor-wait disabled:opacity-60">
                {isLoading ? 'Checking…' : 'Track order'}
              </button>
            </form>
            {errorMsg && <p role="alert" className="mt-3 rounded-lg bg-red-50 px-3.5 py-3 text-sm text-red-700">{errorMsg}</p>}
          </div>

          {activeOrder ? (
            <div className="space-y-6 px-5 py-5 sm:px-7 sm:py-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-stone-500">Order number</p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="font-mono text-base font-semibold">#{activeOrder.id}</span>
                    <button onClick={() => void handleCopy(activeOrder.id)} aria-label="Copy order number" className="rounded p-1 text-stone-400 transition hover:bg-stone-100 hover:text-stone-800">
                      {copied ? <Icons.Check className="h-4 w-4" /> : <Icons.Copy className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <span className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold ${isCancelled ? 'bg-red-50 text-red-700' : 'bg-stone-100 text-stone-800'}`}>
                  <span className={`mr-2 h-1.5 w-1.5 rounded-full ${isCancelled ? 'bg-red-500' : 'bg-emerald-600'}`} />
                  {activeOrder.status}
                </span>
              </div>

              <div className="rounded-xl border border-stone-200 p-4 sm:p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-semibold">Order status</h3>
                    <p className="mt-1 text-sm leading-relaxed text-stone-600">{STATUS_COPY[activeOrder.status]}</p>
                  </div>
                  {activeOrder.estimatedDelivery && !isCancelled && (
                    <div className="sm:text-right">
                      <p className="text-xs text-stone-500">Estimated delivery</p>
                      <p className="mt-1 text-sm font-semibold">{formatDate(activeOrder.estimatedDelivery)}</p>
                    </div>
                  )}
                </div>

                {!isCancelled && (
                  <div className="mt-6 grid grid-cols-4 gap-2">
                    {ORDER_STAGES.map((stage, index) => {
                      const complete = index <= currentStage;
                      return (
                        <div key={stage}>
                          <div className={`mb-2 h-1.5 rounded-full ${complete ? 'bg-stone-900' : 'bg-stone-100'}`} />
                          <p className={`text-[10px] sm:text-xs ${complete ? 'font-semibold text-stone-900' : 'text-stone-400'}`}>{stage}</p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-stone-500">Order date</p>
                  <p className="mt-1 font-medium">{formatDate(activeOrder.date)}</p>
                </div>
                <div>
                  <p className="text-xs text-stone-500">Payment method</p>
                  <p className="mt-1 font-medium">{activeOrder.paymentMethod === 'COD' ? 'Cash on Delivery' : activeOrder.paymentMethod || '—'}</p>
                </div>
              </div>

              <div className="border-t border-stone-100 pt-5">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h3 className="text-sm font-semibold">Items in this order</h3>
                  <span className="text-xs text-stone-500">{activeOrder.items.length} {activeOrder.items.length === 1 ? 'item' : 'items'}</span>
                </div>
                <div className="space-y-3">
                  {activeOrder.items.map((item, index) => (
                    <div key={`${item.id}-${index}`} className="flex items-center gap-3">
                      <img src={item.image} alt={item.name} className="h-16 w-12 rounded-md bg-stone-100 object-cover" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{item.name}</p>
                        <p className="mt-1 text-xs text-stone-500">Qty {item.quantity}{item.selectedColor ? ` · ${item.selectedColor}` : ''}</p>
                      </div>
                      <p className="whitespace-nowrap text-sm font-medium">Rs. {(item.price * item.quantity).toLocaleString('en-PK')}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-stone-100 pt-4">
                  <span className="text-sm font-semibold">Order total</span>
                  <span className="text-base font-semibold">Rs. {activeOrder.total.toLocaleString('en-PK')}</span>
                </div>
              </div>
            </div>
          ) : !errorMsg && !isLoading ? (
            <div className="px-5 py-14 text-center sm:px-7">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-stone-100 text-stone-500">
                <Icons.Package className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-semibold">Your order updates, in one place</h3>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-stone-500">Enter your order number above to view its current status and order summary.</p>
            </div>
          ) : null}
        </div>

        <footer className="flex items-center justify-between border-t border-stone-100 bg-stone-50 px-5 py-3.5 sm:px-7">
          <span className="text-xs text-stone-500">Need help? Contact our support team.</span>
          <button onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-200">Close</button>
        </footer>
      </section>
    </div>
  );
};

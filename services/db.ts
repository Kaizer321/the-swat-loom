import { Product, Order, OrderStatus, CartItem } from '../types';

const API_BASE = '/api';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  if (options.body) headers.set('Content-Type', 'application/json');
  const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || `Request failed (${response.status})`);
  return payload as T;
}

export const db = {
  init: async (): Promise<void> => { /* Database initialization and seed are server-side. */ },
  getAll: async (): Promise<Product[]> => request<Product[]>('/products'),
  getCategories: async (): Promise<string[]> => request<string[]>('/categories'),
  addCategory: async (name: string): Promise<string[]> => request<string[]>('/admin/categories', { method: 'POST', body: JSON.stringify({ name }) }),
  deleteCategory: async (name: string): Promise<string[]> => request<string[]>(`/admin/categories/${encodeURIComponent(name)}`, { method: 'DELETE' }),
  uploadProductImage: async (dataUrl: string): Promise<string> => {
    const result = await request<{ url: string }>('/admin/product-images', { method: 'POST', body: JSON.stringify({ dataUrl }) });
    return result.url;
  },
  save: async (product: Product): Promise<Product[]> => {
    await request('/admin/products', { method: 'PUT', body: JSON.stringify(product) });
    return db.getAll();
  },
  delete: async (id: string): Promise<Product[]> => {
    await request(`/admin/products/${encodeURIComponent(id)}`, { method: 'DELETE' });
    return db.getAll();
  },
  getOrders: async (): Promise<Order[]> => request<Order[]>('/admin/orders'),
  getOrderById: async (id: string, phone: string): Promise<Order | undefined> => {
    if (!id?.trim() || !phone?.trim()) return undefined;
    try { return await request<Order>(`/orders/track/${encodeURIComponent(id.trim())}?phone=${encodeURIComponent(phone.trim())}`); }
    catch (error) { if ((error as Error).message.includes('not found')) return undefined; throw error; }
  },
  createOrder: async (details: { name: string; email: string; phone: string; address: string; city: string; items: CartItem[] }): Promise<Order> =>
    request<Order>('/orders', { method: 'POST', body: JSON.stringify(details) }),
  updateOrderStatus: async (id: string, status: OrderStatus): Promise<Order[]> => {
    await request(`/admin/orders/${encodeURIComponent(id)}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
    return db.getOrders();
  },
  adminLogin: async (email: string, password: string): Promise<void> => {
    await request('/admin/login', { method: 'POST', body: JSON.stringify({ email, password }) });
  },
  adminLogout: async (): Promise<void> => { await request('/admin/logout', { method: 'POST' }); },
};

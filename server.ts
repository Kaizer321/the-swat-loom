import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import http from 'http';
import { randomUUID } from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';
import { WebSocketServer, WebSocket } from 'ws';
import { GoogleGenAI, Modality } from '@google/genai';
import type { LiveServerMessage } from '@google/genai';
import { PRODUCTS, SIGNATURE_SHAWLS, STYLIST_SYSTEM_INSTRUCTION } from './constants.ts';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import type { Product, OrderStatus } from './types.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env.local or .env if present
if (typeof process.loadEnvFile === 'function') {
  try { process.loadEnvFile(path.resolve(__dirname, '.env.local')); } catch {}
  try { process.loadEnvFile(path.resolve(__dirname, '.env')); } catch {}
}

const app = express();
const server = http.createServer(app);

app.disable('x-powered-by');
app.use(cors({
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',').map(value => value.trim()).filter(Boolean) : (process.env.NODE_ENV === 'production' ? false : true),
  credentials: false,
}));
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Lightweight per-process AI rate limits. Use a shared store (Redis/Upstash)
// if this service is deployed with more than one server instance.
type RateEntry = { count: number; resetAt: number };
const rateBuckets = new Map<string, RateEntry>();
const clientAddress = (req: Request) => req.socket.remoteAddress || 'unknown';
const rateLimit = (scope: string, max: number, windowMs: number) =>
  (req: Request, res: Response, next: Function) => {
    const now = Date.now();
    const key = `${scope}:${clientAddress(req)}`;
    let entry = rateBuckets.get(key);
    if (!entry || entry.resetAt <= now) { entry = { count: 0, resetAt: now + windowMs }; rateBuckets.set(key, entry); }
    entry.count += 1;
    res.setHeader('RateLimit-Limit', String(max));
    res.setHeader('RateLimit-Remaining', String(Math.max(0, max - entry.count)));
    if (entry.count > max) {
      res.setHeader('Retry-After', String(Math.max(1, Math.ceil((entry.resetAt - now) / 1000))));
      res.status(429).json({ error: 'Too many requests. Please wait and try again.' });
      return;
    }
    next();
  };
const rateCleanup = setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateBuckets) if (entry.resetAt <= now) rateBuckets.delete(key);
}, 60_000);
rateCleanup.unref?.();

// Helper to get GoogleGenAI client with standard user agent
const getGenAI = (): GoogleGenAI | null => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// Supabase is server-only. Normalize common dashboard/API URL mistakes before
// creating clients, and fail closed with a clear configuration message.
const DEFAULT_CATEGORIES = ['Pashmina', 'Tarkashi', 'Woolen', 'Stallers', 'Printed', 'Mens Shawls', 'Kaddi'];
let ALLOWED_CATEGORIES = new Set(DEFAULT_CATEGORIES);
const refreshCategories = async () => {
  const { data, error } = await supabaseAdmin!.from('categories').select('name').eq('is_active', true).order('sort_order', { ascending: true });
  if (error) throw error;
  ALLOWED_CATEGORIES = new Set((data || []).map((row: any) => row.name));
  return [...ALLOWED_CATEGORIES];
};
const normalizeSupabaseProjectUrl = (raw: string | undefined): string | null => {
  if (!raw?.trim()) return null;
  try {
    const parsed = new URL(raw.trim().replace(/\/+$/, ''));
    if (!['https:', 'http:'].includes(parsed.protocol) || parsed.username || parsed.password || parsed.search || parsed.hash) return null;
    // Accept the project root and the common PostgREST/Auth suffixes, but not
    // dashboard URLs or arbitrary paths that cause PGRST125 invalid-path errors.
    const path = parsed.pathname.replace(/\/+$/, '');
    if (path === '/rest/v1' || path === '/auth/v1') parsed.pathname = '';
    else if (path !== '') return null;
    if (parsed.protocol !== 'https:' && !['localhost', '127.0.0.1'].includes(parsed.hostname)) return null;
    return parsed.origin;
  } catch { return null; }
};
const supabaseUrl = normalizeSupabaseProjectUrl(process.env.SUPABASE_URL);
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY?.trim();
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
const supabaseConfigError = !process.env.SUPABASE_URL ? 'SUPABASE_URL is missing.' : !supabaseUrl ? 'SUPABASE_URL must be the Supabase project root URL (for example https://your-project.supabase.co). Remove dashboard paths or custom URL paths.' : !supabaseAnonKey ? 'SUPABASE_ANON_KEY is missing.' : !supabaseServiceKey ? 'SUPABASE_SERVICE_ROLE_KEY is missing.' : null;
if (supabaseConfigError) console.error(`[Supabase config] ${supabaseConfigError}`);
else console.info(`[Supabase config] Project URL validated: ${supabaseUrl}`);
const supabaseReady = Boolean(supabaseUrl && supabaseAnonKey && supabaseServiceKey);
const supabaseAdmin: SupabaseClient | null = supabaseReady
  ? createClient(supabaseUrl!, supabaseServiceKey!, { auth: { persistSession: false, autoRefreshToken: false } })
  : null;
const supabaseAuth: SupabaseClient | null = supabaseReady
  ? createClient(supabaseUrl!, supabaseAnonKey!, { auth: { persistSession: false, autoRefreshToken: false } })
  : null;

const requireDatabase = (_req: Request, res: Response, next: Function) => {
  if (!supabaseAdmin || !supabaseAuth) { res.status(503).json({ error: supabaseConfigError || 'Database is not configured. Check the server Supabase environment variables.' }); return; }
  next();
};
const requireAdmin = async (req: Request, res: Response, next: Function) => {
  try {
    const cookieHeader = req.headers.cookie || '';
    const token = cookieHeader.split(';').map(part => part.trim()).find(part => part.startsWith('swat_admin_session='))?.slice('swat_admin_session='.length);
    if (!token || !supabaseAdmin || !supabaseAuth) { res.status(401).json({ error: 'Admin login required.' }); return; }
    const { data: userData, error: userError } = await supabaseAuth.auth.getUser(token);
    if (userError || !userData.user) { res.status(401).json({ error: 'Admin session expired. Please sign in again.' }); return; }
    const { data: admin, error } = await supabaseAdmin.from('admin_users').select('user_id').eq('user_id', userData.user.id).maybeSingle();
    if (error || !admin) { res.status(403).json({ error: 'This account is not authorized as an administrator.' }); return; }
    (req as any).adminUser = userData.user;
    next();
  } catch (error) { console.error('Admin authorization error:', error); res.status(500).json({ error: 'Could not verify administrator.' }); }
};

const mapProduct = (row: any): Product => ({
  id: row.id, name: row.name, price: row.price, description: row.description || '',
  longDescription: row.long_description || '', material: row.material || '', category: row.category || 'Tarkashi',
  gender: row.gender || undefined, image: row.image || '', images: row.images || [], tags: row.tags || [],
  colors: row.colors || [], createdAt: row.created_at, salePrice: row.sale_price == null ? null : Number(row.sale_price), isNewArrival: Boolean(row.is_new_arrival), stock: Number(row.stock || 0),
});
const productToRow = (p: Product) => ({
  id: p.id, name: p.name, price: Math.round(Number(p.price)), stock: Math.max(0, Math.floor(Number(p.stock) || 0)), sale_price: p.salePrice == null || p.salePrice === 0 ? null : Math.round(Number(p.salePrice)), is_new_arrival: Boolean(p.isNewArrival), description: p.description || '',
  long_description: p.longDescription || '', material: p.material || '', category: p.category || 'Tarkashi',
  gender: p.gender || null, image: p.image || '', images: p.images || [], tags: p.tags || [], colors: p.colors || [],
  updated_at: new Date().toISOString(),
});
const escapeEmailHtml = (value: unknown) => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]!));

const sendOrderConfirmationEmail = async (order: any) => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('Order confirmation email skipped: RESEND_API_KEY is not configured.');
    return;
  }
  const resend = new Resend(apiKey);
  const testMode = process.env.EMAIL_TEST_MODE === 'true';
  const recipient = testMode ? (process.env.EMAIL_TEST_TO || order.email) : order.email;
  const from = process.env.EMAIL_FROM || 'The Swat Loom <onboarding@resend.dev>';
  const siteUrl = (process.env.PUBLIC_SITE_URL || 'http://localhost:5173').replace(/\/$/, '');
  const itemsHtml = (order.items || []).map((item: any) => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #eee">${escapeEmailHtml(item.name)} × ${Number(item.quantity) || 1}</td>
      <td style="padding:10px 0;border-bottom:1px solid #eee;text-align:right">PKR ${(Number(item.price) * Number(item.quantity || 1)).toLocaleString('en-PK')}</td>
    </tr>`).join('');
  const html = `<!doctype html><html><body style="margin:0;background:#f5f3ef;font-family:Arial,sans-serif;color:#292524">
    <div style="max-width:600px;margin:30px auto;background:#fff;padding:32px;border:1px solid #e7e5e4">
      <p style="letter-spacing:3px;text-transform:uppercase;color:#a16207;font-size:12px">The Swat Loom</p>
      <h1 style="font-family:Georgia,serif;font-weight:normal">Thank you for your order, ${escapeEmailHtml(order.customer_name)}.</h1>
      <p>We've received your order and will contact you when its status changes.</p>
      <div style="background:#fafaf9;padding:16px;margin:24px 0"><div style="color:#78716c;font-size:12px">ORDER ID</div><strong style="font-size:18px">${escapeEmailHtml(order.id)}</strong></div>
      <table style="width:100%;border-collapse:collapse">${itemsHtml}</table>
      <p style="text-align:right;font-size:18px"><strong>Total: PKR ${Number(order.total).toLocaleString('en-PK')}</strong></p>
      <p><strong>Payment:</strong> Cash on Delivery</p>
      <p><strong>Delivery address:</strong><br>${escapeEmailHtml(order.address)}, ${escapeEmailHtml(order.city)}</p>
      <p style="margin-top:28px"><a href="${siteUrl}" style="display:inline-block;background:#a16207;color:#fff;text-decoration:none;padding:13px 20px">Visit The Swat Loom</a></p>
      <p style="font-size:13px;color:#78716c">To track your order, open our website's Track Order section and enter your Order ID and checkout phone number.</p>
    </div></body></html>`;
  const { error } = await resend.emails.send({ from, to: [recipient], subject: `The Swat Loom order confirmation — ${order.id}`, html });
  if (error) throw new Error(error.message || 'Resend could not send the confirmation email.');
  console.info(`Order confirmation email accepted by Resend for ${order.id}${testMode ? ' (test mode)' : ''}.`);
};

const mapOrder = (row: any) => ({
  id: row.id, trackingCode: row.tracking_code, customerName: row.customer_name, email: row.email,
  phone: row.phone, address: row.address, city: row.city, items: row.items || [], total: row.total,
  subtotal: row.subtotal, deliveryFee: row.delivery_fee, currency: row.currency || 'PKR',
  status: row.status, paymentMethod: row.payment_method, paymentStatus: row.payment_status,
  date: row.created_at, artisan: row.artisan || undefined, estimatedDelivery: row.estimated_delivery || undefined,
});

app.post('/api/admin/login', rateLimit('admin-login', 5, 15 * 60_000), requireDatabase, async (req: Request, res: Response) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const password = String(req.body?.password || '');
    if (!email || !password) { res.status(400).json({ error: 'Email and password are required.' }); return; }
    const { data, error } = await supabaseAuth!.auth.signInWithPassword({ email, password });
    if (error || !data.session || !data.user) { res.status(401).json({ error: 'Invalid email or password.' }); return; }
    const { data: admin } = await supabaseAdmin!.from('admin_users').select('user_id').eq('user_id', data.user.id).maybeSingle();
    if (!admin) { await supabaseAuth!.auth.signOut(); res.status(403).json({ error: 'This account is not on the administrator allow-list.' }); return; }
    const maxAge = Math.max(60, (data.session.expires_at || Math.floor(Date.now() / 1000) + 3600) - Math.floor(Date.now() / 1000));
    const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
    res.setHeader('Set-Cookie', `swat_admin_session=${data.session.access_token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${maxAge}${secure}`);
    res.json({ success: true });
  } catch (error) { console.error('Admin login error:', error); res.status(500).json({ error: 'Unable to sign in.' }); }
});


app.post('/api/admin/logout', requireDatabase, (req: Request, res: Response) => {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader('Set-Cookie', `swat_admin_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0${secure}`);
  res.json({ success: true });
});

app.get('/api/categories', requireDatabase, async (_req: Request, res: Response) => {
  try { res.json(await refreshCategories()); } catch (error) { console.error('Categories error:', error); res.status(500).json({ error: 'Could not load categories.' }); }
});

app.get('/api/products', requireDatabase, async (_req: Request, res: Response) => {
  try { await refreshCategories();
    // Read active and inactive rows so an empty active catalogue never causes
    // previously hidden/deactivated products to be silently reactivated.
    const { data: existingRows, error } = await supabaseAdmin!.from('products').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    if (!existingRows?.length) {
      const uniqueSeed = Array.from(new Map([...PRODUCTS, ...SIGNATURE_SHAWLS].map((product: any) => [product.id, product])).values());
      const seed = uniqueSeed.filter((product: any) => ALLOWED_CATEGORIES.has(product.category)).map((product: any) => ({ ...productToRow(product), is_active: true }));
      const { data: seeded, error: seedError } = await supabaseAdmin!.from('products').upsert(seed, { onConflict: 'id' }).select('*');
      if (seedError) throw seedError;
      res.json((seeded || []).filter((row: any) => row.is_active && ALLOWED_CATEGORIES.has(row.category)).map(mapProduct)); return;
    }
    res.json(existingRows.filter((row: any) => row.is_active && ALLOWED_CATEGORIES.has(row.category)).map(mapProduct));
  } catch (error: any) { console.error('Products error:', error); res.status(500).json({ error: 'Could not load products.' }); }
});

app.post('/api/admin/categories', requireDatabase, requireAdmin, async (req: Request, res: Response) => {
  try {
    const name = String(req.body?.name || '').trim().replace(/\s+/g, ' ');
    if (!name || name.length > 40) { res.status(400).json({ error: 'Enter a category name (maximum 40 characters).' }); return; }
    await refreshCategories();
    if ([...ALLOWED_CATEGORIES].some(existing => existing.toLowerCase() === name.toLowerCase())) { res.status(409).json({ error: 'That category already exists.' }); return; }
    const { error } = await supabaseAdmin!.from('categories').upsert({ name, is_active: true, sort_order: 100 }, { onConflict: 'name' });
    if (error) throw error;
    res.json(await refreshCategories());
  } catch (error: any) { console.error('Add category error:', error); res.status(500).json({ error: 'Could not add category.' }); }
});
app.delete('/api/admin/categories/:name', requireDatabase, requireAdmin, async (req: Request, res: Response) => {
  try {
    const name = decodeURIComponent(req.params.name);
    const { count, error: countError } = await supabaseAdmin!.from('products').select('id', { count: 'exact', head: true }).eq('category', name).eq('is_active', true);
    if (countError) throw countError;
    if ((count || 0) > 0) { res.status(409).json({ error: 'Move or deactivate the products in this category before removing it. Existing orders will remain untouched.' }); return; }
    const { error } = await supabaseAdmin!.from('categories').update({ is_active: false }).eq('name', name);
    if (error) throw error;
    res.json(await refreshCategories());
  } catch (error: any) { console.error('Remove category error:', error); res.status(500).json({ error: 'Could not remove category.' }); }
});

app.put('/api/admin/products', requireDatabase, requireAdmin, async (req: Request, res: Response) => {
  try { await refreshCategories();
    const product = req.body as Product;
    if (!product?.id || !product.name || !Number.isFinite(Number(product.price)) || Number(product.price) < 0) { res.status(400).json({ error: 'Valid product ID, name and price are required.' }); return; }
    if (!ALLOWED_CATEGORIES.has(String(product.category))) { res.status(400).json({ error: 'This category is not available in the current storefront.' }); return; }
    if (product.salePrice != null && product.salePrice !== 0 && (!Number.isFinite(Number(product.salePrice)) || Number(product.salePrice) < 0 || Number(product.salePrice) >= Number(product.price))) { res.status(400).json({ error: 'Sale price must be lower than the regular price.' }); return; }
    const { error } = await supabaseAdmin!.from('products').upsert({ ...productToRow(product), is_active: true }, { onConflict: 'id' });
    if (error) throw error;
    res.json({ success: true });
  } catch (error: any) { console.error('Save product error:', error); res.status(500).json({ error: 'Could not save product.' }); }
});
app.post('/api/admin/product-images', requireDatabase, requireAdmin, async (req: Request, res: Response) => {
  try {
    const dataUrl = String(req.body?.dataUrl || '');
    const match = dataUrl.match(/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/);
    if (!match) { res.status(400).json({ error: 'Upload a JPG, PNG or WebP image.' }); return; }
    const mimeType = match[1];
    const bytes = Buffer.from(match[2], 'base64');
    if (!bytes.length || bytes.length > 8 * 1024 * 1024) { res.status(413).json({ error: 'Each image must be smaller than 8 MB.' }); return; }
    const extension = mimeType === 'image/jpeg' ? 'jpg' : mimeType === 'image/png' ? 'png' : 'webp';
    const objectPath = `products/${randomUUID()}.${extension}`;
    const { error } = await supabaseAdmin!.storage.from('product-images').upload(objectPath, bytes, { contentType: mimeType, upsert: false });
    if (error) throw error;
    const { data } = supabaseAdmin!.storage.from('product-images').getPublicUrl(objectPath);
    res.status(201).json({ url: data.publicUrl });
  } catch (error) { console.error('Product image upload error:', error); res.status(500).json({ error: 'Could not upload product image. Check that the product-images storage bucket exists.' }); }
});

app.delete('/api/admin/products/:id', requireDatabase, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { error } = await supabaseAdmin!.from('products').update({ is_active: false, updated_at: new Date().toISOString() }).eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (error) { console.error('Delete product error:', error); res.status(500).json({ error: 'Could not delete product.' }); }
});

app.post('/api/orders', rateLimit('checkout', 10, 10 * 60_000), requireDatabase, async (req: Request, res: Response) => {
  try {
    const { name, email, phone, address, city, items } = req.body || {};
    if (!name?.trim() || !email?.trim() || !phone?.trim() || !address?.trim() || !city?.trim() || !Array.isArray(items) || !items.length) {
      res.status(400).json({ error: 'Name, email, phone, delivery address, city and at least one item are required.' }); return;
    }
    await refreshCategories();
    const ids = [...new Set(items.map((item: any) => String(item.id)))];
    const { data: products, error: productsError } = await supabaseAdmin!.from('products').select('id,name,price,sale_price,stock,image,material,category,description,long_description,tags,colors').in('id', ids).eq('is_active', true).in('category', [...ALLOWED_CATEGORIES]);
    if (productsError) throw productsError;
    const productMap = new Map((products || []).map((product: any) => [product.id, product]));
    const safeItems = items.map((item: any) => {
      const product: any = productMap.get(String(item.id));
      const quantity = Math.max(1, Math.min(20, Math.floor(Number(item.quantity) || 1)));
      if (!product) throw new Error(`Product ${item.id} is unavailable.`);
      if (Number(product.stock || 0) > 0 && quantity > Number(product.stock)) throw new Error(`${product.name} has only ${product.stock} item(s) left.`);
      const effectivePrice = product.sale_price != null && Number(product.sale_price) > 0 && Number(product.sale_price) < Number(product.price) ? Number(product.sale_price) : Number(product.price);
      return { id: product.id, name: product.name, price: effectivePrice, originalPrice: Number(product.price), quantity, image: product.image, material: product.material, category: product.category, description: product.description, longDescription: product.long_description, tags: product.tags || [], colors: product.colors || [], selectedColor: item.selectedColor || null };
    });
    const subtotal = safeItems.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);
    const deliveryFee = 0;
    const total = subtotal + deliveryFee;
    const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
    const id = `SWAT-${Date.now().toString().slice(-6)}-${suffix}`;
    const trackingCode = `SWAT-EXP-${suffix}-PK`;
    const artisans = [
      { name: 'Ustad Gul Zareen', village: 'Islampur, Swat Valley', experienceYears: 34, loomId: 'Kaddi Loom #07', technique: 'Fine Tarkashi Geometric Openwork' },
      { name: 'Ustad Bacha Khan', village: 'Islampur, Swat Valley', experienceYears: 42, loomId: 'Highland Pit-Loom #03', technique: 'Traditional Handloom Weave' },
      { name: 'Mohtarma Bakhtawar Bibi', village: 'Islampur Weavers Guild, Swat', experienceYears: 28, loomId: 'Pashmina Shuttle Loom #12', technique: 'Pure Cashmere Feather-Weave' },
    ];
    const artisan = artisans[Math.floor(Math.random() * artisans.length)];
    const { data: customer, error: customerError } = await supabaseAdmin!.from('customers').upsert({ full_name: name.trim(), email: email.trim().toLowerCase(), phone: phone.trim() }, { onConflict: 'email,phone' }).select('id').single();
    if (customerError) throw customerError;
    const orderRow = { id, tracking_code: trackingCode, customer_id: customer.id, customer_name: name.trim(), email: email.trim().toLowerCase(), phone: phone.trim(), address: address.trim(), city: city.trim(), items: safeItems, subtotal, delivery_fee: deliveryFee, total, currency: 'PKR', status: 'Pending', payment_method: 'COD', payment_status: 'Pending', artisan, estimated_delivery: new Date(Date.now() + 5 * 86400000).toISOString() };
    const { data: order, error: orderError } = await supabaseAdmin!.rpc('create_cod_order_atomic', { p_order: orderRow });
    if (orderError) throw orderError;
    // Email is best-effort: a mail provider outage must never undo a saved order.
    try { await sendOrderConfirmationEmail(order); }
    catch (emailError) { console.error(`Order ${id} was saved, but confirmation email failed:`, emailError); }
    res.status(201).json(mapOrder(order));
  } catch (error: any) { console.error('Create order error:', error); res.status(400).json({ error: error?.message || 'Could not create order.' }); }
});

app.get('/api/orders/track/:lookup', rateLimit('order-track', 10, 15 * 60_000), requireDatabase, async (req: Request, res: Response) => {
  try {
    const lookup = decodeURIComponent(req.params.lookup).replace(/^#/, '');
    const phone = String(req.query.phone || '').replace(/[^+0-9]/g, '');
    if (phone.length < 7 || phone.length > 20) { res.status(400).json({ error: 'Enter the phone number used when placing the order.' }); return; }
    let { data, error } = await supabaseAdmin!.from('orders').select('*').eq('id', lookup).maybeSingle();
    if (error) throw error;
    if (!data) { const result = await supabaseAdmin!.from('orders').select('*').eq('tracking_code', lookup).maybeSingle(); data = result.data; error = result.error; }
    if (error) throw error;
    const storedPhone = String(data?.phone || '').replace(/[^+0-9]/g, '');
    if (!data || storedPhone !== phone) { res.status(404).json({ error: 'Order not found. Check the order number and phone number.' }); return; }
    const order = mapOrder(data);
    const { customerName: _customerName, email: _email, phone: _phone, address: _address, city: _city, ...publicOrder } = order;
    res.json(publicOrder);
  } catch (error) { console.error('Track order error:', error); res.status(500).json({ error: 'Could not look up this order.' }); }
});

app.get('/api/admin/orders', requireDatabase, requireAdmin, async (_req: Request, res: Response) => {
  try {
    const { data, error } = await supabaseAdmin!.from('orders').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    res.json((data || []).map(mapOrder));
  } catch (error) { console.error('Admin orders error:', error); res.status(500).json({ error: 'Could not load orders.' }); }
});
app.patch('/api/admin/orders/:id/status', requireDatabase, requireAdmin, async (req: Request, res: Response) => {
  try {
    const allowed: OrderStatus[] = ['Pending', 'Confirmed', 'Dispatched', 'Delivered', 'Cancelled'];
    const status = req.body?.status as OrderStatus;
    if (!allowed.includes(status)) { res.status(400).json({ error: 'Invalid order status.' }); return; }
    const { error } = await supabaseAdmin!.from('orders').update({ status, updated_at: new Date().toISOString() }).eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (error) { console.error('Update order status error:', error); res.status(500).json({ error: 'Could not update order status.' }); }
});

// Health endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasKey: Boolean(process.env.GEMINI_API_KEY),
    databaseConfigured: supabaseReady,
  });
});

// Helper to execute content generation with automatic fallback for transient 503/429 model spikes
async function generateStylistWithFallback(ai: GoogleGenAI, fullPrompt: string): Promise<string> {
  const candidateModels = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-2.5-pro'];
  let lastErr: any = null;

  for (const modelName of candidateModels) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: fullPrompt,
        config: {
          systemInstruction: STYLIST_SYSTEM_INSTRUCTION,
          temperature: 0.7,
        },
      });
      if (response.text) {
        return response.text;
      }
    } catch (err: any) {
      console.warn(`Model ${modelName} encountered error, trying next fallback:`, err?.message || err);
      lastErr = err;
    }
  }

  throw lastErr || new Error('All model candidates failed');
}

// Master Weaver AI Stylist (Unary)
app.post('/api/gemini/stylist', rateLimit('ai-text', 20, 15 * 60_000), async (req: Request, res: Response) => {
  const ai = getGenAI();
  if (!ai) {
    res.status(503).json({
      error: 'I am currently meditating in the mountains (Server API key missing). Please check back later.',
    });
    return;
  }

  const userMessage = req.body?.message || '';
  if (typeof userMessage !== 'string' || !userMessage.trim() || userMessage.length > 2000) {
    res.status(400).json({ error: 'Enter a message of up to 2,000 characters.' });
    return;
  }

  const inventoryContext = PRODUCTS.slice(0, 30).map((p) =>
    `- Name: ${p.name}, Type: ${p.category}, Material: ${p.material}, Vibe: ${p.description}`
  ).join('\n');

  const fullPrompt = `
Here is my Islampur inventory:
${inventoryContext}

The guest asks: "${userMessage}"

Recommend a specific shawl warmly and poetically as Gul Zareen, master weaver from Islampur, Swat.
`;

  try {
    const text = await generateStylistWithFallback(ai, fullPrompt);
    res.json({ text });
  } catch (error: any) {
    console.error('Server Gemini Stylist Error:', error);
    res.status(500).json({
      error: 'The mountain winds are too strong. Please ask again.',
      details: undefined,
    });
  }
});

// AI Mirror Drape Advice (powered by Gemini)
app.post('/api/gemini/drape-advice', rateLimit('ai-drape', 20, 15 * 60_000), async (req: Request, res: Response) => {
  const ai = getGenAI();
  if (!ai) {
    res.status(503).json({ error: 'Server API key missing.' });
    return;
  }

  const { shawlName, shawlMaterial, shawlCategory } = req.body || {};
  for (const value of [shawlName, shawlMaterial, shawlCategory]) {
    if (value != null && (typeof value !== 'string' || value.length > 120)) { res.status(400).json({ error: 'Invalid shawl details.' }); return; }
  }
  const prompt = `You are Gul Zareen, master weaver from Islampur, Swat.
The guest is currently looking in the Virtual Mirror trying on the "${shawlName || 'Islampur Shawl'}" (Material: ${shawlMaterial || 'Highland Wool'}, Category: ${shawlCategory || 'Heritage'}).
In 2 warm, poetic sentences:
1. Explain how this shawl should be draped in Swati tradition (e.g. Classic Dual-Shoulder Wrap, Swati Pathan Chadar over the left shoulder, Artisan Stole, or Open Mantle).
2. End with: "Recommended Style: [Classic Wrap | Swati Chadar | Artisan Stole | Open Mantle]".`;

  try {
    const text = await generateStylistWithFallback(ai, prompt);
    let recommendedStyle: 'shoulder' | 'chadar' | 'stole' | 'open' = 'shoulder';
    if (/chadar/i.test(text)) recommendedStyle = 'chadar';
    else if (/stole/i.test(text)) recommendedStyle = 'stole';
    else if (/open|mantle/i.test(text)) recommendedStyle = 'open';
    else if (/classic|shoulder|wrap/i.test(text)) recommendedStyle = 'shoulder';

    res.json({ text, recommendedStyle });
  } catch (error: any) {
    console.error('Drape advice error:', error);
    res.status(500).json({ error: 'Could not fetch styling advice.', details: error?.message });
  }
});

// Master Weaver AI Stylist (Streaming SSE)
app.post('/api/gemini/stylist/stream', rateLimit('ai-stream', 10, 15 * 60_000), async (req: Request, res: Response) => {
  const ai = getGenAI();
  if (!ai) {
    res.status(503).json({ error: 'Server API key missing.' });
    return;
  }

  const userMessage = req.body?.message || '';
  if (typeof userMessage !== 'string' || !userMessage.trim() || userMessage.length > 2000) {
    res.status(400).json({ error: 'Enter a message of up to 2,000 characters.' });
    return;
  }

  const inventoryContext = PRODUCTS.slice(0, 30).map((p) =>
    `- Name: ${p.name}, Type: ${p.category}, Material: ${p.material}, Vibe: ${p.description}`
  ).join('\n');

  const fullPrompt = `
Here is my Islampur inventory:
${inventoryContext}

The guest asks: "${userMessage}"

Recommend a specific shawl warmly and poetically as Gul Zareen, master weaver from Islampur, Swat.
`;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const candidateModels = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-2.5-pro'];
  let streamSucceeded = false;

  for (const modelName of candidateModels) {
    try {
      const responseStream = await ai.models.generateContentStream({
        model: modelName,
        contents: fullPrompt,
        config: {
          systemInstruction: STYLIST_SYSTEM_INSTRUCTION,
          temperature: 0.7,
        },
      });

      for await (const chunk of responseStream) {
        if (chunk.text) {
          res.write(`data: ${JSON.stringify({ text: chunk.text })}\n\n`);
        }
      }
      res.write('data: [DONE]\n\n');
      res.end();
      streamSucceeded = true;
      break;
    } catch (err: any) {
      console.warn(`Streaming failed on model ${modelName}, trying fallback:`, err?.message);
    }
  }

  if (!streamSucceeded) {
    res.write(`data: ${JSON.stringify({ error: 'The mountain winds are too strong. Please ask again.' })}\n\n`);
    res.end();
  }
});

// WebSocket Server for Live API (voice and real-time interaction)
const wss = new WebSocketServer({ noServer: true });

wss.on('connection', async (clientWs: WebSocket) => {
  const ai = getGenAI();
  if (!ai) {
    clientWs.send(JSON.stringify({ error: 'Server GEMINI_API_KEY is not configured.' }));
    clientWs.close();
    return;
  }

  try {
    const session = await ai.live.connect({
      model: 'gemini-2.0-flash-exp',
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
        },
        systemInstruction: STYLIST_SYSTEM_INSTRUCTION,
      },
      callbacks: {
        onmessage: (message: LiveServerMessage) => {
          const audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
          const text = message.serverContent?.modelTurn?.parts?.[0]?.text;
          if (audio) clientWs.send(JSON.stringify({ audio }));
          if (text) clientWs.send(JSON.stringify({ text }));
          if (message.serverContent?.interrupted) {
            clientWs.send(JSON.stringify({ interrupted: true }));
          }
        },
        onerror: (err: any) => {
          console.error('Live API Session error:', err);
          clientWs.send(JSON.stringify({ error: err?.message || 'Live session error' }));
        },
        onclose: () => {
          clientWs.close();
        },
      },
    });

    clientWs.on('message', (data) => {
      try {
        const parsed = JSON.parse(data.toString());
        if (parsed.audio) {
          session.sendRealtimeInput({
            audio: { data: parsed.audio, mimeType: 'audio/pcm;rate=16000' },
          });
        } else if (parsed.text) {
          session.sendRealtimeInput({
            text: parsed.text,
          });
        }
      } catch (err) {
        console.error('Error forwarding message to Live session:', err);
      }
    });

    clientWs.on('close', () => {
      try {
        session.close();
      } catch (_) {}
    });
  } catch (error: any) {
    console.error('Failed to establish Live session:', error);
    clientWs.send(JSON.stringify({ error: error?.message || 'Failed to connect to Live API' }));
    clientWs.close();
  }
});

// Upgrade handler for WebSocket connections on /api/live or /live
server.on('upgrade', (request, socket, head) => {
  const pathname = new URL(request.url || '', `http://${request.headers.host || 'localhost'}`).pathname;
  if (pathname !== '/api/live' && pathname !== '/live') { socket.destroy(); return; }
  const now = Date.now();
  const key = `ai-live:${request.socket.remoteAddress || 'unknown'}`;
  let entry = rateBuckets.get(key);
  if (!entry || entry.resetAt <= now) { entry = { count: 0, resetAt: now + 15 * 60_000 }; rateBuckets.set(key, entry); }
  entry.count += 1;
  if (entry.count > 5) { socket.write('HTTP/1.1 429 Too Many Requests\r\nConnection: close\r\n\r\n'); socket.destroy(); return; }
  wss.handleUpgrade(request, socket, head, (ws) => { wss.emit('connection', ws, request); });
});

// Mount Vite middleware in development or serve static files in production
const isProd = process.env.NODE_ENV === 'production';

async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.use((req: Request, res: Response, next) => {
      if (req.path.startsWith('/api')) return next();
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  const PORT = Number(process.env.PORT) || 3000;
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`The Swat Loom server running on http://0.0.0.0:${PORT}`);
  });
}

// Vercel serves files from public/ through its CDN. This fallback handles SPA routes.
if (process.env.VERCEL) {
  app.use((req: Request, res: Response, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.resolve(__dirname, 'public', 'index.html'));
  });
}

// Local/Render runtime keeps the existing HTTP + WebSocket server.
if (!process.env.VERCEL) {
  startServer().catch((error) => {
    console.error('Failed to start The Swat Loom server:', error);
    process.exitCode = 1;
  });
}

export default app;

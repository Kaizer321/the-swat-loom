# Supabase setup — The Swat Loom

1. Copy `.env.example` to `.env.local` in this project root.
2. Set `SUPABASE_URL` to the **Project URL** shown in Supabase project settings, for example `https://abcdefgh.supabase.co`.
   - Do not use the Supabase dashboard URL.
   - Do not append `/rest/v1`, `/auth/v1`, a table name, or any other path. The server normalizes the two common API suffixes, but the project root is recommended.
3. Set `SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY` from the same Supabase project. Keep both keys server-side; never prefix them with `VITE_` or commit `.env.local`.
4. Run `supabase/schema.sql` in the Supabase SQL Editor.
5. Restart the app with `npm run dev` after changing environment variables.

The server validates the URL at startup and prints a safe configuration status. The storefront and checkout only expose active products in these categories: Pashmina, Tarkashi, Woolen, Stallers, Printed, Mens Shawls, and Kaddi. The order API independently checks active status and category, so hidden-category products cannot be ordered. Existing order rows and their snapshots are not deleted or rewritten.


## Admin merchandising update (discounts, arrivals, categories)

After updating the application source, run `supabase/migrations/20261113_admin_merchandising.sql` in Supabase Dashboard → SQL Editor. This additive migration creates/seeds the categories table and adds `sale_price` and `is_new_arrival` to the existing products table. It does not delete products, customers, or orders. Category removal is blocked while active products still use that category. The full `supabase/schema.sql` is also updated for fresh installations.

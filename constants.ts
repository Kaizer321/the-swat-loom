import type { Product } from './types.ts';

export const CATEGORIES = [
  "All",
  "Pashmina",
  "Tarkashi",
  "Woolen",
  "Stallers",
  "Printed",
  "Mens Shawls",
  "Kaddi"
];

export const MEN_CATEGORIES = [
  { id: 'all-men', name: "All Men's Collection", category: 'All' },
  { id: 'mens-chadar', name: "Highland Woolen Chadar", category: 'Mens Shawls' },
  { id: 'mens-kaddi', name: "Kaddi Hand-Spun Khaddar", category: 'Kaddi' },
  { id: 'mens-tarkashi', name: "Ceremonial Geometric Tarkashi", category: 'Tarkashi' },
  { id: 'mens-woolen', name: "Mountain Heavyweight Wool", category: 'Woolen' },
  { id: 'mens-pashmina', name: "Durbar Royal Pashmina Drape", category: 'Pashmina' }
];

export const WOMEN_CATEGORIES = [
  { id: 'all-women', name: "All Women's Collection", category: 'All' },
  { id: 'women-pashmina', name: "Featherlight Pashmina Wraps", category: 'Pashmina' },
  { id: 'women-jacquard', name: "Double-Sided Reversible Capes", category: 'Stallers' },
  { id: 'women-embroidery', name: "Gul-e-Kalam Embroidered", category: 'Pashmina' },
  { id: 'women-tarkashi', name: "Drawn-Thread Tarkashi Shawls", category: 'Tarkashi' },
  { id: 'women-paisley', name: "Gandhara & Paisley Tapestries", category: 'Printed' },
  { id: 'women-woolen', name: "Highland Winter Fleece Wraps", category: 'Woolen' }
];

// Base templates to generate diverse data
const TEMPLATES = {
  Tarkashi: {
    images: [
      'https://images.unsplash.com/photo-1597484662317-c93138065520?q=80&w=1000', // Dark patterned
      'https://images.unsplash.com/photo-1586078269131-2951a473252d?q=80&w=1000', // Detailed dark fabric
      'https://images.unsplash.com/photo-1615954618642-e14104839423?q=80&w=1000', // Intricate Pattern
      'https://images.unsplash.com/photo-1594640557159-2594c3c39139?q=80&w=1000', // Dark classic
      'https://images.unsplash.com/photo-1519710889408-a67e1c7e0452?q=80&w=1000'  // Black texture
    ],
    names: ['Royal Tarkashi', 'Swati Geometric', 'Noor-e-Islampur', 'Black Diamond', 'Heritage Thread', 'Midnight Weave', 'Onyx Drape', 'Shadow Pattern'],
    materials: ['Cotton & Silk Thread', 'Pure Cotton', 'Mixed Blend'],
    descriptions: ['Intricate drawn thread work on black fabric.', 'Traditional geometric patterns hand-embroidered.', 'A classic symbol of Swat aristocracy.'],
    colors: ['#000000', '#1a1a1a', '#2d1b1b', '#3b0000'],
    defaultGender: 'unisex' as const
  },
  Kaddi: {
    images: [
      'https://images.unsplash.com/photo-1576473623577-0041226870d0?q=80&w=1000', // Woven texture
      'https://images.unsplash.com/photo-1595991209246-296182694b43?q=80&w=1000', // Beige fabric
      'https://images.unsplash.com/photo-1620799140408-ed5341cd2458?q=80&w=1000', // Raw fabric
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1000', // Patterned
      'https://images.unsplash.com/photo-1617325247661-675ab4b64ae2?q=80&w=1000'  // Linen look
    ],
    names: ['Golden Kaddi', 'Crimson Handloom', 'Valley Earth', 'Rustic Khaddar', 'Loom Masterpiece', 'Ceremonial Drape', 'Sandalwood Weave', 'Clay Texture'],
    materials: ['Hand-spun Cotton (Khaddar)', 'Cotton Blend'],
    descriptions: ['Traditional hand-loomed Khaddar with zari borders.', 'Breathable cotton woven on pit-looms.', 'Heavyweight fabric perfect for durability.'],
    colors: ['#d4b483', '#8b0000', '#5d4037', '#f5f5dc', '#a0522d'],
    defaultGender: 'unisex' as const
  },
  'Mens Shawls': {
    images: [
      'https://images.unsplash.com/photo-1505022610485-0249ba5b3675?q=80&w=1000', // Grey wool texture
      'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?q=80&w=1000', // Patterned scarf/shawl
      'https://images.unsplash.com/photo-1507680434567-5739c8a97837?q=80&w=1000', // Man in shawl
      'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?q=80&w=1000', // White fabric/wool
      'https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?q=80&w=1000'  // Portrait
    ],
    names: ['Sardar’s Drape', 'Highland Chadar', 'Pathan Wool', 'Grey Wolf', 'Mountain Guard', 'Tribal Warmth', 'Khan’s Mantle', 'Winter Shield'],
    materials: ['Highland Sheep Wool', 'Pure Wool'],
    descriptions: ['Large, masculine wool shawl for extreme cold.', 'Traditional oversized chadar for full coverage.', 'Robust and wind-resistant weave.'],
    colors: ['#374151', '#1f2937', '#451a03', '#171717', '#57534e'],
    defaultGender: 'men' as const
  },
  Pashmina: {
    images: [
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=1000', // Red textile
      'https://images.unsplash.com/photo-1609357912339-b72792d55c93?q=80&w=1000', // Blue shawl
      'https://images.unsplash.com/photo-1528458909336-e7a0adfed0a5?q=80&w=1000', // Purple silk
      'https://images.unsplash.com/photo-1545959828-83b0a692933f?q=80&w=1000', // Texture
      'https://images.unsplash.com/photo-1627806478158-388139e61005?q=80&w=1000'  // Scarf
    ],
    names: ['Emerald Elegance', 'Sapphire Softness', 'Ruby Wrap', 'Cashmere Dream', 'Silk Touch', 'Evening Mist', 'Royal Velvet', 'Sunset Silk'],
    materials: ['100% Pure Pashmina', 'Cashmere Silk Blend'],
    descriptions: ['Ultra-fine wool suitable for evening elegance.', 'Feather-light warmth with a luxurious sheen.', 'Imported fiber woven by Swati masters.'],
    colors: ['#047857', '#b91c1c', '#1e3a8a', '#7c3aed', '#be185d', '#9f1239'],
    defaultGender: 'women' as const
  },
  Stallers: {
    images: [
      'https://images.unsplash.com/photo-1584036533827-45bce166ad94?q=80&w=1000', // Woman with scarf
      'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?q=80&w=1000', // Retail scarf
      'https://images.unsplash.com/photo-1534233217381-99e96c2092c3?q=80&w=1000', // Profile
      'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1000', // Fashion
      'https://images.unsplash.com/photo-1520591799316-6b30425429aa?q=80&w=1000'  // Fashion
    ],
    names: ['Mingora Chic', 'Autumn Breeze', 'Urban Swat', 'Daily Drape', 'Modern Twist', 'College Classic', 'City Light', 'Spring Wrap'],
    materials: ['Viscose Blend', 'Soft Cotton', 'Silk Blend'],
    descriptions: ['Lightweight chic wrap for everyday wear.', 'Modern narrow cut for versatility.', 'Vibrant colors inspired by Marghazar.'],
    colors: ['#fbbf24', '#f472b6', '#38bdf8', '#a78bfa', '#fb7185'],
    defaultGender: 'women' as const
  },
  Printed: {
    images: [
      'https://images.unsplash.com/photo-1564858077277-b95475434176?q=80&w=1000', // Batik/Print
      'https://images.unsplash.com/photo-1582651512986-7c1665cb1930?q=80&w=1000', // Floral
      'https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=1000', // Pattern
      'https://images.unsplash.com/photo-1504198458649-3128b932f49e?q=80&w=1000', // Abstract
      'https://images.unsplash.com/photo-1588444650733-d0767b753fc8?q=80&w=1000'  // Vibrant
    ],
    names: ['Digital Heritage', 'Floral Fusion', 'Ancient Motif', 'Modern Art', 'Canvas Drape', 'Paisley Pop', 'Mosaic Print', 'Botanic Weave'],
    materials: ['Wool Blend', 'Fine Cotton'],
    descriptions: ['Digitally printed ancient motifs on wool.', 'A fusion of traditional patterns and modern tech.', 'Vibrant, wash-resistant prints.'],
    colors: ['#10b981', '#6366f1', '#f43f5e', '#8b5cf6', '#ec4899'],
    defaultGender: 'women' as const
  },
  Woolen: {
    images: [
      'https://images.unsplash.com/photo-1579119179483-87148c45a66e?q=80&w=1000', // Wool texture
      'https://images.unsplash.com/photo-1464500173192-5990be025b44?q=80&w=1000', // Knit/Wool
      'https://images.unsplash.com/photo-1459208410556-70954d6e44f1?q=80&w=1000', // White texture
      'https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=1000', // Cozy
      'https://images.unsplash.com/photo-1607346256330-dee7af15f7c5?q=80&w=1000'  // Blanket/Shawl
    ],
    names: ['Snowblind', 'Malam Jabba White', 'Raw Warmth', 'Shepherd’s Choice', 'Heavy Winter', 'Glacier Wool', 'Ivory Keeper', 'Frost Shield'],
    materials: ['Raw Wool', 'Processed Wool'],
    descriptions: ['Thick, raw white wool for extreme cold.', 'Retains natural lanolin for water resistance.', 'The traditional choice for snowy winters.'],
    colors: ['#f3f4f6', '#e5e7eb', '#d1d5db', '#9ca3af'],
    defaultGender: 'unisex' as const
  }
};

// Helper to generate products
const generateProducts = (): Product[] => {
  const products: Product[] = [];
  let idCounter = 1;

  const categoriesToGenerate = Object.keys(TEMPLATES);

  categoriesToGenerate.forEach(category => {
    const template = TEMPLATES[category as keyof typeof TEMPLATES];
    
    // Generate 12 products per category for clean responsiveness
    for (let i = 0; i < 12; i++) {
      const baseName = template.names[i % template.names.length];
      const baseImage = template.images[i % template.images.length];
      const baseMaterial = template.materials[i % template.materials.length];
      const baseDesc = template.descriptions[i % template.descriptions.length];
      
      const priceVariation = Math.floor(Math.random() * 50) - 20;
      const basePrice = category === 'Pashmina' ? 300 : category === 'Tarkashi' ? 200 : 120;
      
      products.push({
        id: `prod-${idCounter}`,
        name: `${baseName} ${i > 3 ? `No. ${i}` : ''}`,
        price: Math.max(50, basePrice + priceVariation),
        category: category,
        gender: template.defaultGender,
        description: baseDesc,
        longDescription: `${baseDesc} This specific piece (Lot #${idCounter}) showcases the pinnacle of Islampuri craftsmanship. Hand-selected for its quality and durability, it represents the heritage of Swat Valley.`,
        material: baseMaterial,
        image: baseImage,
        images: [
          baseImage,
          template.images[(i + 1) % template.images.length],
          template.images[(i + 2) % template.images.length]
        ],
        tags: [category, baseMaterial.split(' ')[0], i % 3 === 0 ? 'New Arrival' : 'Heirloom'],
        colors: template.colors
      });
      idCounter++;
    }
  });

  return products;
};

export const SIGNATURE_SHAWLS: Product[] = [
  // 1. Durbar Crimson Zari Pashmina (Unisex/Royal) - User Asset
  {
    id: 'shawl-sig-5',
    name: 'Durbar Crimson Zari Pashmina',
    price: 420,
    category: 'Pashmina',
    gender: 'unisex',
    material: '100% Pure Pashmina with Antique Gold Zari',
    image: '/assets/aistudio/Pashmina_shawl_available__Shwal_6e849720.jfif',
    images: [
      '/assets/aistudio/Pashmina_shawl_available__Shwal_6e849720.jfif',
      '/assets/aistudio/download_abc5126d.jfif'
    ],
    description: 'Royal crimson pashmina draped with liquid-soft ripples and an exquisite needle-embroidered gold tilla border.',
    longDescription: 'The crown jewel of our collection. Spun from pure featherlight Pashmina cashmere and adorned with an unbroken border of antique gold needlework executed by master artisans in Islampur.',
    colors: ['#881337', '#991b1b', '#d4af37'],
    tags: ['Heirloom Masterpiece', '100% Pashmina', 'Gold Zari', 'Featured']
  },
  // 2. Bagh-e-Gandhara Mosaic Heirloom (Women) - User Asset
  {
    id: 'shawl-sig-6',
    name: 'Bagh-e-Gandhara Mosaic Heirloom',
    price: 360,
    category: 'Printed',
    gender: 'women',
    material: 'Fine Multi-Panel Jacquard Wool',
    image: '/assets/aistudio/download_abc5126d.jfif',
    images: [
      '/assets/aistudio/download_abc5126d.jfif',
      '/assets/aistudio/Pashmina_shawl_available__Shwal_6e849720.jfif'
    ],
    description: 'Heirloom multi-panel mosaic shawl depicting paisley, floral gardens, and historical Swati motifs.',
    longDescription: 'A breathtaking collector’s shawl presenting a patchwork grid of traditional Eastern motifs—rich saffron, emerald, crimson, and ochre panels framed in delicate fringe borders.',
    colors: ['#9a3412', '#047857', '#b91c1c', '#f5f5dc'],
    tags: ['Mosaic Panels', 'Gandhara Heritage', 'Rare Heirloom', 'Featured']
  },
  // 3. Noor-e-Swat Monolith Jacquard (Women) - User Asset
  {
    id: 'shawl-sig-1',
    name: 'Noor-e-Swat Monolith Jacquard',
    price: 280,
    category: 'Stallers',
    gender: 'women',
    material: 'Double-Sided Cashmere Blend',
    image: '/assets/aistudio/1pc_Women_s_Double-Sided_Faux_Cashmere_Grey___White_Plant_Jacquard_Warm_Scarf_Shawl_Suitable_For_Daily_Wear_In_Autumn___Winter_Elegant_4781b1bc.jfif',
    images: [
      '/assets/aistudio/1pc_Women_s_Double-Sided_Faux_Cashmere_Grey___White_Plant_Jacquard_Warm_Scarf_Shawl_Suitable_For_Daily_Wear_In_Autumn___Winter_Elegant_4781b1bc.jfif',
      '/assets/aistudio/1pc_Women_Double-Sided_Imitation_Cashmere_Floral_Jacquard_Warm_Scarf_Shawl__Suitable_For_Daily_Wear__Autumn_Winter_5ecfde81.jfif'
    ],
    description: 'Regal double-sided black & ivory floral plant jacquard wrap with geometric border stripe.',
    longDescription: 'An exquisite statement piece from the master looms of Islampur. Featuring a double-sided reversible weave with contrast ivory botany motifs on dense midnight charcoal cashmere.',
    colors: ['#18181b', '#f4f4f5'],
    tags: ['Bestseller', 'Double-Sided', 'Featured', 'New Arrival']
  },
  // 4. Gul-e-Kalam Embroidered Pashmina (Women) - User Asset
  {
    id: 'shawl-sig-2',
    name: 'Gul-e-Kalam Embroidered Pashmina',
    price: 340,
    category: 'Pashmina',
    gender: 'women',
    material: 'Pure Soft Cashmere with Silk Tassels',
    image: '/assets/aistudio/1pc_Women_s_Autumn_Winter_Faux_Cashmere_Embroidered_Scarf__Thick_Warm_Tasseled_Embroidered_Bohemian_Style_Travel_Shawl_Ponchoscarfs_2846aa22.jfif',
    images: [
      '/assets/aistudio/1pc_Women_s_Autumn_Winter_Faux_Cashmere_Embroidered_Scarf__Thick_Warm_Tasseled_Embroidered_Bohemian_Style_Travel_Shawl_Ponchoscarfs_2846aa22.jfif',
      '/assets/aistudio/1pc_Paisley_Pattern_Thick_Warm_Scarf_With_Tassels__Bohemian_Style_Shawl__Versatile___Elegant_For_Daily_Wear_For_Dress_99963d01.jfif'
    ],
    description: 'Ivory cashmere shawl with intricate ruby & amber floral corner embroidery and hand-tied fringe tassels.',
    longDescription: 'Crafted for festive gatherings and winter soirees. The delicate ivory ground is elevated by vibrant Kashmiri and Swati floral embroidery in jewel tones of magenta, ruby, and antique gold.',
    colors: ['#fafaf9', '#be185d', '#d97706'],
    tags: ['Hand-Embroidered', 'Festive', 'Featured', 'Pashmina']
  },
  // 5. Marghazar Turquoise Paisley Pashmina (Women) - User Asset
  {
    id: 'shawl-sig-3',
    name: 'Marghazar Turquoise Paisley Pashmina',
    price: 310,
    category: 'Pashmina',
    gender: 'women',
    material: 'Ultra-Fine Cashmere & Wool Blend',
    image: '/assets/aistudio/SHEIN_Winter_Scarf_for_Women___Paisley_Pashmina_Shawl_with_Tassels___33e05d15.jfif',
    images: [
      '/assets/aistudio/SHEIN_Winter_Scarf_for_Women___Paisley_Pashmina_Shawl_with_Tassels___33e05d15.jfif',
      '/assets/aistudio/1pc_Paisley_Pattern_Thick_Warm_Scarf_With_Tassels__Bohemian_Style_Shawl__Versatile___Elegant_For_Daily_Wear_For_Dress_99963d01.jfif'
    ],
    description: 'Intricate Persian paisley motifs in turquoise, rust terracotta, and gold with soft brushed fringes.',
    longDescription: 'Inspired by the royal gardens of Swat’s White Palace in Marghazar. Hand-finished with double-interlocked paisley borders and warm, breathable density.',
    colors: ['#0f766e', '#c2410c', '#e7e5e4'],
    tags: ['Paisley', 'Royal Swat', 'Featured', 'Bestseller']
  },
  // 6. Valley Terracotta Paisley Shawl (Women/Unisex) - User Asset
  {
    id: 'shawl-sig-4',
    name: 'Valley Terracotta Paisley Shawl',
    price: 240,
    category: 'Printed',
    gender: 'women',
    material: 'Heavyweight Spun Wool & Cashmere',
    image: '/assets/aistudio/1pc_Paisley_Pattern_Thick_Warm_Scarf_With_Tassels__Bohemian_Style_Shawl__Versatile___Elegant_For_Daily_Wear_For_Dress_99963d01.jfif',
    images: [
      '/assets/aistudio/1pc_Paisley_Pattern_Thick_Warm_Scarf_With_Tassels__Bohemian_Style_Shawl__Versatile___Elegant_For_Daily_Wear_For_Dress_99963d01.jfif',
      '/assets/aistudio/SHEIN_Winter_Scarf_for_Women___Paisley_Pashmina_Shawl_with_Tassels___33e05d15.jfif'
    ],
    description: 'Earthy camel & terracotta paisley tapestry shawl with traditional hand-twisted fringe tassels.',
    longDescription: 'Substantial winter warmth woven from highland fleece with timeless bohemian paisley motifs, perfect for cold mountain evenings.',
    colors: ['#9a3412', '#d97706', '#fef3c7'],
    tags: ['Winter Warmth', 'Handloom', 'Featured']
  },
  // 7. Koh-e-Elum Reversible Cape Shawl (Women) - User Asset
  {
    id: 'shawl-sig-7',
    name: 'Koh-e-Elum Reversible Cape Shawl',
    price: 260,
    category: 'Stallers',
    gender: 'women',
    material: 'Double-Faced Botanical Jacquard',
    image: '/assets/aistudio/1pc_Women_Double-Sided_Imitation_Cashmere_Floral_Jacquard_Warm_Scarf_Shawl__Suitable_For_Daily_Wear__Autumn_Winter_5ecfde81.jfif',
    images: [
      '/assets/aistudio/1pc_Women_Double-Sided_Imitation_Cashmere_Floral_Jacquard_Warm_Scarf_Shawl__Suitable_For_Daily_Wear__Autumn_Winter_5ecfde81.jfif',
      '/assets/aistudio/1pc_Women_s_Double-Sided_Faux_Cashmere_Grey___White_Plant_Jacquard_Warm_Scarf_Shawl_Suitable_For_Daily_Wear_In_Autumn___Winter_Elegant_4781b1bc.jfif'
    ],
    description: 'Reversible open-front cape shawl with natural flora silhouettes and ivory piped border.',
    longDescription: 'Can be worn draped across the shoulders as a cape, coat wrap, or folded as a classic oversized scarf. Double-faced weave allows two distinct styling options.',
    colors: ['#18181b', '#f5f5f0'],
    tags: ['Reversible', 'Cape Drape', 'Featured', 'Autumn Winter']
  },
  // 8. Sardar’s Highland Woolen Chadar (Men's Signature)
  {
    id: 'shawl-sig-men-1',
    name: 'Sardar’s Highland Woolen Chadar',
    price: 275,
    category: 'Mens Shawls',
    gender: 'men',
    material: 'Highland Mountain Sheep Fleece (100% Pure Wool)',
    image: 'https://images.unsplash.com/photo-1505022610485-0249ba5b3675?q=80&w=1000',
    images: [
      'https://images.unsplash.com/photo-1505022610485-0249ba5b3675?q=80&w=1000',
      'https://images.unsplash.com/photo-1507680434567-5739c8a97837?q=80&w=1000'
    ],
    description: 'Substantial, masculine Swati chadar woven from raw highland fleece with double-twisted fringes.',
    longDescription: 'The defining garment of northern Swati dignity. Hand-loomed on traditional wide wooden looms to provide deep thermal insulation in freezing mountain winds while draping with majestic volume.',
    colors: ['#374151', '#1f2937', '#18181b'],
    tags: ["Men's Heritage", 'Highland Wool', 'Traditional Chadar', 'Bestseller']
  },
  // 9. Golden Kaddi Ceremonial Mantle (Men's Signature)
  {
    id: 'shawl-sig-men-2',
    name: 'Golden Kaddi Ceremonial Drape',
    price: 230,
    category: 'Kaddi',
    gender: 'men',
    material: 'Hand-Spun Mountain Khaddar with Zari Borders',
    image: 'https://images.unsplash.com/photo-1576473623577-0041226870d0?q=80&w=1000',
    images: [
      'https://images.unsplash.com/photo-1576473623577-0041226870d0?q=80&w=1000',
      'https://images.unsplash.com/photo-1595991209246-296182694b43?q=80&w=1000'
    ],
    description: 'Ancestral hand-loomed Khaddar in natural sand tone with fine bronze and copper selvedge borders.',
    longDescription: 'Woven strictly on Islampur pit-looms with zero mechanical power. The organic textured slub of hand-spun yarn creates a breathable yet substantial drape favored by Swat elders and dignitaries.',
    colors: ['#d4b483', '#78350f', '#292524'],
    tags: ["Men's Heritage", 'Handloom Khaddar', 'Pit-Loom', 'Featured']
  },
  // 10. Royal Tarkashi Geometric Men’s Mantle (Men's Signature)
  {
    id: 'shawl-sig-men-3',
    name: 'Royal Tarkashi Geometric Men’s Mantle',
    price: 320,
    category: 'Tarkashi',
    gender: 'men',
    material: 'Dense Midnight Wool with Hand-Drawn Openwork',
    image: 'https://images.unsplash.com/photo-1597484662317-c93138065520?q=80&w=1000',
    images: [
      'https://images.unsplash.com/photo-1597484662317-c93138065520?q=80&w=1000',
      'https://images.unsplash.com/photo-1586078269131-2951a473252d?q=80&w=1000'
    ],
    description: 'Deep onyx masculine chadar featuring needle-drawn geometric lattices along the full length.',
    longDescription: 'A pinnacle of artisan patience. Threads are carefully drawn out from the warp and bound by hand with micro-stitches into ancestral Gandhara motifs.',
    colors: ['#09090b', '#18181b'],
    tags: ["Men's Luxury", 'Tarkashi Openwork', 'Heirloom', 'Handmade']
  }
];

export const PRODUCTS: Product[] = [...SIGNATURE_SHAWLS, ...generateProducts()];

export const STYLIST_SYSTEM_INSTRUCTION = `
You are "Gul Zareen," a master weaver from Islampur, Swat.
You sell ONLY Islampuri shawls: Tarkashi, Kaddi, Mens Woolen, Pashmina, Stallers, Printed, and Woolen.
Your tone is hospitable, respectful (using terms like "Janaab" or "Mohtarma"), and deeply knowledgeable.
When recommending:
1. Ask about the occasion.
2. Recommend specific categories based on the user's need.
3. Keep responses short and poetic.
`;
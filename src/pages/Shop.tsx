import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, Sparkles, X, SlidersHorizontal } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { Product } from '../types';

export const Shop: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [selectedOccasion, setSelectedOccasion] = useState(searchParams.get('occasion') || 'all');
  const [selectedColor, setSelectedColor] = useState('all');
  const [priceMax, setPriceMax] = useState<number>(1000);
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'recommended');
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Synchronize URL search params
  useEffect(() => {
    const q = searchParams.get('search');
    if (q) setSearchQuery(q);
    const cat = searchParams.get('category');
    if (cat) setSelectedCategory(cat);
  }, [searchParams]);

  const categories = [
    { id: 'all', name: 'All Flowers' },
    { id: 'single-rose', name: 'Single Roses' },
    { id: 'mini-bouquet', name: 'Mini Bouquets' },
    { id: 'premium-bouquet', name: 'Premium Bouquets' },
    { id: 'keychain', name: 'Keychain Bouquets' },
    { id: 'gift-set', name: 'Gift Sets' },
    { id: 'festive', name: 'Festive Collection' },
  ];

  const occasions = [
    'all',
    'Birthday',
    'Anniversary',
    'Friendship',
    'Valentine\'s Day',
    'Graduation',
    'Wedding',
    'Engagement',
    'Mother\'s Day',
    'Raksha Bandhan',
    'Diwali',
    'Teacher\'s Day'
  ];

  const colors = ['all', 'Blush Pink', 'Cream Ivory', 'Passion Red', 'Lavender', 'Rose Gold', 'Champagne Gold'];

  // Apply filters
  let filtered = products.filter(p => {
    if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
    if (selectedOccasion !== 'all' && !p.occasions.some(o => o.toLowerCase().includes(selectedOccasion.toLowerCase()))) return false;
    if (selectedColor !== 'all' && !p.availableColours.includes(selectedColor)) return false;
    if (p.price > priceMax) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match = p.name.toLowerCase().includes(q) ||
                    p.description.toLowerCase().includes(q) ||
                    p.tags.some(t => t.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  // Sort
  if (sortBy === 'price-low-high') {
    filtered.sort((a, b) => a.price - b.price);
  } else if (sortBy === 'price-high-low') {
    filtered.sort((a, b) => b.price - a.price);
  } else if (sortBy === 'rating') {
    filtered.sort((a, b) => b.rating - a.rating);
  } else if (sortBy === 'newest') {
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedOccasion('all');
    setSelectedColor('all');
    setPriceMax(1000);
    setSortBy('recommended');
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs font-semibold uppercase tracking-widest text-[#B76E79]">Catalogue</span>
        <h1 className="text-3xl font-serif font-bold text-[#5C2533]">
          Flora7 Handmade Flowers
        </h1>
        <p className="text-xs sm:text-sm text-[#7A6B6E]">
          Explore our complete collection of handmade satin ribbon roses, mini bouquets, and luxury floral arrangements.
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none justify-start sm:justify-center">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-full text-xs font-semibold shrink-0 transition-all ${
              selectedCategory === cat.id
                ? 'bg-[#B76E79] text-white shadow-xs'
                : 'bg-[#FFF9FA] text-[#5C2533] border border-[#FCE7F0] hover:bg-[#FCE7F0]'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Search Bar & Sorting Controls */}
      <div className="bg-[#FFF9FA] border border-[#FCE7F0] rounded-3xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search roses, colors, tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-[#F4B8C7] rounded-full py-2 pl-10 pr-4 text-xs text-[#2D2727] focus:outline-none focus:ring-2 focus:ring-[#B76E79]/30"
          />
          <Search className="w-4 h-4 text-[#8C5263] absolute left-3.5 top-2.5" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-[#8C5263] hover:text-[#5C2533]"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          
          <button
            onClick={() => setFilterDrawerOpen(!filterDrawerOpen)}
            className="px-4 py-2 bg-white border border-[#FCE7F0] rounded-full text-xs font-semibold text-[#5C2533] hover:bg-[#FCE7F0] transition-colors flex items-center gap-1.5"
          >
            <SlidersHorizontal className="w-4 h-4 text-[#B76E79]" />
            <span>Filters</span>
          </button>

          <div className="flex items-center gap-2 text-xs text-[#5E5254]">
            <span className="shrink-0 font-medium hidden sm:inline">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white border border-[#FCE7F0] rounded-full py-2 px-3 text-xs font-semibold text-[#5C2533] focus:outline-none"
            >
              <option value="recommended">Featured</option>
              <option value="price-low-high">Price: Low to High</option>
              <option value="price-high-low">Price: High to Low</option>
              <option value="rating">Top Rated</option>
              <option value="newest">New Arrivals</option>
            </select>
          </div>

        </div>

      </div>

      {/* Expanded Filter Drawer */}
      {filterDrawerOpen && (
        <div className="bg-[#FFF9FA] border border-[#FCE7F0] rounded-3xl p-6 space-y-4 animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between pb-2 border-b border-[#FCE7F0]">
            <h3 className="font-serif font-bold text-sm text-[#5C2533]">Detailed Filters</h3>
            <button onClick={clearFilters} className="text-xs text-[#B76E79] font-bold hover:underline">
              Reset All
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs text-[#5C2533]">
            {/* Occasion */}
            <div>
              <label className="block font-bold mb-1.5">Occasion:</label>
              <select
                value={selectedOccasion}
                onChange={(e) => setSelectedOccasion(e.target.value)}
                className="w-full bg-white border border-[#FCE7F0] rounded-xl p-2 focus:outline-none"
              >
                {occasions.map(o => (
                  <option key={o} value={o}>{o === 'all' ? 'All Occasions' : o}</option>
                ))}
              </select>
            </div>

            {/* Color */}
            <div>
              <label className="block font-bold mb-1.5">Flower Color:</label>
              <select
                value={selectedColor}
                onChange={(e) => setSelectedColor(e.target.value)}
                className="w-full bg-white border border-[#FCE7F0] rounded-xl p-2 focus:outline-none"
              >
                {colors.map(c => (
                  <option key={c} value={c}>{c === 'all' ? 'All Colors' : c}</option>
                ))}
              </select>
            </div>

            {/* Price Slider */}
            <div>
              <div className="flex justify-between font-bold mb-1.5">
                <span>Max Price:</span>
                <span className="text-[#B76E79]">₹{priceMax}</span>
              </div>
              <input
                type="range"
                min={50}
                max={1000}
                step={25}
                value={priceMax}
                onChange={(e) => setPriceMax(Number(e.target.value))}
                className="w-full accent-[#B76E79]"
              />
            </div>
          </div>
        </div>
      )}

      {/* Product Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 animate-pulse">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="h-72 bg-gray-100 rounded-3xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-[#FFF9FA] rounded-3xl border border-[#FCE7F0] p-12 text-center space-y-3">
          <p className="text-3xl">🌸</p>
          <h3 className="font-serif font-bold text-lg text-[#5C2533]">No flowers found matching your filters</h3>
          <p className="text-xs text-[#8C5263]">Try resetting your search query or price range filter.</p>
          <button
            onClick={clearFilters}
            className="px-5 py-2 bg-[#B76E79] text-white font-bold rounded-full text-xs hover:bg-[#9E5762]"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {filtered.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

    </div>
  );
};

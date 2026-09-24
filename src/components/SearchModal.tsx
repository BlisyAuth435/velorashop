import React, { useState, useMemo } from 'react';
import { Search, X, Star, ArrowRight } from 'lucide-react';
import { useStore } from '../hooks/useStore';
import { Product } from '../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (p: Product) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelectProduct,
}) => {
  const { products, settings } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.brand && p.brand.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCat = selectedCat === 'all' || p.category === selectedCat;

      return matchesSearch && matchesCat && p.active;
    });
  }, [products, searchTerm, selectedCat]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 pt-16 sm:pt-24 overflow-y-auto">
      <div className="fixed inset-0 bg-black/85 backdrop-blur-md" onClick={onClose} />

      <div className="relative w-full max-w-3xl bg-[#0e1017] rounded-3xl border border-white/15 p-6 shadow-2xl z-10 animate-in fade-in duration-200">
        {/* Search Input Bar */}
        <div className="relative flex items-center mb-6">
          <Search className="w-5 h-5 text-amber-400 absolute left-4 pointer-events-none" />
          <input
            type="text"
            autoFocus
            placeholder="Search cooker, organic items, apparel, health products, SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-10 py-3.5 rounded-2xl bg-black/60 border border-white/10 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-amber-400 transition-colors"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-4 text-neutral-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Quick Category Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-4 border-b border-white/10">
          <button
            onClick={() => setSelectedCat('all')}
            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              selectedCat === 'all' ? 'bg-amber-400 text-black font-bold' : 'bg-white/5 text-neutral-400 hover:text-white'
            }`}
          >
            All Products
          </button>
          {['Cooker & Rice Items', 'Clothing', 'T-Shirt Combo', 'Health', 'Organics', 'Medicines'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCat === cat ? 'bg-amber-400 text-black font-bold' : 'bg-white/5 text-neutral-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Results */}
        <div className="max-h-[60vh] overflow-y-auto space-y-2 pr-1">
          {filteredProducts.length === 0 ? (
            <div className="py-12 text-center text-neutral-500 text-xs">
              No matching products found. Try keywords like "Cooker", "T-Shirt", "Honey", or "Vitamin".
            </div>
          ) : (
            filteredProducts.map((prod) => (
              <div
                key={prod.id}
                onClick={() => {
                  onSelectProduct(prod);
                  onClose();
                }}
                className="p-3 rounded-2xl hover:bg-white/5 border border-transparent hover:border-white/10 flex items-center justify-between gap-4 cursor-pointer transition-all group"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={prod.images[0]}
                    alt={prod.name}
                    className="w-14 h-14 rounded-xl object-cover bg-neutral-900 border border-white/10"
                  />
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                      {prod.category}
                    </span>
                    <h4 className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-1">
                      {prod.name}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center text-amber-400 text-[10px]">
                        <Star className="w-3 h-3 fill-current" />
                        <span className="ml-0.5 text-neutral-300 font-semibold">{prod.rating.toFixed(1)}</span>
                      </div>
                      <span className="text-neutral-500 text-[10px]">• SKU: {prod.sku}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-right">
                  <div>
                    <span className="text-xs font-extrabold text-white block">
                      {settings.currencySymbol}{prod.salePrice.toLocaleString()}
                    </span>
                    {prod.regularPrice > prod.salePrice && (
                      <span className="text-[10px] text-neutral-500 line-through">
                        {settings.currencySymbol}{prod.regularPrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                  <ArrowRight className="w-4 h-4 text-neutral-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

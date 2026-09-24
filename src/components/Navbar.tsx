import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Search, 
  Heart, 
  User, 
  Menu, 
  X, 
  ShieldCheck, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useStore } from '../hooks/useStore';

interface NavbarProps {
  onOpenSearch: () => void;
  onOpenCart: () => void;
  onOpenAccount: () => void;
  onOpenAdmin: () => void;
  onNavigate: (page: string) => void;
  currentPage: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenSearch,
  onOpenCart,
  onOpenAccount,
  onOpenAdmin,
  onNavigate,
  currentPage,
}) => {
  const { settings, cart, wishlist, isAdmin } = useStore();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const navLinks = [
    { label: 'Home', id: 'home' },
    { label: 'Shop Catalog', id: 'shop' },
    { label: '3D Studio', id: 'studio' },
    { label: 'Categories', id: 'categories' },
    { label: 'Special Offers', id: 'offers' },
    { label: 'Track Order', id: 'track' },
  ];

  const handleLinkClick = (id: string) => {
    setMobileMenuOpen(false);
    if (id === 'track') {
      onOpenAccount();
    } else {
      onNavigate(id);
    }
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'bg-[#090a0f]/85 backdrop-blur-xl border-b border-white/10 shadow-2xl py-3.5'
            : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            {/* Brand Logo & Dynamic Name */}
            <button
              onClick={() => onNavigate('home')}
              className="flex items-center gap-2.5 group text-left focus:outline-none"
            >
              {settings.logo ? (
                <img src={settings.logo} alt={settings.websiteName} className="h-9 w-auto object-contain" />
              ) : (
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center font-bold text-black shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
                  <span className="font-heading text-lg font-extrabold tracking-tighter">
                    {settings.websiteName.charAt(0) || 'V'}
                  </span>
                </div>
              )}
              <div className="flex flex-col">
                <span className="font-heading text-lg sm:text-xl font-bold tracking-wider text-white uppercase group-hover:text-amber-300 transition-colors">
                  {settings.websiteName}
                </span>
                <span className="text-[10px] tracking-widest uppercase text-neutral-400 font-medium -mt-1 hidden sm:block">
                  Luxury Essentials
                </span>
              </div>
            </button>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-7">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => handleLinkClick(link.id)}
                  className={`text-sm font-medium transition-colors relative py-1 hover:text-amber-400 ${
                    currentPage === link.id ? 'text-amber-400 font-semibold' : 'text-neutral-300'
                  }`}
                >
                  {link.label}
                  {currentPage === link.id && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400 rounded-full" />
                  )}
                </button>
              ))}
            </nav>

            {/* Action Buttons: Search, Wishlist, Cart, Account, Admin */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Instant Search Button */}
              <button
                onClick={onOpenSearch}
                title="Search Products"
                className="p-2 sm:p-2.5 rounded-full text-neutral-300 hover:text-white hover:bg-white/10 transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Wishlist */}
              <button
                onClick={() => onNavigate('shop?filter=wishlist')}
                title="Wishlist"
                className="relative p-2 sm:p-2.5 rounded-full text-neutral-300 hover:text-white hover:bg-white/10 transition-colors hidden sm:flex items-center justify-center"
              >
                <Heart className="w-5 h-5" />
                {wishlist.length > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {wishlist.length}
                  </span>
                )}
              </button>

              {/* Order Tracking / Customer Account */}
              <button
                onClick={onOpenAccount}
                title="Customer Account & Order Tracking"
                className="p-2 sm:p-2.5 rounded-full text-neutral-300 hover:text-white hover:bg-white/10 transition-colors hidden sm:flex items-center justify-center"
              >
                <User className="w-5 h-5" />
              </button>

              {/* Cart Button */}
              <button
                onClick={onOpenCart}
                title="Shopping Bag"
                className="relative flex items-center gap-2 px-3 py-2 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 text-white transition-all shadow-md group"
              >
                <ShoppingBag className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-semibold pr-1 hidden sm:inline">Bag</span>
                <span className="w-5 h-5 rounded-full bg-amber-400 text-black text-xs font-bold flex items-center justify-center">
                  {totalCartItems}
                </span>
              </button>

              {/* Admin Portal Gateway */}
              <button
                onClick={onOpenAdmin}
                title="Admin Control Panel"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/30 text-amber-400 text-xs font-semibold transition-all"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span className="hidden md:inline">{isAdmin ? 'Admin Console' : 'Admin Panel'}</span>
              </button>

              {/* Mobile Menu Hamburger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl text-neutral-300 hover:text-white hover:bg-white/10 lg:hidden"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Animated Drawer Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-md" 
            onClick={() => setMobileMenuOpen(false)} 
          />
          <div className="fixed top-0 right-0 bottom-0 w-4/5 max-w-sm bg-[#0e1017] border-l border-white/10 p-6 flex flex-col justify-between shadow-2xl overflow-y-auto">
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-white/10 mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-400 text-black font-bold flex items-center justify-center">
                    {settings.websiteName.charAt(0)}
                  </div>
                  <span className="font-heading font-bold text-lg text-white">
                    {settings.websiteName}
                  </span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-full text-neutral-400 hover:text-white hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Links */}
              <div className="flex flex-col gap-2">
                {navLinks.map((link) => (
                  <button
                    key={link.id}
                    onClick={() => handleLinkClick(link.id)}
                    className="flex items-center justify-between p-3 rounded-xl text-left font-medium text-neutral-200 hover:bg-white/5 hover:text-amber-400 transition-colors"
                  >
                    <span>{link.label}</span>
                    <ArrowRight className="w-4 h-4 text-neutral-500" />
                  </button>
                ))}
              </div>

              <div className="my-6 border-t border-white/10 pt-6 flex flex-col gap-3">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAccount();
                  }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 text-sm font-medium text-neutral-200"
                >
                  <User className="w-5 h-5 text-amber-400" />
                  <span>My Account & Orders</span>
                </button>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAdmin();
                  }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-amber-400/10 border border-amber-400/20 text-sm font-medium text-amber-400"
                >
                  <ShieldCheck className="w-5 h-5" />
                  <span>Admin Management Panel</span>
                </button>
              </div>
            </div>

            <div className="pt-6 border-t border-white/10 text-xs text-neutral-400 flex flex-col gap-1">
              <span>Customer Concierge: {settings.phone}</span>
              <span>{settings.email}</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

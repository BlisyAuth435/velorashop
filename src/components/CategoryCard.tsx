import React, { useRef } from 'react';
import { ArrowUpRight, Layers } from 'lucide-react';
import { Category } from '../types';

interface CategoryCardProps {
  category: Category;
  onSelect: (categoryName: string) => void;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ category, onSelect }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -7;
    const rotateY = ((x - centerX) / centerX) * 7;

    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
  };

  const handleMouseLeave = () => {
    const card = cardRef.current;
    if (!card) return;
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={() => onSelect(category.name)}
      className="group relative h-96 rounded-3xl overflow-hidden cursor-pointer transition-all duration-300 ease-out border border-white/10 hover:border-amber-400/40 shadow-xl hover:shadow-2xl hover:shadow-amber-500/10"
      style={{ transformStyle: 'preserve-3d' }}
    >
      {/* Background Image with Zoom & Dark Gradient */}
      <div className="absolute inset-0 bg-neutral-900">
        <img
          src={category.image}
          alt={category.name}
          className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700 ease-out brightness-90 group-hover:brightness-100"
          loading="lazy"
        />
        {/* Cinematic dark luxury gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#090a0f] via-[#090a0f]/60 to-transparent opacity-90 group-hover:opacity-80 transition-opacity" />
        {/* Soft golden spotlight flare on hover */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-400/20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>

      {/* Top Meta Pill */}
      <div className="absolute top-5 left-5 right-5 flex items-center justify-between z-10">
        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-xs font-semibold text-neutral-300 group-hover:text-amber-300 group-hover:border-amber-400/30 transition-colors">
          <Layers className="w-3.5 h-3.5 text-amber-400" />
          <span>{category.productCount} Items</span>
        </span>

        <div className="w-9 h-9 rounded-full bg-white/10 backdrop-blur-md border border-white/15 flex items-center justify-center text-white group-hover:bg-amber-400 group-hover:text-black transition-all group-hover:rotate-45">
          <ArrowUpRight className="w-4 h-4 transition-transform" />
        </div>
      </div>

      {/* Bottom Content */}
      <div className="absolute bottom-0 left-0 right-0 p-6 z-10 flex flex-col justify-end">
        <span className="text-[11px] font-bold uppercase tracking-widest text-amber-400 mb-1 drop-shadow">
          Collection
        </span>
        <h3 className="font-heading text-xl font-bold text-white mb-2 group-hover:text-amber-200 transition-colors">
          {category.name}
        </h3>
        <p className="text-xs text-neutral-300 line-clamp-2 mb-4 opacity-90 group-hover:opacity-100 transition-opacity leading-relaxed">
          {category.description}
        </p>

        <div className="inline-flex items-center gap-2 text-xs font-bold text-white group-hover:text-amber-400 transition-colors">
          <span>Explore Collection</span>
          <span className="w-4 h-px bg-current group-hover:w-8 transition-all duration-300" />
        </div>
      </div>
    </div>
  );
};

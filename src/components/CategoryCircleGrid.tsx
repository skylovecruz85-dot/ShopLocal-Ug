import React from 'react';
import { 
  Wheat, 
  Smartphone, 
  Car, 
  Shirt, 
  Droplets, 
  Baby, 
  Hammer, 
  BookOpen, 
  Armchair, 
  Building2, 
  Briefcase, 
  Cog, 
  HeartPulse,
  LayoutGrid
} from 'lucide-react';
import { CategoryId } from '../types';
import { CATEGORIES } from '../data/mockData';

interface CategoryCircleGridProps {
  selectedCategory: CategoryId | 'all';
  onSelectCategory: (category: CategoryId | 'all') => void;
  onSelectSubcategory: (sub: string | null) => void;
  darkMode?: boolean;
}

// Jiji signature vibrant solid colors for round 60px category circles
const CATEGORY_COLORS: Record<string, string> = {
  agriculture: 'bg-[#00B53F]',     // Farming (Green)
  electronics: 'bg-[#00B0FF]',     // Electronics (Cyan Blue)
  vehicles: 'bg-[#2979FF]',        // Vehicles (Royal Blue)
  fashion: 'bg-[#FF4081]',         // Fashion (Vibrant Pink)
  'plumbing-water': 'bg-[#00E5FF]', // Plumbing (Aqua Cyan)
  'babies-kids': 'bg-[#FF5252]',    // Kids (Coral Red)
  construction: 'bg-[#FF6D00]',    // Building (Deep Orange)
  furniture: 'bg-[#FF9100]',       // Furniture (Amber Orange)
  'real-estate': 'bg-[#7C4DFF]',   // Property (Purple)
  'education-books': 'bg-[#00B8D4]', // Books (Teal)
  'jobs-services': 'bg-[#9C27B0]',  // Services (Deep Purple)
  machinery: 'bg-[#607D8B]',        // Machinery (Blue Grey)
  'health-beauty': 'bg-[#00C853]',  // Health (Emerald)
};

const getCategoryIcon = (iconName: string) => {
  switch (iconName) {
    case 'Wheat': return Wheat;
    case 'Smartphone': return Smartphone;
    case 'Car': return Car;
    case 'Shirt': return Shirt;
    case 'Droplets': return Droplets;
    case 'Baby': return Baby;
    case 'Hammer': return Hammer;
    case 'BookOpen': return BookOpen;
    case 'Armchair': return Armchair;
    case 'Building2': return Building2;
    case 'Briefcase': return Briefcase;
    case 'Cog': return Cog;
    case 'HeartPulse': return HeartPulse;
    default: return LayoutGrid;
  }
};

export const CategoryCircleGrid: React.FC<CategoryCircleGridProps> = ({
  selectedCategory,
  onSelectCategory,
  onSelectSubcategory,
  darkMode,
}) => {
  return (
    <div className="w-full">
      {/* Category grid: exactly 4 per row, equal size, 60px round icons with 11px label */}
      <div className="grid grid-cols-4 gap-y-4 gap-x-2 w-full">
        {CATEGORIES.map((cat) => {
          const Icon = getCategoryIcon(cat.icon);
          const circleColor = CATEGORY_COLORS[cat.id] || 'bg-[#00B53F]';
          const isSelected = selectedCategory === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => {
                if (isSelected) {
                  onSelectCategory('all');
                  onSelectSubcategory(null);
                } else {
                  onSelectCategory(cat.id);
                  onSelectSubcategory(null);
                }
              }}
              className="flex flex-col items-center group cursor-pointer text-center w-full focus:outline-none"
            >
              {/* 60px Round Icon Circle (white icon inside colored circle) */}
              <div
                className={`w-[60px] h-[60px] rounded-full flex items-center justify-center transition-all duration-200 shadow-sm ${circleColor} ${
                  isSelected
                    ? 'ring-4 ring-[#00B53F] ring-offset-2 scale-105'
                    : 'group-hover:scale-105 group-active:scale-95'
                }`}
              >
                <Icon className="w-7 h-7 text-white stroke-[2.2]" />
              </div>

              {/* Label: 11px font, max 2 words, dark text */}
              <span
                className={`mt-1.5 text-[11px] font-semibold leading-tight text-center truncate max-w-[76px] transition-colors ${
                  isSelected
                    ? 'text-[#00B53F] font-bold'
                    : darkMode
                      ? 'text-slate-300 group-hover:text-white'
                      : 'text-[#222222] group-hover:text-[#00B53F]'
                }`}
              >
                {cat.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

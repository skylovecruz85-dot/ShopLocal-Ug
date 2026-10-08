import React from 'react';
import { 
  Wheat, 
  Smartphone, 
  Car, 
  Shirt, 
  Armchair, 
  Building2, 
  Briefcase, 
  Cog, 
  HeartPulse,
  Droplets,
  Baby,
  Hammer,
  BookOpen,
  LayoutGrid
} from 'lucide-react';
import { CategoryId, Category } from '../types';
import { CATEGORIES } from '../data/mockData';

interface CategoryBarProps {
  selectedCategory: CategoryId | 'all';
  onSelectCategory: (category: CategoryId | 'all') => void;
  selectedSubcategory: string | null;
  onSelectSubcategory: (sub: string | null) => void;
  darkMode?: boolean;
}

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

export const CategoryBar: React.FC<CategoryBarProps> = ({
  selectedCategory,
  onSelectCategory,
  selectedSubcategory,
  onSelectSubcategory,
  darkMode,
}) => {
  const activeCategoryObj = CATEGORIES.find(c => c.id === selectedCategory);

  return (
    <div className={`border-b pt-2.5 pb-2 shadow-2xs transition-colors ${
      darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/80'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Horizontal scrollable category list */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none no-scrollbar">
          <button
            onClick={() => {
              onSelectCategory('all');
              onSelectSubcategory(null);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-[#3db83a] text-white shadow-xs'
                : darkMode 
                  ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' 
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80 hover:text-slate-900'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>All Ads</span>
          </button>

          {CATEGORIES.map((cat) => {
            const Icon = getCategoryIcon(cat.icon);
            const isSelected = selectedCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => {
                  onSelectCategory(cat.id);
                  onSelectSubcategory(null);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#3db83a] text-white shadow-xs font-bold'
                    : darkMode 
                      ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white' 
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-amber-300' : 'text-[#3db83a]'}`} />
                <span>{cat.name}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded ${
                  isSelected 
                    ? 'bg-black/20 text-white' 
                    : darkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-600'
                }`}>
                  {cat.itemCount}
                </span>
              </button>
            );
          })}
        </div>

        {/* Subcategories pill bar when a specific category is chosen */}
        {activeCategoryObj && (
          <div className={`flex items-center gap-2 pt-2 pb-1 border-t overflow-x-auto text-xs no-scrollbar ${
            darkMode ? 'border-slate-800' : 'border-slate-100'
          }`}>
            <span className={`text-[10px] font-bold whitespace-nowrap uppercase tracking-wider pl-1 ${
              darkMode ? 'text-slate-500' : 'text-slate-400'
            }`}>
              {activeCategoryObj.name} Subcategories:
            </span>
            <button
              onClick={() => onSelectSubcategory(null)}
              className={`px-2.5 py-1 rounded text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                selectedSubcategory === null
                  ? darkMode ? 'bg-[#3db83a]/20 text-[#3db83a] font-bold border border-[#3db83a]/40' : 'bg-[#3db83a]/10 text-[#3db83a] font-bold'
                  : darkMode ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              All in {activeCategoryObj.name}
            </button>
            {activeCategoryObj.subcategories.map((sub) => (
              <button
                key={sub}
                onClick={() => onSelectSubcategory(sub)}
                className={`px-2.5 py-1 rounded text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  selectedSubcategory === sub
                    ? 'bg-[#3db83a] text-white font-bold shadow-xs'
                    : darkMode ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {sub}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

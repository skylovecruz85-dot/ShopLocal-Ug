import React, { useState } from 'react';
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
  ChevronRight,
  ChevronDown,
  LayoutGrid
} from 'lucide-react';
import { CategoryId, Category } from '../types';
import { CATEGORIES } from '../data/mockData';

interface CategorySidebarProps {
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

export const CategorySidebar: React.FC<CategorySidebarProps> = ({
  selectedCategory,
  onSelectCategory,
  selectedSubcategory,
  onSelectSubcategory,
  darkMode,
}) => {
  const [expandedCat, setExpandedCat] = useState<CategoryId | null>(
    selectedCategory !== 'all' ? selectedCategory : null
  );

  const toggleCategoryExpand = (catId: CategoryId, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedCat(prev => prev === catId ? null : catId);
  };

  return (
    <aside className={`rounded-xl border shadow-xs overflow-hidden transition-colors ${
      darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/90'
    }`}>
      {/* Sidebar Header */}
      <div className={`p-3.5 border-b flex items-center justify-between ${
        darkMode ? 'border-slate-800 bg-slate-900/60' : 'border-slate-100 bg-slate-50/70'
      }`}>
        <div className="flex items-center gap-2">
          <LayoutGrid className="w-4 h-4 text-[#00B53F]" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
            All Categories
          </h2>
        </div>

        {selectedCategory !== 'all' && (
          <button
            onClick={() => {
              onSelectCategory('all');
              onSelectSubcategory(null);
              setExpandedCat(null);
            }}
            className="text-[11px] font-bold text-[#00B53F] hover:underline cursor-pointer"
          >
            Clear
          </button>
        )}
      </div>

      {/* Category List */}
      <nav className="divide-y divide-slate-100 dark:divide-slate-800/60 max-h-[720px] overflow-y-auto">
        {/* All Classifieds Option */}
        <button
          onClick={() => {
            onSelectCategory('all');
            onSelectSubcategory(null);
          }}
          className={`w-full px-3.5 py-2.5 flex items-center justify-between text-left text-xs transition-colors cursor-pointer ${
            selectedCategory === 'all'
              ? darkMode
                ? 'bg-[#00B53F]/20 text-[#00B53F] font-bold'
                : 'bg-[#00B53F]/10 text-[#00B53F] font-bold'
              : darkMode
                ? 'text-slate-300 hover:bg-slate-800/60'
                : 'text-slate-700 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className={`w-6 h-6 rounded-md flex items-center justify-center ${
              selectedCategory === 'all'
                ? 'bg-[#00B53F] text-white'
                : darkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-600'
            }`}>
              <LayoutGrid className="w-3.5 h-3.5" />
            </div>
            <span>All Uganda Ads</span>
          </div>
          <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400">
            5,400+
          </span>
        </button>

        {CATEGORIES.map((cat) => {
          const Icon = getCategoryIcon(cat.icon);
          const isSelected = selectedCategory === cat.id;
          const isExpanded = expandedCat === cat.id;

          return (
            <div key={cat.id} className="group">
              <div
                onClick={() => {
                  onSelectCategory(cat.id);
                  onSelectSubcategory(null);
                  setExpandedCat(cat.id);
                }}
                className={`w-full px-3.5 py-2.5 flex items-center justify-between text-left text-xs transition-colors cursor-pointer ${
                  isSelected
                    ? darkMode
                      ? 'bg-[#00B53F]/15 text-[#00B53F] font-bold'
                      : 'bg-[#00B53F]/10 text-[#00B53F] font-bold'
                    : darkMode
                      ? 'text-slate-300 hover:bg-slate-800/50'
                      : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${
                    isSelected
                      ? 'bg-[#00B53F] text-white'
                      : darkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-600'
                  }`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="truncate">{cat.name}</span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  <span className={`text-[10px] font-medium ${
                    isSelected 
                      ? 'text-[#00B53F]' 
                      : 'text-slate-600 dark:text-slate-400'
                  }`}>
                    {cat.itemCount}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => toggleCategoryExpand(cat.id, e)}
                    className="p-0.5 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    aria-label={`Toggle ${cat.name} subcategories`}
                  >
                    {isExpanded ? (
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500" />
                    )}
                  </button>
                </div>
              </div>

              {/* Subcategories Accordion */}
              {isExpanded && (
                <div className={`py-1.5 pl-9 pr-3 text-[11px] space-y-1 ${
                  darkMode ? 'bg-slate-950/40' : 'bg-slate-50/70'
                }`}>
                  <button
                    onClick={() => {
                      onSelectCategory(cat.id);
                      onSelectSubcategory(null);
                    }}
                    className={`block w-full text-left py-1 px-2 rounded font-medium transition-colors cursor-pointer ${
                      selectedSubcategory === null && isSelected
                        ? 'text-[#00B53F] font-bold bg-[#00B53F]/10'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    All {cat.name}
                  </button>
                  {cat.subcategories.map((sub) => (
                    <button
                      key={sub}
                      onClick={() => {
                        onSelectCategory(cat.id);
                        onSelectSubcategory(sub);
                      }}
                      className={`block w-full text-left py-1 px-2 rounded transition-colors cursor-pointer truncate ${
                        selectedSubcategory === sub && isSelected
                          ? 'text-[#00B53F] font-bold bg-[#00B53F]/10'
                          : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                      }`}
                    >
                      {sub}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
};

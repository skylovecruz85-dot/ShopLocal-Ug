import React, { useState, useRef } from 'react';
import { 
  X, 
  ArrowLeft, 
  CheckCircle, 
  MapPin, 
  AlertCircle,
  Camera,
  Tag,
  Layers,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CategoryId, ItemCondition, Listing, UgandaDistrict, User } from '../types';
import { CATEGORIES, UGANDA_DISTRICTS } from '../data/mockData';
import { PostAdPromoModal, PromoSelection } from './PostAdPromoModal';

interface PostAdModalProps {
  currentUser: User;
  onClose: () => void;
  onSubmit: (newListing: Partial<Listing>, promoOption?: PromoSelection) => void;
  onOpenProModal: () => void;
  darkMode?: boolean;
  initialStep?: 'details' | 'promo';
}

export const PostAdModal: React.FC<PostAdModalProps> = ({
  currentUser,
  onClose,
  onSubmit,
  onOpenProModal,
  initialStep = 'details',
}) => {
  const [step, setStep] = useState<'details' | 'promo'>(initialStep);
  const [title, setTitle] = useState('');
  const [brand, setBrand] = useState('');
  const [type, setType] = useState('');
  const [category, setCategory] = useState<CategoryId>('agriculture');
  const [price, setPrice] = useState<number | ''>('');
  const [priceInput, setPriceInput] = useState<string>('');
  const [isNegotiable, setIsNegotiable] = useState(true);
  const [exchangePossible, setExchangePossible] = useState(false);
  const [condition, setCondition] = useState<ItemCondition>('Brand New');
  const [district, setDistrict] = useState<UgandaDistrict>(currentUser.district || 'Kampala');
  const [locationDetails, setLocationDetails] = useState('Nakawa Division, Kampala');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [tags, setTags] = useState('Uganda, Quality, Fast Delivery');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawDigits = e.target.value.replace(/\D/g, '');
    if (!rawDigits) {
      setPriceInput('');
      setPrice('');
      return;
    }
    const numericVal = parseInt(rawDigits, 10);
    setPrice(numericVal);
    setPriceInput(numericVal.toLocaleString('en-US'));
  };

  // Check 18 free listings status
  const isFreeLimitReached = !currentUser.isProMember && currentUser.freeListingsUsed >= currentUser.freeListingsTotal;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result && typeof event.target.result === 'string') {
          setImages(prev => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleCustomImageUrl = () => {
    const url = prompt('Enter image URL:');
    if (url && url.startsWith('http')) {
      setImages([...images, url]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !price) {
      alert('Please fill in title and price.');
      return;
    }
    setStep('promo');
  };

  if (step === 'promo') {
    return (
      <PostAdPromoModal
        onBack={() => setStep('details')}
        onClear={() => {
          setTitle('');
          setBrand('');
          setType('');
          setPrice('');
          setPriceInput('');
          setImages([]);
          setDescription('');
          setStep('details');
        }}
        onBuyPromoAndPost={(promo) => {
          const parsedTags = tags.split(',').map(t => t.trim()).filter(Boolean);
          const categoryName = CATEGORIES.find(c => c.id === category)?.name || 'General';
          onSubmit({
            title: title || 'Toyota Harrier 2018',
            brand: brand.trim() || undefined,
            type: type.trim() || undefined,
            category,
            subcategory: categoryName,
            price: Number(price) || 68000000,
            isNegotiable,
            exchangePossible,
            condition,
            district,
            locationDetails,
            description: description || `Genuine ${title || 'Item'} available in ${district}. Direct seller contact with fast delivery across Uganda.`,
            images: images.length > 0 ? images : ['https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80'],
            tags: parsedTags,
          }, promo);
        }}
        onSaveAndPostLater={() => {
          const parsedTags = tags.split(',').map(t => t.trim()).filter(Boolean);
          const categoryName = CATEGORIES.find(c => c.id === category)?.name || 'General';
          onSubmit({
            title: title || 'Toyota Harrier 2018',
            brand: brand.trim() || undefined,
            type: type.trim() || undefined,
            category,
            subcategory: categoryName,
            price: Number(price) || 68000000,
            isNegotiable,
            exchangePossible,
            condition,
            district,
            locationDetails,
            description: description || `Genuine ${title || 'Item'} available in ${district}. Direct seller contact with fast delivery across Uganda.`,
            images: images.length > 0 ? images : ['https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80'],
            tags: parsedTags,
          });
        }}
        adTitle={title}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
      {/* Modal Container: sleek dark black theme with pure white words and black inputs */}
      <div 
        className="rounded-3xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden relative border border-zinc-800 bg-zinc-950 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Back Arrow */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950 text-white sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl border border-zinc-700 bg-black hover:bg-zinc-900 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold text-white"
              title="Back"
            >
              <ArrowLeft className="w-4 h-4 text-white" />
              <span className="text-white">Back</span>
            </button>
            <div>
              <h2 className="font-display font-extrabold text-lg sm:text-xl text-white">
                Post an Item for Sale
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] sm:text-xs font-bold text-white bg-[#3db83a] px-2 py-0.5 rounded-md">
                  🇺🇬 18 Free Listings for Everyone
                </span>
                <span className="text-xs text-white">
                  Listing <strong className="text-white">{currentUser.freeListingsUsed + 1}</strong> of <strong className="text-white">{currentUser.freeListingsTotal || 18} Free</strong> (Including Big Businesses)
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl border border-zinc-700 bg-black text-white hover:bg-zinc-900 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* 2-Step Navigation Indicator */}
        <div className="flex items-center justify-between px-6 py-2.5 bg-zinc-900/90 border-b border-zinc-800 text-xs">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setStep('details')}
              className="px-3 py-1 rounded-full text-xs font-bold bg-[#00B53F] text-white shadow-xs cursor-pointer"
            >
              1. Ad Details
            </button>
            <span className="text-zinc-600">→</span>
            <button
              type="button"
              onClick={() => {
                if (!title) setTitle('Toyota Harrier 2018');
                if (!price) {
                  setPrice(68000000);
                  setPriceInput('68,000,000');
                }
                setStep('promo');
              }}
              className="px-3 py-1 rounded-full text-xs font-bold bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#00E676]" />
              <span>2. Choose Promo (Jiji Screen)</span>
            </button>
          </div>
          <span className="text-[11px] text-zinc-400 font-medium hidden sm:inline">
            Step 1 of 2
          </span>
        </div>

        {/* Free limit notice if reached */}
        {isFreeLimitReached && (
          <div className="p-4 bg-zinc-900 border-b border-amber-500/50 text-white text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-white font-medium">You have reached your 18 Free Listings limit! Upgrade to Pro for unlimited lifetime listings.</span>
            </div>
            <button
              onClick={onOpenProModal}
              className="bg-[#ff7e00] hover:bg-[#e06e00] text-white font-bold px-3 py-1.5 rounded-lg text-xs shrink-0 cursor-pointer shadow-sm"
            >
              Get Pro Pass
            </button>
          </div>
        )}

        {/* Form Body - Words White & Filling Gaps Black */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 p-6 space-y-5 bg-zinc-950 text-white">
          {/* Item Title */}
          <div>
            <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1.5">
              Item Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Toyota Harrier 2018, iPhone 13 128GB, 3 Bedroom in Naalya"
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-700 bg-black text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#00B53F]/40 focus:border-[#00B53F] placeholder:text-zinc-500 transition-colors"
            />
          </div>

          {/* BRAND AND TYPE */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Brand */}
            <div>
              <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-[#00B53F]" />
                  <span>Brand</span>
                </span>
                <span className="text-[11px] text-zinc-400 font-normal">Optional</span>
              </label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="e.g. Apple, Toyota, Samsung, Nike, Crestank..."
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-700 bg-black text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#00B53F]/40 focus:border-[#00B53F] placeholder:text-zinc-500 transition-colors"
              />
            </div>

            {/* Type */}
            <div>
              <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#00B53F]" />
                  <span>Type</span>
                </span>
                <span className="text-[11px] text-zinc-400 font-normal">Optional</span>
              </label>
              <input
                type="text"
                value={type}
                onChange={(e) => setType(e.target.value)}
                placeholder="e.g. Smartphone, Sedan, Boda Boda, Sneakers, Produce..."
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-700 bg-black text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#00B53F]/40 focus:border-[#00B53F] placeholder:text-zinc-500 transition-colors"
              />
            </div>
          </div>

          {/* Category (Subcategory removed per user request) */}
          <div>
            <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1.5">
              Category *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as CategoryId)}
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-700 bg-black text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#00B53F]/40 focus:border-[#00B53F] transition-colors"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id} className="bg-black text-white">
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Price (UGX) & Negotiable / Exchange Possible */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1.5">
                PRICE (UGX) *
              </label>
              <div className="flex rounded-xl overflow-hidden border border-zinc-700 focus-within:border-[#00B53F] focus-within:ring-2 focus-within:ring-[#00B53F]/40 transition-all bg-black">
                {/* Left badge "UGX" green background white text */}
                <span className="bg-[#00B53F] text-white text-xs font-extrabold px-3.5 py-2.5 flex items-center justify-center shrink-0 select-none">
                  UGX
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  required
                  value={priceInput}
                  onChange={handlePriceChange}
                  placeholder="85,000"
                  className="w-full px-4 py-2.5 bg-black text-white text-sm font-semibold focus:outline-none placeholder:text-zinc-500"
                />
              </div>

              {/* Below input show live preview: "Buyers will see: UGX 85,000" */}
              <div className="mt-1.5 flex items-center gap-1.5 text-xs text-zinc-400">
                <span>Buyers will see:</span>
                <span className="font-bold text-[#00B53F]">
                  {price ? `UGX ${Number(price).toLocaleString('en-US')}${isNegotiable ? ' • Negotiable' : ''}` : 'UGX 85,000'}
                </span>
              </div>
            </div>

            {/* Checkboxes: Negotiable & Exchange possible */}
            <div className="space-y-2 pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isNegotiable}
                  onChange={(e) => setIsNegotiable(e.target.checked)}
                  className="w-4 h-4 text-[#00B53F] accent-[#00B53F] bg-black rounded cursor-pointer"
                />
                <span className="text-[12px] font-medium text-white">Negotiable</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={exchangePossible}
                  onChange={(e) => setExchangePossible(e.target.checked)}
                  className="w-4 h-4 text-[#00B53F] accent-[#00B53F] bg-black rounded cursor-pointer"
                />
                <span className="text-[12px] font-medium text-white">Exchange possible</span>
              </label>
            </div>
          </div>

          {/* Condition & District */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1.5">
                Item Condition *
              </label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as ItemCondition)}
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-700 bg-black text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3db83a]/40 focus:border-[#3db83a] transition-colors"
              >
                <option value="Brand New" className="bg-black text-white">Brand New</option>
                <option value="Like New" className="bg-black text-white">Like New</option>
                <option value="Used - Good" className="bg-black text-white">Used - Good</option>
                <option value="Refurbished" className="bg-black text-white">Refurbished</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1.5">
                District / Town *
              </label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value as UgandaDistrict)}
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-700 bg-black text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3db83a]/40 focus:border-[#3db83a] transition-colors"
              >
                {UGANDA_DISTRICTS.filter(d => d !== 'All Uganda').map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Location details */}
          <div>
            <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1.5">
              Specific Neighborhood / Landmark
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-[#3db83a] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={locationDetails}
                onChange={(e) => setLocationDetails(e.target.value)}
                placeholder="e.g. Near Acacia Mall / Kikuubo Market / Entebbe Stage"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-zinc-700 bg-black text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3db83a]/40 focus:border-[#3db83a] placeholder:text-zinc-500 transition-colors"
              />
            </div>
          </div>

          {/* Photos Selection (Sample photos removed per user request) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-white uppercase tracking-wider">
                Item Photos (Upload or Snap)
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs text-[#3db83a] hover:underline font-bold cursor-pointer flex items-center gap-1"
                >
                  <Camera className="w-3.5 h-3.5 text-[#3db83a]" />
                  <span className="text-white">Choose Photo / Camera</span>
                </button>
                <button
                  type="button"
                  onClick={handleCustomImageUrl}
                  className="text-xs text-white hover:text-zinc-300 cursor-pointer font-bold"
                >
                  + URL
                </button>
              </div>
            </div>

            {/* Hidden native camera/file input */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />

            {/* Photo Action Bar & Previews */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-20 h-20 rounded-xl border-2 border-dashed border-zinc-700 bg-black hover:border-[#3db83a] flex flex-col items-center justify-center text-white transition-colors shrink-0 cursor-pointer p-1"
                title="Upload from phone gallery or take photo with camera"
              >
                <Camera className="w-6 h-6 mb-1 text-[#3db83a]" />
                <span className="text-[9px] font-bold text-center leading-tight text-white">Snap / Upload</span>
              </button>

              {/* Current Selected Photos */}
              {images.map((img, i) => (
                <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-zinc-700 bg-black shrink-0 group">
                  <img src={img} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setImages(images.filter((_, idx) => idx !== i))}
                    className="absolute top-1 right-1 p-1 bg-black/80 text-white rounded-full opacity-80 hover:opacity-100 transition-opacity"
                    title="Remove photo"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                </div>
              ))}

              {images.length === 0 && (
                <div className="text-[11px] text-zinc-500 italic flex items-center px-3 py-2 border border-zinc-800 rounded-xl bg-black">
                  No photos added yet. Snap or upload your product image.
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1.5">
              Item Description & Terms
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe condition, specifications, warranty, reason for sale, and delivery availability..."
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-700 bg-black text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3db83a]/40 focus:border-[#3db83a] placeholder:text-zinc-500 resize-none transition-colors"
            />
          </div>

          {/* Search Tags */}
          <div>
            <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1.5">
              Search Tags (comma separated)
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g. organic, brand new, boda boda, wholesale"
              className="w-full px-4 py-2 rounded-xl border border-zinc-700 bg-black text-white text-xs focus:outline-none focus:ring-2 focus:ring-[#3db83a]/40 focus:border-[#3db83a] placeholder:text-zinc-500 transition-colors"
            />
          </div>

          {/* Submit Actions */}
          <div className="pt-2 space-y-2.5">
            {/* Primary: Next to Promo Screen */}
            <button
              type="submit"
              className="w-full h-[50px] rounded-[8px] bg-[#00E676] hover:bg-[#00C853] active:scale-[0.99] text-black font-extrabold text-sm shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer uppercase tracking-wider"
            >
              <span>Next: Choose Promo &amp; Post ad →</span>
            </button>

            {/* Direct Free Post option */}
            <button
              type="button"
              onClick={() => {
                if (!title || !price) {
                  alert('Please fill in title and price.');
                  return;
                }
                confetti({
                  particleCount: 70,
                  spread: 60,
                  origin: { y: 0.6 },
                });
                const parsedTags = tags.split(',').map(t => t.trim()).filter(Boolean);
                const categoryName = CATEGORIES.find(c => c.id === category)?.name || 'General';
                onSubmit({
                  title,
                  brand: brand.trim() || undefined,
                  type: type.trim() || undefined,
                  category,
                  subcategory: categoryName,
                  price: Number(price),
                  isNegotiable,
                  exchangePossible,
                  condition,
                  district,
                  locationDetails,
                  description: description || `Genuine ${title}${brand ? ' (' + brand + ')' : ''} available in ${district}. Direct seller contact with fast delivery across Uganda.`,
                  images: images.length > 0 ? images : ['https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80'],
                  tags: parsedTags,
                });
              }}
              className="w-full py-2 text-xs text-zinc-400 hover:text-white font-medium text-center transition-colors cursor-pointer"
            >
              Or post immediately as standard free ad without promo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

import React, { useState, useEffect, useRef } from 'react';
import {
  X, Plus, Trash2, Upload, Star, Image as ImageIcon,
  Check, AlertCircle, Sparkles, Tag, Layers, RefreshCw, Eye, ChevronDown, ChevronUp
} from 'lucide-react';
import { Product, StockStatus } from '../../types';
import { SafeImage } from '../SafeImage';
import { SATIN_BOUQUET_PRESETS, compressImageFile } from '../../utils/imageUtils';

interface ProductEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onSave: (productData: Partial<Product>) => Promise<void>;
  token: string | null;
}

const CATEGORIES: { value: Product['category']; label: string }[] = [
  { value: 'single-rose', label: 'Single Rose' },
  { value: 'mini-bouquet', label: 'Mini Bouquet (3-5 Roses)' },
  { value: 'premium-bouquet', label: 'Premium Bouquet (7+ Roses)' },
  { value: 'custom-bouquet', label: 'Custom Bouquet' },
  { value: 'gift-set', label: 'Gift Set & Hampers' },
  { value: 'keychain', label: 'Rose Keychains & Accents' },
  { value: 'festive', label: 'Festive & Special Occasion' },
  { value: 'limited', label: 'Limited Edition' }
];

export const ProductEditModal: React.FC<ProductEditModalProps> = ({
  isOpen,
  onClose,
  product,
  onSave,
  token
}) => {
  const isEditing = Boolean(product);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState<Product['category']>('premium-bouquet');
  const [price, setPrice] = useState<number | ''>('');
  const [originalPrice, setOriginalPrice] = useState<number | ''>('');
  const [stockStatus, setStockStatus] = useState<StockStatus>('IN_STOCK');
  const [stockQuantity, setStockQuantity] = useState<number | ''>(50);
  const [flowerType, setFlowerType] = useState('Handmade Satin Ribbon Rose');
  const [numberOfFlowers, setNumberOfFlowers] = useState<number | ''>(7);
  const [preparationTime, setPreparationTime] = useState('1-2 days');
  const [description, setDescription] = useState('');
  const [shortDescription, setShortDescription] = useState('');

  // Images state
  const [images, setImages] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageError, setImageError] = useState('');
  const [showPresetGallery, setShowPresetGallery] = useState(false);

  // Options & Attributes
  const [availableColours, setAvailableColours] = useState<string[]>([]);
  const [colourInput, setColourInput] = useState('');
  const [wrappingOptions, setWrappingOptions] = useState<string[]>([]);
  const [wrappingInput, setWrappingInput] = useState('');
  const [ribbonColours, setRibbonColours] = useState<string[]>([]);
  const [ribbonInput, setRibbonInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  // Flags
  const [isBestSeller, setIsBestSeller] = useState(false);
  const [isNewArrival, setIsNewArrival] = useState(false);
  const [isFestive, setIsFestive] = useState(false);
  const [isLimitedEdition, setIsLimitedEdition] = useState(false);
  const [isCustomisable, setIsCustomisable] = useState(true);
  const [hasPearlOption, setHasPearlOption] = useState(true);
  const [messageCardOption, setMessageCardOption] = useState(true);
  const [giftTagOption, setGiftTagOption] = useState(true);

  // UI state
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (product) {
      setName(product.name || '');
      setSlug(product.slug || '');
      setCategory(product.category || 'premium-bouquet');
      setPrice(product.price ?? '');
      setOriginalPrice(product.originalPrice ?? '');
      setStockStatus(product.stockStatus || 'IN_STOCK');
      setStockQuantity(product.stockQuantity ?? 50);
      setFlowerType(product.flowerType || 'Handmade Satin Ribbon Rose');
      setNumberOfFlowers(product.numberOfFlowers ?? 7);
      setPreparationTime(product.preparationTime || '1-2 days');
      setDescription(product.description || '');
      setShortDescription(product.shortDescription || '');
      setImages(product.images && product.images.length > 0 ? [...product.images] : []);
      setAvailableColours(product.availableColours ? [...product.availableColours] : []);
      setWrappingOptions(product.wrappingOptions ? [...product.wrappingOptions] : []);
      setRibbonColours(product.ribbonColours ? [...product.ribbonColours] : []);
      setTags(product.tags ? [...product.tags] : []);
      setIsBestSeller(Boolean(product.isBestSeller));
      setIsNewArrival(Boolean(product.isNewArrival));
      setIsFestive(Boolean(product.isFestive));
      setIsLimitedEdition(Boolean(product.isLimitedEdition));
      setIsCustomisable(product.isCustomisable ?? true);
      setHasPearlOption(product.hasPearlOption ?? true);
      setMessageCardOption(product.messageCardOption ?? true);
      setGiftTagOption(product.giftTagOption ?? true);
    } else {
      // Default blank values for adding new product
      setName('');
      setSlug('');
      setCategory('premium-bouquet');
      setPrice('');
      setOriginalPrice('');
      setStockStatus('IN_STOCK');
      setStockQuantity(50);
      setFlowerType('Handmade Satin Ribbon Rose');
      setNumberOfFlowers(7);
      setPreparationTime('1-2 days');
      setDescription('Handmade satin ribbon roses crafted with love by Shwetha. Features premium ribbon folds and luxury finish.');
      setShortDescription('Handcrafted satin ribbon rose bouquet.');
      setImages(['/images/flora7-prod-1786682202966-kwoiv.jpeg']);
      setAvailableColours(['Sky Blue & Cream Ivory', 'Blush Pink & Ivory', 'Rose Gold & Champagne']);
      setWrappingOptions(['Frosted Korean White with Gold Trim', 'Dusty Pink Matte', 'Vintage Gold Border Wrap']);
      setRibbonColours(['Luxe Gold Satin Bow', 'Rose Gold Satin', 'Ivory Silk']);
      setTags(['satin roses', 'handmade', 'gift']);
      setIsBestSeller(false);
      setIsNewArrival(true);
      setIsFestive(false);
      setIsLimitedEdition(false);
      setIsCustomisable(true);
      setHasPearlOption(true);
      setMessageCardOption(true);
      setGiftTagOption(true);
    }
    setError('');
    setImageError('');
  }, [product, isOpen]);

  // Auto-generate slug from name if creating new product
  const handleNameChange = (val: string) => {
    setName(val);
    if (!isEditing && !slug) {
      setSlug(
        (val || '')
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '')
      );
    }
  };

  // Image Upload handler with client compression
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!file.type.startsWith('image/')) {
      setImageError('Please select a valid image file (PNG, JPG, WebP, SVG).');
      return;
    }

    setUploadingImage(true);
    setImageError('');

    try {
      // Compress client-side for crisp resolution and instant loading (< 150KB)
      const compressedBase64 = await compressImageFile(file, 1200, 0.85);

      try {
        const res = await fetch('/api/upload-image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ imageBase64: compressedBase64 })
        });

        const data = await res.json();
        if (res.ok && data.imageUrl) {
          setImages(prev => [...prev, data.imageUrl]);
        } else {
          // Fallback: save clean compressed base64 directly
          setImages(prev => [...prev, compressedBase64]);
        }
      } catch {
        // If server upload route fails, fallback to storing data URL
        setImages(prev => [...prev, compressedBase64]);
      } finally {
        setUploadingImage(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    } catch (err: any) {
      setImageError('Failed to process image: ' + (err.message || 'Unknown error'));
      setUploadingImage(false);
    }
  };

  // Add Image via URL
  const handleAddImageUrl = () => {
    if (!newImageUrl.trim()) return;
    const url = newImageUrl.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('/images/')) {
      setImageError('Please enter a valid image URL (e.g. https://... or /images/...)');
      return;
    }
    setImages(prev => [...prev, url]);
    setNewImageUrl('');
    setImageError('');
  };

  // Remove individual image
  const handleRemoveImage = (indexToRemove: number) => {
    if (images.length <= 1) {
      setImageError('Each product must have at least 1 image. Please add another image before removing this one.');
      return;
    }
    setImages(prev => prev.filter((_, idx) => idx !== indexToRemove));
    setImageError('');
  };

  // Set image as primary (move to index 0)
  const handleSetPrimaryImage = (indexToPrimary: number) => {
    if (indexToPrimary === 0) return;
    setImages(prev => {
      const selected = prev[indexToPrimary];
      const rest = prev.filter((_, idx) => idx !== indexToPrimary);
      return [selected, ...rest];
    });
  };

  // Add item to array helper
  const addArrayItem = (
    value: string,
    list: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>,
    setInput: React.Dispatch<React.SetStateAction<string>>
  ) => {
    if (!value.trim()) return;
    if (!list.includes(value.trim())) {
      setList([...list, value.trim()]);
    }
    setInput('');
  };

  // Remove item from array helper
  const removeArrayItem = (
    index: number,
    list: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setList(list.filter((_, i) => i !== index));
  };

  // Form Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Product name is required.');
      return;
    }
    if (price === '' || Number(price) <= 0) {
      setError('Please provide a valid price (e.g. ₹247).');
      return;
    }
    if (images.length === 0) {
      setError('Please add at least one product image.');
      return;
    }

    const calculatedDiscount =
      originalPrice && Number(originalPrice) > Number(price)
        ? Math.round(((Number(originalPrice) - Number(price)) / Number(originalPrice)) * 100)
        : 0;

    const payload: Partial<Product> = {
      name: (name || '').trim(),
      slug: (slug || '').trim() || (name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      category,
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : undefined,
      discountPercent: calculatedDiscount,
      stockStatus,
      stockQuantity: stockQuantity === '' ? 50 : Number(stockQuantity),
      flowerType: flowerType.trim() || 'Handmade Satin Ribbon Rose',
      numberOfFlowers: numberOfFlowers === '' ? 7 : Number(numberOfFlowers),
      preparationTime: preparationTime.trim() || '1-2 days',
      description: description.trim(),
      shortDescription: shortDescription.trim() || description.slice(0, 80),
      images,
      availableColours: availableColours.length > 0 ? availableColours : ['Standard Colors'],
      wrappingOptions: wrappingOptions.length > 0 ? wrappingOptions : ['Standard Wrap'],
      ribbonColours: ribbonColours.length > 0 ? ribbonColours : ['Standard Ribbon'],
      tags: tags.length > 0 ? tags : ['bouquet'],
      isBestSeller,
      isNewArrival,
      isFestive,
      isLimitedEdition,
      isCustomisable,
      hasPearlOption,
      messageCardOption,
      giftTagOption
    };

    setSaving(true);
    setError('');

    try {
      await onSave(payload);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save product. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-[#FCE7F0] overflow-hidden my-8 flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-[#5C2533] text-white p-5 sm:p-6 flex items-center justify-between shrink-0">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#F4B8C7] bg-white/10 px-3 py-1 rounded-full">
              Owner Product Editor
            </span>
            <h2 className="text-xl sm:text-2xl font-serif font-bold mt-1">
              {isEditing ? `Edit Product: ${product?.name}` : 'Create New Handmade Bouquet'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Content */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-8 overflow-y-auto space-y-8 text-xs text-[#5C2533]">
          
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* ======================================================== */}
          {/* SECTION 1: PRODUCT IMAGES MANAGER (Primary Feature) */}
          {/* ======================================================== */}
          <div className="bg-[#FFF9FA] border-2 border-[#FCE7F0] rounded-3xl p-5 sm:p-6 space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#FCE7F0] pb-3">
              <div>
                <h3 className="font-serif font-bold text-base text-[#5C2533] flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-[#B76E79]" />
                  <span>Product Photos & Image Management ({images.length})</span>
                </h3>
                <p className="text-[11px] text-[#8C5263]">
                  The first image with the gold star is the primary cover photo shown across the shop.
                </p>
              </div>

              {/* Upload Button */}
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage}
                  className="px-4 py-2 bg-[#B76E79] hover:bg-[#9E5762] text-white font-bold rounded-full flex items-center gap-2 text-xs shadow-xs transition-colors cursor-pointer"
                >
                  <Upload className={`w-3.5 h-3.5 ${uploadingImage ? 'animate-bounce' : ''}`} />
                  <span>{uploadingImage ? 'Uploading Image...' : 'Upload Image from Device'}</span>
                </button>
              </div>
            </div>

            {imageError && (
              <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs flex items-center gap-2 border border-red-100">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{imageError}</span>
              </div>
            )}

            {/* Current Images Gallery / Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {images.map((imgUrl, idx) => (
                <div
                  key={idx}
                  className={`group relative bg-white rounded-2xl border-2 overflow-hidden shadow-xs transition-all ${
                    idx === 0 ? 'border-[#B76E79] ring-2 ring-[#B76E79]/20' : 'border-[#FCE7F0] hover:border-[#B76E79]/50'
                  }`}
                >
                  <div className="aspect-square w-full bg-[#FFF9FA] flex items-center justify-center overflow-hidden">
                    <SafeImage
                      src={imgUrl}
                      alt={`Product photo ${idx + 1}`}
                      category={category}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  {/* Primary Badge */}
                  {idx === 0 && (
                    <span className="absolute top-2 left-2 bg-[#B76E79] text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                      <Star className="w-2.5 h-2.5 fill-current" /> Cover Photo
                    </span>
                  )}

                  {/* Action Overlay */}
                  <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-center justify-between text-white">
                    {idx !== 0 ? (
                      <button
                        type="button"
                        onClick={() => handleSetPrimaryImage(idx)}
                        className="px-2 py-1 bg-white/20 hover:bg-white/40 text-[10px] font-bold rounded-lg backdrop-blur-xs flex items-center gap-1 transition-colors"
                        title="Set as Primary Cover Photo"
                      >
                        <Star className="w-3 h-3" /> Make Cover
                      </button>
                    ) : (
                      <span className="text-[10px] text-amber-200 font-semibold">★ Main Photo</span>
                    )}

                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="p-1.5 bg-red-600/80 hover:bg-red-600 text-white rounded-lg transition-colors ml-auto"
                      title="Remove this Image"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Image by URL Bar */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={newImageUrl}
                  onChange={e => setNewImageUrl(e.target.value)}
                  placeholder="Or paste an image web link (e.g. https://... or /images/...)"
                  className="w-full bg-white border border-[#FCE7F0] rounded-xl px-3.5 py-2.5 text-xs text-[#5C2533] focus:outline-hidden focus:border-[#B76E79]"
                />
              </div>
              <button
                type="button"
                onClick={handleAddImageUrl}
                className="px-4 py-2.5 bg-white border border-[#B76E79] text-[#B76E79] hover:bg-[#FFF9FA] font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors shrink-0"
              >
                <Plus className="w-3.5 h-3.5" /> Add Image URL
              </button>
            </div>

            {/* Quick Satin Bouquet Photo Presets Accordion */}
            <div className="mt-3 border border-[#FCE7F0] rounded-2xl overflow-hidden bg-[#FFF9FA]/60">
              <button
                type="button"
                onClick={() => setShowPresetGallery(prev => !prev)}
                className="w-full px-4 py-2.5 flex items-center justify-between text-xs font-bold text-[#5C2533] hover:bg-[#FCE7F0]/30 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-[#B76E79]" />
                  <span>🌸 Choose from Flora7 Studio Satin Bouquet Presets (Instant 1-Click Photos)</span>
                </span>
                {showPresetGallery ? <ChevronUp className="w-4 h-4 text-[#8C5263]" /> : <ChevronDown className="w-4 h-4 text-[#8C5263]" />}
              </button>

              {showPresetGallery && (
                <div className="p-3 border-t border-[#FCE7F0] bg-white grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-64 overflow-y-auto">
                  {SATIN_BOUQUET_PRESETS.map(preset => (
                    <div
                      key={preset.id}
                      className="border border-[#FCE7F0] rounded-xl overflow-hidden bg-[#FFF9FA] hover:border-[#B76E79] transition-all group flex flex-col justify-between"
                    >
                      <div className="aspect-square relative overflow-hidden">
                        <SafeImage
                          src={preset.url}
                          alt={preset.name}
                          category={preset.category}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <div className="p-2 space-y-1.5">
                        <p className="text-[10px] font-bold text-[#5C2533] line-clamp-1">{preset.name}</p>
                        <button
                          type="button"
                          onClick={() => {
                            setImages(prev => [...prev, preset.url]);
                            setImageError('');
                          }}
                          className="w-full py-1 bg-[#B76E79] hover:bg-[#9E5762] text-white text-[10px] font-bold rounded-lg transition-colors flex items-center justify-center gap-1"
                        >
                          <Plus className="w-2.5 h-2.5" /> Use Photo
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ======================================================== */}
          {/* SECTION 2: BASIC PRODUCT INFO & PRICING */}
          {/* ======================================================== */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Left Column: Title, Slug, Category */}
            <div className="space-y-4">
              <div>
                <label className="block font-bold text-xs text-[#5C2533] mb-1">
                  Product Title *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => handleNameChange(e.target.value)}
                  placeholder="e.g. 7 Rose Classic Satin Bouquet"
                  required
                  className="w-full bg-[#FFF9FA] border border-[#FCE7F0] rounded-xl px-3.5 py-2.5 text-xs text-[#5C2533] font-semibold focus:outline-hidden focus:border-[#B76E79]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-xs text-[#5C2533] mb-1">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as any)}
                    className="w-full bg-[#FFF9FA] border border-[#FCE7F0] rounded-xl px-3 py-2.5 text-xs text-[#5C2533] font-semibold focus:outline-hidden focus:border-[#B76E79]"
                  >
                    {CATEGORIES.map(c => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-xs text-[#5C2533] mb-1">
                    URL Slug
                  </label>
                  <input
                    type="text"
                    value={slug}
                    onChange={e => setSlug(e.target.value)}
                    placeholder="prod-7-rose-bouquet"
                    className="w-full bg-[#FFF9FA] border border-[#FCE7F0] rounded-xl px-3.5 py-2.5 text-xs text-[#5C2533] font-mono focus:outline-hidden focus:border-[#B76E79]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-xs text-[#5C2533] mb-1">
                  Short One-Line Summary
                </label>
                <input
                  type="text"
                  value={shortDescription}
                  onChange={e => setShortDescription(e.target.value)}
                  placeholder="e.g. Signature 7-rose bouquet with pearl cores & gold ribbon bow."
                  className="w-full bg-[#FFF9FA] border border-[#FCE7F0] rounded-xl px-3.5 py-2.5 text-xs text-[#5C2533] focus:outline-hidden focus:border-[#B76E79]"
                />
              </div>
            </div>

            {/* Right Column: Pricing & Inventory */}
            <div className="space-y-4 bg-[#FFF9FA] p-4.5 rounded-2xl border border-[#FCE7F0]">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-xs text-[#5C2533] mb-1">
                    Selling Price (₹) *
                  </label>
                  <input
                    type="number"
                    value={price}
                    onChange={e => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="247"
                    min="1"
                    required
                    className="w-full bg-white border border-[#FCE7F0] rounded-xl px-3.5 py-2 text-sm font-bold text-[#B76E79] focus:outline-hidden focus:border-[#B76E79]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-xs text-[#5C2533] mb-1">
                    Original Price (₹) (MRP)
                  </label>
                  <input
                    type="number"
                    value={originalPrice}
                    onChange={e => setOriginalPrice(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="299"
                    min="1"
                    className="w-full bg-white border border-[#FCE7F0] rounded-xl px-3.5 py-2 text-xs text-gray-500 line-through focus:outline-hidden focus:border-[#B76E79]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-xs text-[#5C2533] mb-1">
                    Stock Availability *
                  </label>
                  <select
                    value={stockStatus}
                    onChange={e => setStockStatus(e.target.value as StockStatus)}
                    className="w-full bg-white border border-[#FCE7F0] rounded-xl px-3 py-2 text-xs font-semibold text-[#5C2533] focus:outline-hidden focus:border-[#B76E79]"
                  >
                    <option value="IN_STOCK">IN STOCK (Active)</option>
                    <option value="LOW_STOCK">LOW STOCK (Hurry Badge)</option>
                    <option value="OUT_OF_STOCK">OUT OF STOCK</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-xs text-[#5C2533] mb-1">
                    Quantity in Stock
                  </label>
                  <input
                    type="number"
                    value={stockQuantity}
                    onChange={e => setStockQuantity(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="50"
                    min="0"
                    className="w-full bg-white border border-[#FCE7F0] rounded-xl px-3.5 py-2 text-xs text-[#5C2533] font-semibold focus:outline-hidden focus:border-[#B76E79]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-xs text-[#5C2533] mb-1">
                    Number of Roses
                  </label>
                  <input
                    type="number"
                    value={numberOfFlowers}
                    onChange={e => setNumberOfFlowers(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="7"
                    min="1"
                    className="w-full bg-white border border-[#FCE7F0] rounded-xl px-3.5 py-2 text-xs text-[#5C2533] focus:outline-hidden focus:border-[#B76E79]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-xs text-[#5C2533] mb-1">
                    Preparation Time
                  </label>
                  <input
                    type="text"
                    value={preparationTime}
                    onChange={e => setPreparationTime(e.target.value)}
                    placeholder="1-2 days"
                    className="w-full bg-white border border-[#FCE7F0] rounded-xl px-3.5 py-2 text-xs text-[#5C2533] focus:outline-hidden focus:border-[#B76E79]"
                  />
                </div>
              </div>
            </div>

          </div>

          {/* ======================================================== */}
          {/* SECTION 3: FULL DESCRIPTION */}
          {/* ======================================================== */}
          <div>
            <label className="block font-bold text-xs text-[#5C2533] mb-1">
              Full Detailed Description
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Detailed description of craftsmanship, ribbon quality, arrangement, and gifting appeal..."
              className="w-full bg-[#FFF9FA] border border-[#FCE7F0] rounded-2xl p-3.5 text-xs text-[#5C2533] leading-relaxed focus:outline-hidden focus:border-[#B76E79]"
            />
          </div>

          {/* ======================================================== */}
          {/* SECTION 4: COLOR, WRAPPING & RIBBON CUSTOMIZATIONS */}
          {/* ======================================================== */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Available Colours */}
            <div className="space-y-2">
              <label className="block font-bold text-xs text-[#5C2533]">
                Available Rose Colours ({availableColours.length})
              </label>
              <div className="flex flex-wrap gap-1.5 min-h-[38px] p-2 bg-[#FFF9FA] rounded-xl border border-[#FCE7F0]">
                {availableColours.map((c, idx) => (
                  <span key={idx} className="bg-white border border-[#FCE7F0] px-2.5 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1.5">
                    {c}
                    <button type="button" onClick={() => removeArrayItem(idx, availableColours, setAvailableColours)} className="text-red-400 hover:text-red-600">×</button>
                  </span>
                ))}
              </div>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={colourInput}
                  onChange={e => setColourInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addArrayItem(colourInput, availableColours, setAvailableColours, setColourInput); } }}
                  placeholder="e.g. Sky Blue & Ivory"
                  className="flex-1 bg-white border border-[#FCE7F0] rounded-xl px-3 py-1.5 text-xs"
                />
                <button
                  type="button"
                  onClick={() => addArrayItem(colourInput, availableColours, setAvailableColours, setColourInput)}
                  className="px-3 py-1.5 bg-[#B76E79] text-white rounded-xl text-xs font-bold"
                >
                  +
                </button>
              </div>
            </div>

            {/* Wrapping Options */}
            <div className="space-y-2">
              <label className="block font-bold text-xs text-[#5C2533]">
                Wrapping Paper Options ({wrappingOptions.length})
              </label>
              <div className="flex flex-wrap gap-1.5 min-h-[38px] p-2 bg-[#FFF9FA] rounded-xl border border-[#FCE7F0]">
                {wrappingOptions.map((w, idx) => (
                  <span key={idx} className="bg-white border border-[#FCE7F0] px-2.5 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1.5">
                    {w}
                    <button type="button" onClick={() => removeArrayItem(idx, wrappingOptions, setWrappingOptions)} className="text-red-400 hover:text-red-600">×</button>
                  </span>
                ))}
              </div>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={wrappingInput}
                  onChange={e => setWrappingInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addArrayItem(wrappingInput, wrappingOptions, setWrappingOptions, setWrappingInput); } }}
                  placeholder="e.g. Frosted Korean White"
                  className="flex-1 bg-white border border-[#FCE7F0] rounded-xl px-3 py-1.5 text-xs"
                />
                <button
                  type="button"
                  onClick={() => addArrayItem(wrappingInput, wrappingOptions, setWrappingOptions, setWrappingInput)}
                  className="px-3 py-1.5 bg-[#B76E79] text-white rounded-xl text-xs font-bold"
                >
                  +
                </button>
              </div>
            </div>

            {/* Ribbon Styles */}
            <div className="space-y-2">
              <label className="block font-bold text-xs text-[#5C2533]">
                Ribbon Colours ({ribbonColours.length})
              </label>
              <div className="flex flex-wrap gap-1.5 min-h-[38px] p-2 bg-[#FFF9FA] rounded-xl border border-[#FCE7F0]">
                {ribbonColours.map((r, idx) => (
                  <span key={idx} className="bg-white border border-[#FCE7F0] px-2.5 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1.5">
                    {r}
                    <button type="button" onClick={() => removeArrayItem(idx, ribbonColours, setRibbonColours)} className="text-red-400 hover:text-red-600">×</button>
                  </span>
                ))}
              </div>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={ribbonInput}
                  onChange={e => setRibbonInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addArrayItem(ribbonInput, ribbonColours, setRibbonColours, setRibbonInput); } }}
                  placeholder="e.g. Luxe Gold Satin Bow"
                  className="flex-1 bg-white border border-[#FCE7F0] rounded-xl px-3 py-1.5 text-xs"
                />
                <button
                  type="button"
                  onClick={() => addArrayItem(ribbonInput, ribbonColours, setRibbonColours, setRibbonInput)}
                  className="px-3 py-1.5 bg-[#B76E79] text-white rounded-xl text-xs font-bold"
                >
                  +
                </button>
              </div>
            </div>

          </div>

          {/* ======================================================== */}
          {/* SECTION 5: PROMOTIONAL BADGES & TOGGLES */}
          {/* ======================================================== */}
          <div className="bg-[#FFF9FA] p-5 rounded-2xl border border-[#FCE7F0] space-y-3">
            <h4 className="font-bold text-xs text-[#5C2533] uppercase tracking-wider">
              Product Badges & Customer Features
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isBestSeller}
                  onChange={e => setIsBestSeller(e.target.checked)}
                  className="rounded text-[#B76E79] focus:ring-[#B76E79] w-4 h-4"
                />
                <span>⭐ Best Seller</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isNewArrival}
                  onChange={e => setIsNewArrival(e.target.checked)}
                  className="rounded text-[#B76E79] focus:ring-[#B76E79] w-4 h-4"
                />
                <span>✨ New Arrival</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFestive}
                  onChange={e => setIsFestive(e.target.checked)}
                  className="rounded text-[#B76E79] focus:ring-[#B76E79] w-4 h-4"
                />
                <span>🎉 Festive Edition</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isLimitedEdition}
                  onChange={e => setIsLimitedEdition(e.target.checked)}
                  className="rounded text-[#B76E79] focus:ring-[#B76E79] w-4 h-4"
                />
                <span>💎 Limited Edition</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasPearlOption}
                  onChange={e => setHasPearlOption(e.target.checked)}
                  className="rounded text-[#B76E79] focus:ring-[#B76E79] w-4 h-4"
                />
                <span>⚪ Pearl Center Option</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={messageCardOption}
                  onChange={e => setMessageCardOption(e.target.checked)}
                  className="rounded text-[#B76E79] focus:ring-[#B76E79] w-4 h-4"
                />
                <span>💌 Free Message Card</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={giftTagOption}
                  onChange={e => setGiftTagOption(e.target.checked)}
                  className="rounded text-[#B76E79] focus:ring-[#B76E79] w-4 h-4"
                />
                <span>🏷️ Free Gift Tag</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isCustomisable}
                  onChange={e => setIsCustomisable(e.target.checked)}
                  className="rounded text-[#B76E79] focus:ring-[#B76E79] w-4 h-4"
                />
                <span>🎨 Custom Color Select</span>
              </label>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#FCE7F0]">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-full text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || uploadingImage}
              className="px-8 py-2.5 bg-[#B76E79] hover:bg-[#9E5762] text-white font-bold rounded-full text-xs shadow-md transition-colors flex items-center gap-2"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Saving Product...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>{isEditing ? 'Update Product' : 'Add to Catalog'}</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

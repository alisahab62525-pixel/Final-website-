import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Upload, Plus, Trash2, Save, Image as ImageIcon } from 'lucide-react';
import { productService } from '../../services/productService';
import { categoryService } from '../../services/categoryService';
import { storageService } from '../../services/storageService';
import { useToast } from '../../contexts/ToastContext';
import { Category, Product } from '../../types';

export const AdminProductFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { success, error } = useToast();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [uploadingImage, setUploadingImage] = useState<boolean>(false);

  // Form Fields
  const [name, setName] = useState<string>('');
  const [slug, setSlug] = useState<string>('');
  const [brand, setBrand] = useState<string>('Ali Collection');
  const [sku, setSku] = useState<string>('ALI-');
  const [categoryId, setCategoryId] = useState<string>('');
  const [price, setPrice] = useState<number>(0);
  const [discountPrice, setDiscountPrice] = useState<string>('');
  const [stockQuantity, setStockQuantity] = useState<number>(10);
  const [lowStockThreshold, setLowStockThreshold] = useState<number>(4);
  const [shortDescription, setShortDescription] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [isActive, setIsActive] = useState<boolean>(true);
  const [isFeatured, setIsFeatured] = useState<boolean>(false);
  const [isBestSeller, setIsBestSeller] = useState<boolean>(false);
  const [isNewArrival, setIsNewArrival] = useState<boolean>(true);
  const [variantsString, setVariantsString] = useState<string>('');
  const [images, setImages] = useState<string[]>([]);
  const [specRows, setSpecRows] = useState<Array<{ key: string; value: string }>>([
    { key: 'Material', value: '100% Genuine' },
    { key: 'Warranty', value: '1 Year Brand Warranty' },
  ]);

  useEffect(() => {
    async function loadData() {
      try {
        const cats = await categoryService.getCategories(false);
        setCategories(cats);
        if (cats.length > 0 && !categoryId) {
          setCategoryId(cats[0].id);
        }

        if (id) {
          const prod = await productService.getProductById(id);
          if (prod) {
            setName(prod.name);
            setSlug(prod.slug);
            setBrand(prod.brand);
            setSku(prod.sku);
            setCategoryId(prod.category_id);
            setPrice(prod.price);
            setDiscountPrice(prod.discount_price ? String(prod.discount_price) : '');
            setStockQuantity(prod.stock_quantity);
            setLowStockThreshold(prod.low_stock_threshold);
            setShortDescription(prod.short_description);
            setDescription(prod.description);
            setIsActive(prod.is_active);
            setIsFeatured(prod.is_featured);
            setIsBestSeller(prod.is_best_seller);
            setIsNewArrival(prod.is_new_arrival);
            setVariantsString(prod.variants?.join(', ') || '');
            setImages(prod.images?.map(i => i.image_url) || []);
            if (prod.specifications) {
              setSpecRows(
                Object.entries(prod.specifications).map(([k, v]) => ({ key: k, value: v }))
              );
            }
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    if (!isEdit) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '')
      );
    }
  };

  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const publicUrl = await storageService.uploadProductImage(file);
      setImages(prev => [...prev, publicUrl]);
      success('Image uploaded to Supabase Storage (product-images)!');
    } catch (err: any) {
      error(err.message || 'Image upload failed');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleAddSpecificationRow = () => {
    setSpecRows(prev => [...prev, { key: '', value: '' }]);
  };

  const handleRemoveSpecificationRow = (idx: number) => {
    setSpecRows(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !slug.trim() || !sku.trim() || !categoryId) {
      error('Please complete all required product fields.');
      return;
    }

    setSaving(true);
    try {
      const specifications: Record<string, string> = {};
      specRows.forEach(r => {
        if (r.key.trim() && r.value.trim()) {
          specifications[r.key.trim()] = r.value.trim();
        }
      });

      const variants = variantsString
        .split(',')
        .map(v => v.trim())
        .filter(Boolean);

      const parsedDiscount = discountPrice ? Number(discountPrice) : undefined;

      const productPayload = {
        name: name.trim(),
        slug: slug.trim(),
        brand: brand.trim(),
        sku: sku.trim(),
        category_id: categoryId,
        price: Number(price),
        discount_price: parsedDiscount,
        stock_quantity: Number(stockQuantity),
        low_stock_threshold: Number(lowStockThreshold),
        short_description: shortDescription.trim(),
        description: description.trim(),
        is_active: isActive,
        is_featured: isFeatured,
        is_best_seller: isBestSeller,
        is_new_arrival: isNewArrival,
        variants,
        specifications,
        rating: 5.0,
        review_count: 0,
      };

      if (isEdit && id) {
        await productService.updateProduct(id, productPayload, images);
        success('Product successfully updated.');
      } else {
        await productService.createProduct(productPayload, images);
        success('Product successfully created and published.');
      }

      navigate('/admin/products');
    } catch (err: any) {
      error(err.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-xs text-neutral-500">Loading form...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      
      <div className="flex items-center justify-between pb-6 border-b border-neutral-200 dark:border-neutral-800">
        <Link
          to="/admin/products"
          className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Cancel & Back</span>
        </Link>
        <h1 className="text-xl font-bold font-display text-neutral-900 dark:text-white">
          {isEdit ? 'Edit Product' : 'Add New Product'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Core Product Information */}
        <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
            General Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="sm:col-span-2">
              <label className="block font-semibold mb-1">Product Title *</label>
              <input
                type="text"
                required
                value={name}
                onChange={handleNameChange}
                placeholder="e.g. Apex Studio Wireless Headphones"
                className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">URL Slug *</label>
              <input
                type="text"
                required
                value={slug}
                onChange={e => setSlug(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 font-mono text-[11px]"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">Brand Name *</label>
              <input
                type="text"
                required
                value={brand}
                onChange={e => setBrand(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">SKU (Stock Keeping Unit) *</label>
              <input
                type="text"
                required
                value={sku}
                onChange={e => setSku(e.target.value)}
                placeholder="ALI-CAT-001"
                className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">Category *</label>
              <select
                value={categoryId}
                onChange={e => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800"
              >
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold mb-1">Short Description (Kicker)</label>
              <input
                type="text"
                value={shortDescription}
                onChange={e => setShortDescription(e.target.value)}
                placeholder="Brief one-line highlight for cards and previews"
                className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold mb-1">Full Description</label>
              <textarea
                rows={4}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Detailed craftsmanship and product narrative..."
                className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800"
              />
            </div>
          </div>
        </div>

        {/* Pricing & Inventory */}
        <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
            Pricing & Stock Controls
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs font-mono">
            <div>
              <label className="block font-sans font-semibold mb-1">Regular Price (Rs.) *</label>
              <input
                type="number"
                required
                min={0}
                value={price}
                onChange={e => setPrice(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 tabular-nums"
              />
            </div>

            <div>
              <label className="block font-sans font-semibold mb-1">Discount Price (Rs.)</label>
              <input
                type="number"
                min={0}
                value={discountPrice}
                onChange={e => setDiscountPrice(e.target.value)}
                placeholder="Optional sale price"
                className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 tabular-nums"
              />
            </div>

            <div>
              <label className="block font-sans font-semibold mb-1">Stock Quantity *</label>
              <input
                type="number"
                required
                min={0}
                value={stockQuantity}
                onChange={e => setStockQuantity(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 tabular-nums"
              />
            </div>

            <div>
              <label className="block font-sans font-semibold mb-1">Low Stock Warning *</label>
              <input
                type="number"
                required
                min={1}
                value={lowStockThreshold}
                onChange={e => setLowStockThreshold(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 tabular-nums"
              />
            </div>
          </div>
        </div>

        {/* Supabase Storage Image Upload (product-images bucket) */}
        <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
              Product Images (Supabase Storage: product-images)
            </h2>
          </div>

          {/* Upload Drop Zone */}
          <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-xl bg-neutral-50 dark:bg-neutral-800/40">
            <Upload className="w-8 h-8 text-neutral-400 mb-2" />
            <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Upload Image to Supabase Storage
            </p>
            <p className="text-[11px] text-neutral-500 mb-3">PNG, JPG, or WebP</p>
            <label className="px-4 py-2 text-xs font-semibold rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 cursor-pointer hover:opacity-90">
              <span>{uploadingImage ? 'Uploading...' : 'Choose File'}</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageFileUpload}
                disabled={uploadingImage}
                className="hidden"
              />
            </label>
          </div>

          {/* Images gallery list */}
          {images.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
              {images.map((imgUrl, i) => (
                <div key={i} className="relative aspect-[4/3] rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-700 group">
                  <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setImages(prev => prev.filter((_, idx) => idx !== i))}
                    className="absolute top-2 right-2 p-1 rounded-full bg-rose-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Variants & Technical Specifications */}
        <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
            Variants & Specifications
          </h2>

          <div className="text-xs space-y-4">
            <div>
              <label className="block font-semibold mb-1">
                Variants / Color Options (Comma Separated)
              </label>
              <input
                type="text"
                value={variantsString}
                onChange={e => setVariantsString(e.target.value)}
                placeholder="e.g. Matte Black, Sandstone Grey, Midnight Navy"
                className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="font-semibold">Technical Specifications</label>
                <button
                  type="button"
                  onClick={handleAddSpecificationRow}
                  className="text-xs font-semibold text-neutral-900 dark:text-white underline"
                >
                  + Add Spec Row
                </button>
              </div>

              <div className="space-y-2">
                {specRows.map((row, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <input
                      type="text"
                      placeholder="Spec Name (e.g. Weight)"
                      value={row.key}
                      onChange={e => {
                        const val = e.target.value;
                        setSpecRows(prev => prev.map((r, i) => i === idx ? { ...r, key: val } : r));
                      }}
                      className="w-1/3 px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800"
                    />
                    <input
                      type="text"
                      placeholder="Spec Value (e.g. 250 grams)"
                      value={row.value}
                      onChange={e => {
                        const val = e.target.value;
                        setSpecRows(prev => prev.map((r, i) => i === idx ? { ...r, value: val } : r));
                      }}
                      className="flex-1 px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveSpecificationRow(idx)}
                      className="p-1.5 text-neutral-400 hover:text-rose-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Flags & Visibility */}
        <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
            Display Flags
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={e => setIsActive(e.target.checked)}
                className="rounded border-neutral-300 dark:border-neutral-700"
              />
              <span className="font-semibold">Storefront Active</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={e => setIsFeatured(e.target.checked)}
                className="rounded border-neutral-300 dark:border-neutral-700"
              />
              <span>Homepage Featured</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isBestSeller}
                onChange={e => setIsBestSeller(e.target.checked)}
                className="rounded border-neutral-300 dark:border-neutral-700"
              />
              <span>Best Seller Tag</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isNewArrival}
                onChange={e => setIsNewArrival(e.target.checked)}
                className="rounded border-neutral-300 dark:border-neutral-700"
              />
              <span>New Arrival Tag</span>
            </label>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 text-xs font-bold rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:opacity-90 transition-opacity flex items-center gap-2 shadow-lg disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : isEdit ? 'Update Product' : 'Publish Product'}</span>
          </button>
        </div>

      </form>

    </div>
  );
};

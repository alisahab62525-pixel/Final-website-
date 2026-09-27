import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Layers, Check } from 'lucide-react';
import { categoryService } from '../../services/categoryService';
import { storageService } from '../../services/storageService';
import { useToast } from '../../contexts/ToastContext';
import { Category } from '../../types';

export const AdminCategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form
  const [name, setName] = useState<string>('');
  const [slug, setSlug] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isActive, setIsActive] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  const { success, error } = useToast();

  const loadCategories = async () => {
    setLoading(true);
    try {
      const data = await categoryService.getCategories(false);
      setCategories(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setName('');
    setSlug('');
    setDescription('');
    setImageUrl('/src/assets/images/category_tech_gadgets_1790526605221.jpg');
    setIsActive(true);
    setModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingId(cat.id);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description);
    setImageUrl(cat.image_url);
    setIsActive(cat.is_active);
    setModalOpen(true);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    if (!editingId) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) return;

    setSaving(true);
    try {
      if (editingId) {
        await categoryService.updateCategory(editingId, {
          name: name.trim(),
          slug: slug.trim(),
          description: description.trim(),
          image_url: imageUrl.trim(),
          is_active: isActive,
        });
        success('Category updated successfully.');
      } else {
        await categoryService.createCategory({
          name: name.trim(),
          slug: slug.trim(),
          description: description.trim(),
          image_url: imageUrl.trim() || '/src/assets/images/category_tech_gadgets_1790526605221.jpg',
          is_active: isActive,
        });
        success('Category created successfully.');
      }
      setModalOpen(false);
      loadCategories();
    } catch (err: any) {
      error(err.message || 'Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, catName: string) => {
    if (!window.confirm(`Delete category "${catName}"?`)) return;
    try {
      await categoryService.deleteCategory(id);
      success(`Category "${catName}" removed.`);
      loadCategories();
    } catch (err: any) {
      error(err.message || 'Failed to delete category');
    }
  };

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white font-display">
            Category Taxonomy Management
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Organize products into customer-facing departments and collection hierarchies.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="px-4 py-2 text-xs font-semibold rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:opacity-90 inline-flex items-center gap-1.5 self-start sm:self-auto shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Department</span>
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map(cat => (
          <div
            key={cat.id}
            className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="aspect-[16/9] w-full rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                <img src={cat.image_url} alt="" className="w-full h-full object-cover" />
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-neutral-900 dark:text-white">{cat.name}</h3>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                    cat.is_active ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-neutral-200 text-neutral-600 dark:bg-neutral-800'
                  }`}>
                    {cat.is_active ? 'Active' : 'Hidden'}
                  </span>
                </div>
                <p className="font-mono text-[11px] text-neutral-400 mt-0.5">/{cat.slug}</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 line-clamp-2">
                  {cat.description || 'No description provided.'}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => openEditModal(cat)}
                className="px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 font-semibold"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => handleDelete(cat.id, cat.name)}
                className="p-1.5 text-neutral-400 hover:text-rose-500 rounded"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Category Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSave}
            className="max-w-md w-full p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl space-y-4 text-xs"
          >
            <h2 className="text-base font-bold text-neutral-900 dark:text-white">
              {editingId ? 'Edit Category' : 'Create Category'}
            </h2>

            <div>
              <label className="block font-semibold mb-1">Category Title *</label>
              <input
                type="text"
                required
                value={name}
                onChange={handleNameChange}
                placeholder="e.g. Footwear & Sneakers"
                className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">Slug *</label>
              <input
                type="text"
                required
                value={slug}
                onChange={e => setSlug(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">Image URL</label>
              <input
                type="text"
                value={imageUrl}
                onChange={e => setImageUrl(e.target.value)}
                placeholder="/src/assets/images/category_tech_gadgets_1790526605221.jpg"
                className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 font-mono text-[11px]"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">Description</label>
              <textarea
                rows={3}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Brief summary of department items..."
                className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800"
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={isActive}
                onChange={e => setIsActive(e.target.checked)}
              />
              <span className="font-semibold">Active & Visible on Storefront</span>
            </label>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100 dark:border-neutral-800">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 font-semibold rounded-lg text-neutral-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 font-semibold rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Category'}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};

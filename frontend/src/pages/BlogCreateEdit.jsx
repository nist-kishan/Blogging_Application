import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { blogSchema } from '../validations/blogSchema';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { blogService } from '../services/blogService';
import { categoryService } from '../services/categoryService';
import { useSelector } from 'react-redux';
import { Spinner, FullPageLoader } from '../components/Loader';
import { Save, Plus, ArrowLeft, Image, AlertCircle, FileText, X } from 'lucide-react';
import { fileService } from '../services/fileService';
import { getImageUrl } from '../utils/imageUtils';

const BlogCreateEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useSelector((state) => state.auth);
  const [errorMsg, setErrorMsg] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);

  // Inline Category states
  const [isAddCatModalOpen, setIsAddCatModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [isCreatingCat, setIsCreatingCat] = useState(false);

  const isEditMode = !!id;

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);
    setErrorMsg('');
    try {
      const response = await fileService.upload(file);
      if (response.success && response.data) {
        setValue('bannerUrl', response.data);
      } else {
        setErrorMsg(response.message || 'Upload failed.');
      }
    } catch (err) {
      setErrorMsg('Failed to upload image file. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCreateCategoryInline = async (e) => {
    e.preventDefault();
    if (!newCatName) return;
    setIsCreatingCat(true);
    setErrorMsg('');
    try {
      // Slugify name
      const slug = newCatName.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
        
      const response = await categoryService.createCategory({
        name: newCatName,
        slug,
        description: newCatDesc
      });
      
      if (response.success && response.data) {
        await queryClient.invalidateQueries(['categories']);
        setValue('categoryId', response.data.id);
        setIsAddCatModalOpen(false);
        setNewCatName('');
        setNewCatDesc('');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to create category.');
    } finally {
      setIsCreatingCat(false);
    }
  };
  const isAdmin = user?.role === 'ADMIN';

  // Fetch Categories
  const { data: catData, isLoading: isCatLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryService.getCategories,
  });

  // Fetch blog detail if in Edit Mode
  const { data: blogData, isLoading: isBlogLoading, error: blogError } = useQuery({
    queryKey: ['blogToEdit', id],
    queryFn: () => blogService.getBlogById(id),
    enabled: isEditMode,
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(blogSchema),
    defaultValues: {
      status: 'DRAFT',
      featured: false,
    },
  });

  const bannerUrl = watch('bannerUrl');

  // Prefill form in edit mode
  useEffect(() => {
    if (isEditMode && blogData?.data) {
      const blog = blogData.data;
      setValue('title', blog.title);
      setValue('summary', blog.summary || '');
      setValue('content', blog.content);
      setValue('bannerUrl', blog.bannerUrl || '');
      setValue('categoryId', blog.category.id);
      setValue('status', blog.status);
      setValue('featured', blog.featured);
    }
  }, [isEditMode, blogData, setValue]);

  const createMutation = useMutation({
    mutationFn: blogService.createBlog,
    onSuccess: (response) => {
      queryClient.invalidateQueries(['blogs']);
      navigate(`/blog/${response.data.slug}`);
    },
    onError: (err) => {
      setErrorMsg(err.response?.data?.message || 'Failed to create blog post. Please check your inputs.');
    },
  });

  const updateMutation = useMutation({
    mutationFn: blogService.updateBlog,
    onSuccess: (response) => {
      queryClient.invalidateQueries(['blogs']);
      queryClient.invalidateQueries(['blog', response.data.slug]);
      navigate(`/blog/${response.data.slug}`);
    },
    onError: (err) => {
      setErrorMsg(err.response?.data?.message || 'Failed to update blog post.');
    },
  });

  const onSubmit = (data) => {
    setErrorMsg('');
    if (isEditMode) {
      updateMutation.mutate({ id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  if (isEditMode && isBlogLoading) return <FullPageLoader />;
  if (isCatLoading) return <FullPageLoader />;

  if (isEditMode && (blogError || !blogData?.data)) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Error loading post</h2>
        <p className="text-slate-400 mb-6">Failed to load the article details for editing.</p>
        <button onClick={() => navigate(-1)} className="text-primary-400 hover:underline flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Go Back
        </button>
      </div>
    );
  }

  const categories = catData?.data || [];

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500 pb-16">
      {/* HEADER */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 border border-slate-800 rounded-xl bg-slate-900/60 hover:bg-slate-900 text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-extrabold text-white text-glow">
            {isEditMode ? 'Edit Article' : 'Write New Article'}
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            {isEditMode ? 'Modify your post parameters and updates' : 'Compose and publish content to your feeds'}
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 p-3.5 rounded-xl text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* FORM */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="glass rounded-2xl border border-slate-800 p-6 space-y-6">
          {/* Post Title */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400">Article Title</label>
            <input
              type="text"
              placeholder="Give your article a catchy title..."
              {...register('title')}
              className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-primary-500 transition-colors"
            />
            {errors.title && <span className="text-[11px] text-red-400">{errors.title.message}</span>}
          </div>

          {/* Category Selector with Inline Creation Button */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-slate-400">Category Topic</label>
              <button
                type="button"
                onClick={() => setIsAddCatModalOpen(true)}
                className="text-[11px] font-bold text-primary-400 hover:underline cursor-pointer"
              >
                + Add New Category
              </button>
            </div>
            <select
              {...register('categoryId')}
              className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:border-primary-500 transition-colors"
            >
              <option value="">-- Choose Category --</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {errors.categoryId && <span className="text-[11px] text-red-400">{errors.categoryId.message}</span>}
          </div>

          {/* Banner Image Uploader Card Instead of URL box */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400">Banner Image</label>
            
            {bannerUrl ? (
              <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-900/40 h-48 group">
                <img
                  src={getImageUrl(bannerUrl)}
                  alt="Banner preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                  <label className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg text-xs font-semibold cursor-pointer transition select-none">
                    Change Image
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={isUploading}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => setValue('bannerUrl', '')}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold transition cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-800 hover:border-primary-500/50 bg-slate-900/35 rounded-xl h-48 cursor-pointer transition select-none">
                {isUploading ? (
                  <div className="flex flex-col items-center gap-2">
                    <Spinner size="md" />
                    <span className="text-xs text-slate-500 animate-pulse">Uploading banner image...</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-slate-500 hover:text-slate-350 transition-colors">
                    <Image className="w-10 h-10" />
                    <span className="text-xs font-semibold">Click to select and upload banner image</span>
                    <span className="text-[10px]">Supports PNG, JPG, JPEG (max 10MB)</span>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={isUploading}
                />
              </label>
            )}

            {/* Optional URL input fallback (expandable) */}
            <div className="pt-1.5 text-right">
              <button
                type="button"
                onClick={() => setShowUrlInput(!showUrlInput)}
                className="text-[10px] font-bold text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
              >
                {showUrlInput ? 'Hide URL input' : 'Or paste direct image URL instead'}
              </button>
            </div>

            {showUrlInput && (
              <div className="relative animate-in fade-in slide-in-from-top-1 duration-150 mt-2">
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/..."
                  {...register('bannerUrl')}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:border-primary-500"
                />
                <Image className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
              </div>
            )}
            {errors.bannerUrl && <span className="text-[11px] text-red-400">{errors.bannerUrl.message}</span>}
          </div>

          {/* Article Summary */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400">Brief Summary</label>
            <textarea
              placeholder="Write a quick summary introduction for the card feeds (max 500 characters)..."
              {...register('summary')}
              className="w-full p-4 rounded-xl bg-slate-900 border border-slate-800 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-primary-500 transition-colors"
              rows={2}
            />
            {errors.summary && <span className="text-[11px] text-red-400">{errors.summary.message}</span>}
          </div>

          {/* Main Content */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400">Main Content Body</label>
            <textarea
              placeholder="Write your article body here. Spacing and breaks are preserved..."
              {...register('content')}
              className="w-full p-4 rounded-xl bg-slate-900 border border-slate-800 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-primary-500 transition-colors font-sans"
              rows={12}
            />
            {errors.content && <span className="text-[11px] text-red-400">{errors.content.message}</span>}
          </div>
        </div>

        {/* Post Settings */}
        <div className="glass rounded-2xl border border-slate-800 p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex flex-wrap items-center gap-6">
            {/* Status */}
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-slate-400">Status:</label>
              <select
                {...register('status')}
                className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-primary-500"
              >
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
              </select>
            </div>

            {/* Featured Checkbox (Admins only) */}
            {isAdmin && (
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  {...register('featured')}
                  className="w-4 h-4 rounded border-slate-800 text-primary-600 focus:ring-primary-500 focus:ring-offset-slate-900 bg-slate-900"
                />
                <span className="text-xs font-semibold text-slate-300">Feature this article</span>
              </label>
            )}
          </div>

          <button
            type="submit"
            disabled={createMutation.isLoading || updateMutation.isLoading}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium bg-primary-600 hover:bg-primary-500 active:scale-[0.98] transition shadow-lg shadow-primary-500/25 text-sm text-white"
          >
            {createMutation.isLoading || updateMutation.isLoading ? (
              <Spinner size="sm" />
            ) : isEditMode ? (
              <Save className="w-4 h-4" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            <span>{isEditMode ? 'Save Changes' : 'Publish Article'}</span>
          </button>
        </div>
      </form>

      {/* INLINE ADD CATEGORY MODAL */}
      {isAddCatModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="glass max-w-md w-full p-6 rounded-2xl border border-slate-800 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-900 pb-3 mb-4">
              <h3 className="text-sm font-bold text-white">Create New Category</h3>
              <button
                type="button"
                onClick={() => setIsAddCatModalOpen(false)}
                className="text-slate-500 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCategoryInline} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Category Name</label>
                <input
                  type="text"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="e.g. Software Architecture"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:border-primary-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Description (Optional)</label>
                <textarea
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  placeholder="What is this topic about?"
                  className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:border-primary-500"
                  rows={3}
                />
              </div>

              <div className="flex gap-3 justify-end pt-3 border-t border-slate-900 mt-6">
                <button
                  type="button"
                  onClick={() => setIsAddCatModalOpen(false)}
                  className="px-4 py-2 border border-slate-800 text-xs font-semibold text-slate-400 hover:text-slate-200 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingCat}
                  className="flex items-center gap-1.5 px-4 py-2 bg-primary-600 hover:bg-primary-500 text-xs font-bold text-white rounded-lg transition shadow"
                >
                  {isCreatingCat ? <Spinner size="sm" /> : <Plus className="w-3.5 h-3.5" />}
                  <span>Add Category</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogCreateEdit;

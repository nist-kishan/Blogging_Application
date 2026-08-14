import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../services/adminService';
import { categoryService } from '../services/categoryService';
import { blogService } from '../services/blogService';
import { Spinner } from '../components/Loader';
import { LayoutDashboard, Users, Layers, MessageSquare, ShieldAlert, Plus, Trash2, Edit2, Shield, User, FileText, AlertCircle, Search, CheckCircle, Loader } from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';
import { DEFAULT_AVATAR_URL } from '../utils/imageUtils';

const AdminDashboard = () => {
  const queryClient = useQueryClient();
  const [activeSubTab, setActiveSubTab] = useState('stats'); // 'stats', 'users', 'categories', 'blogs'

  // Category Edit State
  const [isAddingCat, setIsAddingCat] = useState(false);
  const [editingCatId, setEditingCatId] = useState(null);
  const [catName, setCatName] = useState('');
  const [catSlug, setCatSlug] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [catError, setCatError] = useState('');

  const [confirmConfig, setConfirmConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: '',
    onConfirm: null,
    isDanger: true
  });

  // 1. Fetch stats
  const { data: statsData, isLoading: isStatsLoading } = useQuery({
    queryKey: ['adminStats'],
    queryFn: adminService.getStats,
    enabled: activeSubTab === 'stats',
  });

  // 2. Fetch Users
  const { data: usersData, isLoading: isUsersLoading } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: adminService.getUsers,
    enabled: activeSubTab === 'users',
  });

  // 3. Fetch Categories
  const { data: categoriesData, isLoading: isCategoriesLoading } = useQuery({
    queryKey: ['adminCategories'],
    queryFn: categoryService.getCategories,
    enabled: activeSubTab === 'categories',
  });

  // 4. Fetch Blogs (both draft and published)
  const { data: blogsData, isLoading: isBlogsLoading } = useQuery({
    queryKey: ['adminBlogs'],
    queryFn: () => blogService.getBlogs({ size: 100 }), // all blogs
    enabled: activeSubTab === 'blogs',
  });

  // USER MUTATIONS
  const roleMutation = useMutation({
    mutationFn: adminService.updateUserRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: adminService.deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
    },
  });

  // CATEGORIES MUTATIONS
  const createCatMutation = useMutation({
    mutationFn: categoryService.createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminCategories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      resetCatForm();
    },
    onError: (err) => {
      setCatError(err.response?.data?.message || 'Failed to create category.');
    },
  });

  const updateCatMutation = useMutation({
    mutationFn: categoryService.updateCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminCategories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      resetCatForm();
    },
    onError: (err) => {
      setCatError(err.response?.data?.message || 'Failed to update category.');
    },
  });

  const deleteCatMutation = useMutation({
    mutationFn: categoryService.deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminCategories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  // BLOGS MUTATIONS
  const toggleBlogStatusMutation = useMutation({
    mutationFn: ({ id, data }) => blogService.updateBlog({ id, data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminBlogs'] });
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
      queryClient.invalidateQueries({ queryKey: ['featuredBlogs'] });
    },
  });

  const deleteBlogMutation = useMutation({
    mutationFn: blogService.deleteBlog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminBlogs'] });
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
      queryClient.invalidateQueries({ queryKey: ['featuredBlogs'] });
    },
  });

  const resetCatForm = () => {
    setCatName('');
    setCatSlug('');
    setCatDesc('');
    setCatError('');
    setIsAddingCat(false);
    setEditingCatId(null);
  };

  const handleOpenAddCat = () => {
    resetCatForm();
    setIsAddingCat(true);
  };

  const handleOpenEditCat = (cat) => {
    setCatName(cat.name);
    setCatSlug(cat.slug);
    setCatDesc(cat.description || '');
    setEditingCatId(cat.id);
    setIsAddingCat(true);
  };

  const handleSaveCategory = (e) => {
    e.preventDefault();
    setCatError('');
    const payload = { name: catName, slug: catSlug, description: catDesc };
    if (editingCatId) {
      updateCatMutation.mutate({ id: editingCatId, data: payload });
    } else {
      createCatMutation.mutate(payload);
    }
  };

  const handleToggleRole = (id, currentRole) => {
    const nextRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN';
    setConfirmConfig({
      isOpen: true,
      title: 'Change User Role',
      message: `Are you sure you want to change this user's role to ${nextRole}?`,
      confirmText: 'Change Role',
      isDanger: false,
      onConfirm: () => roleMutation.mutate({ id, role: nextRole })
    });
  };

  const handleDeleteUser = (id) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Delete User Account',
      message: 'Are you sure you want to delete this user? (This soft-deletes the user account).',
      confirmText: 'Delete User',
      isDanger: true,
      onConfirm: () => deleteUserMutation.mutate(id)
    });
  };

  const handleToggleBlogStatus = (blog) => {
    const nextStatus = blog.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    toggleBlogStatusMutation.mutate({
      id: blog.id,
      data: {
        title: blog.title,
        content: blog.content,
        summary: blog.summary,
        bannerUrl: blog.bannerUrl,
        categoryId: blog.category.id,
        status: nextStatus,
        featured: blog.featured,
      },
    });
  };

  const handleDeleteBlog = (id) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Delete Blog Post',
      message: 'Are you sure you want to delete this blog post? This action cannot be undone.',
      confirmText: 'Delete Post',
      isDanger: true,
      onConfirm: () => deleteBlogMutation.mutate(id)
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-16">
      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        confirmText={confirmConfig.confirmText}
        isDanger={confirmConfig.isDanger}
        onConfirm={confirmConfig.onConfirm}
        onCancel={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
      />
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold text-white text-glow flex items-center gap-2">
          <ShieldAlert className="w-8 h-8 text-primary-400 animate-pulse" />
          <span>Control Panel</span>
        </h1>
        <p className="text-slate-500 text-xs mt-1">Manage system configurations, moderate articles, and configure user permissions.</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-900 overflow-x-auto gap-6 scrollbar-none">
        <button
          onClick={() => setActiveSubTab('stats')}
          className={`flex items-center gap-2 pb-4 text-xs font-bold uppercase tracking-wider relative transition cursor-pointer ${
            activeSubTab === 'stats' ? 'text-primary-400' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Stats</span>
          {activeSubTab === 'stats' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-500"></span>}
        </button>

        <button
          onClick={() => setActiveSubTab('users')}
          className={`flex items-center gap-2 pb-4 text-xs font-bold uppercase tracking-wider relative transition cursor-pointer ${
            activeSubTab === 'users' ? 'text-primary-400' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Users</span>
          {activeSubTab === 'users' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-500"></span>}
        </button>

        <button
          onClick={() => setActiveSubTab('categories')}
          className={`flex items-center gap-2 pb-4 text-xs font-bold uppercase tracking-wider relative transition cursor-pointer ${
            activeSubTab === 'categories' ? 'text-primary-400' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Categories</span>
          {activeSubTab === 'categories' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-500"></span>}
        </button>

        <button
          onClick={() => setActiveSubTab('blogs')}
          className={`flex items-center gap-2 pb-4 text-xs font-bold uppercase tracking-wider relative transition cursor-pointer ${
            activeSubTab === 'blogs' ? 'text-primary-400' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Blogs Moderation</span>
          {activeSubTab === 'blogs' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-500"></span>}
        </button>
      </div>

      {/* -------------------- STATS TAB -------------------- */}
      {activeSubTab === 'stats' && (
        isStatsLoading ? (
          <Spinner size="lg" className="mx-auto" />
        ) : statsData && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in duration-300">
            <div className="glass p-6 rounded-2xl border border-slate-800 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Users</p>
                <h3 className="text-3xl font-black text-white">{statsData.data.totalUsers}</h3>
              </div>
              <Users className="w-10 h-10 text-primary-500 opacity-20" />
            </div>

            <div className="glass p-6 rounded-2xl border border-slate-800 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Blogs</p>
                <h3 className="text-3xl font-black text-white">{statsData.data.totalBlogs}</h3>
              </div>
              <FileText className="w-10 h-10 text-emerald-500 opacity-20" />
            </div>

            <div className="glass p-6 rounded-2xl border border-slate-800 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Comments</p>
                <h3 className="text-3xl font-black text-white">{statsData.data.totalComments}</h3>
              </div>
              <MessageSquare className="w-10 h-10 text-indigo-500 opacity-20" />
            </div>

            <div className="glass p-6 rounded-2xl border border-slate-800 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Categories</p>
                <h3 className="text-3xl font-black text-white">{statsData.data.totalCategories}</h3>
              </div>
              <Layers className="w-10 h-10 text-purple-500 opacity-20" />
            </div>
          </div>
        )
      )}

      {/* -------------------- USERS TAB -------------------- */}
      {activeSubTab === 'users' && (
        isUsersLoading ? (
          <Spinner size="lg" className="mx-auto" />
        ) : (
          <div className="glass rounded-2xl border border-slate-800 overflow-hidden shadow-xl animate-in fade-in duration-300">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-900/60 border-b border-slate-800 text-slate-400 font-semibold">
                  <th className="p-4">User</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Role</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900/60">
                {usersData?.data?.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-900/35 transition-colors">
                    <td className="p-4 flex items-center gap-3">
                      <img
                        src={u.avatarUrl || DEFAULT_AVATAR_URL}
                        alt="avatar"
                        className="w-8 h-8 rounded-full border border-slate-800 bg-slate-800"
                      />
                      <div>
                        <p className="font-bold text-white leading-tight">{u.fullName}</p>
                        <p className="text-xs text-slate-500">@{u.username}</p>
                      </div>
                    </td>
                    <td className="p-4 text-slate-300">{u.email}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        u.role === 'ADMIN' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}>
                        {u.role === 'ADMIN' ? <Shield className="w-3 h-3" /> : <User className="w-3 h-3" />}
                        <span>{u.role}</span>
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex justify-center gap-3">
                        <button
                          onClick={() => handleToggleRole(u.id, u.role)}
                          className="text-xs font-semibold text-primary-400 hover:underline cursor-pointer"
                        >
                          Modify Role
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          className="text-xs font-semibold text-red-400 hover:underline flex items-center gap-0.5 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* -------------------- CATEGORIES TAB -------------------- */}
      {activeSubTab === 'categories' && (
        isCategoriesLoading ? (
          <Spinner size="lg" className="mx-auto" />
        ) : (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Control line */}
            <div className="flex justify-end">
              <button
                onClick={handleOpenAddCat}
                className="flex items-center gap-1.5 px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-xs font-bold transition shadow shadow-primary-500/25"
              >
                <Plus className="w-4 h-4" /> Add Category
              </button>
            </div>

            {/* Inline add form */}
            {isAddingCat && (
              <form onSubmit={handleSaveCategory} className="glass p-6 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-900 pb-2 mb-4">
                  <h3 className="text-sm font-bold text-white">{editingCatId ? 'Edit Category' : 'Create Category'}</h3>
                  <button type="button" onClick={resetCatForm} className="text-slate-500 hover:text-white">
                    Cancel
                  </button>
                </div>

                {catError && (
                  <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-xs">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{catError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-400">Name</label>
                    <input
                      type="text"
                      value={catName}
                      onChange={(e) => setCatName(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:border-primary-500"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-400">Slug</label>
                    <input
                      type="text"
                      value={catSlug}
                      onChange={(e) => setCatSlug(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:border-primary-500"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400">Description</label>
                  <textarea
                    value={catDesc}
                    onChange={(e) => setCatDesc(e.target.value)}
                    className="w-full p-3 rounded-lg bg-slate-900 border border-slate-800 text-sm text-slate-100 focus:outline-none"
                    rows={2}
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition shadow"
                  >
                    Save Category
                  </button>
                </div>
              </form>
            )}

            {/* List */}
            <div className="glass rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-900/60 border-b border-slate-800 text-slate-400 font-semibold">
                    <th className="p-4">Name</th>
                    <th className="p-4">Slug</th>
                    <th className="p-4">Description</th>
                    <th className="p-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900/60">
                  {categoriesData?.data?.map((cat) => (
                    <tr key={cat.id} className="hover:bg-slate-900/35 transition-colors">
                      <td className="p-4 font-bold text-white">{cat.name}</td>
                      <td className="p-4 text-slate-400 font-mono text-xs">{cat.slug}</td>
                      <td className="p-4 text-slate-350 max-w-sm truncate">{cat.description || '-'}</td>
                      <td className="p-4 text-center">
                        <div className="flex justify-center gap-3">
                          <button
                            onClick={() => handleOpenEditCat(cat)}
                            className="text-slate-400 hover:text-white transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setConfirmConfig({
                                isOpen: true,
                                title: 'Delete Category',
                                message: `Are you sure you want to delete the category "${cat.name}"? This action cannot be undone.`,
                                confirmText: 'Delete Category',
                                isDanger: true,
                                onConfirm: () => deleteCatMutation.mutate(cat.id)
                              });
                            }}
                            className="text-rose-500 hover:text-rose-450 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      )}

      {/* -------------------- BLOGS TAB -------------------- */}
      {activeSubTab === 'blogs' && (
        isBlogsLoading ? (
          <Spinner size="lg" className="mx-auto" />
        ) : (
          <div className="glass rounded-2xl border border-slate-800 overflow-hidden shadow-xl animate-in fade-in duration-300">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-900/60 border-b border-slate-800 text-slate-400 font-semibold">
                  <th className="p-4">Article</th>
                  <th className="p-4">Author</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900/60">
                {blogsData?.data?.content?.map((blog) => (
                  <tr key={blog.id} className="hover:bg-slate-900/35 transition-colors">
                    <td className="p-4 font-bold text-white max-w-xs truncate">{blog.title}</td>
                    <td className="p-4 text-slate-300">@{blog.author.username}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        blog.status === 'PUBLISHED' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                      }`}>
                        {blog.status}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex justify-center gap-3">
                        <button
                          onClick={() => handleToggleBlogStatus(blog)}
                          className="text-xs font-semibold text-primary-400 hover:underline"
                        >
                          Toggle Status
                        </button>
                        <button
                          onClick={() => handleDeleteBlog(blog.id)}
                          className="text-xs font-semibold text-red-400 hover:underline flex items-center gap-0.5"
                        >
                          <Trash2 className="w-3 h-3" /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  );
};

export default AdminDashboard;

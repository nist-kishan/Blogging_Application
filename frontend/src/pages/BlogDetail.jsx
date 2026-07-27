import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { blogService } from '../services/blogService';
import CommentSection from '../components/CommentSection';
import { FullPageLoader, Spinner } from '../components/Loader';
import { Heart, Bookmark, Eye, Calendar, ArrowLeft, Edit3, Trash2 } from 'lucide-react';
import { getImageUrl } from '../utils/imageUtils';
import ConfirmModal from '../components/ConfirmModal';

const BlogDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const { data: blogData, isLoading, error } = useQuery({
    queryKey: ['blog', slug],
    queryFn: () => blogService.getBlogBySlug(slug),
  });

  const blog = blogData?.data;

  useEffect(() => {
    if (blog?.id) {
      const viewedBlogs = JSON.parse(sessionStorage.getItem('viewedBlogs') || '[]');
      if (!viewedBlogs.includes(blog.id)) {
        blogService.incrementViewCount(blog.id)
          .then(() => {
            viewedBlogs.push(blog.id);
            sessionStorage.setItem('viewedBlogs', JSON.stringify(viewedBlogs));
            // Silently invalidate to fetch the new viewCount
            queryClient.invalidateQueries(['blog', slug]);
          })
          .catch((err) => {
            console.error('Failed to increment view count', err);
          });
      }
    }
  }, [blog?.id, slug, queryClient]);
  const isAuthor = blog && user && blog.author.id === user.id;
  const isAdmin = user?.role === 'ADMIN';

  const likeMutation = useMutation({
    mutationFn: () => (blog.liked ? blogService.unlikeBlog(blog.id) : blogService.likeBlog(blog.id)),
    onSuccess: () => {
      queryClient.invalidateQueries(['blog', slug]);
      queryClient.invalidateQueries(['blogs']);
    },
  });

  const bookmarkMutation = useMutation({
    mutationFn: () => (blog.bookmarked ? blogService.removeBookmark(blog.id) : blogService.bookmarkBlog(blog.id)),
    onSuccess: () => {
      queryClient.invalidateQueries(['blog', slug]);
      queryClient.invalidateQueries(['blogs']);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => blogService.deleteBlog(blog.id),
    onSuccess: () => {
      navigate('/');
    },
  });

  const handleLike = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    likeMutation.mutate();
  };

  const handleBookmark = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    bookmarkMutation.mutate();
  };

  const handleDelete = () => {
    setIsDeleteModalOpen(true);
  };

  if (isLoading) return <FullPageLoader />;

  if (error || !blog) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Post not found</h2>
        <p className="text-slate-400 mb-6">The article you are looking for does not exist or has been deleted.</p>
        <Link to="/" className="text-primary-400 hover:underline flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
      </div>
    );
  }

  const formattedDate = new Date(blog.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <article className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-16">
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        title="Delete Blog Post"
        message="Are you sure you want to delete this blog post? This action cannot be undone."
        confirmText="Delete Post"
        onConfirm={() => deleteMutation.mutate()}
        onCancel={() => setIsDeleteModalOpen(false)}
      />
      {/* 1. BACK BUTTON & EDIT CONTROLS */}
      <div className="flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to feeds</span>
        </Link>

        {(isAuthor || isAdmin) && (
          <div className="flex items-center gap-3">
            <Link
              to={`/edit/${blog.id}`}
              className="flex items-center gap-1.5 px-4 py-2 border border-slate-800 rounded-xl bg-slate-900/60 hover:bg-slate-900 text-xs font-semibold text-slate-300 hover:text-white transition"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Post</span>
            </Link>
            <button
              onClick={handleDelete}
              className="flex items-center gap-1.5 px-4 py-2 border border-red-500/20 rounded-xl bg-red-500/5 hover:bg-red-500/10 text-xs font-semibold text-red-400 hover:text-red-300 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          </div>
        )}
      </div>

      {/* 2. TITLE & HEADER METADATA */}
      <div className="space-y-4">
        <span className="bg-slate-900 border border-slate-800 text-slate-300 text-xs px-3 py-1.5 rounded-md">
          {blog.category.name}
        </span>
        <h1 className="text-3xl md:text-5xl font-black text-white leading-tight tracking-tight text-glow">
          {blog.title}
        </h1>
        
        {blog.summary && (
          <p className="text-slate-400 text-base md:text-lg border-l-2 border-primary-500 pl-4 italic">
            {blog.summary}
          </p>
        )}

        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-900 pb-6 pt-4">
          <div className="flex items-center gap-3">
            <img
              src={getImageUrl(blog.author.avatarUrl) || 'https://api.dicebear.com/7.x/bottts/svg?seed=' + blog.author.username}
              alt={blog.author.fullName}
              className="w-10 h-10 rounded-full border border-slate-700 bg-slate-800"
            />
            <div>
              <Link to={`/profile/${blog.author.username}`} className="text-sm font-bold text-white hover:text-primary-400 transition-colors">
                {blog.author.fullName}
              </Link>
              <p className="text-xs text-slate-500">@{blog.author.username}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-slate-500 text-xs">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Eye className="w-4 h-4" />
              <span>{blog.viewCount} views</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. BANNER IMAGE */}
      <div className="aspect-[21/9] w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-900">
        <img
          src={getImageUrl(blog.bannerUrl) || 'https://images.unsplash.com/photo-1542435503-956c469947f6?auto=format&fit=crop&w=1200&q=80'}
          alt={blog.title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* 4. POST CONTENT */}
      <div className="prose prose-invert max-w-none text-slate-300 leading-relaxed space-y-6 text-base whitespace-pre-wrap">
        {blog.content}
      </div>

      {/* 5. INTERACTION BAR */}
      <div className="flex items-center justify-between border-y border-slate-900 py-4 mt-8">
        <div className="flex items-center gap-6">
          <button
            onClick={handleLike}
            className={`flex items-center gap-2 text-sm font-semibold transition-colors ${
              blog.liked ? 'text-rose-500 hover:text-rose-400' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Heart className={`w-5 h-5 ${blog.liked ? 'fill-current' : ''}`} />
            <span>{blog.likesCount} Likes</span>
          </button>
        </div>

        <button
          onClick={handleBookmark}
          className={`flex items-center gap-2 text-sm font-semibold transition-colors ${
            blog.bookmarked ? 'text-amber-500 hover:text-amber-400' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Bookmark className={`w-5 h-5 ${blog.bookmarked ? 'fill-current' : ''}`} />
          <span>{blog.bookmarked ? 'Saved' : 'Bookmark'}</span>
        </button>
      </div>

      {/* 6. COMMENTS DISCUSSION SECTION */}
      <CommentSection blogId={blog.id} />
    </article>
  );
};

export default BlogDetail;

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { blogService } from '../services/blogService';
import { Heart, Bookmark, Eye, MessageSquare, Calendar } from 'lucide-react';
import { getImageUrl } from '../utils/imageUtils';

const BlogCard = ({ blog }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useSelector((state) => state.auth);

  const formattedDate = new Date(blog.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const likeMutation = useMutation({
    mutationFn: () => (blog.liked ? blogService.unlikeBlog(blog.id) : blogService.likeBlog(blog.id)),
    onSuccess: () => {
      // Invalidate queries to refresh lists
      queryClient.invalidateQueries(['blogs']);
      queryClient.invalidateQueries(['blog', blog.slug]);
    },
  });

  const bookmarkMutation = useMutation({
    mutationFn: () => (blog.bookmarked ? blogService.removeBookmark(blog.id) : blogService.bookmarkBlog(blog.id)),
    onSuccess: () => {
      queryClient.invalidateQueries(['blogs']);
      queryClient.invalidateQueries(['blog', blog.slug]);
      queryClient.invalidateQueries(['bookmarkedBlogs']);
    },
  });

  const handleLikeClick = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    likeMutation.mutate();
  };

  const handleBookmarkClick = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    bookmarkMutation.mutate();
  };

  return (
    <div className="glass group rounded-2xl border border-slate-800/60 overflow-hidden flex flex-col hover:border-slate-700/80 transition-all duration-300 hover:shadow-2xl hover:shadow-primary-500/5 hover:-translate-y-1">
      {/* BANNER IMAGE */}
      <Link to={`/blog/${blog.slug}`} className="relative h-48 block overflow-hidden bg-slate-900">
        <img
          src={getImageUrl(blog.bannerUrl) || 'https://images.unsplash.com/photo-1542435503-956c469947f6?auto=format&fit=crop&w=800&q=80'}
          alt={blog.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {blog.featured && (
          <span className="absolute top-4 left-4 bg-primary-600/90 backdrop-blur-sm border border-primary-500/30 text-white text-xs font-semibold px-2.5 py-1 rounded-md shadow-md">
            Featured
          </span>
        )}
        <span className="absolute bottom-4 right-4 bg-slate-950/80 backdrop-blur-sm border border-slate-800 text-slate-300 text-xs px-2.5 py-1 rounded-md">
          {blog.category.name}
        </span>
      </Link>

      {/* CARD CONTENT */}
      <div className="p-6 flex flex-col flex-1">
        <div className="flex items-center gap-2 text-slate-500 text-xs mb-3">
          <Calendar className="w-3.5 h-3.5" />
          <span>{formattedDate}</span>
          <span className="w-1 h-1 rounded-full bg-slate-700"></span>
          <Eye className="w-3.5 h-3.5" />
          <span>{blog.viewCount} views</span>
        </div>

        <Link to={`/blog/${blog.slug}`} className="block mb-2">
          <h3 className="text-lg font-bold text-white group-hover:text-primary-400 transition-colors line-clamp-2">
            {blog.title}
          </h3>
        </Link>

        <p className="text-slate-400 text-sm line-clamp-3 mb-6 flex-1">
          {blog.summary || 'No summary available for this blog post. Open to read full content...'}
        </p>

        {/* METADATA BAR */}
        <div className="flex items-center justify-between border-t border-slate-900 pt-4 mt-auto">
          {/* Author info */}
          <Link to={`/profile/${blog.author.username}`} className="flex items-center gap-2.5 group/author">
            <img
              src={getImageUrl(blog.author.avatarUrl) || 'https://api.dicebear.com/7.x/bottts/svg?seed=' + blog.author.username}
              alt={blog.author.fullName}
              className="w-7 h-7 rounded-full border border-slate-800 bg-slate-800"
            />
            <span className="text-xs font-semibold text-slate-300 group-hover/author:text-white transition-colors">
              {blog.author.fullName}
            </span>
          </Link>

          {/* Engagement actions */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleLikeClick}
              disabled={likeMutation.isLoading}
              className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
                blog.liked ? 'text-rose-500 hover:text-rose-400' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Heart className={`w-4 h-4 ${blog.liked ? 'fill-current' : ''}`} />
              <span>{blog.likesCount}</span>
            </button>

            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <MessageSquare className="w-4 h-4" />
              <span>{blog.commentsCount}</span>
            </div>

            <button
              onClick={handleBookmarkClick}
              disabled={bookmarkMutation.isLoading}
              className={`transition-colors ${
                blog.bookmarked ? 'text-amber-500 hover:text-amber-400' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${blog.bookmarked ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogCard;

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { blogService } from '../services/blogService';
import BlogCard from '../components/BlogCard';
import { BlogGridSkeleton } from '../components/Loader';
import { Bookmark } from 'lucide-react';

const BookmarksPage = () => {
  const { data: bookmarkData, isLoading } = useQuery({
    queryKey: ['bookmarkedBlogsPage'],
    queryFn: () => blogService.getBookmarkedBlogs({ size: 100 }),
  });

  const blogs = bookmarkData?.data?.content || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-16">
      <div>
        <h1 className="text-3xl font-extrabold text-white text-glow flex items-center gap-2">
          <Bookmark className="w-8 h-8 text-primary-400" />
          <span>My Bookmarks</span>
        </h1>
        <p className="text-slate-500 text-xs mt-1">
          Review and access articles you have bookmarked for offline or later reading.
        </p>
      </div>

      {isLoading ? (
        <BlogGridSkeleton count={3} />
      ) : blogs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogs.map((blog) => (
            <BlogCard key={blog.id} blog={blog} />
          ))}
        </div>
      ) : (
        <div className="glass p-12 rounded-2xl border border-slate-800 text-center">
          <p className="text-slate-500 text-sm">You have not bookmarked any articles yet.</p>
        </div>
      )}
    </div>
  );
};

export default BookmarksPage;

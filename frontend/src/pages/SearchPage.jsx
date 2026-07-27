import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { blogService } from '../services/blogService';
import BlogCard from '../components/BlogCard';
import { BlogGridSkeleton } from '../components/Loader';
import { Search } from 'lucide-react';

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('query') || '';

  const { data: searchData, isLoading } = useQuery({
    queryKey: ['searchBlogs', query],
    queryFn: () => blogService.searchBlogs({ query }),
    enabled: !!query,
  });

  const blogs = searchData?.data?.content || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-16">
      <div>
        <h1 className="text-3xl font-extrabold text-white text-glow flex items-center gap-2">
          <Search className="w-8 h-8 text-primary-400" />
          <span>Search Results</span>
        </h1>
        <p className="text-slate-500 text-xs mt-1">
          Showing articles matching: <span className="text-slate-350 font-bold">"{query}"</span>
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
          <p className="text-slate-500 text-sm">No articles matched your search query. Try different keywords.</p>
        </div>
      )}
    </div>
  );
};

export default SearchPage;

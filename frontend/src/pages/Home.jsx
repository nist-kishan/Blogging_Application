import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation, useNavigate } from 'react-router-dom';
import { blogService } from '../services/blogService';
import { categoryService } from '../services/categoryService';
import BlogCard from '../components/BlogCard';
import { BlogGridSkeleton } from '../components/Loader';
import { TrendingUp, Flame, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getSelectedCategoryFromSearch } from '../utils/categoryQuery';

const Home = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState(() => getSelectedCategoryFromSearch(location.search));
  const [activeTab, setActiveTab] = useState('latest'); // 'latest', 'trending'

  useEffect(() => {
    const categoryFromUrl = getSelectedCategoryFromSearch(location.search);
    setSelectedCategory(categoryFromUrl);
    setCurrentPage(0);
  }, [location.search]);

  // Fetch Categories
  const { data: catData } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryService.getCategories,
  });

  // Fetch Featured Blogs
  const { data: featuredData } = useQuery({
    queryKey: ['featuredBlogs'],
    queryFn: () => blogService.getBlogs({ featured: true, size: 3, status: 'PUBLISHED' }),
  });

  // Fetch Regular Blogs
  const { data: blogsData, isLoading: isBlogsLoading } = useQuery({
    queryKey: ['blogs', currentPage, selectedCategory, activeTab],
    queryFn: () => {
      const params = {
        page: currentPage,
        size: 6,
        status: 'PUBLISHED',
      };
      if (selectedCategory) {
        params.category = selectedCategory;
      }
      if (activeTab === 'latest') {
        params.sort = 'createdAt,desc';
      } else {
        params.sort = 'viewCount,desc';
      }
      return blogService.getBlogs(params);
    },
    placeholderData: (previousData) => previousData,
  });

  // Fetch Trending Blogs (sidebar list)
  const { data: trendingData } = useQuery({
    queryKey: ['trendingBlogs'],
    queryFn: () => blogService.getTrendingBlogs({ limit: 5 }),
  });

  const categories = catData?.data || [];
  const featuredBlogs = featuredData?.data?.content || [];
  const regularBlogs = blogsData?.data?.content || [];
  const trendingBlogs = trendingData?.data || [];
  const totalPages = blogsData?.data?.totalPages || 0;

  const heroPost = featuredBlogs[0];

  return (
    <div className="space-y-12">
      {/* 1. HERO POST SECTION */}
      {heroPost && !selectedCategory && currentPage === 0 && (
        <div className="relative rounded-3xl overflow-hidden glass border border-slate-800/80 min-h-[420px] flex flex-col justify-end p-8 md:p-12 animate-in fade-in duration-500">
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent z-10"></div>
          <img
            src={heroPost.bannerUrl || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=85'}
            alt={heroPost.title}
            className="absolute inset-0 w-full h-full object-cover object-center"
          />

          <div className="relative z-20 max-w-3xl space-y-4">
            <span className="inline-flex items-center gap-1 bg-primary-600/90 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg border border-primary-500/30">
              <Sparkles className="w-3.5 h-3.5" /> Featured Post
            </span>
            <Link to={`/blog/${heroPost.slug}`} className="block group">
              <h1 className="text-3xl md:text-5xl font-black text-white group-hover:text-primary-400 transition-colors leading-tight text-glow">
                {heroPost.title}
              </h1>
            </Link>
            <p className="text-slate-300 text-sm md:text-base line-clamp-2 max-w-2xl">
              {heroPost.summary || 'Click below to read this featured story...'}
            </p>
            <div className="flex items-center gap-4 text-slate-400 text-xs pt-2">
              <span className="font-semibold text-slate-200">By {heroPost.author.fullName}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-slate-700"></span>
              <span>{new Date(heroPost.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>
          </div>
        </div>
      )}

      {/* 2. CATEGORY PILLS BAR */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 border-b border-slate-900 scrollbar-thin">
        <button
          onClick={() => {
            setSelectedCategory(null);
            setCurrentPage(0);
            const nextSearch = new URLSearchParams(location.search);
            nextSearch.delete('category');
            navigate(nextSearch.toString() ? `?${nextSearch.toString()}` : '/', { replace: false });
          }}
          className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition border cursor-pointer ${
            selectedCategory === null
              ? 'bg-primary-600 border-primary-500 text-white'
              : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          All Topics
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => {
              const nextSearch = new URLSearchParams(location.search);
              nextSearch.set('category', cat.slug);
              navigate(`/?${nextSearch.toString()}`);
              setSelectedCategory(cat.slug);
              setCurrentPage(0);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition border cursor-pointer ${
              selectedCategory === cat.slug
                ? 'bg-primary-600 border-primary-500 text-white'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* 3. MAIN SECTION GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left 3 cols: Feed Articles */}
        <div className="lg:col-span-3 space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Flame className="w-5 h-5 text-primary-400" />
              <span>{selectedCategory ? `${categories.find(c => c.slug === selectedCategory)?.name} Articles` : 'Discover Articles'}</span>
            </h2>

            {/* Layout switch for Sorting */}
            {!selectedCategory && (
              <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => {
                    setActiveTab('latest');
                    setCurrentPage(0);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    activeTab === 'latest' ? 'bg-primary-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Latest
                </button>
                <button
                  onClick={() => {
                    setActiveTab('trending');
                    setCurrentPage(0);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    activeTab === 'trending' ? 'bg-primary-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Trending
                </button>
              </div>
            )}
          </div>

          {isBlogsLoading ? (
            <BlogGridSkeleton count={6} />
          ) : regularBlogs.length > 0 ? (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {regularBlogs.map((blog) => (
                  <BlogCard key={blog.id} blog={blog} />
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 pt-6 border-t border-slate-900">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 0))}
                    disabled={currentPage === 0}
                    className="p-2.5 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-slate-900 text-slate-300 transition"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="text-xs font-semibold text-slate-400">
                    Page {currentPage + 1} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages - 1))}
                    disabled={currentPage >= totalPages - 1}
                    className="p-2.5 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-slate-900 text-slate-300 transition"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="glass rounded-2xl border border-slate-800 p-12 text-center">
              <p className="text-slate-400 text-sm">No articles found in this section.</p>
            </div>
          )}
        </div>

        {/* Right 1 col: Sidebar Trending */}
        <div className="space-y-8">
          <div className="glass rounded-2xl border border-slate-800 p-6">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-6 uppercase tracking-wider">
              <TrendingUp className="w-4.5 h-4.5 text-primary-400" />
              <span>Trending Reads</span>
            </h3>

            {trendingBlogs.length > 0 ? (
              <div className="space-y-4">
                {trendingBlogs.map((blog, idx) => (
                  <div key={blog.id} className="flex gap-4 group items-start">
                    <span className="text-2xl font-black text-slate-800 group-hover:text-primary-500 transition-colors w-8 text-right shrink-0">
                      0{idx + 1}
                    </span>
                    <div className="space-y-1">
                      <Link to={`/blog/${blog.slug}`} className="block">
                        <h4 className="text-xs font-bold text-slate-300 group-hover:text-white line-clamp-2 leading-relaxed transition-colors">
                          {blog.title}
                        </h4>
                      </Link>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500">
                        <span>{blog.author.fullName}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                        <span>{blog.viewCount} views</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-xs">No trending reads found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;

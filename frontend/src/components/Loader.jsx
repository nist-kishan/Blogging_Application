import React from 'react';

export const Spinner = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div
      className={`animate-spin rounded-full border-t-primary-500 border-r-transparent border-b-transparent border-l-transparent ${sizes[size]} ${className}`}
      style={{ borderColor: 'rgba(14, 165, 233, 0.1)', borderTopColor: '#0ea5e9' }}
    ></div>
  );
};

export const FullPageLoader = () => {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-950 text-slate-400">
      <Spinner size="lg" className="mb-4" />
      <p className="text-sm font-medium tracking-wide animate-pulse">Loading Platform...</p>
    </div>
  );
};

export const BlogCardSkeleton = () => {
  return (
    <div className="glass rounded-2xl border border-slate-800/60 overflow-hidden animate-pulse">
      <div className="h-48 bg-slate-900 w-full"></div>
      <div className="p-6">
        <div className="h-4 bg-slate-900 rounded w-1/4 mb-4"></div>
        <div className="h-6 bg-slate-900 rounded w-3/4 mb-3"></div>
        <div className="h-4 bg-slate-900 rounded w-full mb-2"></div>
        <div className="h-4 bg-slate-900 rounded w-5/6 mb-6"></div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-900"></div>
          <div className="h-4 bg-slate-900 rounded w-1/3"></div>
        </div>
      </div>
    </div>
  );
};

export const BlogGridSkeleton = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {Array.from({ length: count }).map((_, idx) => (
        <BlogCardSkeleton key={idx} />
      ))}
    </div>
  );
};

export default FullPageLoader;

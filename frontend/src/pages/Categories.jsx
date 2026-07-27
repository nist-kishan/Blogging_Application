import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { categoryService } from '../services/categoryService';
import { Link } from 'react-router-dom';
import { Spinner } from '../components/Loader';
import { Layers, ArrowRight } from 'lucide-react';

const Categories = () => {
  const { data: catData, isLoading } = useQuery({
    queryKey: ['categoriesPage'],
    queryFn: categoryService.getCategories,
  });

  const categories = catData?.data || [];

  if (isLoading) return <Spinner size="lg" className="mx-auto mt-20" />;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-16">
      <div>
        <h1 className="text-3xl font-extrabold text-white text-glow flex items-center gap-2">
          <Layers className="w-8 h-8 text-primary-400" />
          <span>Explore Topics</span>
        </h1>
        <p className="text-slate-500 text-xs mt-1">
          Browse articles categorized by tech topics, soft skills, engineering design, and frameworks.
        </p>
      </div>

      {categories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category) => (
            <div
              key={category.id}
              className="glass p-6 rounded-2xl border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between group shadow-xl"
            >
              <div>
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-primary-400 transition-colors">
                  {category.name}
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-6">
                  {category.description || 'Articles related to ' + category.name + ' topics.'}
                </p>
              </div>
              <Link
                to={`/?category=${category.slug}`}
                className="flex items-center gap-1.5 text-xs font-semibold text-primary-400 hover:text-primary-300 transition-colors w-fit"
              >
                <span>Browse articles</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass p-12 rounded-2xl border border-slate-800 text-center">
          <p className="text-slate-500 text-sm">No categories available at the moment.</p>
        </div>
      )}
    </div>
  );
};

export default Categories;

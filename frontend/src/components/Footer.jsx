import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="border-t border-slate-900 bg-slate-950/60 py-12 px-4 md:px-8 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col items-center md:items-start gap-2">
          <Link to="/" className="text-lg font-black text-white flex items-center gap-2">
            <span className="bg-primary-600 px-2 py-0.5 rounded text-xs text-white">KR</span>
            <span className="text-glow text-primary-400">Blogging</span>
          </Link>
          <p className="text-xs text-slate-500 text-center md:text-left">
            © {new Date().getFullYear()} KR Blogging Platform. All rights reserved.
          </p>
        </div>

        <div className="flex items-center gap-8 text-xs font-medium text-slate-500">
          <Link to="/" className="hover:text-slate-300 transition-colors">Home</Link>
          <Link to="/categories" className="hover:text-slate-300 transition-colors">Categories</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

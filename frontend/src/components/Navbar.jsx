import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useMutation } from '@tanstack/react-query';
import { authService } from '../services/authService';
import { logoutSuccess } from '../store/authSlice';
import { Search, PenTool, LogOut, LayoutDashboard, User, Heart, Bookmark, Menu, X, ChevronDown, Sun, Moon } from 'lucide-react';
import { getImageUrl } from '../utils/imageUtils';

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const logoutMutation = useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      dispatch(logoutSuccess());
      setIsDropdownOpen(false);
      navigate('/');
    },
  });

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <nav className="glass sticky top-0 z-50 px-4 md:px-8 py-3 transition-all duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* LOGO */}
        <Link to="/" className="text-xl font-black text-white tracking-wider hover:opacity-90 flex items-center gap-2">
          <span className="bg-primary-600 px-3 py-1 rounded-lg text-sm text-white shadow-md shadow-primary-500/25">KR</span>
          <span className="text-glow text-primary-400">Blogging</span>
        </Link>

        {/* SEARCH BAR (Hidden on small mobile) */}
        <form onSubmit={handleSearchSubmit} className="hidden sm:flex flex-1 max-w-md relative">
          <input
            type="text"
            placeholder="Search blogs, categories, authors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900/60 border border-slate-800 focus:border-primary-500 focus:outline-none text-sm text-slate-100 placeholder-slate-500 transition-colors"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-[11px]" />
        </form>

        {/* NAV ITEMS */}
        <div className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Home</Link>
          <Link to="/categories" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Categories</Link>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 border border-slate-800 rounded-xl hover:bg-slate-900/50 text-slate-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
          </button>

          {isAuthenticated ? (
            <>
              {/* Write Post Button */}
              <Link
                to="/write"
                className="flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-white transition-colors border border-slate-800 rounded-xl px-4 py-2 hover:bg-slate-900/50"
              >
                <PenTool className="w-4 h-4 text-primary-400" />
                <span>Write</span>
              </Link>

              {/* Profile dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 focus:outline-none"
                >
                  <img
                    src={getImageUrl(user.avatarUrl) || 'https://api.dicebear.com/7.x/bottts/svg?seed=fallback'}
                    alt="avatar"
                    className="w-8 h-8 rounded-full border border-slate-700 bg-slate-800"
                  />
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-56 rounded-xl border border-slate-800 bg-slate-950 p-2 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-3 py-2 border-b border-slate-900 mb-2">
                      <p className="text-sm font-semibold text-white truncate">{user.fullName}</p>
                      <p className="text-xs text-slate-500 truncate">@{user.username}</p>
                    </div>

                    {user.role === 'ADMIN' && (
                      <Link
                        to="/admin"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-900 transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 text-primary-400" />
                        <span>Admin Dashboard</span>
                      </Link>
                    )}

                    <Link
                      to={`/profile/${user.username}`}
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-900 transition-colors"
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      <span>My Profile</span>
                    </Link>

                    <Link
                      to="/bookmarks"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-900 transition-colors"
                    >
                      <Bookmark className="w-4 h-4 text-slate-400" />
                      <span>Bookmarks</span>
                    </Link>

                    <button
                      onClick={() => logoutMutation.mutate()}
                      className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Log Out</span>
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Log In</Link>
              <Link
                to="/register"
                className="bg-primary-600 hover:bg-primary-500 active:scale-[0.98] text-white text-sm font-medium px-5 py-2.5 rounded-xl transition shadow-lg shadow-primary-500/25"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>

        {/* MOBILE MENU TOGGLE */}
        <div className="flex md:hidden items-center gap-4">
          {isAuthenticated && (
            <img
              src={getImageUrl(user.avatarUrl) || 'https://api.dicebear.com/7.x/bottts/svg?seed=fallback'}
              alt="avatar"
              className="w-8 h-8 rounded-full border border-slate-700 bg-slate-800"
              onClick={() => navigate(`/profile/${user.username}`)}
            />
          )}
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-slate-400 hover:text-white">
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* MOBILE DRAWER */}
      {isMobileMenuOpen && (
        <div className="md:hidden mt-4 pt-4 border-t border-slate-900 flex flex-col gap-4 animate-in slide-in-from-top-5 duration-200">
          <form onSubmit={handleSearchSubmit} className="flex relative">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900/60 border border-slate-800 text-sm text-slate-100 focus:outline-none"
            />
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-[11px]" />
          </form>

          <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="text-slate-300 hover:text-white py-1">Home</Link>
          <Link to="/categories" onClick={() => setIsMobileMenuOpen(false)} className="text-slate-300 hover:text-white py-1">Categories</Link>

          <button
            onClick={() => {
              toggleTheme();
              setIsMobileMenuOpen(false);
            }}
            className="flex items-center gap-2 text-slate-300 hover:text-white py-1 text-left cursor-pointer"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
            <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          </button>

          {isAuthenticated ? (
            <>
              <Link to="/write" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2 text-slate-300 py-1">
                <PenTool className="w-4 h-4" />
                <span>Write a Post</span>
              </Link>
              {user.role === 'ADMIN' && (
                <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2 text-slate-300 py-1">
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Admin Dashboard</span>
                </Link>
              )}
              <Link to="/bookmarks" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2 text-slate-300 py-1">
                <Bookmark className="w-4 h-4" />
                <span>My Bookmarks</span>
              </Link>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  logoutMutation.mutate();
                }}
                className="flex items-center gap-2 text-red-400 py-1 text-left"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-2 mt-2">
              <Link
                to="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-xl border border-slate-800 text-slate-300 hover:text-white text-sm font-medium"
              >
                Log In
              </Link>
              <Link
                to="/register"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-sm font-medium"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;

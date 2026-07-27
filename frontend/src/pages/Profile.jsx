import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSelector, useDispatch } from 'react-redux';
import { userService } from '../services/userService';
import { blogService } from '../services/blogService';
import BlogCard from '../components/BlogCard';
import { Spinner, BlogGridSkeleton } from '../components/Loader';
import { User, FileText, Heart, Bookmark, Edit, Globe, Mail, Save, X, AlertCircle } from 'lucide-react';
import { fileService } from '../services/fileService';
import { loginSuccess } from '../store/authSlice';
import { getImageUrl } from '../utils/imageUtils';

const Profile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const { user: currentUser, isAuthenticated } = useSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState('posts'); // 'posts', 'likes', 'bookmarks'
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);
    setErrorMsg('');
    try {
      const response = await fileService.upload(file);
      if (response.success && response.data) {
        setEditAvatarUrl(response.data);
      } else {
        setErrorMsg(response.message || 'Upload failed.');
      }
    } catch (err) {
      setErrorMsg('Failed to upload image file.');
    } finally {
      setIsUploading(false);
    }
  };

  // Form states for profile edit
  const [editFullName, setEditFullName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editAvatarUrl, setEditAvatarUrl] = useState('');
  const [editSocialLinks, setEditSocialLinks] = useState('');

  const isOwnProfile = currentUser && currentUser.username === username;

  // 1. Fetch Profile info
  const { data: profileData, isLoading: isProfileLoading, error: profileError } = useQuery({
    queryKey: ['profile', username],
    queryFn: () => userService.getProfile(username),
  });

  const profile = profileData?.data;

  // 2. Fetch User written posts
  const { data: postsData, isLoading: isPostsLoading } = useQuery({
    queryKey: ['profilePosts', username],
    queryFn: () => blogService.getBlogs({ author: username, status: isOwnProfile ? null : 'PUBLISHED', size: 100 }),
    enabled: !!profile,
  });

  // 3. Fetch Liked posts (own profile only)
  const { data: likedData, isLoading: isLikesLoading } = useQuery({
    queryKey: ['likedPosts'],
    queryFn: () => blogService.getLikedBlogs({ size: 100 }),
    enabled: !!profile && isOwnProfile,
  });

  // 4. Fetch Bookmarked posts (own profile only)
  const { data: bookmarkedData, isLoading: isBookmarksLoading } = useQuery({
    queryKey: ['bookmarkedPosts'],
    queryFn: () => blogService.getBookmarkedBlogs({ size: 100 }),
    enabled: !!profile && isOwnProfile,
  });

  // Edit Profile Mutation
  const updateProfileMutation = useMutation({
    mutationFn: userService.updateProfile,
    onSuccess: (response) => {
      queryClient.invalidateQueries(['profile', username]);
      if (response?.data) {
        dispatch(loginSuccess(response.data));
      }
      setIsEditModalOpen(false);
    },
    onError: (err) => {
      setErrorMsg(err.response?.data?.message || 'Failed to update profile.');
    },
  });

  const handleOpenEditModal = () => {
    if (profile) {
      setEditFullName(profile.fullName);
      setEditBio(profile.bio || '');
      setEditAvatarUrl(profile.avatarUrl || '');
      setEditSocialLinks(profile.socialLinks || '');
      setErrorMsg('');
      setIsEditModalOpen(true);
    }
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    updateProfileMutation.mutate({
      fullName: editFullName,
      bio: editBio,
      avatarUrl: editAvatarUrl,
      socialLinks: editSocialLinks,
    });
  };

  if (isProfileLoading) return <Spinner size="lg" className="mx-auto mt-20" />;

  if (profileError || !profile) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Profile not found</h2>
        <p className="text-slate-400">The user @{username} does not exist.</p>
      </div>
    );
  }

  const posts = postsData?.data?.content || [];
  const likedPosts = likedData?.data?.content || [];
  const bookmarkedPosts = bookmarkedData?.data?.content || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-16">
      {/* 1. PROFILE PROFILE CARD */}
      <div className="glass rounded-3xl border border-slate-800 p-8 relative overflow-hidden flex flex-col md:flex-row items-center gap-8 shadow-2xl">
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary-500/10 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-purple-500/10 rounded-full blur-2xl"></div>

        {/* Avatar */}
        <div className="relative shrink-0">
          <img
            src={getImageUrl(profile.avatarUrl) || 'https://api.dicebear.com/7.x/bottts/svg?seed=' + profile.username}
            alt={profile.fullName}
            className="w-28 h-28 md:w-36 md:h-36 rounded-full border-2 border-slate-700 bg-slate-800 object-cover shadow-xl"
          />
        </div>

        {/* Details */}
        <div className="flex-1 text-center md:text-left space-y-4 relative">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-white text-glow leading-tight">{profile.fullName}</h1>
              <p className="text-sm text-slate-500">@{profile.username}</p>
            </div>

            {isOwnProfile && (
              <button
                onClick={handleOpenEditModal}
                className="flex items-center justify-center gap-1.5 px-4 py-2 border border-slate-800 rounded-xl bg-slate-900/60 hover:bg-slate-900 text-xs font-semibold text-slate-300 hover:text-white transition"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </button>
            )}
          </div>

          <p className="text-slate-350 text-sm max-w-2xl leading-relaxed">
            {profile.bio || "No bio written yet. Introduce yourself to the platform!"}
          </p>

          <div className="flex flex-wrap justify-center md:justify-start gap-4 text-xs font-semibold text-slate-400">
            <span className="flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-slate-500" /> {profile.email}
            </span>
            {profile.socialLinks && (
              <span className="flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-slate-500" />
                <a href={profile.socialLinks} target="_blank" rel="noreferrer" className="hover:text-primary-400 transition-colors">
                  Social Portfolio
                </a>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 2. PROFILE FEEDS TABS */}
      <div className="space-y-6">
        <div className="flex border-b border-slate-900 pb-px gap-6">
          <button
            onClick={() => setActiveTab('posts')}
            className={`flex items-center gap-2 pb-4 text-sm font-semibold relative transition ${
              activeTab === 'posts' ? 'text-primary-400' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Articles ({posts.length})</span>
            {activeTab === 'posts' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-500"></span>}
          </button>

          {isOwnProfile && (
            <>
              <button
                onClick={() => setActiveTab('likes')}
                className={`flex items-center gap-2 pb-4 text-sm font-semibold relative transition ${
                  activeTab === 'likes' ? 'text-primary-400' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <Heart className="w-4 h-4" />
                <span>Liked ({likedPosts.length})</span>
                {activeTab === 'likes' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-500"></span>}
              </button>

              <button
                onClick={() => setActiveTab('bookmarks')}
                className={`flex items-center gap-2 pb-4 text-sm font-semibold relative transition ${
                  activeTab === 'bookmarks' ? 'text-primary-400' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <Bookmark className="w-4 h-4" />
                <span>Bookmarks ({bookmarkedPosts.length})</span>
                {activeTab === 'bookmarks' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-500"></span>}
              </button>
            </>
          )}
        </div>

        {/* FEED RENDERING */}
        {activeTab === 'posts' && (
          isPostsLoading ? (
            <BlogGridSkeleton count={3} />
          ) : posts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((blog) => (
                <BlogCard key={blog.id} blog={blog} />
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-sm text-center py-12">No articles published by this user.</p>
          )
        )}

        {activeTab === 'likes' && (
          isLikesLoading ? (
            <BlogGridSkeleton count={3} />
          ) : likedPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {likedPosts.map((blog) => (
                <BlogCard key={blog.id} blog={blog} />
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-sm text-center py-12">You have not liked any articles yet.</p>
          )
        )}

        {activeTab === 'bookmarks' && (
          isBookmarksLoading ? (
            <BlogGridSkeleton count={3} />
          ) : bookmarkedPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {bookmarkedPosts.map((blog) => (
                <BlogCard key={blog.id} blog={blog} />
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-sm text-center py-12">You have not bookmarked any articles yet.</p>
          )
        )}
      </div>

      {/* 3. PROFILE EDIT MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="glass max-w-lg w-full p-8 rounded-2xl border border-slate-800 shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-slate-900 pb-4 mb-6">
              <h2 className="text-lg font-bold text-white">Edit Profile Details</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 p-3.5 rounded-xl text-xs mb-4">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-4 overflow-y-auto flex-1 pr-1">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Full Name</label>
                <input
                  type="text"
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:border-primary-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Avatar Image</label>
                <div className="flex items-center gap-4">
                  {/* Live Avatar Preview */}
                  <img
                    src={getImageUrl(editAvatarUrl) || 'https://api.dicebear.com/7.x/bottts/svg?seed=preview'}
                    alt="Avatar preview"
                    className="w-12 h-12 rounded-full border border-slate-700 bg-slate-800 object-cover shrink-0"
                  />
                  <div className="flex flex-col sm:flex-row gap-3 flex-1">
                    <input
                      type="text"
                      value={editAvatarUrl}
                      onChange={(e) => setEditAvatarUrl(e.target.value)}
                      placeholder="https://api.dicebear.com/..."
                      className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:border-primary-500"
                    />
                    <label className="shrink-0 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white cursor-pointer hover:border-slate-700 transition select-none">
                      {isUploading ? (
                        <Spinner size="sm" />
                      ) : (
                        <>
                          <Edit className="w-3.5 h-3.5" />
                          <span>Upload File</span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                        disabled={isUploading}
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Bio</label>
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  placeholder="Tell us about yourself..."
                  className="w-full p-4 rounded-xl bg-slate-900 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:border-primary-500"
                  rows={3}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Social Links / URL portfolio</label>
                <input
                  type="url"
                  value={editSocialLinks}
                  onChange={(e) => setEditSocialLinks(e.target.value)}
                  placeholder="https://twitter.com/johndoe"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-slate-100 focus:outline-none"
                />
              </div>

              <div className="flex gap-4 justify-end pt-4 border-t border-slate-900 mt-6">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold border border-slate-800 text-slate-400 hover:text-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateProfileMutation.isLoading}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-semibold bg-primary-600 hover:bg-primary-500 text-white transition shadow shadow-primary-500/25"
                >
                  {updateProfileMutation.isLoading ? <Spinner size="sm" /> : <Save className="w-4 h-4" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;

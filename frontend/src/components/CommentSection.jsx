import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { commentService } from '../services/commentService';
import { Spinner } from './Loader';
import { Send, MessageSquare, Reply, Edit2, Trash2, X, Check } from 'lucide-react';
import { getImageUrl } from '../utils/imageUtils';
import ConfirmModal from './ConfirmModal';

const CommentNode = ({ comment, blogId, currentUserId, isAdmin, onReply, onEdit, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState('');

  const isOwner = comment.author.id === currentUserId;

  const handleEditSubmit = () => {
    if (editContent.trim()) {
      onEdit(comment.id, editContent.trim(), () => setIsEditing(false));
    }
  };

  const handleReplySubmit = () => {
    if (replyContent.trim()) {
      onReply(comment.id, replyContent.trim(), () => {
        setIsReplying(false);
        setReplyContent('');
      });
    }
  };

  return (
    <div className="border-l-2 border-slate-900 pl-4 mt-6 ml-1 animate-in fade-in duration-300">
      {/* Header Info */}
      <div className="flex items-center gap-2 mb-2">
        <img
          src={getImageUrl(comment.author.avatarUrl) || 'https://api.dicebear.com/7.x/bottts/svg?seed=' + comment.author.username}
          alt={comment.author.fullName}
          className="w-6 h-6 rounded-full border border-slate-800 bg-slate-800"
        />
        <span className="text-xs font-semibold text-slate-300">{comment.author.fullName}</span>
        <span className="text-[10px] text-slate-600">
          {new Date(comment.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      {/* Content Body */}
      {isEditing ? (
        <div className="flex flex-col gap-2 mt-1">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:border-primary-500"
            rows={2}
          />
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setIsEditing(false)}
              className="flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-slate-300 border border-slate-800 px-2.5 py-1 rounded"
            >
              <X className="w-3 h-3" /> Cancel
            </button>
            <button
              onClick={handleEditSubmit}
              className="flex items-center gap-1 text-[11px] font-medium text-white bg-primary-600 hover:bg-primary-500 px-2.5 py-1 rounded shadow"
            >
              <Check className="w-3 h-3" /> Save
            </button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-slate-400 leading-relaxed break-words">{comment.content}</p>
      )}

      {/* Action panel */}
      <div className="flex items-center gap-4 mt-2">
        {currentUserId && !isEditing && (
          <button
            onClick={() => setIsReplying(!isReplying)}
            className="flex items-center gap-1 text-[10px] text-slate-500 hover:text-slate-300 transition-colors font-semibold"
          >
            <Reply className="w-3.5 h-3.5" />
            <span>Reply</span>
          </button>
        )}

        {isOwner && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-1 text-[10px] text-slate-500 hover:text-slate-300 transition-colors font-semibold"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Edit</span>
          </button>
        )}

        {(isOwner || isAdmin) && (
          <button
            onClick={() => onDelete(comment.id)}
            className="flex items-center gap-1 text-[10px] text-rose-500 hover:text-rose-400 transition-colors font-semibold"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>
        )}
      </div>

      {/* Reply input field */}
      {isReplying && (
        <div className="flex gap-2 mt-4 max-w-lg">
          <input
            type="text"
            placeholder={`Reply to ${comment.author.fullName}...`}
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            className="flex-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-primary-500"
          />
          <button
            onClick={handleReplySubmit}
            className="px-3 bg-primary-600 hover:bg-primary-500 text-white rounded-lg flex items-center justify-center shadow"
          >
            <Send className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Recursive Replies rendering */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-2">
          {comment.replies.map((reply) => (
            <CommentNode
              key={reply.id}
              comment={reply}
              blogId={blogId}
              currentUserId={currentUserId}
              isAdmin={isAdmin}
              onReply={onReply}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const CommentSection = ({ blogId }) => {
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [newCommentText, setNewCommentText] = useState('');
  const [deletingCommentId, setDeletingCommentId] = useState(null);

  const isAdmin = user?.role === 'ADMIN';
  const currentUserId = user?.id;

  // Load comments
  const { data: commentData, isLoading } = useQuery({
    queryKey: ['comments', blogId],
    queryFn: () => commentService.getComments(blogId),
  });

  const createMutation = useMutation({
    mutationFn: (data) => commentService.createComment({ blogId, data }),
    onSuccess: () => {
      queryClient.invalidateQueries(['comments', blogId]);
      queryClient.invalidateQueries(['blogs']); // refresh comment count on listing
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => commentService.updateComment({ id, data }),
    onSuccess: () => {
      queryClient.invalidateQueries(['comments', blogId]);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: commentService.deleteComment,
    onSuccess: () => {
      queryClient.invalidateQueries(['comments', blogId]);
      queryClient.invalidateQueries(['blogs']);
    },
  });

  const handlePostRootComment = (e) => {
    e.preventDefault();
    if (newCommentText.trim()) {
      createMutation.mutate({ content: newCommentText.trim() }, {
        onSuccess: () => setNewCommentText(''),
      });
    }
  };

  const handleReply = (parentId, content, callback) => {
    createMutation.mutate({ content, parentId }, {
      onSuccess: () => callback(),
    });
  };

  const handleEdit = (commentId, content, callback) => {
    updateMutation.mutate({ id: commentId, data: { content } }, {
      onSuccess: () => callback(),
    });
  };

  const handleDelete = (commentId) => {
    setDeletingCommentId(commentId);
  };

  const comments = commentData?.data?.content || [];

  return (
    <div className="border-t border-slate-900 pt-8 mt-12">
      <ConfirmModal
        isOpen={deletingCommentId !== null}
        title="Delete Comment"
        message="Are you sure you want to delete this comment? This action cannot be undone."
        confirmText="Delete Comment"
        onConfirm={() => deleteMutation.mutate(deletingCommentId)}
        onCancel={() => setDeletingCommentId(null)}
      />
      <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-6">
        <MessageSquare className="w-5 h-5 text-primary-400" />
        <span>Discussion ({comments.length})</span>
      </h3>

      {/* Root Comment Form */}
      {isAuthenticated ? (
        <form onSubmit={handlePostRootComment} className="flex flex-col gap-3 mb-8">
          <textarea
            placeholder="Add to the discussion... (Markdown supported)"
            value={newCommentText}
            onChange={(e) => setNewCommentText(e.target.value)}
            className="w-full p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-primary-500 transition-colors"
            rows={3}
            required
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={createMutation.isLoading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium bg-primary-600 hover:bg-primary-500 active:scale-[0.98] transition shadow-lg shadow-primary-500/25 text-sm text-white"
            >
              {createMutation.isLoading ? <Spinner size="sm" /> : <Send className="w-4 h-4" />}
              <span>Post Comment</span>
            </button>
          </div>
        </form>
      ) : (
        <div className="glass rounded-xl border border-slate-800 p-6 text-center mb-8">
          <p className="text-slate-400 text-sm mb-4">Please log in to participate in the discussion.</p>
          <a
            href="/login"
            className="inline-block py-2 px-6 rounded-lg bg-primary-600 hover:bg-primary-500 text-xs font-semibold text-white transition-colors"
          >
            Log In
          </a>
        </div>
      )}

      {/* Comment List */}
      {isLoading ? (
        <div className="flex justify-center py-6">
          <Spinner />
        </div>
      ) : comments.length > 0 ? (
        <div className="space-y-6">
          {comments.map((comment) => (
            <CommentNode
              key={comment.id}
              comment={comment}
              blogId={blogId}
              currentUserId={currentUserId}
              isAdmin={isAdmin}
              onReply={handleReply}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <p className="text-slate-500 text-sm text-center py-8">No comments yet. Start the conversation!</p>
      )}
    </div>
  );
};

export default CommentSection;

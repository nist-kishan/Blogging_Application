package com.blogplatform.service;

import com.blogplatform.dto.CommentRequest;
import com.blogplatform.entity.Blog;
import com.blogplatform.entity.Comment;
import com.blogplatform.entity.User;
import com.blogplatform.exception.BadRequestException;
import com.blogplatform.exception.ResourceNotFoundException;
import com.blogplatform.exception.UnauthorizedException;
import com.blogplatform.repository.BlogRepository;
import com.blogplatform.repository.CommentRepository;
import com.blogplatform.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final BlogRepository blogRepository;
    private final UserRepository userRepository;

    @Transactional
    public Comment createComment(UUID blogId, CommentRequest request, UUID authorId) {
        User author = userRepository.findById(authorId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", authorId));

        Blog blog = blogRepository.findById(blogId)
                .orElseThrow(() -> new ResourceNotFoundException("Blog", "id", blogId));

        Comment comment = Comment.builder()
                .content(request.getContent().trim())
                .blog(blog)
                .author(author)
                .build();

        if (request.getParentId() != null) {
            Comment parent = commentRepository.findById(request.getParentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Comment", "id", request.getParentId()));

            // Verify parent comment belongs to the same blog
            if (!parent.getBlog().getId().equals(blogId)) {
                throw new BadRequestException("Parent comment does not belong to the same blog post");
            }

            comment.setParent(parent);
        }

        return commentRepository.save(comment);
    }

    @Transactional
    public Comment updateComment(UUID commentId, CommentRequest request, UUID authorId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment", "id", commentId));

        if (!comment.getAuthor().getId().equals(authorId)) {
            throw new UnauthorizedException("You do not have permission to modify this comment");
        }

        comment.setContent(request.getContent().trim());
        return commentRepository.save(comment);
    }

    @Transactional
    public void deleteComment(UUID commentId, UUID authorId, boolean isAdmin) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment", "id", commentId));

        if (!comment.getAuthor().getId().equals(authorId) && !isAdmin) {
            throw new UnauthorizedException("You do not have permission to delete this comment");
        }

        commentRepository.delete(comment); // soft-delete via hibernate
    }

    @Transactional(readOnly = true)
    public Page<Comment> getCommentsByBlog(UUID blogId, Pageable pageable) {
        return commentRepository.findByBlogIdAndParentIsNull(blogId, pageable);
    }
}

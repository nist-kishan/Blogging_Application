package com.blogplatform.service;

import com.blogplatform.entity.Blog;
import com.blogplatform.entity.Like;
import com.blogplatform.entity.User;
import com.blogplatform.exception.BadRequestException;
import com.blogplatform.exception.ResourceNotFoundException;
import com.blogplatform.repository.BlogRepository;
import com.blogplatform.repository.LikeRepository;
import com.blogplatform.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class LikeService {

    private final LikeRepository likeRepository;
    private final BlogRepository blogRepository;
    private final UserRepository userRepository;

    @Transactional
    public void likeBlog(UUID blogId, UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Blog blog = blogRepository.findById(blogId)
                .orElseThrow(() -> new ResourceNotFoundException("Blog", "id", blogId));

        if (likeRepository.existsByUserIdAndBlogId(userId, blogId)) {
            throw new BadRequestException("You have already liked this blog post");
        }

        Like like = Like.builder()
                .user(user)
                .blog(blog)
                .build();

        likeRepository.save(like);
    }

    @Transactional
    public void unlikeBlog(UUID blogId, UUID userId) {
        Like like = likeRepository.findByUserIdAndBlogId(userId, blogId)
                .orElseThrow(() -> new BadRequestException("You have not liked this blog post yet"));

        likeRepository.delete(like);
    }

    @Transactional(readOnly = true)
    public Page<Like> getUserLikedBlogs(UUID userId, Pageable pageable) {
        return likeRepository.findByUserId(userId, pageable);
    }
}

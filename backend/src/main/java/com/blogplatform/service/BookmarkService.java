package com.blogplatform.service;

import com.blogplatform.entity.Blog;
import com.blogplatform.entity.Bookmark;
import com.blogplatform.entity.User;
import com.blogplatform.exception.BadRequestException;
import com.blogplatform.exception.ResourceNotFoundException;
import com.blogplatform.repository.BlogRepository;
import com.blogplatform.repository.BookmarkRepository;
import com.blogplatform.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BookmarkService {

    private final BookmarkRepository bookmarkRepository;
    private final BlogRepository blogRepository;
    private final UserRepository userRepository;

    @Transactional
    public void bookmarkBlog(UUID blogId, UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Blog blog = blogRepository.findById(blogId)
                .orElseThrow(() -> new ResourceNotFoundException("Blog", "id", blogId));

        if (bookmarkRepository.existsByUserIdAndBlogId(userId, blogId)) {
            throw new BadRequestException("You have already bookmarked this blog post");
        }

        Bookmark bookmark = Bookmark.builder()
                .user(user)
                .blog(blog)
                .build();

        bookmarkRepository.save(bookmark);
    }

    @Transactional
    public void removeBookmark(UUID blogId, UUID userId) {
        Bookmark bookmark = bookmarkRepository.findByUserIdAndBlogId(userId, blogId)
                .orElseThrow(() -> new BadRequestException("You have not bookmarked this blog post yet"));

        bookmarkRepository.delete(bookmark);
    }

    @Transactional(readOnly = true)
    public Page<Bookmark> getUserBookmarkedBlogs(UUID userId, Pageable pageable) {
        return bookmarkRepository.findByUserId(userId, pageable);
    }
}

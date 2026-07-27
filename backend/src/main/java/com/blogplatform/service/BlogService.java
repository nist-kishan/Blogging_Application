package com.blogplatform.service;

import com.blogplatform.dto.BlogRequest;
import com.blogplatform.dto.BlogResponse;
import com.blogplatform.entity.Blog;
import com.blogplatform.entity.BlogStatus;
import com.blogplatform.entity.Category;
import com.blogplatform.entity.User;
import com.blogplatform.exception.BadRequestException;
import com.blogplatform.exception.ResourceNotFoundException;
import com.blogplatform.exception.UnauthorizedException;
import com.blogplatform.mapper.BlogMapper;
import com.blogplatform.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BlogService {

    private final BlogRepository blogRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final LikeRepository likeRepository;
    private final BookmarkRepository bookmarkRepository;
    private final CommentRepository commentRepository;
    private final BlogMapper blogMapper;

    @Transactional
    public Blog createBlog(BlogRequest request, UUID authorId) {
        User author = userRepository.findById(authorId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", authorId));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.getCategoryId()));

        String slug = generateUniqueSlug(request.getTitle());

        Blog blog = Blog.builder()
                .title(request.getTitle().trim())
                .slug(slug)
                .content(request.getContent())
                .summary(request.getSummary())
                .bannerUrl(request.getBannerUrl())
                .status(request.getStatus())
                .featured(Boolean.TRUE.equals(request.getFeatured()))
                .author(author)
                .category(category)
                .viewCount(0)
                .build();

        return blogRepository.save(blog);
    }

    @Transactional
    public Blog updateBlog(UUID blogId, BlogRequest request, UUID userId, boolean isAdmin) {
        Blog blog = blogRepository.findById(blogId)
                .orElseThrow(() -> new ResourceNotFoundException("Blog", "id", blogId));

        // Check ownership
        if (!blog.getAuthor().getId().equals(userId) && !isAdmin) {
            throw new UnauthorizedException("You do not have permission to modify this blog post");
        }

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.getCategoryId()));

        // If title changed, update slug
        if (!blog.getTitle().equalsIgnoreCase(request.getTitle())) {
            blog.setTitle(request.getTitle().trim());
            blog.setSlug(generateUniqueSlug(request.getTitle()));
        }

        blog.setContent(request.getContent());
        blog.setSummary(request.getSummary());
        blog.setBannerUrl(request.getBannerUrl());
        blog.setStatus(request.getStatus());
        blog.setCategory(category);

        // Only admin can feature a blog post
        if (isAdmin) {
            blog.setFeatured(Boolean.TRUE.equals(request.getFeatured()));
        }

        return blogRepository.save(blog);
    }

    @Transactional
    public void deleteBlog(UUID blogId, UUID userId, boolean isAdmin) {
        Blog blog = blogRepository.findById(blogId)
                .orElseThrow(() -> new ResourceNotFoundException("Blog", "id", blogId));

        // Check ownership
        if (!blog.getAuthor().getId().equals(userId) && !isAdmin) {
            throw new UnauthorizedException("You do not have permission to delete this blog post");
        }

        blogRepository.delete(blog); // Soft delete via @SQLDelete
    }

    @Transactional
    public Blog getBlogById(UUID id) {
        Blog blog = blogRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Blog", "id", id));
        blog.setViewCount(blog.getViewCount() + 1);
        return blogRepository.save(blog);
    }

    @Transactional
    public Blog getBlogBySlug(String slug) {
        Blog blog = blogRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Blog", "slug", slug));
        blog.setViewCount(blog.getViewCount() + 1);
        return blogRepository.save(blog);
    }

    @Transactional(readOnly = true)
    public Page<Blog> getBlogs(Pageable pageable, BlogStatus status, String categorySlug, String authorUsername, Boolean isFeatured) {
        // Build correct queries based on provided filter arguments
        if (authorUsername != null) {
            if (status != null) {
                return blogRepository.findAllByStatusAndAuthorUsername(status, authorUsername, pageable);
            } else {
                return blogRepository.findAllByAuthorUsername(authorUsername, pageable);
            }
        }

        if (categorySlug != null) {
            BlogStatus searchStatus = (status != null) ? status : BlogStatus.PUBLISHED;
            return blogRepository.findAllByStatusAndCategorySlug(searchStatus, categorySlug, pageable);
        }

        if (isFeatured != null) {
            BlogStatus searchStatus = (status != null) ? status : BlogStatus.PUBLISHED;
            return blogRepository.findAllByStatusAndFeatured(searchStatus, isFeatured, pageable);
        }

        if (status != null) {
            return blogRepository.findAllByStatus(status, pageable);
        }

        return blogRepository.findAll(pageable);
    }

    @Transactional(readOnly = true)
    public Page<Blog> searchBlogs(String query, BlogStatus status, Pageable pageable) {
        if (status == null) {
            return blogRepository.searchBlogsAdmin(query, pageable);
        }
        return blogRepository.searchBlogs(query, status, pageable);
    }

    @Transactional(readOnly = true)
    public List<Blog> getTrendingBlogs(int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        return blogRepository.findTopTrendingBlogs(pageable);
    }

    public BlogResponse convertToResponse(Blog blog, UUID currentUserId) {
        BlogResponse response = blogMapper.toResponse(blog);
        response.setLikesCount(likeRepository.countByBlogId(blog.getId()));
        response.setCommentsCount(commentRepository.countByBlogId(blog.getId()));

        if (currentUserId != null) {
            response.setLiked(likeRepository.existsByUserIdAndBlogId(currentUserId, blog.getId()));
            response.setBookmarked(bookmarkRepository.existsByUserIdAndBlogId(currentUserId, blog.getId()));
        }

        return response;
    }

    public Page<BlogResponse> convertToResponsePage(Page<Blog> blogs, UUID currentUserId) {
        return blogs.map(blog -> convertToResponse(blog, currentUserId));
    }

    public List<BlogResponse> convertToResponseList(List<Blog> blogs, UUID currentUserId) {
        return blogs.stream()
                .map(blog -> convertToResponse(blog, currentUserId))
                .collect(Collectors.toList());
    }

    private String generateUniqueSlug(String title) {
        String baseSlug = title.toLowerCase()
                .replaceAll("[^a-z0-9\\s]", "")
                .replaceAll("\\s+", "-")
                .trim();
        
        if (baseSlug.isBlank()) {
            baseSlug = "post";
        }

        String slug = baseSlug;
        int counter = 1;
        while (blogRepository.existsBySlug(slug)) {
            slug = baseSlug + "-" + counter;
            counter++;
        }
        return slug;
    }
}

package com.blogplatform.controller;

import com.blogplatform.dto.ApiResponse;
import com.blogplatform.dto.BlogRequest;
import com.blogplatform.dto.BlogResponse;
import com.blogplatform.entity.Blog;
import com.blogplatform.entity.BlogStatus;
import com.blogplatform.entity.Bookmark;
import com.blogplatform.entity.Like;
import com.blogplatform.security.UserPrincipal;
import com.blogplatform.service.BlogService;
import com.blogplatform.service.BookmarkService;
import com.blogplatform.service.LikeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/blogs")
@RequiredArgsConstructor
public class BlogController {

    private final BlogService blogService;
    private final LikeService likeService;
    private final BookmarkService bookmarkService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<BlogResponse>>> getBlogs(
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size,
            @RequestParam(name = "sort", defaultValue = "createdAt,desc") String sort,
            @RequestParam(name = "status", required = false) BlogStatus status,
            @RequestParam(name = "category", required = false) String categorySlug,
            @RequestParam(name = "author", required = false) String authorUsername,
            @RequestParam(name = "featured", required = false) Boolean isFeatured,
            @AuthenticationPrincipal UserPrincipal principal) {

        String[] sortParams = sort.split(",");
        Sort.Direction direction = sortParams.length > 1 && sortParams[1].equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortParams[0]));

        UUID currentUserId = principal != null ? principal.getId() : null;

        // If not logged in, enforce searching only PUBLISHED posts
        BlogStatus queryStatus = status;
        if (principal == null) {
            queryStatus = BlogStatus.PUBLISHED;
        }

        Page<Blog> blogs = blogService.getBlogs(pageable, queryStatus, categorySlug, authorUsername, isFeatured);
        Page<BlogResponse> response = blogService.convertToResponsePage(blogs, currentUserId);

        return ResponseEntity.ok(ApiResponse.success("Blogs fetched successfully", response));
    }

    @GetMapping("/{slug}")
    public ResponseEntity<ApiResponse<BlogResponse>> getBlogBySlug(
            @PathVariable("slug") String slug,
            @AuthenticationPrincipal UserPrincipal principal) {
        UUID currentUserId = principal != null ? principal.getId() : null;
        Blog blog = blogService.getBlogBySlug(slug);
        BlogResponse response = blogService.convertToResponse(blog, currentUserId);
        return ResponseEntity.ok(ApiResponse.success("Blog fetched successfully", response));
    }

    @GetMapping("/id/{id}")
    public ResponseEntity<ApiResponse<BlogResponse>> getBlogById(
            @PathVariable("id") UUID id,
            @AuthenticationPrincipal UserPrincipal principal) {
        UUID currentUserId = principal != null ? principal.getId() : null;
        Blog blog = blogService.getBlogById(id);
        BlogResponse response = blogService.convertToResponse(blog, currentUserId);
        return ResponseEntity.ok(ApiResponse.success("Blog fetched successfully", response));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<BlogResponse>> createBlog(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody BlogRequest request) {
        Blog blog = blogService.createBlog(request, principal.getId());
        BlogResponse response = blogService.convertToResponse(blog, principal.getId());
        return ResponseEntity.ok(ApiResponse.success("Blog post created successfully", response));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<BlogResponse>> updateBlog(
            @PathVariable("id") UUID id,
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody BlogRequest request) {
        boolean isAdmin = principal.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        Blog blog = blogService.updateBlog(id, request, principal.getId(), isAdmin);
        BlogResponse response = blogService.convertToResponse(blog, principal.getId());
        return ResponseEntity.ok(ApiResponse.success("Blog post updated successfully", response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteBlog(
            @PathVariable("id") UUID id,
            @AuthenticationPrincipal UserPrincipal principal) {
        boolean isAdmin = principal.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        blogService.deleteBlog(id, principal.getId(), isAdmin);
        return ResponseEntity.ok(ApiResponse.success("Blog post deleted successfully"));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<Page<BlogResponse>>> searchBlogs(
            @RequestParam("query") String query,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size,
            @AuthenticationPrincipal UserPrincipal principal) {

        Pageable pageable = PageRequest.of(page, size);
        UUID currentUserId = principal != null ? principal.getId() : null;

        // Admins can search drafts too, normal users can only search published blogs
        BlogStatus status = (principal != null && principal.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) ? null : BlogStatus.PUBLISHED;

        Page<Blog> blogs = blogService.searchBlogs(query, status, pageable);
        Page<BlogResponse> response = blogService.convertToResponsePage(blogs, currentUserId);

        return ResponseEntity.ok(ApiResponse.success("Search results fetched successfully", response));
    }

    @GetMapping("/trending")
    public ResponseEntity<ApiResponse<List<BlogResponse>>> getTrendingBlogs(
            @RequestParam(name = "limit", defaultValue = "5") int limit,
            @AuthenticationPrincipal UserPrincipal principal) {
        UUID currentUserId = principal != null ? principal.getId() : null;
        List<Blog> blogs = blogService.getTrendingBlogs(limit);
        List<BlogResponse> response = blogService.convertToResponseList(blogs, currentUserId);
        return ResponseEntity.ok(ApiResponse.success("Trending blogs fetched successfully", response));
    }

    // LIKES
    @PostMapping("/{id}/like")
    public ResponseEntity<ApiResponse<Void>> likeBlog(
            @PathVariable("id") UUID id,
            @AuthenticationPrincipal UserPrincipal principal) {
        likeService.likeBlog(id, principal.getId());
        return ResponseEntity.ok(ApiResponse.success("Blog liked successfully"));
    }

    @DeleteMapping("/{id}/like")
    public ResponseEntity<ApiResponse<Void>> unlikeBlog(
            @PathVariable("id") UUID id,
            @AuthenticationPrincipal UserPrincipal principal) {
        likeService.unlikeBlog(id, principal.getId());
        return ResponseEntity.ok(ApiResponse.success("Blog unliked successfully"));
    }

    @GetMapping("/liked")
    public ResponseEntity<ApiResponse<Page<BlogResponse>>> getLikedBlogs(
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size,
            @AuthenticationPrincipal UserPrincipal principal) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Like> likes = likeService.getUserLikedBlogs(principal.getId(), pageable);
        Page<BlogResponse> response = likes.map(like -> blogService.convertToResponse(like.getBlog(), principal.getId()));
        return ResponseEntity.ok(ApiResponse.success("Liked blogs fetched successfully", response));
    }

    // BOOKMARKS
    @PostMapping("/{id}/bookmark")
    public ResponseEntity<ApiResponse<Void>> bookmarkBlog(
            @PathVariable("id") UUID id,
            @AuthenticationPrincipal UserPrincipal principal) {
        bookmarkService.bookmarkBlog(id, principal.getId());
        return ResponseEntity.ok(ApiResponse.success("Blog bookmarked successfully"));
    }

    @DeleteMapping("/{id}/bookmark")
    public ResponseEntity<ApiResponse<Void>> removeBookmark(
            @PathVariable("id") UUID id,
            @AuthenticationPrincipal UserPrincipal principal) {
        bookmarkService.removeBookmark(id, principal.getId());
        return ResponseEntity.ok(ApiResponse.success("Bookmark removed successfully"));
    }

    @GetMapping("/bookmarked")
    public ResponseEntity<ApiResponse<Page<BlogResponse>>> getBookmarkedBlogs(
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size,
            @AuthenticationPrincipal UserPrincipal principal) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Bookmark> bookmarks = bookmarkService.getUserBookmarkedBlogs(principal.getId(), pageable);
        Page<BlogResponse> response = bookmarks.map(bookmark -> blogService.convertToResponse(bookmark.getBlog(), principal.getId()));
        return ResponseEntity.ok(ApiResponse.success("Bookmarked blogs fetched successfully", response));
    }
}

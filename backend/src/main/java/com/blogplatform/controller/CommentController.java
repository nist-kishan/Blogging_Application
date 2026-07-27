package com.blogplatform.controller;

import com.blogplatform.dto.ApiResponse;
import com.blogplatform.dto.CommentRequest;
import com.blogplatform.dto.CommentResponse;
import com.blogplatform.entity.Comment;
import com.blogplatform.mapper.CommentMapper;
import com.blogplatform.security.UserPrincipal;
import com.blogplatform.service.CommentService;
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

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/comments")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;
    private final CommentMapper commentMapper;

    @GetMapping("/blog/{blogId}")
    public ResponseEntity<ApiResponse<Page<CommentResponse>>> getCommentsForBlog(
            @PathVariable("blogId") UUID blogId,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "20") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Comment> comments = commentService.getCommentsByBlog(blogId, pageable);
        Page<CommentResponse> response = comments.map(commentMapper::toResponse);

        return ResponseEntity.ok(ApiResponse.success("Comments fetched successfully", response));
    }

    @PostMapping("/blog/{blogId}")
    public ResponseEntity<ApiResponse<CommentResponse>> createComment(
            @PathVariable("blogId") UUID blogId,
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CommentRequest request) {

        Comment comment = commentService.createComment(blogId, request, principal.getId());
        return ResponseEntity.ok(ApiResponse.success("Comment added successfully", commentMapper.toResponse(comment)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CommentResponse>> updateComment(
            @PathVariable("id") UUID id,
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CommentRequest request) {

        Comment comment = commentService.updateComment(id, request, principal.getId());
        return ResponseEntity.ok(ApiResponse.success("Comment updated successfully", commentMapper.toResponse(comment)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteComment(
            @PathVariable("id") UUID id,
            @AuthenticationPrincipal UserPrincipal principal) {

        boolean isAdmin = principal.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        commentService.deleteComment(id, principal.getId(), isAdmin);
        return ResponseEntity.ok(ApiResponse.success("Comment deleted successfully"));
    }
}

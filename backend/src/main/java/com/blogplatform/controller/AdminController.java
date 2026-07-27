package com.blogplatform.controller;

import com.blogplatform.dto.ApiResponse;
import com.blogplatform.dto.DashboardStats;
import com.blogplatform.dto.UserResponse;
import com.blogplatform.entity.User;
import com.blogplatform.entity.UserRole;
import com.blogplatform.mapper.UserMapper;
import com.blogplatform.repository.BlogRepository;
import com.blogplatform.repository.CategoryRepository;
import com.blogplatform.repository.CommentRepository;
import com.blogplatform.repository.UserRepository;
import com.blogplatform.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final UserService userService;
    private final UserRepository userRepository;
    private final BlogRepository blogRepository;
    private final CommentRepository commentRepository;
    private final CategoryRepository categoryRepository;
    private final UserMapper userMapper;

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<DashboardStats>> getDashboardStats() {
        DashboardStats stats = DashboardStats.builder()
                .totalUsers(userRepository.count())
                .totalBlogs(blogRepository.count())
                .totalComments(commentRepository.count())
                .totalCategories(categoryRepository.count())
                .build();
        return ResponseEntity.ok(ApiResponse.success("Dashboard statistics fetched successfully", stats));
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAllUsers() {
        List<User> users = userService.getAllUsers();
        List<UserResponse> response = users.stream()
                .map(userMapper::toResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success("All users fetched successfully", response));
    }

    @PutMapping("/users/{id}/role")
    public ResponseEntity<ApiResponse<UserResponse>> updateUserRole(
            @PathVariable("id") UUID id,
            @RequestParam("role") UserRole role) {
        User updatedUser = userService.updateUserRole(id, role);
        return ResponseEntity.ok(ApiResponse.success("User role updated successfully", userMapper.toResponse(updatedUser)));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable("id") UUID id) {
        userService.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.success("User deleted successfully"));
    }
}

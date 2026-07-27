package com.blogplatform.dto;

import com.blogplatform.entity.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponse {
    private UUID id;
    private String email;
    private String username;
    private String fullName;
    private String bio;
    private String avatarUrl;
    private String socialLinks;
    private boolean emailVerified;
    private UserRole role;
    private Instant createdAt;
}

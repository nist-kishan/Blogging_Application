package com.blogplatform.dto;

import com.blogplatform.entity.BlogStatus;
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
public class BlogResponse {
    private UUID id;
    private String title;
    private String slug;
    private String summary;
    private String content;
    private String bannerUrl;
    private BlogStatus status;
    private int viewCount;
    private boolean featured;
    private UserResponse author;
    private CategoryResponse category;
    private Instant createdAt;
    private Instant updatedAt;
    private int likesCount;
    private int commentsCount;
    private boolean liked;
    private boolean bookmarked;
}

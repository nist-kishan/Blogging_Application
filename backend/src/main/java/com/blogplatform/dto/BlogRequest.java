package com.blogplatform.dto;

import com.blogplatform.entity.BlogStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BlogRequest {

    @NotBlank(message = "Blog title is required")
    @Size(max = 255, message = "Title must be under 255 characters")
    private String title;

    @Size(max = 500, message = "Summary must be under 500 characters")
    private String summary;

    @NotBlank(message = "Blog content is required")
    private String content;

    @Size(max = 500, message = "Banner URL must be under 500 characters")
    private String bannerUrl;

    @NotNull(message = "Category ID is required")
    private UUID categoryId;

    @NotNull(message = "Blog status is required")
    private BlogStatus status;

    private Boolean featured;
}

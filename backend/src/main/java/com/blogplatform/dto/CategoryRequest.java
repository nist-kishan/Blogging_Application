package com.blogplatform.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CategoryRequest {

    @NotBlank(message = "Category name is required")
    @Size(max = 100, message = "Category name must be under 100 characters")
    private String name;

    @NotBlank(message = "Category slug is required")
    @Pattern(regexp = "^[a-z0-9-]+$", message = "Slug must be lowercase alphanumeric and hyphens only")
    @Size(max = 100, message = "Category slug must be under 100 characters")
    private String slug;

    @Size(max = 500, message = "Description must be under 500 characters")
    private String description;
}

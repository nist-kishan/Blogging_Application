package com.blogplatform.dto;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProfileRequest {

    @Size(max = 100, message = "Full name must be under 100 characters")
    private String fullName;

    @Size(max = 1000, message = "Bio must be under 1000 characters")
    private String bio;

    @Size(max = 500, message = "Avatar URL must be under 500 characters")
    private String avatarUrl;

    @Size(max = 1000, message = "Social links format must be under 1000 characters")
    private String socialLinks;
}

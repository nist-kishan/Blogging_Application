package com.blogplatform.mapper;

import com.blogplatform.dto.BlogResponse;
import com.blogplatform.entity.Blog;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {UserMapper.class, CategoryMapper.class})
public interface BlogMapper {

    @Mapping(target = "likesCount", ignore = true)
    @Mapping(target = "commentsCount", ignore = true)
    @Mapping(target = "liked", ignore = true)
    @Mapping(target = "bookmarked", ignore = true)
    BlogResponse toResponse(Blog blog);
}

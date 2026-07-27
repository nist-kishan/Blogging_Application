package com.blogplatform.mapper;

import com.blogplatform.dto.CommentResponse;
import com.blogplatform.entity.Comment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {UserMapper.class})
public interface CommentMapper {

    @Mapping(target = "parentId", source = "parent.id")
    CommentResponse toResponse(Comment comment);
}

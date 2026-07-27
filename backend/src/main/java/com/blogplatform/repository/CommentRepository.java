package com.blogplatform.repository;

import com.blogplatform.entity.Comment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface CommentRepository extends JpaRepository<Comment, UUID> {

    @EntityGraph(attributePaths = {"author", "blog"})
    @Override
    Optional<Comment> findById(UUID id);

    @EntityGraph(attributePaths = {"author"})
    Page<Comment> findByBlogIdAndParentIsNull(UUID blogId, Pageable pageable);

    int countByBlogId(UUID blogId);
}

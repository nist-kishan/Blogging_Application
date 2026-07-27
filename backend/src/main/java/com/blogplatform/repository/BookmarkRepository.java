package com.blogplatform.repository;

import com.blogplatform.entity.Bookmark;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface BookmarkRepository extends JpaRepository<Bookmark, UUID> {

    Optional<Bookmark> findByUserIdAndBlogId(UUID userId, UUID blogId);

    boolean existsByUserIdAndBlogId(UUID userId, UUID blogId);

    @EntityGraph(attributePaths = {"blog", "blog.author", "blog.category"})
    Page<Bookmark> findByUserId(UUID userId, Pageable pageable);
}

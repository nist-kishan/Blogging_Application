package com.blogplatform.repository;

import com.blogplatform.entity.Like;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface LikeRepository extends JpaRepository<Like, UUID> {

    Optional<Like> findByUserIdAndBlogId(UUID userId, UUID blogId);

    boolean existsByUserIdAndBlogId(UUID userId, UUID blogId);

    int countByBlogId(UUID blogId);

    @EntityGraph(attributePaths = {"blog", "blog.author", "blog.category"})
    Page<Like> findByUserId(UUID userId, Pageable pageable);
}
